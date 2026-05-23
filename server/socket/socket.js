import { Server } from "socket.io";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db.config.js";
import env from "../utils/env.js";

const onlineUsers = new Map();

const typingUsers = new Map();

const getUsersInRoom = (roomId) => typingUsers.get(roomId) ?? new Set();

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie;
      if (!rawCookie) return next(new Error("No cookie provided"));

      const parsed = cookie.parse(rawCookie);
      const token = parsed.token;
      if (!token) return next(new Error("No token in cookie"));

      const decoded = jwt.verify(token, env.jwtSecret);
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });

      if (!user || !user.isActive) return next(new Error("Unauthorized"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.user.id;

    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);

    const rooms = await prisma.chatRoom.findMany({
      where: { participants: { has: userId } },
      select: { id: true },
    });
    rooms.forEach(({ id }) => socket.join(id));

    rooms.forEach(({ id }) => {
      socket.to(id).emit("user_online", { userId });
    });

    socket.on("send_message", async (data, ack) => {
      try {
        const { roomId, listingId, content, messageType = "text" } = data;

        const room = await prisma.chatRoom.findFirst({
          where: { id: roomId, participants: { has: userId } },
        });
        if (!room) return ack?.({ error: "Room not found" });

        const message = await prisma.message.create({
          data: {
            roomId,
            senderId: userId,
            listingId,
            messageType,
            content,
            isRead: false,
          },
        });

        await prisma.chatRoom.update({
          where: { id: roomId },
          data: { updatedAt: new Date() },
        });

        io.to(roomId).emit("new_message", message);
        ack?.({ success: true, message });
      } catch (err) {
        ack?.({ error: "Failed to send message" });
      }
    });

    socket.on("typing_start", ({ roomId }) => {
      if (!typingUsers.has(roomId)) typingUsers.set(roomId, new Set());
      typingUsers.get(roomId).add(userId);

      socket.to(roomId).emit("typing_update", {
        roomId,
        userId,
        isTyping: true,
      });
    });

    socket.on("typing_stop", ({ roomId }) => {
      getUsersInRoom(roomId).delete(userId);

      socket.to(roomId).emit("typing_update", {
        roomId,
        userId,
        isTyping: false,
      });
    });

    socket.on("messages_read", async ({ roomId }) => {
      try {
        await prisma.message.updateMany({
          where: {
            roomId,
            senderId: { not: userId },
            isRead: false,
          },
          data: { isRead: true },
        });

        socket.to(roomId).emit("messages_read_ack", { roomId, readBy: userId });
      } catch (err) {
        console.error("Read receipt error:", err);
      }
    });

    socket.on("disconnect", () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);

          rooms.forEach(({ id }) => {
            socket.to(id).emit("user_offline", { userId });
          });

          typingUsers.forEach((users, roomId) => {
            if (users.has(userId)) {
              users.delete(userId);
              socket.to(roomId).emit("typing_update", {
                roomId,
                userId,
                isTyping: false,
              });
            }
          });
        }
      }
    });
  });

  return io;
};

export const isUserOnline = (userId) => onlineUsers.has(userId);
