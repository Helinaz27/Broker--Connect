// utils/constants.js
export const COIN_RULES = {
  WELCOME_BONUS: 30,
  POSTING_FEE: 5,
  SYSTEM_CONTACT_FEE: 5,
  MAX_IMAGES_PER_LISTING: 3,
  MIN_TO_BUY :10,
  MIN_TO_SEND : 10
};

export const USER_LEVELS = {
  NORMAL: 0,
  VERIFIED: 1,
  PREMIUM: 2
};

export const KYC_STATUS = {
  NONE: 'none',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const TRANSACTION_REASONS = {
  WELCOME_BONUS: 'welcome_bonus',
  KYC_BONUS: 'kyc_bonus',
  PURCHASE: 'purchase',
  POSTING_FEE: 'posting_fee',
  CONTACT_ACCESS: 'contact_access',
  USER_TRANSFER: 'user_transfer',
  REFUND: 'refund'
};

export const LISTING_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SOLD: 'sold',
  RENTED: 'rented',
  OCCUPIED: 'occupied',
  COMPLETED: 'completed'
};

export const LISTING_TYPES = {
  HOUSE: 'house',
  CAR: 'car',
  SERVICE: 'service'
};