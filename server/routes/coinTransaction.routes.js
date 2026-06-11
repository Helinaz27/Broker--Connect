import express from "express";
import { can } from "../middleware/can.js";
import * as coinTransactionController from "../controllers/coinTransaction.controller.js";

const router = express.Router();

router.get(
  "/my-transactions",
  can("coinTransaction", "readOwn"),
  coinTransactionController.getMyTransactions,
);

router.get(
  "/admin/all",
  can("coinTransaction", "manage"),
  coinTransactionController.adminGetAllTransactions,
);

router.get(
  "/admin/transaction/:id",
  can("coinTransaction", "manage"),
  coinTransactionController.adminGetTransactionById,
);

router.get(
  "/admin/user/:userId",
  can("coinTransaction", "manage"),
  coinTransactionController.adminGetTransactionsByUser,
);

export default router;
