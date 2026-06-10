import * as coinTransactionService from "../services/coinTransaction.service.js";

export const getMyTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { transactions, total } =
      await coinTransactionService.getMyTransactionsService(
        req.user.id,
        page,
        limit,
      );
    return res.status(200).json({
      success: true,
      message: `Retrieved ${transactions.length} transactions successfully`,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

export const adminGetAllTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type || null;
    const { transactions, total } =
      await coinTransactionService.adminGetAllTransactionsService(
        page,
        limit,
        type,
      );
    return res.status(200).json({
      success: true,
      message: `Retrieved ${transactions.length} transactions successfully`,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

export const adminGetTransactionById = async (req, res) => {
  try {
    const transaction =
      await coinTransactionService.adminGetTransactionByIdService(
        req.params.id,
      );
    return res.status(200).json({
      success: true,
      message: "Transaction retrieved successfully",
      data: transaction,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

export const adminGetTransactionsByUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type || null;
    const { transactions, total } =
      await coinTransactionService.adminGetTransactionsByUserService(
        req.params.userId,
        page,
        limit,
        type,
      );
    return res.status(200).json({
      success: true,
      message: `Retrieved ${transactions.length} transactions successfully`,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
