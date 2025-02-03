import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

const prisma = new PrismaClient();
const app = express();

// データベース接続確認
prisma.$connect()
    .then(() => console.log('データベース接続成功'))
    .catch((error) => {
        console.error('データベース接続エラー:', error);
        process.exit(1);
    });

// エラーハンドリング
process.on('unhandledRejection', (error) => {
    console.error('未処理のPromise rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('未処理の例外:', error);
    process.exit(1);
});

// CORS設定
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

app.use(express.json());

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Content-Type"]
    },
    pingTimeout: 20000,
    pingInterval: 10000,
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    connectTimeout: 45000
});

// ルームデータの型定義
interface RoomData {
    users: {
        id: string;
        youtubeLinks: any[];
    }[];
    messages: {
        text: string;
        timestamp: string;
        userId: string;
    }[];
    currentVideo: string | null;
}

// ルーム管理
const rooms: Map<string, RoomData> = new Map();

io.on("connection", (socket) => {
    console.log(`ユーザー接続: ${socket.id}`);

    // ルーム参加
    socket.on("joinRoom", async (roomName: string) => {
        try {
            console.log(`User ${socket.id} attempting to join room: ${roomName}`);
            
            // ルームが存在しない場合は作成
            if (!rooms.has(roomName)) {
                const dbRoom = await prisma.room.findUnique({
                    where: { name: roomName },
                    include: {
                        messages: {
                            orderBy: { timestamp: 'asc' },
                            take: 100
                        }
                    }
                });

                if (dbRoom) {
                    rooms.set(roomName, {
                        users: [],
                        messages: dbRoom.messages.map(msg => ({
                            text: msg.text,
                            timestamp: msg.timestamp.toISOString(),
                            userId: msg.userId
                        })),
                        currentVideo: null
                    });
                } else {
                    rooms.set(roomName, {
                        users: [],
                        messages: [],
                        currentVideo: null
                    });
                }
            }

            const room = rooms.get(roomName)!;

            // ユーザーをルームに追加
            room.users.push({
                id: socket.id,
                youtubeLinks: []
            });
            socket.join(roomName);

            // 既存のメッセージを送信
            socket.emit("messageHistory", room.messages);

            // 現在の動画情報を送信
            if (room.currentVideo) {
                socket.emit("currentVideo", room.currentVideo);
            }

            console.log(`User ${socket.id} joined room: ${roomName}`);

        } catch (error) {
            console.error("ルーム参加エラー:", error);
            socket.emit("error", { message: "ルームへの参加に失敗しました" });
        }
    });

    // メッセージ送信
    // クライアントのping状態を監視
    let lastPing = Date.now();
    
    socket.on("ping", () => {
        lastPing = Date.now();
    });

    const pingInterval = setInterval(() => {
        const now = Date.now();
        if (now - lastPing > 25000) {
            socket.disconnect(true);
        }
    }, 10000);

    socket.on("message", async (data: {
        room: string;
        text: string;
        timestamp: string;
        userId: string;
    }) => {
        try {
            const { room: roomName, text, timestamp, userId } = data;
            console.log(`Message received in ${roomName}:`, { text, userId });

            const room = rooms.get(roomName);
            if (!room) {
                throw new Error("ルームが見つかりません");
            }

            const messageData = {
                text,
                timestamp,
                userId
            };

            // メッセージをデータベースに保存
            const dbRoom = await prisma.room.findUnique({
                where: { name: roomName }
            });

            if (dbRoom) {
                await prisma.chatMessage.create({
                    data: {
                        text,
                        userId,
                        roomId: dbRoom.id,
                        timestamp: new Date(timestamp)
                    }
                });
            }

            // メッセージをルームに追加
            room.messages.push(messageData);

            // 送信者にメッセージ送信成功を通知
            socket.emit("messageSent", messageData);

            // ルーム全体にメッセージをブロードキャスト（送信者を除く）
            socket.to(roomName).emit("message", messageData);

            console.log(`Message broadcast to room ${roomName}:`, messageData);

        } catch (error) {
            console.error("メッセージ送信エラー:", error);
            socket.emit("error", { message: "メッセージの送信に失敗しました" });
        }
    });

    // ルーム退出
    socket.on("leaveRoom", (roomName: string) => {
        const room = rooms.get(roomName);
        if (room) {
            room.users = room.users.filter(user => user.id !== socket.id);
            socket.leave(roomName);
            io.to(roomName).emit("updateRoomUsers", room.users);

            if (room.users.length === 0) {
                rooms.delete(roomName);
            }

            console.log(`User ${socket.id} left room: ${roomName}`);
        }
    });

    // 切断時の処理
    socket.on("disconnect", () => {
        console.log(`ユーザー切断: ${socket.id}`);
        clearInterval(pingInterval);
        
        // 全ルームからユーザーを削除
        rooms.forEach((room, roomName) => {
            room.users = room.users.filter(user => user.id !== socket.id);
            io.to(roomName).emit("updateRoomUsers", room.users);

            if (room.users.length === 0) {
                rooms.delete(roomName);
            }
        });
    });
});

const PORT = process.env.PORT || 3001;

try {
    server.listen(PORT, () => {
        console.log(`サーバー起動完了: http://localhost:${PORT}`);
    });
} catch (error) {
    console.error("サーバー起動エラー:", error);
    process.exit(1);
}
