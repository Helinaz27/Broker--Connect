import { prisma } from "../config/db.config.js";
import { isUserOnline } from "../socket/socket.js";
import cloudinary from "../config/cloudinary.config.js";

const uploadImagesToCloudinary = async (files) => {
  const uploadPromises = files.map((file) => {
    const isImage = file.mimetype.startsWith("image/");
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "listings",
          resource_type: isImage ? "image" : "raw",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        },
      );
      uploadStream.end(file.buffer);
    });
  });
  return await Promise.all(uploadPromises);
};

const attachListingToMessages = async (messages) => {
  const listingIds = [
    ...new Set(messages.map((m) => m.listingId).filter(Boolean)),
  ];
  if (listingIds.length === 0)
    return messages.map((m) => ({ ...m, listing: null }));

  const listings = await prisma.listing.findMany({
    where: { id: { in: listingIds } },
    select: { id: true, title: true, images: true, listingType: true },
  });

  const listingMap = Object.fromEntries(listings.map((l) => [l.id, l]));

  return messages.map((m) => ({
    ...m,
    listing: m.listingId ? (listingMap[m.listingId] ?? null) : null,
  }));
};

export const initiateChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { listingId, otherUserId } = req.body;
    const isAdmin = (req.user.roles || []).includes("admin");

    if (userId === otherUserId) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot chat with yourself" });
    }

    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
    });
    if (!otherUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!isAdmin) {
      const access = await prisma.contactAccess.findFirst({
        where: {
          listingId,
          isActive: true,
          OR: [
            { viewerId: userId, ownerId: otherUserId },
            { viewerId: otherUserId, ownerId: userId },
          ],
        },
      });

      if (!access) {
        return res.status(403).json({
          success: false,
          message: "You need contact access to this listing to start a chat",
        });
      }
    }

    const sortedIds = [userId, otherUserId].sort();

    let room = await prisma.chatRoom.findFirst({
      where: { participants: { hasEvery: sortedIds } },
    });

    if (!room) {
      room = await prisma.chatRoom.create({
        data: { participants: sortedIds },
      });
    }

    const rawMessages = await prisma.message.findMany({
      where: { roomId: room.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    const messages = await attachListingToMessages(rawMessages.reverse());

    return res.status(200).json({
      success: true,
      data: {
        room,
        messages,
        otherUser: {
          id: otherUser.id,
          firstName: otherUser.firstName,
          lastName: otherUser.lastName,
          profileImage: otherUser.profileImage,
          isOnline: isUserOnline(otherUser.id),
        },
      },
    });
  } catch (err) {
    console.error("initiateChat error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getChatRooms = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [rooms, total] = await Promise.all([
      prisma.chatRoom.findMany({
        where: { participants: { has: userId } },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.chatRoom.count({ where: { participants: { has: userId } } }),
    ]);

    const enriched = await Promise.all(
      rooms.map(async (room) => {
        const otherUserId = room.participants.find((p) => p !== userId);

        const [otherUser, lastMessage, unreadCount] = await Promise.all([
          prisma.user.findUnique({
            where: { id: otherUserId },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          }),
          prisma.message.findFirst({
            where: { roomId: room.id },
            orderBy: { createdAt: "desc" },
          }),
          prisma.message.count({
            where: {
              roomId: room.id,
              senderId: { not: userId },
              isRead: false,
            },
          }),
        ]);

        return {
          ...room,
          otherUser: { ...otherUser, isOnline: isUserOnline(otherUserId) },
          lastMessage,
          unreadCount,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      data: {
        rooms: enriched,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    console.error("getChatRooms error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const searchContacts = async (req, res) => {
  try {
    const userId = req.user.id;
    const q = req.query.q?.trim();

    if (!q) {
      return res
        .status(400)
        .json({ success: false, message: "Search query required" });
    }

    const rooms = await prisma.chatRoom.findMany({
      where: { participants: { has: userId } },
      select: { id: true, participants: true },
    });

    const otherUserIds = rooms.map((r) =>
      r.participants.find((p) => p !== userId),
    );

    const matchedUsers = await prisma.user.findMany({
      where: {
        id: { in: otherUserIds },
        OR: [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, firstName: true, lastName: true, profileImage: true },
    });

    const result = matchedUsers.map((u) => {
      const room = rooms.find((r) => r.participants.includes(u.id));
      return { ...u, roomId: room?.id, isOnline: isUserOnline(u.id) };
    });

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("searchContacts error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { roomId } = req.params;
    const limit = parseInt(req.query.limit) || 30;
    const cursor = req.query.cursor;

    const room = await prisma.chatRoom.findFirst({
      where: { id: roomId, participants: { has: userId } },
    });
    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    const rawMessages = await prisma.message.findMany({
      where: {
        roomId,
        ...(cursor ? { id: { lt: cursor } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const reversed = rawMessages.reverse();
    const messages = await attachListingToMessages(reversed);
    const nextCursor = rawMessages.length === limit ? rawMessages[0].id : null;

    return res.status(200).json({
      success: true,
      data: { messages, nextCursor },
    });
  } catch (err) {
    console.error("getMessages error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const uploadMessageFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { roomId } = req.params;

    const room = await prisma.chatRoom.findFirst({
      where: { id: roomId, participants: { has: userId } },
    });
    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No file provided" });
    }

    const urls = await uploadImagesToCloudinary(req.files);

    return res.status(200).json({ success: true, data: { urls } });
  } catch (err) {
    console.error("uploadMessageFile error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
