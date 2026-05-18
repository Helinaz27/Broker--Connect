import bcrypt from 'bcryptjs';

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};


export const formatUserResponse = (user) => {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    roles: user.roles,
    coins: user.coins,
    isActive: user.isActive,
    isKYCVerified: user.isKYCVerified,
    profileImage: user.profileImage,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

// Compare password (reusable for login, password change)
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const formatPagination = (page, limit, total) => {
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / limit)
  };
};

export const successResponse = (res, message, data = null, statusCode = 200) => {
  const response = { success: true, message };
  if (data) response.data = data;
  return res.status(statusCode).json(response);
};

// Format error response (reusable)
export const errorResponse = (res, message, error = null, statusCode = 500) => {
  const response = { success: false, message };
  if (error) response.error = error;
  return res.status(statusCode).json(response);
};