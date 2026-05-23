import axios from "axios";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import https from "https";
import { prisma } from "../config/db.config.js";
import { successResponse, errorResponse } from "../utils/helpers.js";
import { COIN_RULES } from "../utils/constants.js";
import {
  createPendingPayment,
  getPaymentByTxRef,
  creditCoinsToUser,
  markPaymentFailed,
  getPaginatedPayments,
} from "../services/payment.service.js";

export const initiateChapa = async (req, res) => {
  try {
    const { coinsRequested } = req.body;
    const user = req.user;

    const amountBirr = coinsRequested * COIN_RULES.COIN_PRICE_IN_BIRR;
    const tx_ref = `ch-${user.id}-${uuidv4().split("-")[0]}`;

    const payment = await createPendingPayment({
      userId: user.id,
      amountBirr,
      coinsReceived: coinsRequested,
      transactionId: tx_ref,
    });

    const { data } = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        amount: amountBirr.toString(),
        currency: "ETB",
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        phone_number: user.phone,
        tx_ref,
        return_url: `${process.env.FRONTEND_URL}/payment/result?tx_ref=${tx_ref}`,
        "customization[title]": "Buy Coins",
        "customization[description]": `Purchase of ${coinsRequested} coins`,
      },
      {
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    return successResponse(
      res,
      "Payment initiated successfully",
      {
        checkout_url: data.data.checkout_url,
        tx_ref,
        amountBirr,
        coinsRequested,
        paymentId: payment.id,
      },
      201,
    );
  } catch (error) {
    console.error(
      "Chapa response:",
      JSON.stringify(error.response?.data, null, 2),
    );
    return errorResponse(
      res,
      "Failed to initiate payment",
      error.response?.data?.message || error.message,
    );
  }
};

export const verifyChapa = async (req, res) => {
  try {
    const { tx_ref } = req.params;
    const user = req.user;

    const payment = await getPaymentByTxRef(tx_ref);
    if (!payment)
      return errorResponse(res, "Payment record not found", null, 404);
    if (payment.userId !== user.id)
      return errorResponse(res, "Unauthorized", null, 403);
    if (payment.status === "success") {
      return successResponse(res, "Payment already verified", { payment });
    }

    const { data } = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` },
      },
    );

    if (data.data.status !== "success") {
      await markPaymentFailed(tx_ref);
      return errorResponse(res, "Payment was not successful", null, 400);
    }

    const [updatedPayment, updatedUser] = await creditCoinsToUser({
      transactionId: tx_ref,
      userId: payment.userId,
      coinsReceived: payment.coinsReceived,
      amountBirr: payment.amountBirr,
    });

    return successResponse(
      res,
      `Dear ${user.firstName} ${user.lastName}, ${payment.coinsReceived} coins have been added to your balance`,
      {
        coinsReceived: payment.coinsReceived,
        currentCoinBalance: updatedUser.coins,
        payment: updatedPayment,
      },
    );
  } catch (error) {
    console.error("Verify Chapa error:", error.response?.data || error.message);
    return errorResponse(
      res,
      "Failed to verify payment",
      error.response?.data?.message || error.message,
    );
  }
};

export const chapaWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-chapa-signature"];
    const hash = crypto
      .createHmac("sha256", process.env.CHAPA_WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest("hex");
    if (hash !== signature) {
      return res.sendStatus(401);
    }

    const { tx_ref, status } = req.body;

    const payment = await getPaymentByTxRef(tx_ref);
    if (!payment) return res.sendStatus(200);
    if (payment.status === "success") return res.sendStatus(200);

    if (status !== "success") {
      await markPaymentFailed(tx_ref);
      return res.sendStatus(200);
    }

    await creditCoinsToUser({
      transactionId: tx_ref,
      userId: payment.userId,
      coinsReceived: payment.coinsReceived,
      amountBirr: payment.amountBirr,
    });

    return res.sendStatus(200);
  } catch (error) {
    console.error("Chapa webhook error:", error.message);
    return res.sendStatus(200);
  }
};

export const getMyPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { payments, total } = await getPaginatedPayments({
      filters: { userId: req.user.id },
      page,
      limit,
    });

    return successResponse(
      res,
      `Dear ${req.user.firstName} ${req.user.lastName}, you have ${total} payments`,
      {
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    );
  } catch (error) {
    return errorResponse(res, "Server error", error.message);
  }
};

export const getCoinBalance = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { coins: true, firstName: true, lastName: true },
    });

    return successResponse(
      res,
      `Dear ${user.firstName} ${user.lastName}, your current coin balance is ${user.coins}`,
      { coins: user.coins },
    );
  } catch (error) {
    return errorResponse(res, "Server error", error.message);
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, paymentMethod } = req.query;
    const { payments, total } = await getPaginatedPayments({
      filters: {
        ...(status && { status }),
        ...(paymentMethod && { paymentMethod }),
      },
      page,
      limit,
    });

    return successResponse(
      res,
      `Retrieved ${payments.length} of ${total} payments`,
      {
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    );
  } catch (error) {
    return errorResponse(res, "Server error", error.message);
  }
};

export const searchPayment = async (req, res) => {
  try {
    const { transactionId, status, page = 1, limit = 20 } = req.query;
    const { payments, total } = await getPaginatedPayments({
      filters: {
        ...(transactionId && { transactionId: { contains: transactionId } }),
        ...(status && { status }),
      },
      page,
      limit,
    });

    return successResponse(res, `Found ${total} payments`, {
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    return errorResponse(res, "Server error", error.message);
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, completedAt } = req.body;

    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) return errorResponse(res, "Payment not found", null, 404);

    const updated = await prisma.payment.update({
      where: { id },
      data: {
        status,
        ...(completedAt && { completedAt: new Date(completedAt) }),
      },
    });

    return successResponse(res, "Payment status updated successfully", {
      payment: updated,
    });
  } catch (error) {
    return errorResponse(res, "Server error", error.message);
  }
};

export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) return errorResponse(res, "Payment not found", null, 404);

    await prisma.payment.delete({ where: { id } });

    return successResponse(res, "Payment deleted successfully", null);
  } catch (error) {
    return errorResponse(res, "Server error", error.message);
  }
};
