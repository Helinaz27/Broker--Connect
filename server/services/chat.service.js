import { prisma } from "../config/db.config.js";

export const createRoomService = async (
  creatorId,
  listingId,
  participantId,
  creatorRoles = [],
) => {
  const isAdmin = creatorRoles.includes("admin");

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw { status: 404, message: "Listing not found" };
  if (!isAdmin && listing.status !== "active")
    throw { status: 400, message: "Listing is not active" };

  const participant = await prisma.user.findUnique({
    where: { id: participantId },
  });
  if (!participant) throw { status: 404, message: "Participant not found" };

  if (creatorId === participantId) {
    throw {
      status: 400,
      message: "You cannot create a chat room with yourself",
    };
  }

  if (!isAdmin) {
    const isCreatorOwner = creatorId === listing.ownerId;
    const isParticipantOwner = participantId === listing.ownerId;

    if (!isCreatorOwner && !isParticipantOwner) {
      throw {
        status: 400,
        message:
          "Chat must be between the listing owner and an interested user",
      };
    }

    const buyerId = isCreatorOwner ? participantId : creatorId;

    const access = await prisma.contactAccess.findFirst({
      where: {
        viewerId: buyerId,
        listingId,
        isActive: true,
      },
    });

    if (!access) {
      throw {
        status: 403,
        message:
          "Contact access not unlocked. Pay the required coins to chat with this listing owner",
      };
    }
  }

  const existing = await prisma.chatRoom.findFirst({
    where: {
      participants: { hasEvery: [creatorId, participantId] },
    },
  });

  if (existing) return existing;

  const room = await prisma.chatRoom.create({
    data: {
      participants: [creatorId, participantId],
    },
  });

  return room;
};

export const getMyRoomsService = async (userId, page, limit) => {
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

  return { rooms, total };
};

export const getRoomByIdService = async (userId, roomId) => {
  const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
  if (!room) throw { status: 404, message: "Chat room not found" };

  if (!room.participants.includes(userId)) {
    throw { status: 403, message: "You are not a participant of this room" };
  }

  return room;
};

export const adminGetAllRoomsService = async (page, limit) => {
  const skip = (page - 1) * limit;

  const [rooms, total] = await Promise.all([
    prisma.chatRoom.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.chatRoom.count(),
  ]);

  return { rooms, total };
};

export const adminGetRoomByIdService = async (roomId) => {
  const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
  if (!room) throw { status: 404, message: "Chat room not found" };
  return room;
};
