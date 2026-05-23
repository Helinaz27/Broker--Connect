import express from "express";
const router = express.Router();

import userRoutes from "./user.routes.js";
import kycRoutes from "./kyc.routes.js";
import listingRoutes from "./listing.routes.js";
import platformFeeRoutes from "./platformFee.routes.js";
import paymentRoutes from "./payment.routes.js";
import coinTransactionRoutes from "./coinTransaction.routes.js";
import contactAccessRoutes from "./contactAccess.routes.js";
import messageRoutes from "./message.routes.js";
import chatRoutes from "./chat.routes.js";
import notificationRoutes from "./notification.routes.js";

// Mount all routes
router.use("/users", userRoutes);
router.use("/kyc", kycRoutes);
router.use("/listings", listingRoutes);
router.use("/platform-fees", platformFeeRoutes);
router.use("/payments", paymentRoutes);
router.use("/coin-transactions", coinTransactionRoutes);
router.use("/contact-access", contactAccessRoutes);
router.use("/messages", messageRoutes);
router.use("/chat", chatRoutes);
router.use("/notifications", notificationRoutes);

export default router;
