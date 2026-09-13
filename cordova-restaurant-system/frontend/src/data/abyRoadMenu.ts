import type { MenuItem, MenuCategory } from '@/lib/types';

export const ABY_ROAD_CATEGORIES: MenuCategory[] = [
  {
    id: 'cat-aby-1',
    restaurant_id: 'aby-road-resto-bar',
    name: 'Bestsellers Promo',
    sort_order: 1
  },
  {
    id: 'cat-aby-2',
    restaurant_id: 'aby-road-resto-bar',
    name: 'Sizzling & Pulutan',
    sort_order: 2
  },
  {
    id: 'cat-aby-3',
    restaurant_id: 'aby-road-resto-bar',
    name: 'Noodles & Mains',
    sort_order: 3
  }
];

export const ABY_ROAD_MENU_ITEMS: MenuItem[] = [
  // Bestsellers Promo
  {
    id: 'mi-aby-1',
    restaurant_id: 'aby-road-resto-bar',
    category_id: 'cat-aby-1',
    category_name: 'Bestsellers Promo',
    name: 'Pork Sisig (Single / Family)',
    description: 'Sizzling savory pork sisig topped with egg, fresh chili, and calamansi. (Single ₱170 / Family ₱295) - Bestseller Big Discount',
    price: 170,
    image_url: '/images/aby-road/pork-sisig.png',
    is_available: true,
    dietary_tags: ['bestseller', 'sisig', 'pork', 'sizzling', 'promo']
  },
  {
    id: 'mi-aby-2',
    restaurant_id: 'aby-road-resto-bar',
    category_id: 'cat-aby-1',
    category_name: 'Bestsellers Promo',
    name: 'Pork Sinigang (Single / Family)',
    description: 'Sour tamarind broth with tender pork and fresh garden vegetables. (Single ₱170 / Family ₱295) - Bestseller Big Discount',
    price: 170,
    image_url: '/images/aby-road/pork-sinigang.png',
    is_available: true,
    dietary_tags: ['bestseller', 'sinigang', 'soup', 'pork', 'promo']
  },
  {
    id: 'mi-aby-3',
    restaurant_id: 'aby-road-resto-bar',
    category_id: 'cat-aby-1',
    category_name: 'Bestsellers Promo',
    name: 'Fried Chicken (5pcs / 10pcs)',
    description: 'Crispy seasoned golden fried chicken. (Single 5pcs ₱225 / Family 10pcs ₱399) - Bestseller Big Discount',
    price: 225,
    image_url: '/images/aby-road/fried-chicken.png',
    is_available: true,
    dietary_tags: ['bestseller', 'fried-chicken', 'crispy', 'promo']
  },
  {
    id: 'mi-aby-4',
    restaurant_id: 'aby-road-resto-bar',
    category_id: 'cat-aby-1',
    category_name: 'Bestsellers Promo',
    name: 'Buffalo Chicken (Single / Family)',
    description: 'Crispy chicken wings glazed in sweet & spicy buffalo sauce with toasted sesame seeds. (Single ₱170 / Family ₱295) - Bestseller Big Discount',
    price: 170,
    image_url: '/images/aby-road/buffalo-chicken.png',
    is_available: true,
    dietary_tags: ['bestseller', 'chicken-wings', 'buffalo', 'spicy', 'promo']
  },
  {
    id: 'mi-aby-5',
    restaurant_id: 'aby-road-resto-bar',
    category_id: 'cat-aby-1',
    category_name: 'Bestsellers Promo',
    name: 'Lumpia Shanghai (12pcs / 24pcs)',
    description: 'Crispy golden fried meat spring rolls served with sweet chili dipping sauce. (Single 12pcs ₱155 / Family 24pcs ₱285)',
    price: 155,
    image_url: '/images/aby-road/lumpia-shanghai.png',
    is_available: true,
    dietary_tags: ['bestseller', 'lumpia', 'appetizer', 'crispy', 'promo']
  },
  {
    id: 'mi-aby-6',
    restaurant_id: 'aby-road-resto-bar',
    category_id: 'cat-aby-1',
    category_name: 'Bestsellers Promo',
    name: 'Pancit Canton (Single / Family)',
    description: 'Stir-fried yellow noodles tossed with pork, vegetables, and calamansi. (Single ₱170 / Family ₱275)',
    price: 170,
    image_url: '/images/aby-road/pancit-canton.png',
    is_available: true,
    dietary_tags: ['bestseller', 'pancit', 'noodles', 'promo']
  },
  {
    id: 'mi-aby-7',
    restaurant_id: 'aby-road-resto-bar',
    category_id: 'cat-aby-1',
    category_name: 'Bestsellers Promo',
    name: 'Bihon Guisado (Single / Family)',
    description: 'Classic Filipino stir-fried rice vermicelli noodles with savory meats and fresh vegetables. (Single ₱150 / Family ₱245)',
    price: 150,
    image_url: '/images/aby-road/bihon-guisado.png',
    is_available: true,
    dietary_tags: ['bestseller', 'bihon', 'noodles', 'promo']
  },
  {
    id: 'mi-aby-8',
    restaurant_id: 'aby-road-resto-bar',
    category_id: 'cat-aby-1',
    category_name: 'Bestsellers Promo',
    name: 'Lechon Kawali (Single / Family)',
    description: 'Golden crispy deep-fried pork belly with crackling skin and tender meat. (Single ₱250 / Family ₱480)',
    price: 250,
    image_url: '/images/aby-road/lechon-kawali.png',
    is_available: true,
    dietary_tags: ['bestseller', 'lechon-kawali', 'crispy-pork', 'pulutan', 'promo']
  },

  // Sizzling & Pulutan
  {
    id: 'mi-aby-9',
    restaurant_id: 'aby-road-resto-bar',
    category_id: 'cat-aby-2',
    category_name: 'Sizzling & Pulutan',
    name: 'Pork Sisig (Family Platter)',
    description: 'Large family-size sizzling pork sisig loaded with egg, chili, and calamansi.',
    price: 295,
    image_url: '/images/aby-road/pork-sisig.png',
    is_available: true,
    dietary_tags: ['sisig', 'family', 'pulutan', 'sizzling']
  },
  {
    id: 'mi-aby-10',
    restaurant_id: 'aby-road-resto-bar',
    category_id: 'cat-aby-2',
    category_name: 'Sizzling & Pulutan',
    name: 'Lechon Kawali (Family Platter)',
    description: 'Extra large family platter of crispy lechon kawali with liver dipping sauce.',
    price: 480,
    image_url: '/images/aby-road/lechon-kawali.png',
    is_available: true,
    dietary_tags: ['lechon-kawali', 'family', 'pulutan']
  },
  {
    id: 'mi-aby-11',
    restaurant_id: 'aby-road-resto-bar',
    category_id: 'cat-aby-2',
    category_name: 'Sizzling & Pulutan',
    name: 'Buffalo Chicken (Family Platter)',
    description: 'Family shareable platter of sweet & spicy sesame buffalo chicken wings.',
    price: 295,
    image_url: '/images/aby-road/buffalo-chicken.png',
    is_available: true,
    dietary_tags: ['buffalo', 'wings', 'family']
  },
  {
    id: 'mi-aby-12',
    restaurant_id: 'aby-road-resto-bar',
    category_id: 'cat-aby-2',
    category_name: 'Sizzling & Pulutan',
    name: 'Lumpia Shanghai (24 pcs Platter)',
    description: 'Party pack of 24 crispy golden fried pork lumpia rolls with sweet chili dip.',
    price: 285,
    image_url: '/images/aby-road/lumpia-shanghai.png',
    is_available: true,
    dietary_tags: ['lumpia', 'party-pack', 'pulutan']
  },

  // Noodles & Mains
  {
    id: 'mi-aby-13',
    restaurant_id: 'aby-road-resto-bar',
    category_id: 'cat-aby-3',
    category_name: 'Noodles & Mains',
    name: 'Fried Chicken (10 pcs Bucket)',
    description: '10-piece bucket of crispy golden fried chicken with gravy.',
    price: 399,
    image_url: '/images/aby-road/fried-chicken.png',
    is_available: true,
    dietary_tags: ['fried-chicken', 'bucket', 'family']
  },
  {
    id: 'mi-aby-14',
    restaurant_id: 'aby-road-resto-bar',
    category_id: 'cat-aby-3',
    category_name: 'Noodles & Mains',
    name: 'Pancit Canton (Family Fiesta)',
    description: 'Fiesta-sized platter of stir-fried savory Pancit Canton noodles.',
    price: 275,
    image_url: '/images/aby-road/pancit-canton.png',
    is_available: true,
    dietary_tags: ['pancit', 'canton', 'family']
  },
  {
    id: 'mi-aby-15',
    restaurant_id: 'aby-road-resto-bar',
    category_id: 'cat-aby-3',
    category_name: 'Noodles & Mains',
    name: 'Bihon Guisado (Family Fiesta)',
    description: 'Fiesta-sized platter of savory Filipino stir-fried bihon noodles.',
    price: 245,
    image_url: '/images/aby-road/bihon-guisado.png',
    is_available: true,
    dietary_tags: ['bihon', 'family', 'noodles']
  },
  {
    id: 'mi-aby-16',
    restaurant_id: 'aby-road-resto-bar',
    category_id: 'cat-aby-3',
    category_name: 'Noodles & Mains',
    name: 'Pork Sinigang (Family Bowl)',
    description: 'Large family-size hot tamarind soup bowl with pork ribs and vegetables.',
    price: 295,
    image_url: '/images/aby-road/pork-sinigang.png',
    is_available: true,
    dietary_tags: ['sinigang', 'soup', 'family']
  }
];
