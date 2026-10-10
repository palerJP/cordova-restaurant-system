/**
 * One-time move of existing local uploads to Vercel Blob.
 *
 * Run `npm run storage:migrate` to preview. After creating a public and a
 * private Blob store and setting their tokens, run `npm run storage:migrate --
 * --apply`. Keep the local upload directories until the apply report is clean.
 * This script never deletes local files and updates rows only when their old
 * reference still matches, so interrupted runs can be resumed safely.
 */
const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { put } = require('@vercel/blob');
const { pool } = require('../config/db');
const env = require('../config/env');

const COLUMNS = [
  ['restaurants', 'cover_image_url'],
  ['restaurants', 'business_permit_url'],
  ['users', 'avatar_url'],
  ['restaurant_images', 'image_url'],
  ['menu_items', 'image_url'],
  ['promotions', 'image_url'],
];
const CONTENT_TYPES = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.pdf': 'application/pdf',
};

function looksLocal(reference) {
  return typeof reference === 'string' && (
    reference.startsWith('/uploads/') || reference.startsWith('/api/uploads/')
    || reference.startsWith('local-private:')
  );
}

function localSource(reference) {
  if (typeof reference !== 'string') return null;
  let root;
  let relative;
  if (reference.startsWith('local-private:/business-permits/')) {
    root = path.resolve(process.cwd(), 'private-uploads');
    relative = reference.slice('local-private:/'.length);
  } else if (reference.startsWith('/uploads/')) {
    root = path.resolve(process.cwd(), env.upload.dir);
    relative = reference.slice('/uploads/'.length);
  } else if (reference.startsWith('/api/uploads/')) {
    root = path.resolve(process.cwd(), env.upload.dir);
    relative = reference.slice('/api/uploads/'.length);
  } else {
    return null;
  }
  const match = /^(restaurant-images|avatars|business-permits)\/([A-Za-z0-9._-]+)$/.exec(relative);
  if (!match || match[2] === '.' || match[2] === '..') return null;
  const absolute = path.resolve(root, relative);
  if (!absolute.startsWith(`${root}${path.sep}`)) return null;
  const isPrivate = match[1] === 'business-permits';
  return { root, absolute, pathname: relative, isPrivate, contentType: CONTENT_TYPES[path.extname(relative).toLowerCase()] };
}

async function assertLocalFile(source) {
  const [realRoot, realFile] = await Promise.all([fs.realpath(source.root), fs.realpath(source.absolute)]);
  if (!realFile.startsWith(`${realRoot}${path.sep}`)) throw new Error('Upload file escapes its source directory');
  const stat = await fs.stat(realFile);
  if (!stat.isFile()) throw new Error('Upload path is not a file');
  if (!source.contentType) throw new Error('Unsupported upload file extension');
  return realFile;
}

async function collect() {
  const candidates = [];
  const invalidLocal = [];
  for (const [table, column] of COLUMNS) {
    const { rows } = await pool.query(`SELECT id, ${column} AS reference FROM ${table} WHERE ${column} IS NOT NULL`);
    for (const row of rows) {
      const source = localSource(row.reference);
      const isPermitColumn = table === 'restaurants' && column === 'business_permit_url';
      if (source && source.isPrivate === isPermitColumn) {
        candidates.push({ table, column, id: row.id, reference: row.reference });
      } else if (looksLocal(row.reference)) {
        invalidLocal.push({ table, column, id: row.id });
      }
    }
  }
  const { rows: reviews } = await pool.query('SELECT id, photos FROM reviews WHERE photos IS NOT NULL');
  for (const review of reviews) {
    for (const url of review.photos) {
      if (looksLocal(url) && (!localSource(url) || localSource(url).isPrivate)) {
        invalidLocal.push({ table: 'reviews', column: 'photos', id: review.id });
      }
    }
    if (review.photos.some((url) => localSource(url) && !localSource(url).isPrivate)) {
      candidates.push({ table: 'reviews', column: 'photos', id: review.id, reference: review.photos });
    }
  }
  const { rows: permits } = await pool.query(
    'SELECT id, business_permit_url FROM restaurants WHERE business_permit_url IS NOT NULL'
  );
  const unsupportedPermits = permits.filter((row) => !localSource(row.business_permit_url)
    && !/^https:\/\/[^/]+\.private\.blob\.vercel-storage\.com\/business-permits\//.test(row.business_permit_url));
  return { candidates, unsupportedPermits, invalidLocal };
}

async function run({ apply = false } = {}) {
  const { candidates, unsupportedPermits, invalidLocal } = await collect();
  const uniqueSources = new Map();
  for (const item of candidates) {
    const references = Array.isArray(item.reference) ? item.reference : [item.reference];
    for (const reference of references) {
      const source = localSource(reference);
      if (source) uniqueSources.set(reference, source);
    }
  }

  let missing = 0;
  for (const [reference, source] of uniqueSources) {
    try {
      await assertLocalFile(source);
      console.log(`${apply ? 'UPLOAD' : 'READY'} ${source.isPrivate ? 'private permit' : 'public image'} ${reference}`);
    } catch (error) {
      missing += 1;
      console.error(`MISSING ${reference}: ${error.message}`);
    }
  }
  for (const row of unsupportedPermits) {
    console.error(`REVIEW permit for restaurant ${row.id}: stored reference is not in private Blob storage`);
  }
  for (const row of invalidLocal) {
    console.error(`REVIEW ${row.table}.${row.column} for row ${row.id}: invalid local upload reference`);
  }
  console.log(`${candidates.length} database rows, ${uniqueSources.size} local files, ${missing} missing files, ${unsupportedPermits.length} permits and ${invalidLocal.length} local references needing manual review.`);
  if (!apply) return { candidates: candidates.length, files: uniqueSources.size, missing, unsupportedPermits: unsupportedPermits.length, invalidLocal: invalidLocal.length };
  if (missing || unsupportedPermits.length || invalidLocal.length) throw new Error('Fix missing files and unsafe references before applying.');
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error('BLOB_READ_WRITE_TOKEN is required to run this migration locally.');
  if ([...uniqueSources.values()].some((source) => source.isPrivate) && !process.env.BLOB_PRIVATE_READ_WRITE_TOKEN) {
    throw new Error('BLOB_PRIVATE_READ_WRITE_TOKEN is required for permit migration.');
  }

  const moved = new Map();
  for (const [reference, source] of uniqueSources) {
    const actual = await assertLocalFile(source);
    const target = `${source.pathname.slice(0, source.pathname.lastIndexOf('/'))}/${randomUUID()}${path.extname(actual).toLowerCase()}`;
    const options = {
      access: source.isPrivate ? 'private' : 'public',
      contentType: source.contentType,
      addRandomSuffix: false,
      token: source.isPrivate ? process.env.BLOB_PRIVATE_READ_WRITE_TOKEN : process.env.BLOB_READ_WRITE_TOKEN,
    };
    const blob = await put(target, await fs.readFile(actual), options);
    moved.set(reference, blob.url);
  }

  for (const item of candidates) {
    if (item.column === 'photos') {
      const replacement = item.reference.map((url) => moved.get(url) || url);
      await pool.query('UPDATE reviews SET photos = $1 WHERE id = $2 AND photos = $3',
        [replacement, item.id, item.reference]);
    } else {
      await pool.query(`UPDATE ${item.table} SET ${item.column} = $1 WHERE id = $2 AND ${item.column} = $3`,
        [moved.get(item.reference), item.id, item.reference]);
    }
  }
  console.log(`Updated up to ${candidates.length} database rows. Local files were kept for rollback.`);
  return { candidates: candidates.length, files: uniqueSources.size, missing: 0, unsupportedPermits: 0, invalidLocal: 0 };
}

if (require.main === module) {
  run({ apply: process.argv.includes('--apply') })
    .then(() => pool.end())
    .catch(async (error) => { console.error(error.message); await pool.end(); process.exitCode = 1; });
}

module.exports = { localSource, run };
