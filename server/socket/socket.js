import { Server } from "socket.io";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db.config.js";
import env from "../utils/env.js";

const onlineUsers = new Map();
const typingUsers = new Map();
const activeCalls = new Map(); // callId -> { roomId, callerId, calleeId, type, startedAt }
const userInCall = new Map(); // userId -> callId

let _io = null;

const getUsersInRoom = (roomId) => typingUsers.get(roomId) ?? new Set();

export const emitToUser = (userId, event, data) => {
  if (!_io) return;
  const sockets = onlineUsers.get(userId);
  if (sockets) {
    sockets.forEach((socketId) => {
      _io.to(socketId).emit(event, data);
    });
  }
};

export const initSocket = (httpServer) => {
  console.log("Initializing Socket.IO server...");
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  _io = io;

  io.use(async (socket, next) => {
    try {
      let token = null;
      const rawCookie = socket.handshake.headers.cookie;
      if (rawCookie) {
        const parsed = cookie.parse(rawCookie);
        token = parsed.token;
      }
      if (!token && socket.handshake.auth?.token) {
        token = socket.handshake.auth.token;
      }
      if (!token) return next(new Error("No token provided"));
      const decoded = jwt.verify(token, env.jwtSecret);
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user || !user.isActive) return next(new Error("Unauthorized"));
      socket.user = user;
      next();
    } catch (err) {
      console.error("Socket auth error:", err.message);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.user.id;

    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);

    const rooms = await prisma.chatRoom.findMany({
      where: { participants: { has: userId } },
      select: { id: true, participants: true },
    });

    rooms.forEach(({ id }) => socket.join(id));

    const contactUserIds = [
      ...new Set(
        rooms.flatMap(({ participants }) =>
          participants.filter((p) => p !== userId),
        ),
      ),
    ];

    const onlineContactIds = contactUserIds.filter((id) => onlineUsers.has(id));
    socket.emit("online_contacts", { userIds: onlineContactIds });

    rooms.forEach(({ id }) => {
      socket.to(id).emit("user_online", { userId });
    });

    socket.on("join_room", async ({ roomId }) => {
      const room = await prisma.chatRoom.findFirst({
        where: { id: roomId, participants: { has: userId } },
      });
      if (room) {
        socket.join(roomId);
      }
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
            ...(listingId ? { listingId } : {}),
            messageType,
            content,
            isRead: false,
          },
        });

        let listing = null;
        if (listingId) {
          listing = await prisma.listing.findUnique({
            where: { id: listingId },
            select: { id: true, title: true, images: true, listingType: true },
          });
        }

        const messageWithListing = { ...message, listing };

        await prisma.chatRoom.update({
          where: { id: roomId },
          data: { updatedAt: new Date() },
        });

        io.to(roomId).emit("new_message", messageWithListing);

        room.participants.forEach((participantId) => {
          if (participantId !== userId) {
            const participantSockets = onlineUsers.get(participantId);
            if (participantSockets) {
              participantSockets.forEach((socketId) => {
                io.to(socketId).emit("new_message", messageWithListing);
              });
            }
          }
        });

        ack?.({ success: true, message: messageWithListing });
      } catch (err) {
        console.error("send_message error:", err);
        ack?.({ error: "Failed to send message" });
      }
    });

    socket.on("typing_start", ({ roomId }) => {
      if (!typingUsers.has(roomId)) typingUsers.set(roomId, new Set());
      typingUsers.get(roomId).add(userId);
      socket
        .to(roomId)
        .emit("typing_update", { roomId, userId, isTyping: true });
    });

    socket.on("typing_stop", ({ roomId }) => {
      getUsersInRoom(roomId).delete(userId);
      socket
        .to(roomId)
        .emit("typing_update", { roomId, userId, isTyping: false });
    });

    socket.on("messages_read", async ({ roomId }) => {
      try {
        await prisma.message.updateMany({
          where: { roomId, senderId: { not: userId }, isRead: false },
          data: { isRead: true },
        });
        socket.to(roomId).emit("messages_read_ack", { roomId, readBy: userId });
      } catch (err) {
        console.error("Read receipt error:", err);
      }
    });

    socket.on("call_offer", async ({ roomId, calleeId, offer, callType }) => {
      // callType: "audio" | "video"
      try {
        const room = await prisma.chatRoom.findFirst({
          where: { id: roomId, participants: { has: userId } },
        });
        if (!room) return;

        const staleCallId = userInCall.get(userId);
        if (staleCallId) {
          const staleCall = activeCalls.get(staleCallId);
          if (staleCall) {
            // notify the other party if they're still waiting
            const otherUserId =
              staleCall.callerId === userId
                ? staleCall.calleeId
                : staleCall.callerId;
            emitToUser(otherUserId, "call_ended", {
              callId: staleCallId,
              duration: 0,
            });
            userInCall.delete(staleCall.callerId);
            userInCall.delete(staleCall.calleeId);
            activeCalls.delete(staleCallId);
          } else {
            // orphaned entry with no matching call — just remove it
            userInCall.delete(userId);
          }
        }

        // Check if callee is busy
        if (userInCall.has(calleeId)) {
          emitToUser(userId, "call_busy", { roomId, calleeId });
          return;
        }

        const callId = `${roomId}_${Date.now()}`;
        activeCalls.set(callId, {
          roomId,
          callerId: userId,
          calleeId,
          callType,
          startedAt: null, // set when answered
          callId,
        });

        // Store pending call on both sides temporarily (caller tracks by callId)
        userInCall.set(userId, callId);

        emitToUser(calleeId, "call_incoming", {
          roomId,
          callerId: userId,
          callerName: `${socket.user.firstName} ${socket.user.lastName}`,
          callerImage: socket.user.profileImage || null,
          offer,
          callType,
          callId,
        });
      } catch (err) {
        console.error("call_offer error:", err);
      }
    });

    socket.on("call_answer", async ({ callId, answer }) => {
      try {
        const call = activeCalls.get(callId);
        if (!call) return;

        call.startedAt = new Date();
        userInCall.set(userId, callId); // callee now also in call

        emitToUser(call.callerId, "call_answered", { callId, answer });
      } catch (err) {
        console.error("call_answer error:", err);
      }
    });

    socket.on("call_ice_candidate", ({ callId, candidate, toUserId }) => {
      emitToUser(toUserId, "call_ice_candidate", { callId, candidate });
    });

    socket.on("call_decline", async ({ callId }) => {
      try {
        const call = activeCalls.get(callId);
        if (!call) return;

        userInCall.delete(call.callerId);
        userInCall.delete(call.calleeId);
        activeCalls.delete(callId);

        emitToUser(call.callerId, "call_declined", { callId });

        // Save missed call message
        await prisma.message.create({
          data: {
            roomId: call.roomId,
            senderId: call.callerId,
            messageType:
              call.callType === "video" ? "call_video" : "call_audio",
            content: "missed_call",
            callStatus: "missed",
            callDuration: 0,
            isRead: false,
          },
        });

        await prisma.chatRoom.update({
          where: { id: call.roomId },
          data: { updatedAt: new Date() },
        });
      } catch (err) {
        console.error("call_decline error:", err);
      }
    });

    socket.on("call_end", async ({ callId }) => {
      try {
        const call = activeCalls.get(callId);
        if (!call) return;

        const duration = call.startedAt
          ? Math.floor((Date.now() - call.startedAt.getTime()) / 1000)
          : 0;

        const otherUserId =
          call.callerId === userId ? call.calleeId : call.callerId;
        emitToUser(otherUserId, "call_ended", { callId, duration });

        userInCall.delete(call.callerId);
        userInCall.delete(call.calleeId);
        activeCalls.delete(callId);

        // Save call history message
        await prisma.message.create({
          data: {
            roomId: call.roomId,
            senderId: call.callerId,
            messageType:
              call.callType === "video" ? "call_video" : "call_audio",
            content: duration > 0 ? "call_ended" : "missed_call",
            callStatus: duration > 0 ? "ended" : "missed",
            callDuration: duration,
            isRead: false,
          },
        });

        await prisma.chatRoom.update({
          where: { id: call.roomId },
          data: { updatedAt: new Date() },
        });
      } catch (err) {
        console.error("call_end error:", err);
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
              socket
                .to(roomId)
                .emit("typing_update", { roomId, userId, isTyping: false });
            }
          });

          // End any active call if user disconnects
          const callId = userInCall.get(userId);
          if (callId) {
            const call = activeCalls.get(callId);
            if (call) {
              const otherUserId =
                call.callerId === userId ? call.calleeId : call.callerId;
              emitToUser(otherUserId, "call_ended", { callId, duration: 0 });
              userInCall.delete(call.callerId);
              userInCall.delete(call.calleeId);
              activeCalls.delete(callId);
            }
          }
        }
      }
    });
  });

  return io;
};

export const isUserOnline = (userId) => onlineUsers.has(userId);
