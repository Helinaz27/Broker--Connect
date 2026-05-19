import * as contactAccessService from '../services/contactAccess.service.js';

export const accessContact = async (req, res) => {
  try {
    const { listingId } = req.body;

    const data = await contactAccessService.accessContactService(req.user.id, listingId);

    return res.status(201).json({
      success: true,
      message: 'Contact access granted successfully',
      data,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const getMyAccesses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { accesses, total } = await contactAccessService.getMyAccessesService(
      req.user.id,
      page,
      limit
    );
    return res.status(200).json({
      success: true,
      message: `Retrieved ${accesses.length} accesses successfully`,
      data: {
        accesses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const adminGetAllAccesses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { accesses, total } = await contactAccessService.adminGetAllAccessesService(page, limit);
    return res.status(200).json({
      success: true,
      message: `Retrieved ${accesses.length} accesses successfully`,
      data: {
        accesses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const adminGetAccessesByListing = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { accesses, total } = await contactAccessService.adminGetAccessesByListingService(
      req.params.listingId,
      page,
      limit
    );
    return res.status(200).json({
      success: true,
      message: `Retrieved ${accesses.length} accesses successfully`,
      data: {
        accesses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const adminGetAccessesByUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { accesses, total } = await contactAccessService.adminGetAccessesByUserService(
      req.params.userId,
      page,
      limit
    );
    return res.status(200).json({
      success: true,
      message: `Retrieved ${accesses.length} accesses successfully`,
      data: {
        accesses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};