import { prisma } from "../config/db.config.js";
import cloudinary from "../config/cloudinary.config.js";
import { emitToUser } from "../socket/socket.js";
import {
  notifyKYCApproved,
  notifyKYCRejected,
} from "./notification.service.js";

const uploadToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    uploadStream.end(file.buffer);
  });
};

export const submitKYCService = async (
  userId,
  userFullName,
  files,
  documentType,
  documentNumber,
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (user.isKYCVerified) {
    return {
      success: false,
      message: "You are already verified.",
      status: 400,
    };
  }

  if (!files?.frontSideImage || !files?.backSideImage) {
    return {
      success: false,
      message: "Both front and back images are required",
      status: 400,
    };
  }

  const validTypes = ["national_id", "passport", "driving_license"];
  if (!validTypes.includes(documentType)) {
    return { success: false, message: "Invalid document type", status: 400 };
  }

  const existingDoc = await prisma.kYCRequest.findFirst({
    where: {
      documentNumber,
      documentType,
      status: { in: ["pending", "approved"] },
      userId: { not: userId },
    },
  });

  if (existingDoc) {
    return {
      success: false,
      message: `This ${documentType} number already exists`,
      status: 400,
    };
  }

  const existingKYC = await prisma.kYCRequest.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const [frontImage, backImage] = await Promise.all([
    uploadToCloudinary(files.frontSideImage[0], "kyc_documents/front_side"),
    uploadToCloudinary(files.backSideImage[0], "kyc_documents/back_side"),
  ]);

  const kycData = {
    documentType,
    documentNumber,
    frontSideImage: frontImage.secure_url,
    backSideImage: backImage.secure_url,
    status: "pending",
    reviewedBy: null,
    reviewNote: null,
    reviewedAt: null,
  };

  let kycRequest;

  if (existingKYC) {
    kycRequest = await prisma.kYCRequest.update({
      where: { id: existingKYC.id },
      data: kycData,
    });
  } else {
    kycRequest = await prisma.kYCRequest.create({
      data: { userId, ...kycData },
    });
  }

  const notification = await prisma.notification.create({
    data: {
      userId,
      type: "kyc_submitted",
      title: "KYC Submitted",
      body: `Dear ${userFullName}, your KYC request has been submitted and is under review.`,
      // path: "/kyc/status",
      isRead: false,
    },
  });

  emitToUser(userId, "new_notification", notification);

  const updatedUser = await prisma.user.findUnique({
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
      isKYCVerified: true,
      profileImage: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    success: true,
    message: `Dear ${userFullName}, your KYC request has been submitted successfully.`,
    data: {
      kycRequest: {
        id: kycRequest.id,
        documentType,
        frontSideImage: kycRequest.frontSideImage,
        backSideImage: kycRequest.backSideImage,
        status: "pending",
        createdAt: kycRequest.createdAt,
        user: updatedUser,
      },
    },
    status: 201,
  };
};

export const getMyKYCStatusService = async (
  userId,
  userFullName,
  isKYCVerified,
) => {
  if (isKYCVerified) {
    return {
      success: true,
      message: `Dear ${userFullName}, you are already verified.`,
      data: {
        isKYCVerified: true,
        status: "verified",
        nextAction: "can_create_listings",
      },
      status: 200,
    };
  }

  const kycRequest = await prisma.kYCRequest.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (!kycRequest) {
    return {
      success: true,
      message: `Dear ${userFullName}, you haven't submitted KYC yet.`,
      data: {
        kycSubmitted: false,
        status: null,
        recommendation: "Please submit your ID, passport, or driving license",
      },
      status: 200,
    };
  }

  const statusMap = {
    pending: {
      message: "Your KYC is under review",
      nextAction: "waiting_for_admin_review",
    },
    approved: {
      message: "Congratulations! Your KYC is verified",
      nextAction: "can_create_listings",
    },
    rejected: {
      message: "Your KYC was rejected",
      nextAction: "resubmit_with_clear_images",
    },
  };

  const result = {
    kycSubmitted: true,
    status: kycRequest.status,
    documentType: kycRequest.documentType,
    submittedAt: kycRequest.createdAt,
    nextAction: statusMap[kycRequest.status].nextAction,
  };

  if (kycRequest.status === "rejected") {
    result.reason = kycRequest.reviewNote || "Document image is blurry";
  }

  return {
    success: true,
    message: `Dear ${userFullName}, ${statusMap[kycRequest.status].message}`,
    data: result,
    status: 200,
  };
};

export const getAllKYCService = async (status, page, limit) => {
  const skip = (page - 1) * limit;
  const where = status && status !== "all" ? { status } : {};

  const [requests, total] = await Promise.all([
    prisma.kYCRequest.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profileImage: true,
          },
        },
      },
    }),
    prisma.kYCRequest.count({ where }),
  ]);

  const formattedRequests = await Promise.all(
    requests.map(async (req) => {
      const result = {
        id: req.id,
        documentType: req.documentType,
        documentNumber: req.documentNumber,
        frontSideImage: req.frontSideImage,
        backSideImage: req.backSideImage,
        status: req.status,
        submittedAt: req.createdAt,
        user: req.user,
      };

      if (req.reviewedBy && req.status !== "pending") {
        const admin = await prisma.user.findUnique({
          where: { id: req.reviewedBy },
          select: { id: true, firstName: true, lastName: true, email: true },
        });
        if (req.status === "approved") {
          result.verifiedAt = req.reviewedAt;
          result.approvedBy = admin;
        } else if (req.status === "rejected") {
          result.rejectedAt = req.reviewedAt;
          result.rejectedBy = admin;
          result.reason = req.reviewNote;
        }
      }

      return result;
    }),
  );

  return {
    success: true,
    message: `Retrieved ${formattedRequests.length} KYC requests`,
    data: {
      kycRequests: formattedRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
    status: 200,
  };
};

export const getKYCByIdService = async (requestId) => {
  const kycRequest = await prisma.kYCRequest.findUnique({
    where: { id: requestId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!kycRequest) {
    return { success: false, message: "KYC request not found", status: 404 };
  }

  return {
    success: true,
    message: "KYC request retrieved",
    data: { kycRequest },
    status: 200,
  };
};

export const approveKYCService = async (requestId, adminId, adminFullName) => {
  const kycRequest = await prisma.kYCRequest.findUnique({
    where: { id: requestId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          roles: true,
        },
      },
    },
  });

  if (!kycRequest) {
    return { success: false, message: "KYC request not found", status: 404 };
  }

  const currentRoles = kycRequest.user.roles;
  const updatedRoles = Array.from(new Set([...currentRoles, "client"]));

  const approvedAt = new Date();

  await Promise.all([
    prisma.kYCRequest.update({
      where: { id: requestId },
      data: { status: "approved", reviewedBy: adminId, reviewedAt: approvedAt },
    }),
    prisma.user.update({
      where: { id: kycRequest.userId },
      data: { isKYCVerified: true, roles: { set: updatedRoles } },
    }),
  ]);

  const notification = await prisma.notification.create({
    data: {
      userId: kycRequest.userId,
      type: "kyc_approved",
      title: "KYC Approved!",
      body: "Congratulations! Your identity verification has been approved. You can now create listings.",
      path: "/kyc/status",
      isRead: false,
    },
  });

  emitToUser(kycRequest.userId, "new_notification", notification);

  notifyKYCApproved({
    userId: kycRequest.userId,
    userEmail: kycRequest.user.email,
    firstName: kycRequest.user.firstName,
  }).catch((err) => console.error("notifyKYCApproved error:", err));

  return {
    success: true,
    message: "KYC approved successfully",
    data: {
      kycRequest: {
        id: kycRequest.id,
        documentType: kycRequest.documentType,
        status: "approved",
        approvedAt,
        approvedBy: { id: adminId, name: adminFullName },
      },
      user: { id: kycRequest.userId, isKYCVerified: true },
    },
    status: 200,
  };
};

export const rejectKYCService = async (
  requestId,
  adminId,
  adminFullName,
  reviewNote,
) => {
  const kycRequest = await prisma.kYCRequest.findUnique({
    where: { id: requestId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          roles: true,
        },
      },
    },
  });

  if (!kycRequest) {
    return { success: false, message: "KYC request not found", status: 404 };
  }

  if (!kycRequest.user) {
    return {
      success: false,
      message: "User not found for this KYC request",
      status: 404,
    };
  }

  const rejectedAt = new Date();
  const reason = reviewNote || "Document image is blurry";
  const updatedRoles =
    kycRequest.user.roles?.filter((role) => role !== "client") || [];

  await Promise.all([
    prisma.kYCRequest.update({
      where: { id: requestId },
      data: {
        status: "rejected",
        reviewedBy: adminId,
        reviewNote: reason,
        reviewedAt: rejectedAt,
      },
    }),
    prisma.user.update({
      where: { id: kycRequest.userId },
      data: { isKYCVerified: false, roles: { set: updatedRoles } },
    }),
  ]);

  const notification = await prisma.notification.create({
    data: {
      userId: kycRequest.userId,
      type: "kyc_rejected",
      title: "KYC Verification Rejected",
      body: `Your KYC was rejected. Reason: ${reason}. Please re-submit with correct documents.`,
      path: "/kyc/submit",
      isRead: false,
    },
  });

  emitToUser(kycRequest.userId, "new_notification", notification);

  notifyKYCRejected({
    userId: kycRequest.userId,
    userEmail: kycRequest.user.email,
    firstName: kycRequest.user.firstName,
    reviewNote: reason,
  }).catch((err) => console.error("notifyKYCRejected error:", err));

  return {
    success: true,
    message: "KYC rejected successfully",
    data: {
      kycRequest: {
        id: kycRequest.id,
        documentType: kycRequest.documentType,
        status: "rejected",
        rejectedAt,
        reason,
        rejectedBy: { id: adminId, name: adminFullName },
      },
      user: { id: kycRequest.userId, isKYCVerified: false },
      nextAction: "user_needs_to_resubmit_with_clear_images",
    },
    status: 200,
  };
};
