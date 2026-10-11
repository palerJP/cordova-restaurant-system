const multer = require('multer');
const sharp = require('sharp');
const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const env = require('../config/env');
const ApiError = require('../utils/apiError');

const evidenceUpload = multer({ storage: multer.memoryStorage(), limits: {
  fileSize: 5 * 1024 * 1024, files: 1, fields: 8, fieldSize: 10000,
} }).single('evidence');
const directory = () => path.resolve(env.upload.dir, 'claim-evidence');

async function saveEvidence(file) {
  if (!file) throw ApiError.badRequest('Upload ownership evidence (PDF, JPEG, PNG, or WebP, up to 5 MB)');
  let content, extension;
  if (file.buffer.subarray(0, 5).toString() === '%PDF-') {
    if (!file.buffer.subarray(-2048).toString().includes('%%EOF')) throw ApiError.badRequest('Invalid PDF evidence');
    content = file.buffer;
    extension = 'pdf';
  } else {
    try {
      const image = sharp(file.buffer, { limitInputPixels: 25000000 });
      const metadata = await image.metadata();
      if (!['jpeg', 'png', 'webp'].includes(metadata.format)) throw new Error('Unsupported image');
      content = await image.resize({ width: 2400, withoutEnlargement: true }).webp().toBuffer();
      extension = 'webp';
    } catch {
      throw ApiError.badRequest('Evidence must contain a valid PDF, JPEG, PNG, or WebP file');
    }
  }
  const filename = `${randomUUID()}.${extension}`;
  await fs.mkdir(directory(), { recursive: true });
  await fs.writeFile(path.join(directory(), filename), content, { flag: 'wx', mode: 0o600 });
  return filename;
}
async function removeEvidence(filename) {
  if (filename) await fs.unlink(path.join(directory(), filename)).catch(() => {});
}
module.exports = { evidenceUpload, saveEvidence, removeEvidence, directory };
