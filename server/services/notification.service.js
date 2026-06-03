import { prisma } from "../config/db.config.js";
import { sendKYCApprovedEmail, sendKYCRejectedEmail } from "../utils/email.js";

const saveNotification = async ({
  userId,
  type,
  title,
  body,
  path,
  referenceId,
}) => {
  return await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body,
      path: path ?? null,
      referenceId: referenceId ?? null,
      isRead: false,
    },
  });
};

export const notifyKYCApproved = async ({ userId, userEmail, firstName }) => {
  try {
    await sendKYCApprovedEmail(userEmail, firstName);
  } catch (error) {
    console.error("notifyKYCApproved error:", error);
  }
};

export const notifyKYCRejected = async ({
  userId,
  userEmail,
  firstName,
  reviewNote,
}) => {
  try {
    await sendKYCRejectedEmail(userEmail, firstName, reviewNote);
  } catch (error) {
    console.error("notifyKYCRejected error:", error);
  }
};

export const notifyNewMessage = async ({ userId, senderName, roomId }) => {
  try {
    await saveNotification({
      userId,
      type: "message",
      title: "New Message",
      body: `${senderName} sent you a message.`,
      path: "/messages",
      referenceId: roomId,
    });
  } catch (error) {
    console.error("notifyNewMessage error:", error);
  }
};

export const notifyPaymentSuccess = async ({
  userId,
  coinsReceived,
  amountBirr,
}) => {
  try {
    await saveNotification({
      userId,
      type: "payment_success",
      title: "Payment Successful",
      body: `Your payment of ${amountBirr} ETB was successful. ${coinsReceived} coins have been added to your account.`,
      path: "/payments",
    });
  } catch (error) {
    console.error("notifyPaymentSuccess error:", error);
  }
};

export const notifyNewContact = async ({
  userId,
  viewerName,
  listingTitle,
  listingId,
}) => {
  try {
    await saveNotification({
      userId,
      type: "new_contact",
      title: "Someone Viewed Your Contact",
      body: `${viewerName} paid to access your contact information for listing "${listingTitle}".`,
      path: "/listings",
      referenceId: listingId,
    });
  } catch (error) {
    console.error("notifyNewContact error:", error);
  }
};

export const notifyPostExpired = async ({
  userId,
  listingTitle,
  listingId,
}) => {
  try {
    await saveNotification({
      userId,
      type: "post_expired",
      title: "Your Listing Has Expired",
      body: `Your listing "${listingTitle}" has expired. Renew it to keep it visible.`,
      path: "/listings",
      referenceId: listingId,
    });
  } catch (error) {
    console.error("notifyPostExpired error:", error);
  }
};

export const notifyInsufficientCoins = async ({
  userId,
  coinsNeeded,
  coinsAvailable,
}) => {
  try {
    await saveNotification({
      userId,
      type: "insufficient_coins",
      title: "Insufficient Coins",
      body: `You need ${coinsNeeded} coins but you only have ${coinsAvailable}. Please buy more coins to continue.`,
      path: "/payments",
    });
  } catch (error) {
    console.error("notifyInsufficientCoins error:", error);
  }
};

export const notifySystem = async ({ userId, title, body, path }) => {
  try {
    await saveNotification({
      userId,
      type: "system",
      title,
      body,
      path: path ?? null,
    });
  } catch (error) {
    console.error("notifySystem error:", error);
  }
};

export const broadcastSystemNotification = async ({ title, body, path }) => {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true },
    });
    await prisma.notification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        type: "system",
        title,
        body,
        path: path ?? null,
        isRead: false,
      })),
    });
  } catch (error) {
    console.error("broadcastSystemNotification error:", error);
  }
};

export const getMyNotificationsService = async ({
  userId,
  page,
  limit,
  isRead,
}) => {
  const skip = (page - 1) * limit;
  const where = { userId };
  if (isRead !== undefined) where.isRead = isRead === "true";

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    notifications,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

export const getUnreadCountService = async (userId) => {
  return await prisma.notification.count({
    where: { userId, isRead: false },
  });
};

export const markAllAsReadService = async (userId) => {
  return await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};

export const adminGetAllNotificationsService = async ({
  page,
  limit,
  userId,
  type,
}) => {
  const skip = (page - 1) * limit;
  const where = {};
  if (userId) where.userId = userId;
  if (type) where.type = type;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    notifications,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

export const markOneAsReadService = async (userId, notificationId) => {
  return await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
};

export const deleteNotificationService = async (userId, notificationId) => {
  return await prisma.notification.deleteMany({
    where: { id: notificationId, userId },
  });
};
