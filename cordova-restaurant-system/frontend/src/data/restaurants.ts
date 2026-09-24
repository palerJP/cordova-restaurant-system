import type { Restaurant } from '@/lib/types';
import { getRestaurantReviewStats } from './restaurantReviews';

/**
 * ============================================================================
 * 🍽️ RESTAURANT FRONTEND DIRECTORY & CUSTOMIZATIONS
 * ============================================================================
 * All 26 verified Cordova restaurants, organized and numbered with verified
 * phone numbers, physical addresses, and opening hours.
 * ============================================================================
 */

export type EstablishmentCategory = 'Fast Food' | 'Restaurant' | 'Cafe' | 'Street Food' | 'Resto Bar' | 'Pizza';

export interface RestaurantCustomConfig {
  name: string;
  category: EstablishmentCategory;
  coverImage?: string | null;
  barangay?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  hours?: string;
  hidden?: boolean;
}

export const RESTAURANT_CUSTOMIZATIONS: Record<string, RestaurantCustomConfig> = {

  // 1. Horizon Bean Cafe
  'horizon-bean-cafe': {
    name: 'Horizon Bean Cafe',
    category: 'Cafe',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjr6iV9_a_faqTZ-ifuWgFk7EFlqV4QwQobcFDdYO8WXbjpAq1AmURrTo0&s=10',
    barangay: 'San Miguel',
    description: 'A cozy, small-scale neighborhood coffee shop known for its premium coffee, comfort food, and late-night chill vibe.',
    address: 'Unit 3, JMP Building, Purok 1 San Miguel Road, Cordova',
    phone: '0975 174 5866',
    hours: '10:00 AM - 12:00 AM (Daily)',
  },

  // 4. ABY ROAD Resto Bar
  'aby-road-resto-bar': {
    name: 'ABY ROAD Resto Bar',
    category: 'Resto Bar',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5Kp2YeaylbA53UcCROxnangSIQ2YUsJqB4hx0nIhYoPxKqG-rz4-Z0uo&s=10',
    barangay: 'Bangbang',
    description: 'Beatles-inspired restobar famous for its "Sarap na, sulit pa!" big discount bestsellers: sizzling pork sisig, buffalo chicken, crispy fried chicken, pork sinigang, pancit canton, and lechon kawali.',
    address: '7W3W+MXG, Bang-Bang - Day-As, Cordova, Cebu',
    phone: '0922 944 3882 / (032) 238 5718',
    hours: '10:00 AM - 2:00 AM (Sun-Thu), 10:00 AM - 3:30 AM (Fri-Sat)',
  },

  // 5. Eat n' Repeat
  'eat-n-repeat': {
    name: 'Eat n\' Repeat',
    category: 'Cafe',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfQN23Tk3arzxnvZgYwgrZTOYhPgijf_4p5q3K621FO-181pCjRTDDMTE&s=10',
    barangay: 'Bangbang',
    description: 'aesthetic at Instagram-worthy na cafe at tambayan.',
    address: 'Crossroad, Back of Gaisano, Cordova',
    phone: '0915 151 6595',
    hours: '9:00 AM - 12:00 AM (Mon, Tue, Thu, Fri), 9:00 AM - 12:30 AM (Wed), Open 24 hours (Sat), 9:00 AM - 2:30 PM (Sun)',
  },

  // 6. Taytayan Pinoy Restaurant
  'taytayan-pinoy-restaurant': {
    name: 'Taytayan Pinoy Restaurant',
    category: 'Restaurant',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAYNgM2l1VWAjy1lHThQ1WNwLiI44JDAfo8aQqPS-wKw&s',
    barangay: 'Ibabao',
    description: 'ay isang kilalang open-air at lutong-bahay na kainan.',
    address: '7WCW+C77, Babag II Rd, Cordova',
    phone: '(032) 412 3783',
    hours: '10:00 AM - 2:00 PM & 4:00 PM - 10:00 PM (Mon-Thu), 10:00 AM - 10:00 PM (Fri-Sun)',
  },

  // 7. STUFFED N' FRIED Cordova Branch 
  'stuffed-n-fried-cordova': {
    name: 'STUFFED N\' FRIED Cordova Branch',
    category: 'Restaurant',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSub4cBCkl0sLPiZn-BhNhb7c4hdfE3MRFGRLD74LABAA&s=10',
    barangay: 'Gabi',
    description: 'a popular local chicken house in Cebu known for its signature double-fried, 15-spice Batter-Fried Whole Chicken, crispy lechon kawali, and special ngohiong.',
    address: '1911 M.L. Quezon National Highway, Cordova',
    phone: '0975 985 6145',
    hours: '10:00 AM - 9:00 PM (Daily)',
  },

  // 8. McDonald's Cordova 
  'mcdonalds-cordova': {
    name: 'McDonald\'s Cordova',
    category: 'Fast Food',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUBuFiPDiQi0bDijKV76uMXADQD2DVL6JlpKeaD0zy17-sGjV6caPB9Z6r&s=10',
    barangay: 'San Miguel',
    description: 'the world\'s largest chain of hamburger fast-food restaurants.',
    address: 'Bangbang II Road, San Miguel, Cordova',
    phone: '0968 851 0931',
    hours: 'Open 24 hours (Daily)',
  },

  // 9. Barracks Grill and Resto Bar 
  'barracks-grill-and-resto-bar': {
    name: 'Barracks Grill and Resto Bar',
    category: 'Resto Bar',
    coverImage: 'https://lh3.googleusercontent.com/grass-cs/ACvplmP1_ZIZux8LEYKASSCkThb2Q5Xfp8toCwBgS6gR0yYblz4-nHIdDYzdpQMjKUn7jXu5G9wYNFod4dWcCTSvjT9sCay87OKunPdMMUupTd3j7StpHg43j3LIzG2a_KFUd1xr1AFL=s294-w294-h220-n-k-no',
    barangay: 'Gabi',
    description: 'casual nightspot and dining place.',
    address: 'Ajoya Subdivision, Mactan Island, Cordova, Cebu',
    phone: '0977 328 7689',
    hours: '5:00 PM – 4:00 AM (Daily)',
  },

  // 11. RCA Bilao Food Station
  'rca-bilao-food-station': {
    name: 'RCA Bilao Food Station',
    category: 'Restaurant',
    coverImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
    barangay: 'Gabi',
    description: 'Pansit stir-fry, boneless lechon belly, kakanin sa bilao, ug lain-laing food trays.',
    address: 'Sitio Mahayahay, Gabi, Cordova, Cebu',
    phone: '(032) 326 8766',
    hours: '8:00 AM – 4:00 PM (Daily)',
  },

  // 12. MAVERICKS by The Baker Street 
  'mavericks-by-the-baker-street': {
    name: 'MAVERICKS by The Baker Street',
    category: 'Cafe',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQu11QAkAvQPNZ0Y4r8_IbqwVvIJxwA2-bk15_VEO_zKcHOiSdH6-5VH4Sw&s=10',
    barangay: 'Gabi',
    description: 'Creative space Collective Stories Local Hangouts After hours refuge Pastry Party Coffee Catch up.',
    address: 'Gabi Rd, Cordova, Cebu',
    phone: '0920 527 6233',
    hours: 'Closed Mon; 2:00 PM – 10:00 PM (Tue–Thu); 3:00 PM – 11:00 PM (Fri); 3:00 PM – 12:00 AM (Sat); 12:00 AM – 12:00 PM & 3:00 PM – 11:00 PM (Sun)',
  },
 
  // 13. Entoys Bakasihan
  'entoys-bakasihan': {
    name: 'Entoys Bakasihan',
    category: 'Restaurant',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNCj7x2CFrrKVmn4OCdP_c3QLiciyRFdV0CyqWzXXm4-bNfD447vK7R78o&s=10',
    barangay: 'Buagsong',
    description: 'a popular open-air, casual eatery located in Barangay Buagsong, Cordova, Cebu, famous for its signature reef eel dish called nilarang na bakasi.',
    address: 'Buagsong Barangay Road, Buagsong, Cordova, Cebu',
    phone: '0966 931 7531',
    hours: '6:00 AM – 6:00 PM (Daily)',
  },

  // 14. Tita Kim's
  'tita-kims': {
    name: "Tita Kim's",
    category: 'Restaurant',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQukvKATrQQW_HUYIbjrG6X6b9KNlzpQz5qlo3DJuung&s=10',
    barangay: 'Gabi',
    description: 'A popular Eat-All-You-Can Filipino buffet in Barangay Gabi, Cordova, featuring fresh seafood, meats, and Filipino comfort dishes for ₱299 only.',
    address: 'Purok 5, Lot 747 National Highway, Cordova, Cebu',
    phone: '0998 868 8573',
    hours: 'Closed Mon; 5:00 PM – 10:00 PM (Tue–Fri); 11:30 AM – 10:00 PM (Sat–Sun)',
  },

  // 15. Burandat Seafood Bucket
  'burandat-seafood-bucket': {
    name: 'Burandat Seafood Bucket',
    category: 'Restaurant',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnfjHmw1Us3mlI-tffQq2II3E62OOo-9HD_C5SkWUykDQHElwEa0m7Suar&s=10',
    barangay: 'Gabi',
    description: 'Fresh catch-of-the-day seafood grilled to order, right by the shoreline.',
    address: 'Purok 2, Barangay Gabi, Cordova, Cebu',
    phone: '0916 473 3656',
    hours: 'Hours currently unlisted',
  },

  // 16. Csalt Cafe Cordova
  'csalt-cafe-cordova': {
    name: 'Csalt Cafe Cordova',
    category: 'Cafe',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQe-86il0KEf6Gh0WJs_q-X3I8tGbhjWomjoBkTJBGbBw&s=10',
    barangay: 'Poblacion',
    description: 'Cozy cafe with ocean views, specializing in coffee, pastries and light vegetarian meals.',
    address: 'Sitio Ubos, Poblacion, Cordova, Cebu',
    phone: 'N/A',
    hours: 'Hours currently unlisted',
  },

  // 17. Cafe Mafia
  'cafe-mafia': {
    name: 'Cafe Mafia',
    category: 'Cafe',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQn_riqkNLK4YjVNUrYSCXKc5N22V82mhWXzQ4UFs0Tx8u_yOL9-5XN5kn4&s=10',
    barangay: 'Dapitan',
    description: 'A cozy neighborhood cafe in Cordova famous for its signature handcrafted Mafia Premium Burgers, artisan espresso & iced coffee, appetizers, and fruit teas.',
    address: 'Purok 1, Dapitan, Cordova, Cebu',
    phone: '0917 321 0453',
    hours: '1:00 PM – 10:00 PM (Daily)',
  },

  // 18. Solea Mactan Resort
  'solea-mactan-resort': {
    name: 'Solea Mactan Resort',
    category: 'Restaurant',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJs8-gUFPgl9cU83YnTf5__Fp_8BhFL8IlfKPl9fcQzl1rzsB2MdLjWhyc&s=10',
    barangay: 'Alegria',
    description: '[Verified] The in-house restaurant of Solea Mactan Resort, serving pizza, international, and Filipino dishes. Popular with resort guests and open to walk-in diners.',
    address: 'Victor Wahing Street, Alegria, Cordova, Cebu',
    phone: '(032) 517 8889',
    hours: 'Open 24 hours (Resort front desk); dining options inside operate 6:00 AM – 10:00 PM (Daily)',
    hidden: true,
  },    

  // 19. Sungka Native Restaurant
  'sungka-native-restaurant': {
    name: 'Sungka Native Restaurant',
    category: 'Restaurant',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYiZGOakQCISH5JLE9XpMaq7c834bHYQ2Pv8nmzfxhdn6ZopUeMouJ5nY&s=10',
    barangay: 'Day-as',
    description: 'Classic Filipino dishes served with warm hospitality near Cordova port.',
    address: 'Day-as, Cordova, Cebu',
    phone: 'sungkanative@gmail.com',
    email: 'sungkanative@gmail.com',
    hours: '10:00 AM – 9:00 PM (Daily)',
  },

  // 20. Lantaw Floating Native Restaurant
  'lantaw-floating-native-restaurant': {
    name: 'Lantaw Floating Native Restaurant',
    category: 'Restaurant',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuOl7HxrmSXr2JW-b5lLt0iRWS7hh_ObrmQKrIpIT3WQe99Zm3s-C1kjw&s=10',
    barangay: 'Day-as',
    description: '[Verified] A floating native restaurant on the Cordova waterfront known for sunset views across the Mactan Channel toward the Cebu City skyline. Filipino and seafood dishes served in open-air, bamboo-accented dining platforms over the water.',
    address: 'Day-as Wharf, Cordova, Cebu',
    phone: '0985 052 3061',
    hours: 'Permanently closed at this location (relocated to Il Corso, SRP Cebu City and Busay)',
  },

  // 21. Alberto's Pizza Cordova
  'albertos-pizza-cordova': {
    name: 'Alberto\'s Pizza Cordova',
    category: 'Pizza',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc1MHHZ0YdgZ6T7yKZsr3ms71ihX6gDgQPOM7_3fWQ6RucKdjph9uKAdY&s=10',
    barangay: 'Gabi',
    description: '[Name confirmed, location approximate] A local pizzeria in Cordova. Exact address not independently verified — location shown is approximate.',
    address: 'Gabi, Cordova, Cebu',
    phone: '0925 871 4539',
    hours: '9:00 AM – 10:00 PM (Daily)',
  },

  // 22. Cascaja Cafe 
  'cascaja-cafe': {
    name: 'Cascaja Cafe',
    category: 'Cafe',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaMHiYg94wzeeK6oPQ5FTQczijAWKvc6mCLFWa1_FHW2uxgFuFfns-Gi0&s=10',
    barangay: 'Calan',
    description: 'sa Cordova, Cebu ay isang cozy na coffee shop na nag-aalok ng masasarap na kape, rice meals, pasta, at budget-friendly na inumin.',
    address: 'Calan, Cordova, Cebu',
    phone: '+63 995 755 0983',
    hours: '1:00 PM – 9:00 PM (Tue–Sun), Closed Mon',
  },

  // 23. Don Macchiatos Cordova
  'don-macchiatos-cordova': {
    name: 'Don Macchiatos Cordova',
    category: 'Cafe',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2kgd78I8cpTbhSrOOc3ZfSq9BO0clYam57_rgDI3UviCc_tuXlsO2VJry&s=10',
    barangay: 'San Miguel',
    description: '[Name confirmed, location approximate] A coffee shop in Cordova. Exact address not independently verified — location shown is approximate.',
    address: 'San Miguel, Cordova, Cebu',
    phone: '0918 596 7413',
    hours: '8:00 AM – 9:00 PM (Daily)',
  },

  // 24. Parola Seaview Restaurant
  'parola-seaview-restaurant': {
    name: 'Parola Seaview Restaurant',
    category: 'Restaurant',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSL7EJmXtZI_6OP_IOn3cdEknylsIq8N-5D7mLaGIpgfPDot9rz1oMJ1vk&s=10',
    barangay: 'Poblacion',
    description: '[Verified] A large open-air restaurant near the Cordova RORO port, built around a decorative lighthouse (parola) with an overwater deck facing Bantayan Bay. Known for Filipino seafood and meat dishes and sunset views.',
    address: 'Roro Port Road, Poblacion, Cordova, Cebu',
    phone: '0947 990 8561',
    hours: '10:00 AM – 10:00 PM (Daily)',
  },

  // 25. 10,000 Roses Cafe & More
  '10000-roses-cafe-and-more': {
    name: '10,000 Roses Cafe & More',
    category: 'Cafe',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRY-gDUjXc0GWAZGac7KeR3AWR2ZyPLpAqZzWVcplRkWXIajolwprvnDykK&s=10',
    barangay: 'Day-as',
    description: '[Verified] A cafe and garden attraction within the Cordova Tourism Center compound, known for its thousands of LED-lit artificial roses that illuminate at dusk. Serves coffee, pizza, pasta, and light Filipino fare alongside the light installation.',
    address: 'Day-as, Cordova, Cebu (adjacent to Day-as Port / Parola)',
    phone: '0956 839 9427',
    hours: '10:00 AM – 10:00 PM (Daily)',
  },

  // 26. Papsys BBQ
  'papsys-bbq': {
    name: 'Papsys BBQ',
    category: 'Fast Food',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9N4HYtH1Bcb1QfplVolrNrR0fV2St3wEqU1dXS4sYa80-tR1w4MiEFAo&s=10',
    barangay: 'Bang-bang',
    description: 'a popular Filipino casual dining restaurant chain known for its signature charcoal-grilled specialties and rustic, modern ambiance',
    address: 'Barangay Bang-bang, Cordova, Cebu',
    phone: '0927 296 4811',
    hours: '9:00 AM – 9:00 PM (Daily)',
  },

  // The Latte Cafe
  'the-latte-cafe-mtvn5h2j': {
    name: 'The Latte Cafe',
    category: 'Cafe',
    coverImage: '/images/the-latte-cafe-logo.jpg',
    barangay: 'Gabi',
    description: 'an aesthetic, pet-friendly neighborhood coffee shop',
    address: 'Gabi, Cordova, Cebu',
    phone: '0910 618 1758',
  },

  // Sip ‘n Street Brew and Refreshments
  'sip-n-street-brew-and-refreshments-mu9qvrtr': {
    name: 'Sip ‘n Street Brew and Refreshments',
    category: 'Cafe',
    coverImage: '/uploads/restaurant-images/1789904428171-0769693d4cfcfd3b.png',
    barangay: 'Catarman Cordova',
    description: 'a local beverage spot in Dakit-dakit, Catarman, Cordova, offering iced and hot coffee, non-coffee drinks, and soda.',
    address: 'Dakit-dakit Catarman Cordova',
    phone: '09659144727',
  },
};

export function normalizeKey(str?: string): string {
  return (str || '').toLowerCase().replace(/[\s\-_]/g, '');
}

export function slugifyKey(key: string): string {
  return key
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function inferCuisines(name: string, description: string = '', barangay: string = ''): string[] {
  const text = `${name} ${description} ${barangay}`.toLowerCase();
  const list: string[] = [];
  if (text.includes('seafood') || text.includes('bakasi') || text.includes('fish') || text.includes('shrimp') || text.includes('shellfish')) {
    list.push('Seafood');
  }
  if (text.includes('cafe') || text.includes('café') || text.includes('coffee') || text.includes('pastry') || text.includes('baker') || text.includes('tea') || text.includes('macchiato') || text.includes('milktea')) {
    list.push('Cafe');
  }
  if (text.includes('grill') || text.includes('bbq') || text.includes('barbecue') || text.includes('lechon') || text.includes('fried') || text.includes('chicken') || text.includes('ribs')) {
    list.push('Grill & BBQ');
  }
  if (text.includes('pizza') || text.includes('pasta') || text.includes('italian')) {
    list.push('Pizza & Pasta');
  }
  if (text.includes('resort') || text.includes('hotel') || text.includes('roses')) {
    list.push('Resort Dining');
  }
  if (text.includes('street food') || text.includes('tambayan') || text.includes('food park') || text.includes('bilao')) {
    list.push('Street Food');
  }
  if (text.includes('fast food') || text.includes('fast-food') || text.includes('fastfood') || text.includes('burger') || text.includes('fries') || text.includes('mcdonald')) {
    list.push('Fast Food');
  }
  if (list.length === 0 || text.includes('pinoy') || text.includes('filipino') || text.includes('cebuano') || text.includes('lutong-bahay') || text.includes('native')) {
    list.push('Filipino');
  }
  return Array.from(new Set(list));
}

function inferPriceRange(name: string, description: string = ''): 'budget' | 'moderate' | 'expensive' | 'premium' {
  const text = `${name} ${description}`.toLowerCase();
  if (text.includes('resort') || text.includes('fine') || text.includes('solea')) return 'premium';
  if (text.includes('resto bar') || text.includes('bucket') || text.includes('parola') || text.includes('seafood grill')) return 'moderate';
  if (text.includes('expensive') || text.includes('luxury')) return 'expensive';
  return 'budget';
}

export function getAllStaticRestaurants(): Restaurant[] {
  const result: Restaurant[] = [];
  let index = 1;

  for (const [key, config] of Object.entries(RESTAURANT_CUSTOMIZATIONS)) {
    if (config.hidden) continue;

    const slug = slugifyKey(key);
    const cuisines = inferCuisines(config.name, config.description, config.barangay);
    const priceRange = inferPriceRange(config.name, config.description);
    const stats = getRestaurantReviewStats(slug);

    result.push({
      id: `static-${slug}`,
      owner_id: 'owner-static',
      name: config.name || key,
      category: config.category,
      slug: slug,
      description: config.description || `Welcome to ${config.name || key} in Cordova, Cebu.`,
      address: config.address || (config.barangay ? `${config.barangay}, Cordova, Cebu` : 'Cordova, Cebu'),
      barangay: config.barangay || 'Cordova',
      latitude: 10.2500 + (index * 0.0012) % 0.02,
      longitude: 123.9480 + (index * 0.0015) % 0.02,
      phone: config.phone || '+63 917 123 4567',
      email: config.email || `${slug}@cordovaeats.local`,
      hours: config.hours,
      price_range: priceRange,
      services_offered: ['dine_in', 'takeout'],
      cover_image_url: config.coverImage || undefined,
      status: 'verified',
      avg_rating: stats.rating,
      review_count: stats.count,
      view_count: 100 + (index * 23) % 300,
      is_active: true,
      cuisines: cuisines,
      dietary_options: [],
      amenities: ['Al Fresco', 'Dine-In'],
      created_at: new Date().toISOString(),
    });
    index++;
  }

  return result;
}

export function getStaticRestaurantBySlug(slug: string): Restaurant | null {
  const all = getAllStaticRestaurants();
  const norm = normalizeKey(slug);
  return all.find((r) => normalizeKey(r.slug) === norm || normalizeKey(r.name) === norm || normalizeKey(r.id) === norm) || null;
}

export function matchesCategory(restaurant: Restaurant, category: string): boolean {
  if (!category) return true;
  const cat = category.toLowerCase().trim();
  if (cat === 'all') return true;

  const restCustom = getRestaurantCustomization(restaurant);
  const restCategory = (restCustom?.category || restaurant.category || '').toLowerCase().trim();

  // Normalize e.g. "fastfood" vs "fast food", "restobar" vs "resto bar"
  const catNorm = normalizeKey(cat);
  const restCatNorm = normalizeKey(restCategory);

  if (catNorm === 'all') return true;
  if (restCatNorm && (restCatNorm === catNorm || restCatNorm.includes(catNorm) || catNorm.includes(restCatNorm))) {
    return true;
  }

  // Also match against cuisines array (e.g. from backend or inferred)
  if (restaurant.cuisines && Array.isArray(restaurant.cuisines)) {
    if (restaurant.cuisines.some((c) => {
      const cNorm = normalizeKey(c);
      return cNorm === catNorm || cNorm.includes(catNorm) || catNorm.includes(cNorm);
    })) {
      return true;
    }
  }

  return false;
}

export function getRestaurantCustomization(restaurant: Restaurant): RestaurantCustomConfig | null {
  if (!restaurant) return null;

  // Direct lookup
  let custom =
    RESTAURANT_CUSTOMIZATIONS[restaurant.slug] ||
    RESTAURANT_CUSTOMIZATIONS[restaurant.id];

  // Fallback: normalized loose match
  if (!custom) {
    const slugNorm = normalizeKey(restaurant.slug);
    const nameNorm = normalizeKey(restaurant.name);
    for (const [key, val] of Object.entries(RESTAURANT_CUSTOMIZATIONS)) {
      const keyNorm = normalizeKey(key);
      const valNameNorm = normalizeKey(val.name);
      if (
        keyNorm === slugNorm ||
        keyNorm === nameNorm ||
        valNameNorm === nameNorm ||
        (slugNorm && keyNorm && (slugNorm.startsWith(keyNorm) || keyNorm.startsWith(slugNorm))) ||
        (nameNorm && valNameNorm && (nameNorm.includes(valNameNorm) || valNameNorm.includes(nameNorm)))
      ) {
        custom = val;
        break;
      }
    }
  }

  return custom || null;
}

export function isRestaurantVisible(restaurant: Restaurant): boolean {
  if (!restaurant) return false;
  const custom = getRestaurantCustomization(restaurant);
  if (!custom) return true;
  if (custom.hidden) return false;
  return true;
}

export function applyRestaurantCustomization(restaurant: Restaurant): Restaurant {
  if (!restaurant) return restaurant;
  const custom = getRestaurantCustomization(restaurant);
  const stats = getRestaurantReviewStats(restaurant.slug || restaurant.id || restaurant.name);

  if (!custom) {
    return {
      ...restaurant,
      review_count: stats.count,
      avg_rating: stats.rating,
    };
  }

  return {
    ...restaurant,
    name: custom.name || restaurant.name,
    category: custom.category || restaurant.category,
    cover_image_url:
      custom.coverImage !== undefined && custom.coverImage !== null && custom.coverImage.trim() !== ''
        ? custom.coverImage
        : restaurant.cover_image_url,
    barangay: custom.barangay || restaurant.barangay,
    description: custom.description || restaurant.description,
    address: custom.address || restaurant.address,
    phone: custom.phone || restaurant.phone,
    email: custom.email || restaurant.email,
    hours: custom.hours || (restaurant as any)?.hours,
    review_count: stats.count,
    avg_rating: stats.rating,
  };
}
