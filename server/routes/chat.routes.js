import express from "express";
import { can } from "../middleware/can.js";
import {
  initiateChat,
  getChatRooms,
  searchContacts,
  getMessages,
  uploadMessageFile,
} from "../controllers/chat.controller.js";
import {
  initiateChatValidator,
  getRoomsValidator,
  searchContactsValidator,
  getMessagesValidator,
  uploadFileValidator,
} from "../validators/chat.validator.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/initiate",
  can("chat", "createOwn"),
  initiateChatValidator,
  initiateChat,
);
router.get("/rooms", can("chat", "readOwn"), getRoomsValidator, getChatRooms);
router.get(
  "/rooms/search",
  can("chat", "readOwn"),
  searchContactsValidator,
  searchContacts,
);
router.get(
  "/rooms/:roomId/messages",
  can("chat", "readOwn"),
  getMessagesValidator,
  getMessages,
);
router.post(
  "/rooms/:roomId/upload",
  can("chat", "createOwn"),
  upload.array("files", 5),
  uploadFileValidator,
  uploadMessageFile,
);

export default router;
