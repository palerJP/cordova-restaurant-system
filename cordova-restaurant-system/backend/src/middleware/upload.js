const multer = require('multer');
const path = require('node:path');
const crypto = require('node:crypto');
const fs = require('node:fs');
const env = require('../config/env');
const ApiError = require('../utils/apiError');

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DOCUMENT_TYPES = [...IMAGE_TYPES, 'application/pdf'];
// A Vercel Function cannot receive more than 4.5 MB, including multipart overhead.
const MAX_REQUEST_BYTES = 4 * 1024 * 1024;
const MAX_FILE_BYTES = Math.min(env.upload.maxMb * 1024 * 1024, 3.75 * 1024 * 1024);

function filename(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  return `${crypto.randomUUID()}${ext}`;
}

function diskStorage(subdir) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const dest = path.resolve(process.cwd(), env.upload.dir, subdir);
      try {
        fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
      } catch (error) {
        cb(error);
      }
    },
    filename: (req, file, cb) => cb(null, filename(file)),
  });
}

function storage(subdir) {
  return env.isProduction ? multer.memoryStorage() : diskStorage(subdir);
}

function fileFilterFor(allowedTypes) {
  return (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(ApiError.badRequest(`Unsupported file type: ${file.mimetype}`));
    }
    cb(null, true);
  };
}

function fileLimit(localMb = env.upload.maxMb) {
  return { fileSize: env.isProduction ? MAX_FILE_BYTES : localMb * 1024 * 1024 };
}

const uploadRestaurantImage = multer({
  storage: storage('restaurant-images'),
  fileFilter: fileFilterFor(IMAGE_TYPES),
  limits: fileLimit(),
});

const uploadAvatar = multer({
  storage: storage('avatars'),
  fileFilter: fileFilterFor(IMAGE_TYPES),
  limits: fileLimit(2),
});

const uploadHighlightImages = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilterFor(IMAGE_TYPES),
  limits: { fileSize: 2 * 1024 * 1024, files: 5, fields: 4, parts: 9 },
});

const uploadBusinessCreation = multer({
  storage: env.isProduction ? multer.memoryStorage() : multer.diskStorage({
    destination: (req, file, cb) => {
      const isPermit = file.fieldname === 'businessPermit';
      const dest = path.resolve(process.cwd(), isPermit ? 'private-uploads' : env.upload.dir,
        isPermit ? 'business-permits' : 'restaurant-images');
      try {
        fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
      } catch (error) {
        cb(error);
      }
    },
    filename: (req, file, cb) => cb(null, filename(file)),
  }),
  fileFilter: (req, file, cb) => fileFilterFor(
    file.fieldname === 'businessPermit' ? DOCUMENT_TYPES : IMAGE_TYPES
  )(req, file, cb),
  limits: fileLimit(),
});

function limitUploadRequest(req, res, next) {
  if (env.isProduction && Number(req.headers['content-length']) > MAX_REQUEST_BYTES) {
    return next(new ApiError(413, 'Upload request exceeds 4 MB. Please use smaller files.'));
  }
  return next();
}

module.exports = {
  uploadRestaurantImage,
  uploadAvatar,
  uploadHighlightImages,
  uploadBusinessCreation,
  limitUploadRequest,
};
