import User from '../models/User.js';

export const canCreateListing = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user.canCreateListings) {
      return res.status(403).json({
        success: false,
        message: 'KYC approval required to create listings. Please submit KYC request.'
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};