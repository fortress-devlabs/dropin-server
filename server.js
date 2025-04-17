const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user_joined', socket.id);
    });

    socket.on('offer', (data) => {
        socket.to(data.targetId).emit('offer', { senderId: socket.id, offer: data.offer });
    });

    socket.on('answer', (data) => {
        socket.to(data.targetId).emit('answer', { senderId: socket.id, answer: data.answer });
    });

    socket.on('ice_candidate', (data) => {
        socket.to(data.targetId).emit('ice_candidate', { senderId: socket.id, candidate: data.candidate });
    });

    socket.on('disconnecting', () => {
        socket.rooms.forEach((roomId) => {
            socket.to(roomId).emit('user_left', socket.id);
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
