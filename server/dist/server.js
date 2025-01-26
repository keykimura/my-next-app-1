"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const client_1 = require("@prisma/client");
const cors_1 = __importDefault(require("cors"));
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
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
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(express_1.default.json());
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    },
    pingTimeout: 60000
});
// ルーム管理
const rooms = new Map();
io.on("connection", (socket) => {
    console.log(`ユーザー接続: ${socket.id}`);
    // ルーム参加
    socket.on("joinRoom", async (roomName) => {
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
                }
                else {
                    rooms.set(roomName, {
                        users: [],
                        messages: [],
                        currentVideo: null
                    });
                }
            }
            const room = rooms.get(roomName);
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
        }
        catch (error) {
            console.error("ルーム参加エラー:", error);
            socket.emit("error", { message: "ルームへの参加に失敗しました" });
        }
    });
    // メッセージ送信
    socket.on("message", async (data) => {
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
        }
        catch (error) {
            console.error("メッセージ送信エラー:", error);
            socket.emit("error", { message: "メッセージの送信に失敗しました" });
        }
    });
    // ルーム退出
    socket.on("leaveRoom", (roomName) => {
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
}
catch (error) {
    console.error("サーバー起動エラー:", error);
    process.exit(1);
}
