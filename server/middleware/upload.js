import multer from 'multer';
import path from 'path';
import cloudinary from '../config/cloudinary.config.js';
import { Readable } from 'stream';

// Configure storage (memory storage for Cloudinary)
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// ─── Cloudinary Helpers ───────────────────────────────────────────────────────

export const uploadToCloudinary = (buffer, folder = 'listings') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    );
    Readable.from(buffer).pipe(stream);
  });

export const uploadManyToCloudinary = (files = [], folder = 'listings') =>
  Promise.all(files.map((f) => uploadToCloudinary(f.buffer, folder)));

export const deleteFromCloudinary = (url) => {
  const parts    = url.split('/');
  const filename = parts[parts.length - 1].split('.')[0];
  const folder   = parts[parts.length - 2];
  const publicId = `${folder}/${filename}`;
  return cloudinary.uploader.destroy(publicId);
};

// ─── Multer Middleware ────────────────────────────────────────────────────────

// Single file upload middleware (for KYC document)
export const uploadSingle = upload.single('documentImage');

// Profile image upload middleware
export const uploadProfileImage = upload.single('profileImage');

// Multiple files upload middleware (for House, Car, Service listings)
export const uploadMultiple = upload.array('images', 10); // Max 10 images

// Handle upload errors
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};

export const uploadKYCImages = upload.fields([
  { name: 'frontSideImage', maxCount: 1 },
  { name: 'backSideImage', maxCount: 1 },
]);

export default upload;