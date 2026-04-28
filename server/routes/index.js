import express from "express";
const router = express.Router();

import userRoutes from  "./user.routes.js";
// import kycRoutes  from  "./kyc.routes.js";
// import houseRoutes  from "./house.routes.js";
// import carRoutes  from "./car.routes.js";
// import serviceRoutes  from "./service.routes.js";
// import chatRoutes from "./chat.routes.js";
// import notificationRoutes from  "./notification.routes.js";
// import paymentRoutes from  "./payment.routes.js";

// Mount all routes
router.use("/users", userRoutes);
// router.use("/kyc", kycRoutes);
// router.use("/houses", houseRoutes);
// router.use("/cars", carRoutes);
// router.use("/services", serviceRoutes);
// router.use("/chats", chatRoutes);
// router.use("/notifications", notificationRoutes);
// router.use("/payments", paymentRoutes);

export default router;
