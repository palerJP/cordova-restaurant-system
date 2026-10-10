const sharp = require('sharp');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { Readable } = require('node:stream');
const { put, get } = require('@vercel/blob');
const env = require('../config/env');
const ApiError = require('../utils/apiError');
const logger = require('../utils/logger');

const PUBLIC_UPLOADS = path.resolve(process.cwd(), env.upload.dir);
const PRIVATE_UPLOADS = path.resolve(process.cwd(), 'private-uploads');
const PERMIT_PREFIX = 'business-permits/';

async function processImage(file, { maxWidth = 1600, quality = 80 } = {}) {
  if (!file || !file.mimetype.startsWith('image/')) return file;

  try {
    if (file.buffer) {
      const buffer = await sharp(file.buffer)
        .resize({ width: maxWidth, withoutEnlargement: true })
        .webp({ quality })
        .toBuffer();
      return { ...file, buffer, size: buffer.length, mimetype: 'image/webp', filename: `${crypto.randomUUID()}.webp` };
    }

    const parsed = path.parse(file.path);
    const optimizedPath = path.join(parsed.dir, `${parsed.name}.webp`);
    await sharp(file.path)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality })
      .toFile(optimizedPath);
    await fs.promises.unlink(file.path);
    return { ...file, path: optimizedPath, filename: path.basename(optimizedPath), mimetype: 'image/webp' };
  } catch (error) {
    logger.warn('Image processing failed, keeping original', { error: error.message, file: file.originalname });
    return file;
  }
}

function safeLocalUrl(file, root, prefix) {
  const relative = path.relative(root, file.path);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw ApiError.internal('Invalid upload location.');
  }
  return `${prefix}/${relative.replace(/\\/g, '/')}`;
}

function generatedName(file) {
  const ext = path.extname(file.filename || file.originalname || '').toLowerCase();
  return `${crypto.randomUUID()}${ext}`;
}

async function publicUrlFor(file) {
  if (!env.isProduction) return safeLocalUrl(file, PUBLIC_UPLOADS, '/uploads');
  if (!file.buffer) throw ApiError.internal('Upload data is unavailable.');
  const subdir = file.fieldname === 'avatar' ? 'avatars' : 'restaurant-images';
  const blob = await put(`${subdir}/${generatedName(file)}`, file.buffer, {
    access: 'public',
    contentType: file.mimetype,
    addRandomSuffix: false,
    token: env.upload.publicBlobToken,
  });
  return blob.url;
}

async function privateUrlFor(file) {
  if (!env.isProduction) return safeLocalUrl(file, PRIVATE_UPLOADS, 'local-private:');
  if (!file.buffer) throw ApiError.internal('Upload data is unavailable.');
  if (!env.upload.privateBlobToken) {
    throw ApiError.internal('Private document storage is not configured.');
  }
  const blob = await put(`${PERMIT_PREFIX}${generatedName(file)}`, file.buffer, {
    access: 'private',
    contentType: file.mimetype,
    addRandomSuffix: false,
    token: env.upload.privateBlobToken,
  });
  return blob.url;
}

function localPermitPath(reference) {
  let root;
  let relative;
  if (reference.startsWith('local-private:/business-permits/')) {
    root = PRIVATE_UPLOADS;
    relative = reference.slice('local-private:/'.length);
  } else if (reference.startsWith('/uploads/business-permits/')) {
    root = PUBLIC_UPLOADS;
    relative = reference.slice('/uploads/'.length);
  } else {
    return null;
  }
  if (!/^business-permits\/[A-Za-z0-9._-]+$/.test(relative)) return null;
  const resolved = path.resolve(root, relative);
  if (!resolved.startsWith(`${root}${path.sep}`)) return null;
  return resolved;
}

async function openPrivatePermit(reference) {
  if (!reference || typeof reference !== 'string') throw ApiError.notFound('Permit not found');

  const localPath = localPermitPath(reference);
  if (localPath) {
    if (env.isProduction) throw ApiError.notFound('Permit must be migrated to private storage.');
    let stat;
    try { stat = await fs.promises.stat(localPath); } catch { throw ApiError.notFound('Permit not found'); }
    if (!stat.isFile()) throw ApiError.notFound('Permit not found');
    const ext = path.extname(localPath).toLowerCase();
    const contentType = ext === '.pdf' ? 'application/pdf' : ext === '.png' ? 'image/png'
      : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    return { stream: fs.createReadStream(localPath), contentType };
  }

  let parsed;
  try { parsed = new URL(reference); } catch { throw ApiError.notFound('Permit not found'); }
  if (parsed.protocol !== 'https:' || !parsed.hostname.endsWith('.private.blob.vercel-storage.com')
      || !parsed.pathname.slice(1).startsWith(PERMIT_PREFIX)) {
    throw ApiError.notFound('Permit not found');
  }
  if (!env.upload.privateBlobToken) {
    throw ApiError.internal('Private document storage is not configured.');
  }
  const result = await get(reference, { access: 'private', token: env.upload.privateBlobToken });
  if (!result || result.statusCode !== 200) throw ApiError.notFound('Permit not found');
  return { stream: Readable.fromWeb(result.stream), contentType: result.blob.contentType };
}

module.exports = { processImage, publicUrlFor, privateUrlFor, openPrivatePermit };
