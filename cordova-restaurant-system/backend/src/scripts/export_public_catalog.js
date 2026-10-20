/** Export only public catalog fields and mirror referenced public photos. */
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');
const { pool } = require('../config/db');

const repo = path.resolve(__dirname, '../../..');
const publicRoot = path.join(repo, 'frontend', 'public');
const imageRoot = path.join(publicRoot, 'images', 'catalog-webp');
const mapFile = path.join(repo, 'frontend', 'src', 'data', 'catalogImageMap.json');
const fallbackFile = path.join(repo, 'frontend', 'src', 'data', 'dishPhotoFallbacks.json');
const coverFallbackFile = path.join(repo, 'frontend', 'src', 'data', 'restaurantCoverFallbacks.json');
const snapshotFile = path.join(repo, 'database', 'catalog.snapshot.json');
const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
async function saveImage(reference, data) {
  const target = `/images/catalog-webp/${hash(reference)}.webp`;
  await sharp(data).rotate().resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80, effort: 4 }).toFile(path.join(publicRoot, target.slice(1)));
  return target;
}

async function mirror(reference) {
  if (reference.startsWith('/images/')) {
    try { await fs.access(path.join(publicRoot, reference.slice(1))); return reference; } catch { return null; }
  }
  if (reference.startsWith('/uploads/')) {
    const relative = reference.slice('/uploads/'.length);
    if (!/^restaurant-images\/[A-Za-z0-9._-]+$/.test(relative)) return null;
    const source = path.join(repo, 'backend', 'uploads', relative);
    try {
      const data = await fs.readFile(source);
      if (!['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'].includes(path.extname(relative).toLowerCase())) return null;
      return saveImage(reference, data);
    } catch { return null; }
  }
  if (!reference.startsWith('https://')) return null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(reference, { signal: AbortSignal.timeout(15000), headers: {
        'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.foodpanda.ph/',
      } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const mime = response.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase();
      if (!imageTypes.has(mime)) throw new Error(`Unsupported content type: ${mime}`);
      const data = Buffer.from(await response.arrayBuffer());
      if (data.length < 100 || data.length > 8 * 1024 * 1024) throw new Error('Invalid image size');
      return saveImage(reference, data);
    } catch (error) {
      if (attempt === 1) return { error: error.message };
    }
  }
}

async function run() {
  await fs.mkdir(imageRoot, { recursive: true });
  const [restaurants, categories, dishes, gallery] = await Promise.all([
    pool.query(`SELECT id,slug,name,description,address,barangay,latitude,longitude,phone,email,
      price_range,services_offered,cover_image_url,status,is_active FROM restaurants ORDER BY slug`),
    pool.query('SELECT id,restaurant_id,name,sort_order FROM menu_categories ORDER BY restaurant_id,sort_order,name'),
    pool.query(`SELECT id,restaurant_id,category_id,name,description,price,image_url,is_available,dietary_tags
      FROM menu_items ORDER BY restaurant_id,name,id`),
    pool.query('SELECT id,restaurant_id,image_url,is_cover,sort_order FROM restaurant_images ORDER BY restaurant_id,sort_order'),
  ]);
  const references = new Set([...restaurants.rows.map((r) => r.cover_image_url),
    ...dishes.rows.map((r) => r.image_url), ...gallery.rows.map((r) => r.image_url)].filter(Boolean));
  const customization = await fs.readFile(path.join(repo, 'frontend', 'src', 'data', 'restaurants.ts'), 'utf8');
  for (const match of customization.matchAll(/coverImage:\s*'([^']+)'/g)) references.add(match[1]);
  const urls = [...references].sort();
  let map = {};
  try { map = JSON.parse(await fs.readFile(mapFile, 'utf8')); } catch { /* first export */ }
  const failures = [];
  let cursor = 0;
  let completed = 0;
  async function worker() {
    while (cursor < urls.length) {
      const reference = urls[cursor++];
      let result = map[reference];
      if (result && result.startsWith('/images/catalog-webp/')) {
        try { await fs.access(path.join(publicRoot, result.slice(1))); } catch { result = null; }
      }
      if (!result) result = await mirror(reference);
      if (typeof result === 'string') map[reference] = result;
      else if (result?.error) failures.push({ host: new URL(reference).host, error: result.error });
      else failures.push({ host: reference.startsWith('/') ? 'local' : 'invalid', error: 'No local image' });
      completed++;
      if (completed % 50 === 0 || completed === urls.length) console.log(`Images checked: ${completed}/${urls.length}, mirrored: ${Object.keys(map).length}`);
    }
  }
  await Promise.all(Array.from({ length: 10 }, worker));
  const sortedMap = Object.fromEntries(Object.entries(map).filter(([original, local]) => original !== local)
    .sort(([a], [b]) => a.localeCompare(b)));
  const local = (url) => url ? (map[url] || url) : null;
  const sourcePhoto = (url) => url && map[url] ? map[url] : null;
  const fallbacks = {};
  const byCategory = new Map();
  const byRestaurant = new Map();
  for (const dish of dishes.rows) {
    const photo = sourcePhoto(dish.image_url);
    if (!photo) continue;
    const categoryKey = `${dish.restaurant_id}|${dish.category_id}`;
    if (!byCategory.has(categoryKey)) byCategory.set(categoryKey, photo);
    if (!byRestaurant.has(dish.restaurant_id)) byRestaurant.set(dish.restaurant_id, photo);
  }
  const covers = new Map(restaurants.rows.map((r) => [r.id, sourcePhoto(r.cover_image_url)]));
  const coverFallbacks = {};
  for (const restaurant of restaurants.rows) {
    if (!sourcePhoto(restaurant.cover_image_url)) {
      coverFallbacks[restaurant.slug] = byRestaurant.get(restaurant.id) || '/hero_background.png';
    }
  }
  for (const dish of dishes.rows) {
    if (sourcePhoto(dish.image_url)) continue;
    fallbacks[dish.id] = byCategory.get(`${dish.restaurant_id}|${dish.category_id}`)
      || byRestaurant.get(dish.restaurant_id) || covers.get(dish.restaurant_id) || '/hero_background.png';
  }
  const snapshot = {
    generated_at: new Date().toISOString(),
    counts: { restaurants: restaurants.rows.length, categories: categories.rows.length, dishes: dishes.rows.length },
    restaurants: restaurants.rows.map((r) => ({ ...r,
      cover_image_url: coverFallbacks[r.slug] || local(r.cover_image_url),
    })),
    categories: categories.rows,
    dishes: dishes.rows.map((r) => ({ ...r,
      image_url: fallbacks[r.id] || local(r.image_url),
      ...(fallbacks[r.id] ? { representative_photo: true } : {}),
    })),
    gallery: gallery.rows.map((r) => ({ ...r, image_url: local(r.image_url) })),
  };
  await fs.writeFile(mapFile, `${JSON.stringify(sortedMap, null, 2)}\n`);
  await fs.writeFile(fallbackFile, `${JSON.stringify(Object.fromEntries(Object.entries(fallbacks).sort(([a], [b]) => a.localeCompare(b))), null, 2)}\n`);
  await fs.writeFile(coverFallbackFile, `${JSON.stringify(coverFallbacks, null, 2)}\n`);
  await fs.writeFile(snapshotFile, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(JSON.stringify({ restaurants: snapshot.counts.restaurants, categories: snapshot.counts.categories,
    dishes: snapshot.counts.dishes, mirrored: Object.keys(map).length, representativePhotos: Object.keys(fallbacks).length,
    representativeCovers: Object.keys(coverFallbacks).length,
    missing: failures.length,
    failuresByHost: failures.reduce((o, f) => { o[f.host] = (o[f.host] || 0) + 1; return o; }, {}) }));
}

run().catch((error) => { console.error(error.message); process.exitCode = 1; })
  .finally(() => pool.end());
