/** Idempotently sync the reviewed public catalog snapshot into a database. */
const fs = require('node:fs');
const path = require('node:path');
const { pool } = require('../config/db');

const snapshot = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../database/catalog.snapshot.json'), 'utf8'));
const catalogOwnerId = '00000000-0000-4000-8000-000000000026';
const apply = process.argv.includes('--apply');

async function sync(client) {
  const counts = { restaurants: 0, categories: 0, dishes: 0, gallery: 0 };
  const restaurantIds = new Map();
  const categoryIds = new Map();
  const { rows: ownerRows } = await client.query("SELECT id FROM users WHERE email = 'catalog-import@cordovaeats.invalid'");
  let ownerId = ownerRows[0]?.id;
  for (const r of snapshot.restaurants) {
    const { rows } = await client.query('SELECT id,slug FROM restaurants WHERE id = $1 OR slug = $2', [r.id, r.slug]);
    if (rows.length > 1) throw new Error(`Conflicting restaurant identity: ${r.slug}`);
    let id = rows[0]?.id;
    if (!id) {
      if (!ownerId) {
        const created = await client.query(`INSERT INTO users (id,email,full_name,role,is_active,email_verified)
          VALUES ($1,'catalog-import@cordovaeats.invalid','Catalog Import','owner',FALSE,FALSE)
          ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name RETURNING id`, [catalogOwnerId]);
        ownerId = created.rows[0].id;
      }
      const created = await client.query(`INSERT INTO restaurants
        (id,owner_id,name,slug,description,address,barangay,latitude,longitude,phone,email,
         price_range,services_offered,cover_image_url,status,is_active,verified_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::service_type[],$14,'verified',TRUE,now()) RETURNING id`,
      [r.id, ownerId, r.name, r.slug, r.description, r.address, r.barangay, r.latitude, r.longitude,
        r.phone, r.email, r.price_range, r.services_offered, r.cover_image_url]);
      id = created.rows[0].id;
    } else {
      await client.query(`UPDATE restaurants SET name=$2,description=$3,address=$4,barangay=$5,
        latitude=$6,longitude=$7,phone=$8,email=$9,price_range=$10,
        cover_image_url=CASE WHEN $11 LIKE '/images/%' THEN $11 ELSE cover_image_url END
        WHERE id=$1`, [id, r.name, r.description, r.address, r.barangay, r.latitude, r.longitude,
        r.phone, r.email, r.price_range, r.cover_image_url]);
    }
    restaurantIds.set(r.id, id);
    counts.restaurants++;
  }
  for (const c of snapshot.categories) {
    const restaurantId = restaurantIds.get(c.restaurant_id);
    const { rows } = await client.query(`SELECT id FROM menu_categories WHERE id=$1 OR (restaurant_id=$2 AND name=$3)
      ORDER BY (id=$1) DESC LIMIT 1`, [c.id, restaurantId, c.name]);
    let id = rows[0]?.id;
    if (id) await client.query('UPDATE menu_categories SET name=$2,sort_order=$3 WHERE id=$1', [id, c.name, c.sort_order]);
    else {
      const created = await client.query('INSERT INTO menu_categories (id,restaurant_id,name,sort_order) VALUES ($1,$2,$3,$4) RETURNING id',
        [c.id, restaurantId, c.name, c.sort_order]);
      id = created.rows[0].id;
    }
    categoryIds.set(c.id, id);
    counts.categories++;
  }
  for (const d of snapshot.dishes) {
    const restaurantId = restaurantIds.get(d.restaurant_id);
    const categoryId = d.category_id ? categoryIds.get(d.category_id) : null;
    const { rows } = await client.query(`SELECT id FROM menu_items WHERE id=$1 OR
      (restaurant_id=$2 AND category_id IS NOT DISTINCT FROM $3::uuid AND name=$4)
      ORDER BY (id=$1) DESC LIMIT 1`, [d.id, restaurantId, categoryId, d.name]);
    if (rows[0]) {
      await client.query(`UPDATE menu_items SET category_id=$2,name=$3,description=$4,price=$5,
        image_url=COALESCE($6,image_url),is_available=$7,dietary_tags=$8 WHERE id=$1`,
      [rows[0].id, categoryId, d.name, d.description, d.price, d.image_url, d.is_available, d.dietary_tags]);
    } else {
      await client.query(`INSERT INTO menu_items
        (id,restaurant_id,category_id,name,description,price,image_url,is_available,dietary_tags)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [d.id, restaurantId, categoryId, d.name, d.description, d.price, d.image_url, d.is_available, d.dietary_tags]);
    }
    counts.dishes++;
  }
  for (const photo of snapshot.gallery) {
    const restaurantId = restaurantIds.get(photo.restaurant_id);
    await client.query(`INSERT INTO restaurant_images (id,restaurant_id,image_url,is_cover,sort_order)
      VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO UPDATE SET
      image_url=EXCLUDED.image_url,is_cover=EXCLUDED.is_cover,sort_order=EXCLUDED.sort_order`,
    [photo.id, restaurantId, photo.image_url, photo.is_cover, photo.sort_order]);
    counts.gallery++;
  }
  return counts;
}

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const counts = await sync(client);
    await client.query(apply ? 'COMMIT' : 'ROLLBACK');
    console.log(`${apply ? 'Applied' : 'Checked'} catalog: ${JSON.stringify(counts)}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}

run().catch((error) => { console.error(error.message); process.exitCode = 1; })
  .finally(() => pool.end());
