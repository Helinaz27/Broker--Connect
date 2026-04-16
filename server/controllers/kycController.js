import KycRequest from '../models/KycRequest.js';
import User from '../models/User.js';
import CoinTransaction from '../models/CoinTransaction.js'; // ADDED
import { KYC_STATUS, COIN_RULES, TRANSACTION_REASONS } from '../utils/constants.js'; // ADDED
import {
  validateKycSubmit,
  validateKycReview,
  validateStatusFilter
} from '../validations/kycValidation.js';
import {
  checkExistingPendingRequest,
  createKycRequest,
  getUserKycRequests,
  fetchAllKycRequests,
  fetchKycRequestById,
  processKycReview,
  removeKycRequest,
  updateUserLevelAfterKyc,
  formatKycResponse
} from '../services/kycService.js';

export const submitKycRequest = async (req, res) => {
  try {
    const validation = validateKycSubmit(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        message: 'Validation failed: ' + validation.errors.join(', ')
      });
    }

    const existingRequest = await checkExistingPendingRequest(req.user._id);
    if (existingRequest) {
      return res.status(400).json({
        message: 'You already have a pending KYC request'
      });
    }

    const kycRequest = await createKycRequest(req.user._id, {
      ...req.body,
      status: KYC_STATUS.PENDING
    });

    // Update user's kyc status
    await User.findByIdAndUpdate(req.user._id, {
      kycStatus: KYC_STATUS.PENDING,
      kycSubmittedAt: new Date()
    });

    res.status(201).json({
      message: 'KYC request submitted successfully',
      kycRequest: formatKycResponse(kycRequest)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMyKycRequests = async (req, res) => {
  try {
    const requests = await getUserKycRequests(req.user._id);

    res.json({
      count: requests.length,
      requests: requests.map(req => formatKycResponse(req))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllKycRequests = async (req, res) => {
  try {
    const { status } = req.query;
    
    const statusValidation = validateStatusFilter(status);
    if (!statusValidation.isValid) {
      return res.status(400).json({ message: statusValidation.message });
    }

    const filter = status ? { status } : {};
    const requests = await fetchAllKycRequests(filter, true);

    res.json({
      count: requests.length,
      requests: requests.map(req => formatKycResponse(req))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getKycRequestById = async (req, res) => {
  try {
    const request = await fetchKycRequestById(req.params.id, true);

    if (!request) {
      return res.status(404).json({ message: 'KYC request not found' });
    }

    res.json({ request: formatKycResponse(request) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const reviewKycRequest = async (req, res) => {
  try {
    const validation = validateKycReview(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        message: 'Validation failed: ' + validation.errors.join(', ')
      });
    }

    const kycRequest = await KycRequest.findById(req.params.id);
    if (!kycRequest) {
      return res.status(404).json({ message: 'KYC request not found' });
    }

    if (kycRequest.status !== 'pending') {
      return res.status(400).json({
        message: `This request has already been ${kycRequest.status}`
      });
    }

    const updatedRequest = await processKycReview(
      req.params.id,
      req.user._id,
      req.body
    );

    if (req.body.status === 'approved') {
      await User.findByIdAndUpdate(kycRequest.userId, {
        level: 1,
        kycStatus: KYC_STATUS.APPROVED,
        canCreateListings: true,
        kycApprovedAt: new Date()
      });

      await User.findByIdAndUpdate(kycRequest.userId, {
        $inc: { coins: COIN_RULES.KYC_BONUS || 0 }
      });

      await CoinTransaction.create({
        userId: kycRequest.userId,
        type: 'credit',
        amount: COIN_RULES.KYC_BONUS || 0,
        reason: TRANSACTION_REASONS.KYC_BONUS,
        description: 'KYC approval bonus'
      });
    } else if (req.body.status === 'rejected') {
      await User.findByIdAndUpdate(kycRequest.userId, {
        kycStatus: KYC_STATUS.REJECTED,
        canCreateListings: false,
        kycRejectedAt: new Date(),
        kycRejectionReason: req.body.reviewNote
      });
    }

    res.json({
      message: `KYC request ${req.body.status} successfully`,
      kycRequest: formatKycResponse(updatedRequest)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteKycRequest = async (req, res) => {
  try {
    const kycRequest = await removeKycRequest(req.params.id);

    if (!kycRequest) {
      return res.status(404).json({ message: 'KYC request not found' });
    }

    await User.findByIdAndUpdate(kycRequest.userId, {
      kycStatus: KYC_STATUS.NONE,
      canCreateListings: false
    });

    res.json({ message: 'KYC request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};