const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { Readable } = require('node:stream');
const sharp = require('sharp');
const { put, get, del } = require('@vercel/blob');
const env = require('../config/env');
const ApiError = require('../utils/apiError');

const LOCAL_ROOT = path.resolve(process.cwd(), 'private-uploads', 'visit-highlights');
const BLOB_PREFIX = 'visit-highlights/';

async function save(file) {
  let image;
  try {
    image = sharp(file.buffer, { limitInputPixels: 25_000_000 });
    const info = await image.metadata();
    if (!['jpeg', 'png', 'webp'].includes(info.format)) throw new Error('Unsupported image format');
  } catch {
    throw ApiError.badRequest('Please upload valid JPEG, PNG, or WebP images.');
  }
  const bytes = await image.rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
  const name = `${crypto.randomUUID()}.webp`;
  if (env.isProduction) {
    const blob = await put(`${BLOB_PREFIX}${name}`, bytes, {
      access: 'private', contentType: 'image/webp', addRandomSuffix: false,
      token: env.upload.privateBlobToken,
    });
    return blob.url;
  }
  await fs.mkdir(LOCAL_ROOT, { recursive: true });
  await fs.writeFile(path.join(LOCAL_ROOT, name), bytes);
  return `local-highlight:${name}`;
}

function localName(ref) {
  const match = /^local-highlight:([a-f0-9-]{36}\.webp)$/.exec(ref || '');
  return match?.[1] || null;
}

function validBlobRef(ref) {
  try {
    const url = new URL(ref);
    return url.protocol === 'https:'
      && url.hostname.endsWith('.private.blob.vercel-storage.com')
      && url.pathname.slice(1).startsWith(BLOB_PREFIX);
  } catch { return false; }
}

async function open(ref) {
  const name = localName(ref);
  if (name) {
    if (env.isProduction) throw ApiError.notFound('Image unavailable');
    try {
      await fs.access(path.join(LOCAL_ROOT, name));
      return { stream: require('node:fs').createReadStream(path.join(LOCAL_ROOT, name)), contentType: 'image/webp' };
    }
    catch { throw ApiError.notFound('Image unavailable'); }
  }
  if (!validBlobRef(ref)) throw ApiError.notFound('Image unavailable');
  const result = await get(ref, { access: 'private', token: env.upload.privateBlobToken });
  if (!result || result.statusCode !== 200) throw ApiError.notFound('Image unavailable');
  return { stream: Readable.fromWeb(result.stream), contentType: 'image/webp' };
}

async function remove(ref) {
  const name = localName(ref);
  if (name) return fs.unlink(path.join(LOCAL_ROOT, name)).catch(() => {});
  if (validBlobRef(ref)) return del(ref, { token: env.upload.privateBlobToken });
}

module.exports = { save, open, remove };
