import cloudinary from '../config/cloudinary.config.js';
import { successResponse, errorResponse } from '../utils/helpers.js';
import { saveKYCToDatabase } from '../services/kyc.service.js';

//  USER KYC CONTROLLERS 

export const submitKYC = async (req, res) => {
  try {
    const userId = req.user.id;
    const { documentType, documentNumber } = req.body;

    // ALL CHECKS IN CONTROLLER
    if (!req.file) {
      return errorResponse(res, 'Document image is required', null, 400);
    }

    // Check existing KYC
    const existingKYC = await prisma.kYCRequest.findFirst({
      where: {
        userId: userId,
        status: { in: ['pending', 'approved'] }
      }
    });

    if (existingKYC) {
      return errorResponse(res, 'You already have a pending or approved KYC request', null, 400);
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'kyc_documents', resource_type: 'image' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // Prepare final data after ALL checks
    const kycData = {
      userId: userId,
      documentType: documentType,
      documentNumber: documentNumber,
      documentImageUrl: uploadResult.secure_url,
      status: 'pending'
    };

    // Service ONLY saves to database (no checks)
    const kycRequest = await saveKYCToDatabase(kycData);

    return successResponse(res, 'KYC request submitted successfully', { kycRequest }, 201);
  } catch (error) {
    console.error('Submit KYC error:', error);
    return errorResponse(res, 'Server error', error.message);
  }
};

export const getMyKYCStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    // Controller does the find
    const kycRequest = await prisma.kYCRequest.findFirst({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!kycRequest) {
      return successResponse(res, 'No KYC request found', { status: 'not_submitted' });
    }

    return successResponse(res, 'KYC status retrieved', { kycRequest });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

//  ADMIN KYC CONTROLLERS 

export const getPendingKYC = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Controller does the find
    const [requests, total] = await Promise.all([
      prisma.kYCRequest.findMany({
        where: { status: 'pending' },
        skip: skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'asc' }
      }),
      prisma.kYCRequest.count({ where: { status: 'pending' } })
    ]);

    return successResponse(res, `Retrieved ${requests.length} pending KYC requests`, {
      kycRequests: requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const getAllKYC = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    // Controller does the find
    const [requests, total] = await Promise.all([
      prisma.kYCRequest.findMany({
        where,
        skip: skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.kYCRequest.count({ where })
    ]);

    return successResponse(res, `Retrieved ${requests.length} KYC requests`, {
      kycRequests: requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const getKYCById = async (req, res) => {
  try {
    const { requestId } = req.params;

    // Controller does the find
    const kycRequest = await prisma.kYCRequest.findUnique({
      where: { id: requestId }
    });

    if (!kycRequest) {
      return errorResponse(res, 'KYC request not found', null, 404);
    }

    return successResponse(res, 'KYC request retrieved', { kycRequest });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const approveKYC = async (req, res) => {
  try {
    const { requestId } = req.params;
    const adminId = req.user.id;

    // Controller does ALL checks
    const kycRequest = await prisma.kYCRequest.findUnique({
      where: { id: requestId }
    });

    if (!kycRequest) {
      return errorResponse(res, 'KYC request not found', null, 404);
    }

    if (kycRequest.status !== 'pending') {
      return errorResponse(res, 'This KYC request has already been processed', null, 400);
    }

    // Controller updates directly (or call service only to save)
    await prisma.kYCRequest.update({
      where: { id: requestId },
      data: {
        status: 'approved',
        reviewedBy: adminId,
        reviewedAt: new Date()
      }
    });

    // Update user
    await prisma.user.update({
      where: { id: kycRequest.userId },
      data: { isEmailVerified: true }
    });

    return successResponse(res, 'KYC request approved successfully');
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const rejectKYC = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reviewNote } = req.body;
    const adminId = req.user.id;

    // Controller does ALL checks
    const kycRequest = await prisma.kYCRequest.findUnique({
      where: { id: requestId }
    });

    if (!kycRequest) {
      return errorResponse(res, 'KYC request not found', null, 404);
    }

    if (kycRequest.status !== 'pending') {
      return errorResponse(res, 'This KYC request has already been processed', null, 400);
    }

    // Controller updates directly
    await prisma.kYCRequest.update({
      where: { id: requestId },
      data: {
        status: 'rejected',
        reviewedBy: adminId,
        reviewNote: reviewNote,
        reviewedAt: new Date()
      }
    });

    return successResponse(res, 'KYC request rejected successfully');
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};