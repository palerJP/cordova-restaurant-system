const sharp = require('sharp');
const path = require('path');
const fs = require('fs/promises');
const logger = require('../utils/logger');

/**
 * Resizes and compresses an uploaded image in place, converting to WebP for
 * a good size/quality tradeoff. Non-image files (e.g. PDF permits) pass
 * through untouched. Runs after multer has already written the original.
 */
async function processImage(file, { maxWidth = 1600, quality = 80 } = {}) {
  if (!file || !file.mimetype.startsWith('image/')) return file;

  const parsed = path.parse(file.path);
  const optimizedPath = path.join(parsed.dir, `${parsed.name}.webp`);

  try {
    await sharp(file.path)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality })
      .toFile(optimizedPath);

    await fs.unlink(file.path); // remove the original, keep only the optimized version

    return {
      ...file,
      path: optimizedPath,
      filename: path.basename(optimizedPath),
      mimetype: 'image/webp',
    };
  } catch (err) {
    logger.warn('Image processing failed, keeping original', { error: err.message, file: file.originalname });
    return file;
  }
}

function publicUrlFor(file) {
  // Files are served statically from /uploads (see app.js) — this maps the
  // absolute disk path back to a public-facing relative URL.
  const uploadsIndex = file.path.indexOf('uploads');
  return `/${file.path.slice(uploadsIndex).replace(/\\/g, '/')}`;
}

module.exports = { processImage, publicUrlFor };
