import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

interface RoomData {
    [key: string]: {
        users: string[];
        youtubeLinks: string[];
        currentVideo: string | null;
    };
}

interface ChatMessage {
    text: string;
    timestamp: string;
    userId: string;
}

const rooms: RoomData = {};

io.on("connection", (socket) => {
    console.log(`ユーザー接続: ${socket.id}`);

    socket.on("createRoom", (roomName: string) => {
        if (!rooms[roomName]) {
            rooms[roomName] = {
                users: [],
                youtubeLinks: [],
                currentVideo: null
            };
            io.emit("updateRoomList", Object.keys(rooms));
        }
    });

    socket.on("joinRoom", (roomName: string) => {
        if (rooms[roomName]) {
            rooms[roomName].users.push(socket.id);
            socket.join(roomName);
            socket.emit("joinedRoom", roomName);
            if (rooms[roomName].currentVideo) {
                socket.emit("currentVideo", rooms[roomName].currentVideo);
            }
        }
    });

    socket.on("message", ({ room, message, userId }: { room: string; message: string; userId: string }) => {
        const timestamp = new Date().toLocaleTimeString('ja-JP');
        const chatMessage: ChatMessage = {
            text: message,
            timestamp,
            userId
        };
        io.to(room).emit("message", chatMessage);
    });

    socket.on("submitYoutubeLink", ({ room, link }: { room: string; link: string }) => {
        if (rooms[room]) {
            rooms[room].youtubeLinks.push(link);
            if (!rooms[room].currentVideo) {
                rooms[room].currentVideo = link;
            }
            io.to(room).emit("updateYoutubeLinks", rooms[room].youtubeLinks);
            io.to(room).emit("currentVideo", rooms[room].currentVideo);
        }
    });

    socket.on("nextVideo", (room: string) => {
        if (rooms[room] && rooms[room].youtubeLinks.length > 0) {
            const randomIndex = Math.floor(Math.random() * rooms[room].youtubeLinks.length);
            rooms[room].currentVideo = rooms[room].youtubeLinks[randomIndex];
            io.to(room).emit("currentVideo", rooms[room].currentVideo);
        }
    });

    socket.on("leaveRoom", (roomName: string) => {
        if (rooms[roomName]) {
            rooms[roomName].users = rooms[roomName].users.filter((id) => id !== socket.id);
            socket.leave(roomName);
            if (rooms[roomName].users.length === 0) {
                delete rooms[roomName];
                io.emit("updateRoomList", Object.keys(rooms));
            }
        }
    });

    socket.on("disconnect", () => {
        for (const roomName in rooms) {
            rooms[roomName].users = rooms[roomName].users.filter((id) => id !== socket.id);
            if (rooms[roomName].users.length === 0) {
                delete rooms[roomName];
                io.emit("updateRoomList", Object.keys(rooms));
            }
        }
    });
});

server.listen(3001, () => {
    console.log("サーバー起動中: http://localhost:3001");
});
