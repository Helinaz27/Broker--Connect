import multer from 'multer';
import path from 'path';
import cloudinary from '../config/cloudinary.config.js';
import { Readable } from 'stream';

const storage = multer.memoryStorage();

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

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
});

//  Cloudinary Helpers 

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

//  Multer Middleware 

export const uploadSingle = upload.single('documentImage');
export const uploadProfileImage = upload.single('profileImage');
export const uploadMultiple = upload.array('images', 10); // Max 10 images
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