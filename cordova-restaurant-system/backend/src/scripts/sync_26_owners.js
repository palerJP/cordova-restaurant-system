const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

const OWNERS = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    email: 'owner.10000roses@cordovateats.ph',
    full_name: 'Bae Min-jun',
    phone: '+639171000001',
    restaurant_slug: '10000-roses-cafe-and-more',
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    email: 'owner.abyroad@cordovateats.ph',
    full_name: 'Abigail Sanchez',
    phone: '+639171000002',
    restaurant_slug: 'aby-road-resto-bar',
  },
  {
    id: '20000000-0000-0000-0000-000000000003',
    email: 'owner.albertos@cordovateats.ph',
    full_name: 'Alberto Tan',
    phone: '+639171000003',
    restaurant_slug: 'albertos-pizza-cordova',
  },
  {
    id: '20000000-0000-0000-0000-000000000004',
    email: 'owner.barracks@cordovateats.ph',
    full_name: 'Mario Ramos',
    phone: '+639171000004',
    restaurant_slug: 'barracks-grill-and-resto-bar',
  },
  {
    id: '20000000-0000-0000-0000-000000000005',
    email: 'owner.bric@cordovateats.ph',
    full_name: 'Brian Richard Castro',
    phone: '+639171000005',
    restaurant_slug: 'bric-food-park',
  },
  {
    id: '20000000-0000-0000-0000-000000000006',
    email: 'owner.burandat@cordovateats.ph',
    full_name: 'Danilo Burandat',
    phone: '+639171000006',
    restaurant_slug: 'burandat-seafood-bucket',
  },
  {
    id: '20000000-0000-0000-0000-000000000007',
    email: 'owner.cafemafia@cordovateats.ph',
    full_name: 'Marco Rossi',
    phone: '+639171000007',
    restaurant_slug: 'cafe-mafia',
  },
  {
    id: '20000000-0000-0000-0000-000000000008',
    email: 'owner.cascaja@cordovateats.ph',
    full_name: 'Clara Cascaja',
    phone: '+639171000008',
    restaurant_slug: 'cascaja-cafe',
  },
  {
    id: '20000000-0000-0000-0000-000000000009',
    email: 'owner.csalt@cordovateats.ph',
    full_name: 'Cynthia Salter',
    phone: '+639171000009',
    restaurant_slug: 'csalt-cafe-cordova',
  },
  {
    id: '20000000-0000-0000-0000-000000000010',
    email: 'owner.donmacchiatos@cordovateats.ph',
    full_name: 'Donato Macalinao',
    phone: '+639171000010',
    restaurant_slug: 'don-macchiatos-cordova',
  },
  {
    id: '20000000-0000-0000-0000-000000000011',
    email: 'owner.eatnrepeat@cordovateats.ph',
    full_name: 'Eleanor Reyes',
    phone: '+639171000011',
    restaurant_slug: 'eat-n-repeat',
  },
  {
    id: '20000000-0000-0000-0000-000000000012',
    email: 'owner.entoys@cordovateats.ph',
    full_name: "Florencio 'Entoy' Escabas",
    phone: '+639171000012',
    restaurant_slug: 'entoys-bakasihan',
  },
  {
    id: '20000000-0000-0000-0000-000000000013',
    email: 'owner.horizon@cordovateats.ph',
    full_name: 'Hazel Joy Ompad',
    phone: '+639171000013',
    restaurant_slug: 'horizon-bean-cafe',
  },
  {
    id: '20000000-0000-0000-0000-000000000015',
    email: 'owner.lantaw@cordovateats.ph',
    full_name: 'Leonardo Lantaw',
    phone: '+639171000015',
    restaurant_slug: 'lantaw-floating-native-restaurant',
  },
  {
    id: '20000000-0000-0000-0000-000000000016',
    email: 'owner.mavericks@cordovateats.ph',
    full_name: 'Michael Maverick',
    phone: '+639171000016',
    restaurant_slug: 'mavericks-by-the-baker-street',
  },
  {
    id: '20000000-0000-0000-0000-000000000017',
    email: 'owner.mcdonalds@cordovateats.ph',
    full_name: 'Manuel Dy (Franchisee)',
    phone: '+639171000017',
    restaurant_slug: 'mcdonalds-cordova',
  },
  {
    id: '20000000-0000-0000-0000-000000000018',
    email: 'owner.papsys@cordovateats.ph',
    full_name: "Patrick 'Papsy' Alcordo",
    phone: '+639171000018',
    restaurant_slug: 'papsys-bbq',
  },
  {
    id: '20000000-0000-0000-0000-000000000019',
    email: 'owner.parola@cordovateats.ph',
    full_name: 'Roberto Parola',
    phone: '+639171000019',
    restaurant_slug: 'parola-seaview-restaurant',
  },
  {
    id: '20000000-0000-0000-0000-000000000020',
    email: 'owner.rca@cordovateats.ph',
    full_name: 'Rowena Castillo Alcover',
    phone: '+639171000020',
    restaurant_slug: 'rca-bilao-food-station',
  },
  {
    id: '20000000-0000-0000-0000-000000000021',
    email: 'owner.solea@cordovateats.ph',
    full_name: 'Sophia Leano',
    phone: '+639171000021',
    restaurant_slug: 'solea-mactan-resort',
  },
  {
    id: '20000000-0000-0000-0000-000000000022',
    email: 'owner.streetfoodpark@cordovateats.ph',
    full_name: 'Sherwin Flores',
    phone: '+639171000022',
    restaurant_slug: 'street-food-park',
  },
  {
    id: '20000000-0000-0000-0000-000000000023',
    email: 'owner.stuffednfried@cordovateats.ph',
    full_name: 'Stefan Navarro',
    phone: '+639171000023',
    restaurant_slug: 'stuffed-n-fried-cordova',
  },
  {
    id: '20000000-0000-0000-0000-000000000024',
    email: 'owner.sungka@cordovateats.ph',
    full_name: 'Salvador Sungka',
    phone: '+639171000024',
    restaurant_slug: 'sungka-native-restaurant',
  },
  {
    id: '20000000-0000-0000-0000-000000000025',
    email: 'owner.taytayan@cordovateats.ph',
    full_name: 'Tomas Taytayan',
    phone: '+639171000025',
    restaurant_slug: 'taytayan-pinoy-restaurant',
  },
  {
    id: '20000000-0000-0000-0000-000000000026',
    email: 'owner.titakims@cordovateats.ph',
    full_name: "Kimberly 'Tita Kim' Arong",
    phone: '+639171000026',
    restaurant_slug: 'tita-kims',
  },
];

async function sync26Owners() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Convert any old non-26 dummy owner accounts into customer role
  await pool.query(`
    UPDATE users 
    SET role = 'customer' 
    WHERE role = 'owner' 
      AND email NOT IN (${OWNERS.map((_, i) => `$${i + 1}`).join(', ')})
  `, OWNERS.map(o => o.email));

  // 2. Upsert the 26 owners
  for (const o of OWNERS) {
    // Delete existing with this id if different email
    await pool.query('DELETE FROM users WHERE id = $1 AND email != $2', [o.id, o.email]);

    await pool.query(`
      INSERT INTO users (id, email, password_hash, full_name, role, phone, email_verified_at, created_at)
      VALUES ($1, $2, $3, $4, 'owner', $5, now(), now())
      ON CONFLICT (email) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = 'owner',
        phone = EXCLUDED.phone,
        email_verified_at = now()
    `, [o.id, o.email, passwordHash, o.full_name, o.phone]);

    // Retrieve actual user id
    const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [o.email]);
    const actualUserId = userRes.rows[0]?.id || o.id;

    // 3. Link this owner to their restaurant
    const updateRestRes = await pool.query(
      'UPDATE restaurants SET owner_id = $1 WHERE slug = $2 RETURNING id, name, slug',
      [actualUserId, o.restaurant_slug]
    );

    if (updateRestRes.rows.length > 0) {
      console.log(`Linked [${updateRestRes.rows[0].name}] -> Owner: ${o.full_name} (${o.email})`);
    } else {
      console.warn(`Restaurant not found for slug: ${o.restaurant_slug}`);
    }
  }

  // 4. Verify total counts
  const ownerCountRes = await pool.query("SELECT COUNT(*) AS total FROM users WHERE role = 'owner'");
  const restCountRes = await pool.query("SELECT COUNT(*) AS total FROM restaurants");
  const verifiedRestCountRes = await pool.query("SELECT COUNT(*) AS total FROM restaurants WHERE status = 'verified'");

  console.log('\n=== SYNC SUMMARY ===');
  console.log('Total Restaurants in DB:', restCountRes.rows[0].total);
  console.log('Verified Restaurants in DB:', verifiedRestCountRes.rows[0].total);
  console.log('Total Restaurant Owners in DB:', ownerCountRes.rows[0].total);

  await pool.end();
}

sync26Owners().catch(err => {
  console.error(err);
  pool.end();
});
