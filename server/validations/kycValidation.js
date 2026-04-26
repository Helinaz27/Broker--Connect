// validations/kycValidation.js
import { KYC_STATUS } from '../utils/constants.js';

export const validateKycSubmit = (data) => {
  const { documentType, documentNumber, documentImageUrl } = data;
  const errors = [];

  if (!documentType) {
    errors.push('Document type is required');
  } else if (!['kebele', 'national_id', 'passport'].includes(documentType)) {
    errors.push('Document type must be kebele, national_id, or passport');
  }

  if (!documentNumber) {
    errors.push('Document number is required');
  } else if (documentNumber.trim() === '') {
    errors.push('Document number cannot be empty');
  } else if (documentNumber.length < 3) {
    errors.push('Document number must be at least 3 characters');
  } else if (documentNumber.length > 50) {
    errors.push('Document number cannot exceed 50 characters');
  }

  if (!documentImageUrl) {
    errors.push('Document image is required');
  } else if (documentImageUrl.trim() === '') {
    errors.push('Document image cannot be empty');
  } else if (!documentImageUrl.match(/^https?:\/\/.+/)) {
    errors.push('Document image must be a valid URL starting with http:// or https://');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateKycReview = (data) => {
  const { status, reviewNote } = data;
  const errors = [];

  if (!status) {
    errors.push('Status is required');
  } else if (![KYC_STATUS.APPROVED, KYC_STATUS.REJECTED].includes(status)) {
    errors.push(`Status must be ${KYC_STATUS.APPROVED} or ${KYC_STATUS.REJECTED}`);
  }

  if (reviewNote !== undefined) {
    if (reviewNote.trim() === '') {
      errors.push('Review note cannot be empty if provided');
    } else if (reviewNote.length < 5) {
      errors.push('Review note must be at least 5 characters');
    } else if (reviewNote.length > 500) {
      errors.push('Review note cannot exceed 500 characters');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateStatusFilter = (status) => {
  if (status) {
    if (![KYC_STATUS.PENDING, KYC_STATUS.APPROVED, KYC_STATUS.REJECTED].includes(status)) {
      return {
        isValid: false,
        message: `Status must be ${KYC_STATUS.PENDING}, ${KYC_STATUS.APPROVED}, or ${KYC_STATUS.REJECTED}`
      };
    }
  }
  return { isValid: true };
};

export const validateKycUpdate = (data) => {
  const { documentType, documentNumber, documentImageUrl } = data;
  const errors = [];

  if (!documentType && !documentNumber && !documentImageUrl) {
    errors.push('At least one field must be provided for update');
    return { isValid: false, errors };
  }

  // Document Type validation 
  if (documentType && !['kebele', 'national_id', 'passport'].includes(documentType)) {
    errors.push('Document type must be kebele, national_id, or passport');
  }

  // Document Number validation 
  if (documentNumber) {
    if (documentNumber.trim() === '') {
      errors.push('Document number cannot be empty');
    } else if (documentNumber.length < 3) {
      errors.push('Document number must be at least 3 characters');
    } else if (documentNumber.length > 50) {
      errors.push('Document number cannot exceed 50 characters');
    }
  }

  if (documentImageUrl) {
    if (documentImageUrl.trim() === '') {
      errors.push('Document image cannot be empty');
    } else if (!documentImageUrl.match(/^https?:\/\/.+/)) {
      errors.push('Document image must be a valid URL starting with http:// or https://');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};