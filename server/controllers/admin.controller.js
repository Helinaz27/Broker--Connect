import User from "../models/User.js";
import KycRequest from "../models/KycRequest.js";
import PostingFee from "../models/PostingFee.js";
import HouseListing from "../models/HouseListing.js";
import Car from "../models/Car.js";
import ServiceListing from "../models/ServiceListing.js";
import Payment from "../models/Payment.js";
import CoinTransaction from "../models/CoinTransaction.js";
import {
  KYC_STATUS,
  COIN_RULES,
  TRANSACTION_REASONS,
} from "../utils/constants.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      pendingKyc,
      approvedKyc,
      rejectedKyc,
      activeListings,
      totalPayments,
      totalCoinsIssued,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      KycRequest.countDocuments({ status: KYC_STATUS.PENDING }),
      KycRequest.countDocuments({ status: KYC_STATUS.APPROVED }),
      KycRequest.countDocuments({ status: KYC_STATUS.REJECTED }),
      HouseListing.countDocuments({ status: "active" }) +
        Car.countDocuments({ status: "active" }) +
        ServiceListing.countDocuments({ status: "active" }),
      Payment.countDocuments({ status: "success" }),
      CoinTransaction.aggregate([
        { $match: { type: "credit" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      User.find().sort({ createdAt: -1 }).limit(5).select("-passwordHash"),
    ]);

    res.json({
      success: true,
      message: "Dashboard statistics retrieved successfully",
      data: {
        totalUsers,
        pendingKyc,
        approvedKyc,
        rejectedKyc,
        activeListings,
        totalPayments,
        totalCoinsIssued: totalCoinsIssued[0]?.total || 0,
        recentUsers,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getPendingKYC = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const requests = await KycRequest.find({ status: KYC_STATUS.PENDING })
      .populate(
        "userId",
        "username firstname lastname email phone kycStatus canCreateListings",
      )
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await KycRequest.countDocuments({
      status: KYC_STATUS.PENDING,
    });

    res.json({
      success: true,
      message: "Pending KYC requests retrieved successfully",
      data: requests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const approveKYC = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await KycRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "KYC request not found",
      });
    }

    request.status = KYC_STATUS.APPROVED;
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    await User.findByIdAndUpdate(request.userId, {
      level: 1,
      kycStatus: KYC_STATUS.APPROVED,
      canCreateListings: true,
      kycApprovedAt: new Date(),
    });

    const kycBonus = COIN_RULES.KYC_BONUS || 0;
    if (kycBonus > 0) {
      const user = await User.findById(request.userId);
      user.coins += kycBonus;
      await user.save();

      await CoinTransaction.create({
        userId: request.userId,
        type: "credit",
        amount: kycBonus,
        reason: TRANSACTION_REASONS.KYC_BONUS,
        description: "KYC approval bonus",
      });
    }

    res.json({
      success: true,
      message: "KYC request approved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const rejectKYC = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reviewNote } = req.body;

    const request = await KycRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "KYC request not found",
      });
    }

    request.status = KYC_STATUS.REJECTED;
    request.reviewedBy = req.user._id;
    request.reviewNote = reviewNote;
    request.reviewedAt = new Date();
    await request.save();

    await User.findByIdAndUpdate(request.userId, {
      kycStatus: KYC_STATUS.REJECTED,
      canCreateListings: false,
      kycRejectedAt: new Date(),
      kycRejectionReason: reviewNote,
    });

    res.json({
      success: true,
      message: "KYC request rejected successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, level, kycStatus } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { firstname: { $regex: search, $options: "i" } },
        { lastname: { $regex: search, $options: "i" } },
      ];
    }
    if (role) filter.roles = role;
    if (level) filter.level = Number(level);
    if (kycStatus) filter.kycStatus = kycStatus;

    const users = await User.find(filter)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive, level, roles, kycStatus, canCreateListings } = req.body; // ADDED

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (isActive !== undefined) user.isActive = isActive;
    if (level !== undefined) user.level = level;
    if (roles !== undefined) user.roles = roles;
    if (kycStatus !== undefined) user.kycStatus = kycStatus; // ADDED
    if (canCreateListings !== undefined)
      user.canCreateListings = canCreateListings; // ADDED

    await user.save();

    res.json({
      success: true,
      message: "User status updated successfully",
      data: {
        id: user._id,
        username: user.username,
        isActive: user.isActive,
        level: user.level,
        roles: user.roles,
        kycStatus: user.kycStatus,
        canCreateListings: user.canCreateListings,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const createPostingFee = async (req, res) => {
  try {
    const { category, durationDays, priceBirr, description } = req.body;

    const fee = await PostingFee.create({
      category,
      durationDays,
      priceBirr,
      description,
      isActive: true,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Posting fee created successfully",
      data: fee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getPostingFees = async (req, res) => {
  try {
    const { category, isActive } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const fees = await PostingFee.find(filter)
      .populate("createdBy", "username")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Posting fees retrieved successfully",
      data: fees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const updatePostingFee = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fee = await PostingFee.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Posting fee not found",
      });
    }

    res.json({
      success: true,
      message: "Posting fee updated successfully",
      data: fee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const deletePostingFee = async (req, res) => {
  try {
    const { id } = req.params;

    const fee = await PostingFee.findByIdAndDelete(id);

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Posting fee not found",
      });
    }

    res.json({
      success: true,
      message: "Posting fee deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getSystemOverview = async (req, res) => {
  try {
    const [
      totalUsers,
      totalListings,
      totalPayments,
      totalKyc,
      recentActivities,
    ] = await Promise.all([
      User.countDocuments(),
      HouseListing.countDocuments() +
        Car.countDocuments() +
        ServiceListing.countDocuments(),
      Payment.countDocuments({ status: "success" }),
      KycRequest.countDocuments(),
      Promise.all([
        User.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select("username createdAt"),
        KycRequest.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate("userId", "username"),
        Payment.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate("userId", "username"),
      ]),
    ]);

    res.json({
      success: true,
      message: "System overview retrieved successfully",
      data: {
        counts: {
          users: totalUsers,
          listings: totalListings,
          payments: totalPayments,
          kyc: totalKyc,
        },
        recentActivities,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
