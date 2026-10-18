// Restore only missing, previously approved directory records. Existing owner
// applications, statuses, menus, reviews and ownership are never overwritten.
const fs = require('node:fs');
const crypto = require('node:crypto');
const { pool } = require('../config/db');

async function run(snapshotPath, approvedPath, { apply = false } = {}) {
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  const approved = JSON.parse(fs.readFileSync(approvedPath, 'utf8')).restaurants;
  const source = snapshot.catalog.map((entry) => {
    const record = approved.find((row) => row.slug === entry.slug && row.status === 'verified');
    if (!record) throw new Error(`No previously approved record for ${entry.slug}`);
    return { ...record, cover_image_url: entry.cover_image_url || record.cover_image_url, cuisines: entry.cuisines || [] };
  });
  const client = await pool.connect();
  try {
    const { rows: existing } = await client.query('SELECT id,slug,status,owner_id FROM restaurants');
    const missing = source.filter((record) => !existing.some((row) => row.slug === record.slug));
    const report = { approved: source.length, missing: missing.length, existingPreserved: existing.length, restored: 0, menuItems: 0 };
    if (!apply || !missing.length) return report;
    await client.query('BEGIN');
    await client.query(`INSERT INTO users(email,password_hash,full_name,role,is_active,email_verified,accepts_marketing)
      VALUES('unclaimed-listings@cordova-restaurants.gov.ph',$1,'Unclaimed public directory','owner',false,false,false)
      ON CONFLICT(email) DO NOTHING`, [crypto.randomBytes(48).toString('hex')]);
    const { rows: owners } = await client.query("SELECT id FROM users WHERE email='unclaimed-listings@cordova-restaurants.gov.ph' AND is_active=false");
    if (!owners[0]) throw new Error('Unclaimed directory owner must be inactive');
    for (const record of missing) {
      const { rows } = await client.query(`INSERT INTO restaurants
        (id,owner_id,name,slug,description,address,barangay,latitude,longitude,phone,email,price_range,
         services_offered,cover_image_url,status,verified_at,is_active,ownership_claimed,avg_rating,review_count,view_count)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'verified',$15,true,false,0,0,0)
        ON CONFLICT(slug) DO NOTHING RETURNING id`, [record.id,owners[0].id,record.name,record.slug,
        record.description,record.address,record.barangay,record.latitude,record.longitude,record.phone,
        record.email,record.price_range,record.services_offered,record.cover_image_url,record.verified_at]);
      if (!rows[0]) continue;
      const id = rows[0].id;
      report.restored++;
      for (const name of record.cuisines) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
        let cuisine = await client.query('SELECT id FROM cuisines WHERE name=$1 OR slug=$2', [name,slug]);
        if (!cuisine.rows[0]) cuisine = await client.query('INSERT INTO cuisines(name,slug) VALUES($1,$2) RETURNING id',[name,slug]);
        await client.query('INSERT INTO restaurant_cuisines(restaurant_id,cuisine_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[id,cuisine.rows[0].id]);
      }
      const menu = snapshot.menus.find((entry) => entry.slug === record.slug);
      if (!menu) continue;
      const categories = new Map();
      for (const category of menu.categories) {
        const result = await client.query('INSERT INTO menu_categories(restaurant_id,name,sort_order) VALUES($1,$2,$3) RETURNING id',[id,category.name,category.sort_order || 0]);
        categories.set(category.id,result.rows[0].id);
      }
      for (let start = 0; start < menu.items.length; start += 100) {
        const items = menu.items.slice(start,start+100);
        const values = [];
        const placeholders = items.map((item) => {
          if (!categories.has(item.category_id)) throw new Error(`Missing category for ${item.name}`);
          const offset = values.length;
          values.push(id,categories.get(item.category_id),item.name,item.description || null,item.price,item.image_url || null,item.is_available !== false,item.dietary_tags || []);
          return `(${Array.from({ length: 8 },(_,i)=>`$${offset+i+1}`).join(',')})`;
        });
        await client.query(`INSERT INTO menu_items(restaurant_id,category_id,name,description,price,image_url,is_available,dietary_tags) VALUES ${placeholders.join(',')}`,values);
        report.menuItems += items.length;
      }
    }
    const preserved = await client.query('SELECT id,slug,status,owner_id FROM restaurants WHERE id=ANY($1::uuid[])',[existing.map((row)=>row.id)]);
    for (const before of existing) {
      const after = preserved.rows.find((row)=>row.id===before.id);
      if (!after || after.status !== before.status || after.owner_id !== before.owner_id) throw new Error('Existing application changed unexpectedly');
    }
    await client.query('COMMIT');
    return report;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}

if (require.main === module) {
  run(process.argv[2],process.argv[3],{ apply: process.argv.includes('--apply') })
    .then((report)=>console.log(JSON.stringify(report)))
    .catch((error)=>{console.error(error.message);process.exitCode=1;})
    .finally(()=>pool.end());
}
module.exports = { run };
