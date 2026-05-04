import express from "express";
const router = express.Router();

import userRoutes from  "./user.routes.js";
import kycRoutes  from  "./kyc.routes.js";
import houseRoutes  from "./house.routes.js";
import carRoutes  from "./car.routes.js";
import serviceRoutes  from "./service.routes.js";
import postingFeeRoutes from "./postingFee.routes.js";    
import paymentRoutes from  "./payment.routes.js";
import coinTransactionRoutes from "./coinTransaction.routes.js";
import contactAccessRoutes from "./contactAccess.routes.js";  
// import messageRoutes from "./message.routes.js";    
// import notificationRoutes from  "./notification.routes.js";
// import chatRoutes from "./chat.routes.js";


// Mount all routes
router.use("/users", userRoutes);
router.use("/kyc", kycRoutes);
router.use("/houses", houseRoutes);
router.use("/cars", carRoutes);
router.use("/services", serviceRoutes);
router.use("/posting-fees", postingFeeRoutes);
router.use("/payments", paymentRoutes);
router.use("/coin-transactions", coinTransactionRoutes);
router.use("/contact-access", contactAccessRoutes);
// router.use("/messages", messageRoutes);
// router.use("/notifications", notificationRoutes);
// router.use("/chats", chatRoutes);


export default router;
