import express from "express";
const router = express.Router();

const authRoutes = require("./auth.routes.js");
const userRoutes = require("./user.routes.js");
const kycRoutes = require("./kyc.routes.js");
const houseRoutes = require("./house.routes.js");
const carRoutes = require("./car.routes.js");
const serviceRoutes = require("./service.routes.js");
const chatRoutes = require("./chat.routes.js");
const notificationRoutes = require("./notification.routes.js");
const paymentRoutes = require("./payment.routes.js");
const adminRoutes = require("./admin.routes.js");

// Mount all routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/kyc", kycRoutes);
router.use("/houses", houseRoutes);
router.use("/cars", carRoutes);
router.use("/services", serviceRoutes);
router.use("/chats", chatRoutes);
router.use("/notifications", notificationRoutes);
router.use("/payments", paymentRoutes);
router.use("/admin", adminRoutes);

export default router;
