import { prisma } from '../config/db.config.js';
import cloudinary from '../config/cloudinary.config.js';
import { successResponse, errorResponse } from '../utils/helpers.js';
import { saveKYCToDatabase } from '../services/kyc.service.js';

//  USER KYC CONTROLLERS 
export const submitKYC = async (req, res) => {
  try {
    const userId = req.user.id;
    const userFullName = `${req.user.firstName} ${req.user.lastName}`;
    const { documentType, documentNumber } = req.body;

    if (req.user.isEmailVerified === true) {
      return errorResponse(res, 'You are already verified. No need to submit KYC request.', null, 400);
    }
    // ALL CHECKS IN CONTROLLER
    if (!req.files || !req.files.frontSideImage || !req.files.backSideImage) {
      return errorResponse(res, 'Both front side and back side images are required', null, 400);
    }

    // Validate document type
    const validDocumentTypes = ['national_id', 'passport', 'driving_license'];
    if (!validDocumentTypes.includes(documentType)) {
      return errorResponse(res, 'Invalid document type. Allowed: national_id, passport, driving_license', null, 400);
    }

    // Check if document number already exists
    const existingDocument = await prisma.kYCRequest.findFirst({
      where: {
        documentNumber: documentNumber,
        documentType: documentType,
        status: { in: ['pending', 'approved'] }
      }
    });

    if (existingDocument) {
      return errorResponse(res, `A KYC request with this ${documentType} number already exists. Please use a different document.`, null, 400);
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

    // Upload front side image to Cloudinary
    const frontUploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'kyc_documents/front_side', resource_type: 'image' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.files.frontSideImage[0].buffer);
    });

    // Upload back side image to Cloudinary
    const backUploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'kyc_documents/back_side', resource_type: 'image' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.files.backSideImage[0].buffer);
    });

    // Prepare final data with both images
    const kycData = {
      userId: userId,
      documentType: documentType,
      documentNumber: documentNumber,
      frontSideImage: frontUploadResult.secure_url,
      backSideImage: backUploadResult.secure_url,
      status: 'pending'
    };

    // Service saves to database
    const kycRequest = await saveKYCToDatabase(kycData);

    // Get full user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        roles: true,
        coins: true,
        isActive: true,
        isEmailVerified: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Format response
    const formattedResponse = {
      id: kycRequest.id,
      documentType: kycRequest.documentType,
      documentNumber: kycRequest.documentNumber,
      frontSideImage: kycRequest.frontSideImage,
      backSideImage: kycRequest.backSideImage,
      status: kycRequest.status,
      createdAt: kycRequest.createdAt,
      user: user
    };

    return successResponse(res, `Dear ${userFullName}, your KYC request has been submitted successfully.`, { kycRequest: formattedResponse }, 201);
  } catch (error) {
    console.error('Submit KYC error:', error);
    return errorResponse(res, 'Server error', error.message);
  }
};

export const getMyKYCStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const userFullName = `${req.user.firstName} ${req.user.lastName}`;

    const kycRequest = await prisma.kYCRequest.findFirst({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!kycRequest) {
      return successResponse(res, `Dear ${userFullName}, you haven't submitted KYC yet. Please submit your KYC to start posting listings.`, {
        kycSubmitted: false,
        status: null,
        recommendation: "Please submit your national_id, passport, or driving_license with clear front and back images"
      });
    }

    if (kycRequest.status === 'pending') {
      return successResponse(res, `Dear ${userFullName}, your KYC is under review. We will notify you once approved.`, {
        kycSubmitted: true,
        status: "pending",
        documentType: kycRequest.documentType,
        submittedAt: kycRequest.createdAt,
        nextAction: "waiting_for_admin_review"
      });
    }

    if (kycRequest.status === 'approved') {
      return successResponse(res, `Dear ${userFullName}, congratulations! Your KYC is verified. You can now create listings.`, {
        kycSubmitted: true,
        status: "approved",
        documentType: kycRequest.documentType,
        verifiedAt: kycRequest.reviewedAt,
        reviewedBy: "admin",
        nextAction: "can_create_listings"
      });
    }

    if (kycRequest.status === 'rejected') {
      return successResponse(res, `Dear ${userFullName}, your KYC was rejected. Please resubmit with clear images.`, {
        kycSubmitted: true,
        status: "rejected",
        documentType: kycRequest.documentType,
        rejectedAt: kycRequest.reviewedAt,
        reviewedBy: "admin",
        reason: kycRequest.reviewNote || "Document image is blurry",
        nextAction: "resubmit_with_clear_images"
      });
    }
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

//  ADMIN KYC CONTROLLERS 
export const getPendingKYC = async (req, res) => {
  try {
    const requests = await prisma.kYCRequest.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profileImage: true
          }
        }
      }
    });

    const formattedRequests = requests.map(request => ({
      id: request.id,
      documentType: request.documentType,
      documentNumber: request.documentNumber,
      frontSideImage: request.frontSideImage,
      backSideImage: request.backSideImage,
      status: request.status,
      submittedAt: request.createdAt,
      user: request.user
    }));

    return successResponse(res, `Retrieved ${formattedRequests.length} pending KYC requests`, {
      kycRequests: formattedRequests
    });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const getRejectedKYC = async (req, res) => {
  try {
    const requests = await prisma.kYCRequest.findMany({
      where: { status: 'rejected' },
      orderBy: { reviewedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profileImage: true
          }
        }
      }
    });

    const formattedRequests = await Promise.all(
      requests.map(async (request) => {
        let adminData = null;
        if (request.reviewedBy) {
          const admin = await prisma.user.findUnique({
            where: { id: request.reviewedBy },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              roles: true
            }
          });
          if (admin) {
            adminData = admin;
          }
        }

        return {
          id: request.id,
          documentType: request.documentType,
          documentNumber: request.documentNumber,
          frontSideImage: request.frontSideImage,
          backSideImage: request.backSideImage,
          status: request.status,
          rejectedAt: request.reviewedAt,
          rejectedBy: adminData,
          reason: request.reviewNote,
          user: request.user
        };
      })
    );

    return successResponse(res, `Retrieved ${formattedRequests.length} rejected KYC requests`, {
      kycRequests: formattedRequests
    });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const approveKYC = async (req, res) => {
  try {
    const { requestId } = req.params;
    const adminId = req.user.id;

    const kycRequest = await prisma.kYCRequest.findUnique({
      where: { id: requestId }
    });

    if (!kycRequest) {
      return errorResponse(res, 'KYC request not found', null, 404);
    }

    if (kycRequest.status !== 'pending') {
      return errorResponse(res, 'This KYC request has already been processed', null, 400);
    }

    await prisma.kYCRequest.update({
      where: { id: requestId },
      data: {
        status: 'approved',
        reviewedBy: adminId,
        reviewedAt: new Date()
      }
    });

    // Update user to verified
    await prisma.user.update({
      where: { id: kycRequest.userId },
      data: { isEmailVerified: true }
    });

    return successResponse(res, 'KYC request approved successfully');
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const getAllKYC = async (req, res) => {
  try {
    const { status } = req.query;
    
    const where = {};
    if (status) where.status = status;

    const requests = await prisma.kYCRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profileImage: true
          }
        }
      }
    });

    const formattedRequests = await Promise.all(
      requests.map(async (request) => {
        let adminData = null;
        if (request.reviewedBy && request.status !== 'pending') {
          const admin = await prisma.user.findUnique({
            where: { id: request.reviewedBy },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              roles: true
            }
          });
          if (admin) {
            adminData = admin;
          }
        }

        const responseData = {
          id: request.id,
          documentType: request.documentType,
          documentNumber: request.documentNumber,
          frontSideImage: request.frontSideImage,
          backSideImage: request.backSideImage,
          status: request.status,
          submittedAt: request.createdAt,
          user: request.user
        };

        if (request.status === 'approved') {
          responseData.verifiedAt = request.reviewedAt;
          responseData.approvedBy = adminData;
        } else if (request.status === 'rejected') {
          responseData.rejectedAt = request.reviewedAt;
          responseData.rejectedBy = adminData;
          responseData.reason = request.reviewNote;
        }

        return responseData;
      })
    );

    return successResponse(res, `Retrieved ${formattedRequests.length} KYC requests`, {
      kycRequests: formattedRequests
    });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const getKYCById = async (req, res) => {
  try {
    const { requestId } = req.params;

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

export const getApprovedKYC = async (req, res) => {
  try {
    const requests = await prisma.kYCRequest.findMany({
      where: { status: 'approved' },
      orderBy: { reviewedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profileImage: true
          }
        }
      }
    });

    const formattedRequests = await Promise.all(
      requests.map(async (request) => {
        let adminData = null;
        if (request.reviewedBy) {
          const admin = await prisma.user.findUnique({
            where: { id: request.reviewedBy },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              roles: true
            }
          });
          if (admin) {
            adminData = admin;
          }
        }

        return {
          id: request.id,
          documentType: request.documentType,
          documentNumber: request.documentNumber,
          frontSideImage: request.frontSideImage,
          backSideImage: request.backSideImage,
          status: request.status,
          verifiedAt: request.reviewedAt,
          approvedBy: adminData,
          user: request.user
        };
      })
    );

    return successResponse(res, `Retrieved ${formattedRequests.length} approved KYC requests`, {
      kycRequests: formattedRequests
    });
  } catch (error) {
    return errorResponse(res, 'Server error', error.message);
  }
};

export const rejectKYC = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reviewNote } = req.body;
    const adminId = req.user.id;

    const kycRequest = await prisma.kYCRequest.findUnique({
      where: { id: requestId }
    });

    if (!kycRequest) {
      return errorResponse(res, 'KYC request not found', null, 404);
    }

    if (kycRequest.status !== 'pending') {
      return errorResponse(res, 'This KYC request has already been processed', null, 400);
    }

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