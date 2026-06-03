import express from "express";
import { can } from "../middleware/can.js";
import * as notificationController from "../controllers/notification.controller.js";
import {
  sendNotificationValidator,
  markAsReadValidator,
} from "../validators/notification.validator.js";

const router = express.Router();

router.get(
  "/admin/all",
  can("notification", "manage"),
  notificationController.adminGetAllNotifications,
);
router.post(
  "/admin/send",
  can("notification", "manage"),
  sendNotificationValidator,
  notificationController.sendSystemNotification,
);

router.put(
  "/read-all",
  can("notification", "updateOwn"),
  notificationController.markAllAsRead,
);

router.get(
  "/unread/count",
  can("notification", "readOwn"),
  notificationController.getUnreadCount,
);
router.get(
  "/",
  can("notification", "readOwn"),
  notificationController.getMyNotifications,
);

router.put(
  "/:id/read",
  can("notification", "updateOwn"),
  markAsReadValidator,
  notificationController.markOneAsRead,
);
router.delete(
  "/:id",
  can("notification", "deleteOwn"),
  markAsReadValidator,
  notificationController.deleteNotification,
);

export default router;
