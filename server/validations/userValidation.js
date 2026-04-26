import { USER_LEVELS, KYC_STATUS, COIN_RULES } from '../utils/constants.js';

// Registration validation
export const validateRegister = (data) => {
  const { username, firstname, lastname, email, phone, password, role } = data;
  const errors = [];

  // Username validation
  if (!username) {
    errors.push('Username is required');
  } else if (username.length < 3) {
    errors.push('Username must be at least 3 characters');
  } else if (username.length > 30) {
    errors.push('Username cannot exceed 30 characters');
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, and underscores');
  }

  // Email validation
  if (!email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please enter a valid email address');
  }

  // Password validation
  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 5) {
    errors.push('Password must be at least 5 characters');
  } else if (password.length > 100) {
    errors.push('Password cannot exceed 100 characters');
  }

  // Firstname and Lastname validation (optional)
  if (firstname) {
    if (firstname.trim() === '') {
      errors.push('First name cannot be empty if provided');
    } else if (firstname.length > 50) {
      errors.push('First name cannot exceed 50 characters');
    }
  }
  
  if (lastname) {
    if (lastname.trim() === '') {
      errors.push('Last name cannot be empty if provided');
    } else if (lastname.length > 50) {
      errors.push('Last name cannot exceed 50 characters');
    }
  }

  // Level validation using constants
  if (data.level !== undefined) {
    if (![USER_LEVELS.NORMAL, USER_LEVELS.VERIFIED, USER_LEVELS.PREMIUM].includes(data.level)) {
      errors.push(`Level must be ${USER_LEVELS.NORMAL} (normal), ${USER_LEVELS.VERIFIED} (verified), or ${USER_LEVELS.PREMIUM} (premium)`);
    }
  }

  // Coins validation
  if (data.coins !== undefined) {
    if (typeof data.coins !== 'number' || data.coins < 0) {
      errors.push('Coins must be a positive number');
    }
  }


  if (data.isEmailVerified !== undefined && typeof data.isEmailVerified !== 'boolean') {
    errors.push('isEmailVerified must be a boolean');
  }

  // freeTrial validation
  if (data.freeTrial !== undefined) {
    if (typeof data.freeTrial !== 'object') {
      errors.push('freeTrial must be an object');
    } else {
      if (data.freeTrial.used !== undefined && typeof data.freeTrial.used !== 'boolean') {
        errors.push('freeTrial.used must be a boolean');
      }
      if (data.freeTrial.availableUntil !== undefined) {
        const date = new Date(data.freeTrial.availableUntil);
        if (isNaN(date.getTime())) {
          errors.push('freeTrial.availableUntil must be a valid date');
        }
      }
    }
  }

  // KYC fields validation not during registration
  if (data.kycStatus !== undefined) {
    if (!Object.values(KYC_STATUS).includes(data.kycStatus)) {
      errors.push(`kycStatus must be one of: ${Object.values(KYC_STATUS).join(', ')}`);
    }
  }

  if (data.canCreateListings !== undefined && typeof data.canCreateListings !== 'boolean') {
    errors.push('canCreateListings must be a boolean');
  }

  // Role validation
  if (role) {
    const validRoles = ['user', 'admin', 'super_admin'];
    if (!validRoles.includes(role)) {
      errors.push('Invalid role. Role must be user, admin, or super_admin');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    role: role || 'user',
    ...data
  };
};

// Login validation
export const validateLogin = (data) => {
  const { email, password } = data;
  const errors = [];

  if (!email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please enter a valid email address');
  }

  if (!password) {
    errors.push('Password is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Profile update validation
export const validateProfileUpdate = (data) => {
  const { firstname, lastname, phone, password } = data;
  const errors = [];

  // Text field validations
  if (firstname !== undefined) {
    if (firstname === '') {
      errors.push('First name cannot be empty');
    } else if (firstname.length > 50) {
      errors.push('First name cannot exceed 50 characters');
    }
  }

  if (lastname !== undefined) {
    if (lastname === '') {
      errors.push('Last name cannot be empty');
    } else if (lastname.length > 50) {
      errors.push('Last name cannot exceed 50 characters');
    }
  }

  if (phone !== undefined) {
    if (phone === '') {
      errors.push('Phone cannot be empty');
    } else if (!/^\+?[0-9]{10,15}$/.test(phone.replace(/\s/g, ''))) {
      errors.push('Please enter a valid phone number (10-15 digits)');
    }
  }

  // Level validation
  if (data.level !== undefined) {
    if (![USER_LEVELS.NORMAL, USER_LEVELS.VERIFIED, USER_LEVELS.PREMIUM].includes(data.level)) {
      errors.push(`Level must be ${USER_LEVELS.NORMAL}, ${USER_LEVELS.VERIFIED}, or ${USER_LEVELS.PREMIUM}`);
    }
  }

  // Coins validation
  if (data.coins !== undefined) {
    if (typeof data.coins !== 'number' || data.coins < 0) {
      errors.push('Coins must be a positive number');
    }
  }

  // Profile image validation
  if (data.profileImage !== undefined) {
    if (typeof data.profileImage !== 'string') {
      errors.push('Profile image must be a string');
    } else if (data.profileImage && !data.profileImage.match(/^https?:\/\/.+/)) {
      errors.push('Profile image must be a valid URL starting with http:// or https://');
    }
  }

  // Boolean validations
  if (data.isActive !== undefined && typeof data.isActive !== 'boolean') {
    errors.push('isActive must be a boolean');
  }

  if (data.freeTrial !== undefined && typeof data.freeTrial !== 'object') {
    errors.push('freeTrial must be an object');
  }

  // KYC fields validation (admin only)
  if (data.kycStatus !== undefined) {
    if (!Object.values(KYC_STATUS).includes(data.kycStatus)) {
      errors.push(`kycStatus must be one of: ${Object.values(KYC_STATUS).join(', ')}`);
    }
  }

  if (data.canCreateListings !== undefined && typeof data.canCreateListings !== 'boolean') {
    errors.push('canCreateListings must be a boolean');
  }

  // Password validation
  if (password !== undefined) {
    if (password === '') {
      errors.push('Password cannot be empty');
    } else if (password.length < 5) {
      errors.push('Password must be at least 5 characters');
    } else if (password.length > 100) {
      errors.push('Password cannot exceed 100 characters');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};