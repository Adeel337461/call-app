import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

import connectDB from './config/connectDB.js';
import userRouter from './routes/auth.route.js';

dotenv.config();
const app = express();

// --- HTTP SERVER WRAPPER ---
const server = http.createServer(app);

// --- SOCKET.IO SERVER ---
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Simple in-memory room tracking – good enough for learning
const rooms = {}; // roomId -> [socketIds]

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join-room", ({ roomId, name }) => {
    console.log(`Socket ${socket.id} (${name}) joining room ${roomId}`);

    if (!rooms[roomId]) rooms[roomId] = [];

    rooms[roomId].push({ socketId: socket.id, name });
    socket.join(roomId);

    const otherUsers = rooms[roomId].filter(u => u.socketId !== socket.id);

    // Send all existing users (with name) to the new user
    socket.emit("all-users", otherUsers);

    // Notify existing users that a new user joined
    otherUsers.forEach((user) => {
      io.to(user.socketId).emit("user-joined", {
        socketId: socket.id,
        name,
      });
    });
  });
  

  socket.on("offer", ({ target, sdp }) => {
    io.to(target).emit("offer", { sdp, caller: socket.id });
  });

  socket.on("answer", ({ target, sdp }) => {
    io.to(target).emit("answer", { sdp, caller: socket.id });
  });

  socket.on("ice-candidate", ({ target, candidate }) => {
    io.to(target).emit("ice-candidate", { candidate, from: socket.id });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    for (const roomId in rooms) {
      const before = rooms[roomId].length;
      rooms[roomId] = rooms[roomId].filter((u) => u.socketId !== socket.id);

      if (before !== rooms[roomId].length) {
        // someone left this room → notify others
        io.to(roomId).emit("user-left", socket.id);
      }

      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
      }
    }
  });
});

// --- EXPRESS MIDDLEWARE ---
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Hello World!" });
});

app.use("/api/user", userRouter);

// --- START SERVER ---
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log("Server is running on port", PORT);
  });
});
