require('dotenv').config();
const { pool } = require('../config/db');

async function seedAbyRoad() {
  console.log('Seeding ABY ROAD Resto Bar menu...');
  
  const restRes = await pool.query(`
    SELECT id, name, slug FROM restaurants 
    WHERE slug = 'aby-road-resto-bar' OR slug = 'aby-road' OR name ILIKE '%aby road%'
    LIMIT 1;
  `);

  if (restRes.rows.length === 0) {
    console.error('ABY ROAD restaurant not found in database.');
    return;
  }

  const restaurantId = restRes.rows[0].id;
  console.log(`Found Restaurant: ${restRes.rows[0].name} (ID: ${restaurantId})`);

  // Delete existing categories & items to avoid duplicates
  await pool.query(`DELETE FROM menu_items WHERE restaurant_id = $1`, [restaurantId]);
  await pool.query(`DELETE FROM menu_categories WHERE restaurant_id = $1`, [restaurantId]);

  // Categories
  const categories = [
    { name: 'Bestsellers Promo', sort_order: 1 },
    { name: 'Sizzling & Pulutan', sort_order: 2 },
    { name: 'Noodles & Mains', sort_order: 3 },
    { name: 'Drinks & Refreshments', sort_order: 4 }
  ];

  const categoryMap = {};
  for (const cat of categories) {
    const catRes = await pool.query(`
      INSERT INTO menu_categories (restaurant_id, name, sort_order)
      VALUES ($1, $2, $3)
      RETURNING id, name;
    `, [restaurantId, cat.name, cat.sort_order]);
    categoryMap[catRes.rows[0].name] = catRes.rows[0].id;
  }

  const items = [
    // Bestsellers Promo
    {
      category: 'Bestsellers Promo',
      name: 'Pork Sisig (Single / Family)',
      description: 'Sizzling savory pork sisig topped with egg, fresh chili, and calamansi. (Single ₱170 / Family ₱295) - Bestseller Big Discount',
      price: 170,
      image: '/images/aby-road/pork-sisig.png',
      tags: ['bestseller', 'sisig', 'pork', 'sizzling', 'promo']
    },
    {
      category: 'Bestsellers Promo',
      name: 'Pork Sinigang (Single / Family)',
      description: 'Sour tamarind broth with tender pork and fresh garden vegetables. (Single ₱170 / Family ₱295) - Bestseller Big Discount',
      price: 170,
      image: '/images/aby-road/pork-sinigang.png',
      tags: ['bestseller', 'sinigang', 'soup', 'pork', 'promo']
    },
    {
      category: 'Bestsellers Promo',
      name: 'Fried Chicken (5pcs / 10pcs)',
      description: 'Crispy seasoned golden fried chicken. (Single 5pcs ₱225 / Family 10pcs ₱399) - Bestseller Big Discount',
      price: 225,
      image: '/images/aby-road/fried-chicken.png',
      tags: ['bestseller', 'fried-chicken', 'crispy', 'promo']
    },
    {
      category: 'Bestsellers Promo',
      name: 'Buffalo Chicken (Single / Family)',
      description: 'Crispy chicken wings glazed in sweet & spicy buffalo sauce with toasted sesame seeds. (Single ₱170 / Family ₱295) - Bestseller Big Discount',
      price: 170,
      image: '/images/aby-road/buffalo-chicken.png',
      tags: ['bestseller', 'chicken-wings', 'buffalo', 'spicy', 'promo']
    },
    {
      category: 'Bestsellers Promo',
      name: 'Lumpia Shanghai (12pcs / 24pcs)',
      description: 'Crispy golden fried meat spring rolls served with sweet chili dipping sauce. (Single 12pcs ₱155 / Family 24pcs ₱285)',
      price: 155,
      image: '/images/aby-road/lumpia-shanghai.png',
      tags: ['bestseller', 'lumpia', 'appetizer', 'crispy', 'promo']
    },
    {
      category: 'Bestsellers Promo',
      name: 'Pancit Canton (Single / Family)',
      description: 'Stir-fried yellow noodles tossed with pork, vegetables, and calamansi. (Single ₱170 / Family ₱275)',
      price: 170,
      image: '/images/aby-road/pancit-canton.png',
      tags: ['bestseller', 'pancit', 'noodles', 'promo']
    },
    {
      category: 'Bestsellers Promo',
      name: 'Bihon Guisado (Single / Family)',
      description: 'Classic Filipino stir-fried rice vermicelli noodles with savory meats and fresh vegetables. (Single ₱150 / Family ₱245)',
      price: 150,
      image: '/images/aby-road/bihon-guisado.png',
      tags: ['bestseller', 'bihon', 'noodles', 'promo']
    },
    {
      category: 'Bestsellers Promo',
      name: 'Lechon Kawali (Single / Family)',
      description: 'Golden crispy deep-fried pork belly with crackling skin and tender meat. (Single ₱250 / Family ₱480)',
      price: 250,
      image: '/images/aby-road/lechon-kawali.png',
      tags: ['bestseller', 'lechon-kawali', 'crispy-pork', 'pulutan', 'promo']
    },

    // Sizzling & Pulutan
    {
      category: 'Sizzling & Pulutan',
      name: 'Pork Sisig (Family Platter)',
      description: 'Large family-size sizzling pork sisig loaded with egg, chili, and calamansi.',
      price: 295,
      image: '/images/aby-road/pork-sisig.png',
      tags: ['sisig', 'family', 'pulutan', 'sizzling']
    },
    {
      category: 'Sizzling & Pulutan',
      name: 'Lechon Kawali (Family Platter)',
      description: 'Extra large family platter of crispy lechon kawali with liver dipping sauce.',
      price: 480,
      image: '/images/aby-road/lechon-kawali.png',
      tags: ['lechon-kawali', 'family', 'pulutan']
    },
    {
      category: 'Sizzling & Pulutan',
      name: 'Buffalo Chicken (Family Platter)',
      description: 'Family shareable platter of sweet & spicy sesame buffalo chicken wings.',
      price: 295,
      image: '/images/aby-road/buffalo-chicken.png',
      tags: ['buffalo', 'wings', 'family']
    },
    {
      category: 'Sizzling & Pulutan',
      name: 'Lumpia Shanghai (24 pcs Platter)',
      description: 'Party pack of 24 crispy golden fried pork lumpia rolls with sweet chili dip.',
      price: 285,
      image: '/images/aby-road/lumpia-shanghai.png',
      tags: ['lumpia', 'party-pack', 'pulutan']
    },

    // Noodles & Mains
    {
      category: 'Noodles & Mains',
      name: 'Fried Chicken (10 pcs Bucket)',
      description: '10-piece bucket of crispy golden fried chicken with gravy.',
      price: 399,
      image: '/images/aby-road/fried-chicken.png',
      tags: ['fried-chicken', 'bucket', 'family']
    },
    {
      category: 'Noodles & Mains',
      name: 'Pancit Canton (Family Fiesta)',
      description: 'Fiesta-sized platter of stir-fried savory Pancit Canton noodles.',
      price: 275,
      image: '/images/aby-road/pancit-canton.png',
      tags: ['pancit', 'canton', 'family']
    },
    {
      category: 'Noodles & Mains',
      name: 'Bihon Guisado (Family Fiesta)',
      description: 'Fiesta-sized platter of savory Filipino stir-fried bihon noodles.',
      price: 245,
      image: '/images/aby-road/bihon-guisado.png',
      tags: ['bihon', 'family', 'noodles']
    },
    {
      category: 'Noodles & Mains',
      name: 'Pork Sinigang (Family Bowl)',
      description: 'Large family-size hot tamarind soup bowl with pork ribs and vegetables.',
      price: 295,
      image: '/images/aby-road/pork-sinigang.png',
      tags: ['sinigang', 'soup', 'family']
    }
  ];

  for (const item of items) {
    const catId = categoryMap[item.category];
    await pool.query(`
      INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, dietary_tags)
      VALUES ($1, $2, $3, $4, $5, $6, true, $7);
    `, [restaurantId, catId, item.name, item.description, item.price, item.image, item.tags]);
  }

  console.log(`Successfully seeded ${items.length} items for ABY ROAD Resto Bar.`);
}

if (require.main === module) {
  seedAbyRoad()
    .then(() => {
      console.log('Done.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}

module.exports = { seedAbyRoad };
