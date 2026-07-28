const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const env = require('../config/env');
const ApiError = require('../utils/apiError');

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DOCUMENT_TYPES = [...IMAGE_TYPES, 'application/pdf'];

function makeStorage(subdir) {
  const dest = path.join(env.upload.dir, subdir);
  fs.mkdirSync(dest, { recursive: true });
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const safeName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
      cb(null, safeName);
    },
  });
}

function fileFilterFor(allowedTypes) {
  return (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(ApiError.badRequest(`Unsupported file type: ${file.mimetype}`));
    }
    cb(null, true);
  };
}

const limits = { fileSize: env.upload.maxMb * 1024 * 1024 };

// Used for restaurant cover photos / gallery images / menu item images
const uploadRestaurantImage = multer({
  storage: makeStorage('restaurant-images'),
  fileFilter: fileFilterFor(IMAGE_TYPES),
  limits,
});

// Used for business permit / registration document verification
const uploadBusinessPermit = multer({
  storage: makeStorage('business-permits'),
  fileFilter: fileFilterFor(DOCUMENT_TYPES),
  limits,
});

// Used for user avatars
const uploadAvatar = multer({
  storage: makeStorage('avatars'),
  fileFilter: fileFilterFor(IMAGE_TYPES),
  limits: { fileSize: 2 * 1024 * 1024 },
});

module.exports = { uploadRestaurantImage, uploadBusinessPermit, uploadAvatar };
