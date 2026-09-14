require('dotenv').config();
const { pool } = require('../config/db');
const { syncToRestaurantTs, inferCategory, getDefaultCoverImage } = require('../services/restaurantSync.service');

const ORIGINAL_MAP = {
  'horizon-bean-cafe': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80',
  'grillhouse-cordova-bbq': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYx1TyZdXDc_Y1AEZbFrr5Z9bTwmQjoAZCuWUYtHu3ag&s=10',
  'street-food-park': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80',
  'aby-road-resto-bar': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5Kp2YeaylbA53UcCROxnangSIQ2YUsJqB4hx0nIhYoPxKqG-rz4-Z0uo&s=10',
  'eat-n-repeat': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfQN23Tk3arzxnvZgYwgrZTOYhPgijf_4p5q3K621FO-181pCjRTDDMTE&s=10',
  'taytayan-pinoy-restaurant': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAYNgM2l1VWAjy1lHThQ1WNwLiI44JDAfo8aQqPS-wKw&s',
  'stuffed-n-fried-cordova': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSub4cBCkl0sLPiZn-BhNhb7c4hdfE3MRFGRLD74LABAA&s=10',
  'mcdonalds-cordova': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUBuFiPDiQi0bDijKV76uMXADQD2DVL6JlpKeaD0zy17-sGjV6caPB9Z6r&s=10',
  'barracks-grill-and-resto-bar': 'https://lh3.googleusercontent.com/grass-cs/ACvplmP1_ZIZux8LEYKASSCkThb2Q5Xfp8toCwBgS6gR0yYblz4-nHIdDYzdpQMjKUn7jXu5G9wYNFod4dWcCTSvjT9sCay87OKunPdMMUupTd3j7StpHg43j3LIzG2a_KFUd1xr1AFL=s294-w294-h220-n-k-no',
  'bric-food-park': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
  'rca-bilao-food-station': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
  'mavericks-by-the-baker-street': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQu11QAkAvQPNZ0Y4r8_IbqwVvIJxwA2-bk15_VEO_zKcHOiSdH6-5VH4Sw&s=10',
  'entoys-bakasihan': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNCj7x2CFrrKVmn4OCdP_c3QLiciyRFdV0CyqWzXXm4-bNfD447vK7R78o&s=10',
  'tita-kims': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQukvKATrQQW_HUYIbjrG6X6b9KNlzpQz5qlo3DJuung&s=10',
  'burandat-seafood-bucket': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnfjHmw1Us3mlI-tffQq2II3E62OOo-9HD_C5SkWUykDQHElwEa0m7Suar&s=10',
  'csalt-cafe-cordova': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQe-86il0KEf6Gh0WJs_q-X3I8tGbhjWomjoBkTJBGbBw&s=10',
  'cafe-mafia': 'http://localhost:3000/cafe-mafia-cover.png',
  'solea-mactan-resort': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJs8-gUFPgl9cU83YnTf5__Fp_8BhFL8IlfKPl9fcQzl1rzsB2MdLjWhyc&s=10',
  'sungka-native-restaurant': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYiZGOakQCISH5JLE9XpMaq7c834bHYQ2Pv8nmzfxhdn6ZopUeMouJ5nY&s=10',
  'lantaw-floating-native-restaurant': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuOl7HxrmSXr2JW-b5lLt0iRWS7hh_ObrmQKrIpIT3WQe99Zm3s-C1kjw&s=10',
  'albertos-pizza-cordova': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc1MHHZ0YdgZ6T7yKZsr3ms71ihX6gDgQPOM7_3fWQ6RucKdjph9uKAdY&s=10',
  'cascaja-cafe': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaMHiYg94wzeeK6oPQ5FTQczijAWKvc6mCLFWa1_FHW2uxgFuFfns-Gi0&s=10',
  'don-macchiatos-cordova': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2kgd78I8cpTbhSrOOc3ZfSq9BO0clYam57_rgDI3UviCc_tuXlsO2VJry&s=10',
  'parola-seaview-restaurant': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSL7EJmXtZI_6OP_IOn3cdEknylsIq8N-5D7mLaGIpgfPDot9rz1oMJ1vk&s=10',
  '10000-roses-cafe-and-more': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRY-gDUjXc0GWAZGac7KeR3AWR2ZyPLpAqZzWVcplRkWXIajolwprvnDykK&s=10',
  'papsys-bbq': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9N4HYtH1Bcb1QfplVolrNrR0fV2St3wEqU1dXS4sYa80-tR1w4MiEFAo&s=10',
};

async function syncAll() {
  console.log('🔄 Cleaning up database and synchronizing original restaurant photos...');
  try {
    // Standardize slug for Papsy's BBQ
    await pool.query("UPDATE restaurants SET slug = 'papsys-bbq' WHERE name ILIKE '%papsy%'");

    const { rows } = await pool.query(`
      SELECT 
        r.*,
        COALESCE(
          (SELECT array_agg(c.name) FROM restaurant_cuisines rc
            JOIN cuisines c ON c.id = rc.cuisine_id WHERE rc.restaurant_id = r.id),
          '{}'
        ) AS cuisines
      FROM restaurants r
      WHERE r.status = 'verified'
      ORDER BY r.name ASC
    `);

    let count = 0;
    for (const r of rows) {
      let cover = r.cover_image_url;
      const slugKey = (r.slug || '').toLowerCase();
      if (ORIGINAL_MAP[slugKey]) {
        cover = ORIGINAL_MAP[slugKey];
        await pool.query('UPDATE restaurants SET cover_image_url = $1 WHERE id = $2', [cover, r.id]);
        r.cover_image_url = cover;
      } else if (!cover || cover.trim() === '') {
        const cat = inferCategory(r.name, r.description, r.cuisines);
        cover = getDefaultCoverImage(r.name, r.description, cat);
        await pool.query('UPDATE restaurants SET cover_image_url = $1 WHERE id = $2', [cover, r.id]);
        r.cover_image_url = cover;
      }
      const ok = syncToRestaurantTs(r);
      if (ok) count++;
    }

    console.log(`✅ Successfully checked and synchronized ${count} restaurant(s) in restaurants.ts with original images!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Sync failed:', err);
    process.exit(1);
  }
}

syncAll();
