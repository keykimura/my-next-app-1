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
    [key: string]: string[];
}

const rooms: RoomData = {};

io.on("connection", (socket) => {
    console.log(`ユーザー接続: ${socket.id}`);

    socket.on("createRoom", (roomName: string) => {
        if (!rooms[roomName]) {
            rooms[roomName] = [];
            io.emit("updateRoomList", Object.keys(rooms));
        }
    });

    socket.on("joinRoom", (roomName: string) => {
        if (rooms[roomName]) {
            rooms[roomName].push(socket.id);
            socket.join(roomName);
            socket.emit("joinedRoom", roomName);
        }
    });

    socket.on("message", ({ room, message }: { room: string; message: string }) => {
        io.to(room).emit("message", message);
    });

    socket.on("leaveRoom", (roomName: string) => {
        if (rooms[roomName]) {
            rooms[roomName] = rooms[roomName].filter((id) => id !== socket.id);
            socket.leave(roomName);
            if (rooms[roomName].length === 0) {
                delete rooms[roomName];
                io.emit("updateRoomList", Object.keys(rooms));
            }
        }
    });

    socket.on("disconnect", () => {
        for (const roomName in rooms) {
            rooms[roomName] = rooms[roomName].filter((id) => id !== socket.id);
            if (rooms[roomName].length === 0) {
                delete rooms[roomName];
                io.emit("updateRoomList", Object.keys(rooms));
            }
        }
    });
});

server.listen(3001, () => {
    console.log("サーバー起動中: http://localhost:3001");
});
