import KycRequest from '../models/KycRequest.js';
import User from '../models/User.js';
import { KYC_STATUS, TRANSACTION_REASONS, COIN_RULES } from '../utils/constants.js';
import CoinTransaction from '../models/CoinTransaction.js';

export const checkExistingPendingRequest = async (userId) => {
  return await KycRequest.findOne({
    userId,
    status: KYC_STATUS.PENDING
  });
};

export const createKycRequest = async (userId, requestData) => {
  await User.findByIdAndUpdate(userId, {
    kycStatus: KYC_STATUS.PENDING,
    kycSubmittedAt: new Date()
  });
  
  return await KycRequest.create({
    userId,
    ...requestData,
    status: KYC_STATUS.PENDING,
    submissionCount: 1
  });
};

export const getUserKycRequests = async (userId) => {
  return await KycRequest.find({ userId })
    .sort({ createdAt: -1 })
    .populate('reviewedBy', 'username email');
};

export const fetchAllKycRequests = async (filter = {}, populate = true) => {
  let query = KycRequest.find(filter).sort({ createdAt: -1 });
  
  if (populate) {
    query = query
      .populate('userId', 'username email firstname lastname phone kycStatus canCreateListings')
      .populate('reviewedBy', 'username email');
  }
  
  return await query;
};

export const fetchKycRequestById = async (id, populate = true) => {
  let query = KycRequest.findById(id);
  
  if (populate) {
    query = query
      .populate('userId', 'username email firstname lastname phone kycStatus canCreateListings')
      .populate('reviewedBy', 'username email');
  }
  
  return await query;
};

export const updateKycRequest = async (id, updateData) => {
  return await KycRequest.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );
};

export const processKycReview = async (requestId, reviewerId, reviewData) => {
  const kycRequest = await KycRequest.findById(requestId);
  
  if (!kycRequest) return null;
  
  kycRequest.status = reviewData.status;
  kycRequest.reviewedBy = reviewerId;
  kycRequest.reviewNote = reviewData.reviewNote;
  kycRequest.reviewedAt = new Date();
  
  await kycRequest.save();
  

  if (reviewData.status === KYC_STATUS.APPROVED) {
    await User.findByIdAndUpdate(kycRequest.userId, {
      level: 1,
      kycStatus: KYC_STATUS.APPROVED,
      canCreateListings: true,
      kycApprovedAt: new Date()
    });
    

    const kycBonus = COIN_RULES.KYC_BONUS || 0;
    if (kycBonus > 0) {
      const user = await User.findById(kycRequest.userId);
      user.coins += kycBonus;
      await user.save();
      
      await CoinTransaction.create({
        userId: kycRequest.userId,
        type: 'credit',
        amount: kycBonus,
        reason: TRANSACTION_REASONS.KYC_BONUS,
        description: 'KYC approval bonus'
      });
    }
  } else if (reviewData.status === KYC_STATUS.REJECTED) {
    await User.findByIdAndUpdate(kycRequest.userId, {
      kycStatus: KYC_STATUS.REJECTED,
      canCreateListings: false,
      kycRejectedAt: new Date(),
      kycRejectionReason: reviewData.reviewNote
    });
  }
  
  return kycRequest;
};

export const removeKycRequest = async (id) => {
  const kycRequest = await KycRequest.findById(id);
  if (!kycRequest) return null;
  
  if (kycRequest.status === KYC_STATUS.PENDING) {
    await User.findByIdAndUpdate(kycRequest.userId, {
      kycStatus: KYC_STATUS.NONE,
      canCreateListings: false
    });
  }
  
  return await KycRequest.findByIdAndDelete(id);
};

export const updateUserLevelAfterKyc = async (userId, level = 1) => {
  return await User.findByIdAndUpdate(
    userId,
    { level },
    { new: true }
  );
};

export const getKycStatistics = async () => {
  const [pending, approved, rejected, total] = await Promise.all([
    KycRequest.countDocuments({ status: KYC_STATUS.PENDING }),
    KycRequest.countDocuments({ status: KYC_STATUS.APPROVED }),
    KycRequest.countDocuments({ status: KYC_STATUS.REJECTED }),
    KycRequest.countDocuments()
  ]);
  
  return {
    pending,
    approved,
    rejected,
    total,
    approvalRate: total > 0 ? ((approved / total) * 100).toFixed(2) : 0
  };
};

export const getUserKycStatus = async (userId) => {
  const latestRequest = await KycRequest.findOne({ userId })
    .sort({ createdAt: -1 })
    .populate('reviewedBy', 'username email');
  
  const user = await User.findById(userId).select('kycStatus canCreateListings');
  
  return {
    status: user?.kycStatus || KYC_STATUS.NONE,
    canCreateListings: user?.canCreateListings || false,
    latestRequest: latestRequest ? formatKycResponse(latestRequest) : null
  };
};


export const resubmitKycRequest = async (userId, requestData) => {
  const rejectedRequest = await KycRequest.findOne({
    userId,
    status: KYC_STATUS.REJECTED
  }).sort({ createdAt: -1 });
  
  const submissionCount = rejectedRequest ? rejectedRequest.submissionCount + 1 : 1;
  
  await User.findByIdAndUpdate(userId, {
    kycStatus: KYC_STATUS.PENDING,
    kycSubmittedAt: new Date()
  });
  
  const previousRequests = rejectedRequest ? [rejectedRequest._id] : [];
  
  return await KycRequest.create({
    userId,
    ...requestData,
    status: KYC_STATUS.PENDING,
    submissionCount,
    previousRequests
  });
};

export const formatKycResponse = (kycRequest) => {
  return {
    _id: kycRequest._id,
    userId: kycRequest.userId,
    documentType: kycRequest.documentType,
    documentNumber: kycRequest.documentNumber,
    documentImageUrl: kycRequest.documentImageUrl,
    status: kycRequest.status,
    reviewedBy: kycRequest.reviewedBy,
    reviewNote: kycRequest.reviewNote,
    reviewedAt: kycRequest.reviewedAt,
    submissionCount: kycRequest.submissionCount,
    previousRequests: kycRequest.previousRequests,
    createdAt: kycRequest.createdAt,
    updatedAt: kycRequest.updatedAt
  };
};