import type { Restaurant, MenuItem } from '@/lib/types';
import { matchesCategory } from '@/data/restaurants';
import { ESTABLISHMENT_REVIEWS } from '@/data/restaurantReviews';

import { PAROLA_MENU_ITEMS } from '@/data/parolaMenu';
import { TAYTAYAN_MENU_ITEMS } from '@/data/taytayanMenu';
import { HORIZON_MENU_ITEMS } from '@/data/horizonMenu';
import { PAPSY_MENU_ITEMS } from '@/data/papsyMenu';
import { MCDONALDS_MENU_ITEMS } from '@/data/mcdonaldsMenu';
import { EAT_N_REPEAT_MENU_ITEMS } from '@/data/eatNRepeatMenu';
import { STUFFED_N_FRIED_MENU_ITEMS } from '@/data/stuffedNFriedMenu';
import { CAFE_MAFIA_MENU_ITEMS } from '@/data/cafeMafiaMenu';
import { DON_MACCHIATOS_MENU_ITEMS } from '@/data/donMacchiatosMenu';
import { ALBERTOS_MENU_ITEMS } from '@/data/albertosMenu';
import { TEN_THOUSAND_ROSES_MENU_ITEMS } from '@/data/tenThousandRosesMenu';
import { ABY_ROAD_MENU_ITEMS } from '@/data/abyRoadMenu';
import { TITA_KIMS_MENU_ITEMS } from '@/data/titaKimsMenu';

/**
 * Curated signature dishes for Cordova establishments without dedicated TS menu files
 */
const ENTOYS_SIGNATURE_ITEMS: MenuItem[] = [
  { id: 'entoy-1', restaurant_id: 'entoys-bakasihan', name: 'Nilarang na Bakasi (Signature Reef Eel Soup)', description: 'World-famous Netflix featured sour-spicy herbal broth with tender reef eel.', price: 120, is_available: true },
  { id: 'entoy-2', restaurant_id: 'entoys-bakasihan', name: 'Tinolang Bakasi (Coastal Ginger Broth)', description: 'Freshly caught reef eel simmered with native ginger, lemongrass, and chili leaves.', price: 130, is_available: true },
  { id: 'entoy-3', restaurant_id: 'entoys-bakasihan', name: 'Crispy Deep-Fried Bakasi', description: 'Crunchy battered baby reef eels seasoned with sea salt and spiced native vinegar.', price: 150, is_available: true },
  { id: 'entoy-4', restaurant_id: 'entoys-bakasihan', name: 'Puso (Cordova Hanging Rice)', description: 'Traditional Cebuano boiled woven diamond coconut leaf rice.', price: 10, is_available: true },
];

const LANTAW_SIGNATURE_ITEMS: MenuItem[] = [
  { id: 'lantaw-1', restaurant_id: 'lantaw-floating-native-restaurant', name: 'Lantaw Floating Seafood Platter', description: 'Generous overwater platter of charcoal-grilled pompano, garlic butter prawns, and calamari.', price: 680, is_available: true },
  { id: 'lantaw-2', restaurant_id: 'lantaw-floating-native-restaurant', name: 'Baked Scallops with Garlic Butter & Cheese', description: 'Local Cordova sea scallops broiled with golden cheddar and roasted garlic.', price: 260, is_available: true },
  { id: 'lantaw-3', restaurant_id: 'lantaw-floating-native-restaurant', name: 'Grilled Tuna Panga (Jaw)', description: 'Succulent tuna jaw basted with sweet native soy marinade over coconut charcoal.', price: 380, is_available: true },
  { id: 'lantaw-4', restaurant_id: 'lantaw-floating-native-restaurant', name: 'Cordova Sunset Refresher Cooler', description: 'Tropical mango and passion fruit blend served chilled with a sunset view.', price: 120, is_available: true },
];

const BURANDAT_SIGNATURE_ITEMS: MenuItem[] = [
  { id: 'burandat-1', restaurant_id: 'burandat-seafood-bucket', name: 'Burandat Ultimate Seafood Bucket', description: 'Shoreline bucket filled with fresh steamed mud crabs, prawns, mussels, and sweet corn in cajun garlic butter.', price: 599, is_available: true },
  { id: 'burandat-2', restaurant_id: 'burandat-seafood-bucket', name: 'Catch-of-the-Day Charcoal Grilled Fish', description: 'Whole fresh catch from Cordova fishermen grilled directly to order.', price: 320, is_available: true },
  { id: 'burandat-3', restaurant_id: 'burandat-seafood-bucket', name: 'Garlic Butter Scallop Skewers', description: 'Tender sea scallops basted with rich garlic butter.', price: 220, is_available: true },
];

const BARRACKS_SIGNATURE_ITEMS: MenuItem[] = [
  { id: 'barracks-1', restaurant_id: 'barracks-grill-and-resto-bar', name: 'Barracks Charcoal Pork BBQ Skewers (5 pcs)', description: 'Signature sweet-savory Cebuano pork skewers flame-grilled over hot coals.', price: 175, is_available: true },
  { id: 'barracks-2', restaurant_id: 'barracks-grill-and-resto-bar', name: 'Sizzling Pork Sisig with Fresh Egg', description: 'Crispy pork bits seasoned with calamansi, native onions, and chili on a smoking hot plate.', price: 220, is_available: true },
  { id: 'barracks-3', restaurant_id: 'barracks-grill-and-resto-bar', name: 'Charcoal Grilled Liempo (Pork Belly)', description: 'Thick cut marinated pork belly with crispy skin and juicy meat.', price: 180, is_available: true },
  { id: 'barracks-4', restaurant_id: 'barracks-grill-and-resto-bar', name: 'Late-Night Ice Cold San Miguel Bucket', description: '6 bottles of chilled beer served until 4:00 AM.', price: 380, is_available: true },
];

const LATTE_CAFE_SIGNATURE_ITEMS: MenuItem[] = [
  { id: 'latte-1', restaurant_id: 'the-latte-cafe-mtvn5h2j', name: 'Artisan Spanish Latte', description: 'Double shot rich espresso with sweetened condensed milk and silky textured whole milk.', price: 135, is_available: true },
  { id: 'latte-2', restaurant_id: 'the-latte-cafe-mtvn5h2j', name: 'Ceremonial Matcha Espresso Fusion', description: 'Layered Japanese Uji matcha and artisan espresso over iced fresh milk.', price: 145, is_available: true },
  { id: 'latte-3', restaurant_id: 'the-latte-cafe-mtvn5h2j', name: 'Cordova Sea Salt Cold Brew', description: '16-hour steeped specialty beans topped with salted cream foam.', price: 130, is_available: true },
];

const CSALT_SIGNATURE_ITEMS: MenuItem[] = [
  { id: 'csalt-1', restaurant_id: 'csalt-cafe-cordova', name: 'Wharf Sea Salt Caramel Latte', description: 'Signature espresso crafted with sea salt infused caramel by the Poblacion wharf.', price: 125, is_available: true },
  { id: 'csalt-2', restaurant_id: 'csalt-cafe-cordova', name: 'Oceanfront Cold Brew', description: 'Smooth, low-acid cold brew enjoyed with panoramic sea breeze.', price: 115, is_available: true },
  { id: 'csalt-3', restaurant_id: 'csalt-cafe-cordova', name: 'Vegetarian Basil Pesto Pasta', description: 'Freshly crushed basil, roasted garlic, and olive oil pasta.', price: 160, is_available: true },
];

const RCA_SIGNATURE_ITEMS: MenuItem[] = [
  { id: 'rca-1', restaurant_id: 'rca-bilao-food-station', name: 'Crispy Boneless Lechon Belly sa Bilao', description: 'Crispy crackling roast pork belly served over traditional woven bilao with native dipping sauce.', price: 450, is_available: true },
  { id: 'rca-2', restaurant_id: 'rca-bilao-food-station', name: 'Pansit Bam-i Special Bilao', description: 'Savory stir-fried noodles with lechon bits, vegetables, and boiled eggs.', price: 320, is_available: true },
  { id: 'rca-3', restaurant_id: 'rca-bilao-food-station', name: 'Kakanin Assortment Fiesta Tray', description: 'Sweet Filipino rice cakes including puto, biko, and sapin-sapin.', price: 280, is_available: true },
];

/**
 * Fast lookup of all static menu items indexed by restaurant slug key
 */
const ALL_MENU_ITEMS: Record<string, MenuItem[]> = {
  'parola-seaview-restaurant': PAROLA_MENU_ITEMS,
  'taytayan-pinoy-restaurant': TAYTAYAN_MENU_ITEMS,
  'horizon-bean-cafe': HORIZON_MENU_ITEMS,
  'papsys-bbq': PAPSY_MENU_ITEMS,
  'mcdonalds-cordova': MCDONALDS_MENU_ITEMS,
  'eat-n-repeat': EAT_N_REPEAT_MENU_ITEMS,
  'stuffed-n-fried-cordova': STUFFED_N_FRIED_MENU_ITEMS,
  'stuffed-n-fried-cordova-branch': STUFFED_N_FRIED_MENU_ITEMS,
  'cafe-mafia': CAFE_MAFIA_MENU_ITEMS,
  'don-macchiatos-cordova': DON_MACCHIATOS_MENU_ITEMS,
  'albertos-pizza-cordova': ALBERTOS_MENU_ITEMS,
  '10000-roses-cafe-and-more': TEN_THOUSAND_ROSES_MENU_ITEMS,
  'aby-road-resto-bar': ABY_ROAD_MENU_ITEMS,
  'tita-kims': TITA_KIMS_MENU_ITEMS,
  'entoys-bakasihan': ENTOYS_SIGNATURE_ITEMS,
  'lantaw-floating-native-restaurant': LANTAW_SIGNATURE_ITEMS,
  'burandat-seafood-bucket': BURANDAT_SIGNATURE_ITEMS,
  'barracks-grill-and-resto-bar': BARRACKS_SIGNATURE_ITEMS,
  'the-latte-cafe-mtvn5h2j': LATTE_CAFE_SIGNATURE_ITEMS,
  'csalt-cafe-cordova': CSALT_SIGNATURE_ITEMS,
  'rca-bilao-food-station': RCA_SIGNATURE_ITEMS,
};

/**
 * Best-of-the-Best Landmark Authority Rankings
 * Connects high-intent queries with verified Cordova local authority champions
 */
interface AuthorityChampion {
  slug: string;
  boost: number;
  reason: string;
}

const BEST_OF_THE_BEST_MAP: Record<string, AuthorityChampion[]> = {
  bakasi: [
    { slug: 'entoys-bakasihan', boost: 95, reason: '👑 #1 Netflix Famous Reef Eel (Nilarang na Bakasi) Landmark' },
    { slug: 'taytayan-pinoy-restaurant', boost: 55, reason: '✨ Authentic Native Linarang na Bakasi' },
    { slug: 'parola-seaview-restaurant', boost: 40, reason: '✨ Waterfront Nilarang na Bakasi Specialty' },
  ],
  seafood: [
    { slug: 'parola-seaview-restaurant', boost: 105, reason: '👑 #1 Overwater Seaside Destination & Fresh Catch' },
    { slug: 'burandat-seafood-bucket', boost: 80, reason: '✨ Shoreline Fresh Catch Seafood Buckets' },
    { slug: 'lantaw-floating-native-restaurant', boost: 75, reason: '✨ Iconic Floating Native Seafood Restaurant' },
    { slug: 'entoys-bakasihan', boost: 50, reason: '✨ Fresh Coastal Catch & Reef Seafood' },
    { slug: 'taytayan-pinoy-restaurant', boost: 40, reason: '✨ Native Kinilaw, Sinugba & Seafood Broth' },
    { slug: 'tita-kims', boost: 20, reason: '✨ Eat-All-You-Can Seafood & Filipino Buffet' },
  ],
  sunset: [
    { slug: 'parola-seaview-restaurant', boost: 95, reason: '👑 #1 Cordova Parola Lighthouse & Overwater Sunset Deck' },
    { slug: 'lantaw-floating-native-restaurant', boost: 85, reason: '✨ Famous Floating Native Sunset Over Water' },
    { slug: '10000-roses-cafe-and-more', boost: 75, reason: '✨ Sunset & 10,000 Glowing Roses at Dusk' },
    { slug: 'csalt-cafe-cordova', boost: 40, reason: '✨ Scenic Wharf & Ocean Sunset View' },
  ],
  parola: [
    { slug: 'parola-seaview-restaurant', boost: 98, reason: '👑 Built Directly at Cordova Parola Lighthouse' },
    { slug: '10000-roses-cafe-and-more', boost: 50, reason: '✨ Adjacent to Parola & Day-as Port' },
    { slug: 'lantaw-floating-native-restaurant', boost: 40, reason: '✨ Near Day-as Port & Lighthouse Channel' },
  ],
  bbq: [
    { slug: 'papsys-bbq', boost: 95, reason: '👑 #1 Cordova Charcoal-Grilled BBQ Skewers' },
    { slug: 'barracks-grill-and-resto-bar', boost: 80, reason: '✨ Sizzling BBQ Platters & Late-Night Grill' },
    { slug: 'aby-road-resto-bar', boost: 60, reason: '✨ Beatles Sizzling Sisig & Grilled Pork Belly' },
    { slug: 'stuffed-n-fried-cordova', boost: 35, reason: '✨ 15-Spice Batter Chicken & Crispy Pork Kawali' },
  ],
  coffee: [
    { slug: 'horizon-bean-cafe', boost: 95, reason: '👑 #1 Artisan Specialty Coffee & Late-Night Vibe' },
    { slug: 'the-latte-cafe-mtvn5h2j', boost: 94, reason: '✨ Aesthetic Artisan Espresso & Spanish Lattes' },
    { slug: 'cafe-mafia', boost: 75, reason: '✨ Handcrafted Mafia Artisan Espresso & Cold Drinks' },
    { slug: 'eat-n-repeat', boost: 45, reason: '✨ Aesthetic Cafe, Lattes & Cordova Cold Brew' },
    { slug: 'mavericks-by-the-baker-street', boost: 35, reason: '✨ Creative Specialty Coffee Catch-Up' },
    { slug: 'don-macchiatos-cordova', boost: 30, reason: '✨ Famous ₱39 Iced Caramel Macchiato' },
    { slug: 'cascaja-cafe', boost: 28, reason: '✨ Cozy Neighborhood Coffee & Pastries' },
    { slug: '10000-roses-cafe-and-more', boost: 25, reason: '✨ Oceanview Espresso & Cafe Drinks' },
  ],
  romantic: [
    { slug: '10000-roses-cafe-and-more', boost: 98, reason: '👑 #1 Romantic Date Landmark with 10,000 Illuminated Roses' },
    { slug: 'parola-seaview-restaurant', boost: 75, reason: '✨ Candlelit Seaside Lighthouse Dinner Over Water' },
    { slug: 'lantaw-floating-native-restaurant', boost: 70, reason: '✨ Romantic Floating Waterfront Dining' },
    { slug: 'eat-n-repeat', boost: 35, reason: '✨ Aesthetic Cozy Date Spot' },
  ],
  late: [
    { slug: 'barracks-grill-and-resto-bar', boost: 95, reason: '👑 Open Until 4:00 AM Daily for Late-Night Food & Drinks' },
    { slug: 'aby-road-resto-bar', boost: 82, reason: '✨ Open Until 3:30 AM (Fri-Sat) & 2:00 AM (Sun-Thu)' },
    { slug: 'mcdonalds-cordova', boost: 70, reason: '✨ Open 24 Hours Daily' },
    { slug: 'horizon-bean-cafe', boost: 50, reason: '✨ Open Until 12:00 AM Midnight Daily' },
    { slug: 'eat-n-repeat', boost: 35, reason: '✨ Open 24 Hours on Saturdays' },
  ],
  budget: [
    { slug: 'papsys-bbq', boost: 60, reason: '👑 Budget-Friendly Charcoal Skewers & Inasal' },
    { slug: 'don-macchiatos-cordova', boost: 50, reason: '✨ Famous ₱39 Budget Coffee' },
    { slug: 'albertos-pizza-cordova', boost: 45, reason: '✨ Affordable Freshly Baked Local Pizza' },
    { slug: 'entoys-bakasihan', boost: 40, reason: '✨ Budget Carinderia-Style Fresh Seafood' },
    { slug: 'mcdonalds-cordova', boost: 35, reason: '✨ Budget Value Meals & Combos' },
    { slug: 'cascaja-cafe', boost: 30, reason: '✨ Budget-Friendly Coffee & Rice Meals' },
  ],
  lechon: [
    { slug: 'rca-bilao-food-station', boost: 80, reason: '👑 #1 Boneless Lechon Belly sa Bilao' },
    { slug: 'stuffed-n-fried-cordova', boost: 55, reason: '✨ Crispy Golden Lechon Kawali' },
    { slug: 'aby-road-resto-bar', boost: 40, reason: '✨ Sizzling Lechon Kawali & Sisig' },
  ],
  pizza: [
    { slug: 'albertos-pizza-cordova', boost: 80, reason: '👑 #1 Favorite Local Pizzeria in Cordova' },
    { slug: '10000-roses-cafe-and-more', boost: 50, reason: '✨ Artisanal Pizza by the Sea' },
    { slug: 'cascaja-cafe', boost: 35, reason: '✨ Baked Pasta & Pizza Snacks' },
  ],
  buffet: [
    { slug: 'tita-kims', boost: 85, reason: '👑 #1 Eat-All-You-Can Filipino Buffet (₱299)' },
  ],
  inasal: [
    { slug: 'papsys-bbq', boost: 90, reason: '👑 #1 Flame-Grilled Chicken Inasal' },
    { slug: 'eat-n-repeat', boost: 60, reason: '✨ Signature Chicken Inasal Rice Bowl' },
  ],
  burger: [
    { slug: 'cafe-mafia', boost: 90, reason: '👑 Handcrafted Mafia Premium Burgers' },
    { slug: 'mcdonalds-cordova', boost: 65, reason: '✨ Iconic Burger McDo & Big Mac' },
  ],
  sisig: [
    { slug: 'barracks-grill-and-resto-bar', boost: 90, reason: '👑 Sizzling Pork Sisig with Fresh Egg' },
    { slug: 'aby-road-resto-bar', boost: 85, reason: '✨ Authentic Pork Sisig Platters' },
  ],
};

/**
 * Common stopwords and query modifiers to ignore during query tokenization
 */
const STOP_WORDS = new Set([
  'and', '&', 'the', 'in', 'of', 'for', 'a', 'an', 'at', 'to', 'near', 'with', 'on', 'or', 'is', 'by',
  'best', 'top', 'good', 'great', 'famous', 'popular', 'friendly', 'place', 'places', 'spot', 'spots'
]);

/**
 * Semantic synonym mappings for Cordova culinary & geographical concepts
 */
const SEMANTIC_CONCEPTS: Record<string, string[]> = {
  // Bakasi / Eel
  bakasi: ['bakasi', 'eel', 'reef eel', 'nilarang', 'linarang', 'buagsong'],
  eel: ['bakasi', 'eel', 'reef eel', 'nilarang', 'linarang'],
  nilarang: ['bakasi', 'eel', 'nilarang', 'linarang'],

  // Seafood
  seafood: ['seafood', 'fish', 'shrimp', 'squid', 'scallops', 'crab', 'pompano', 'bangus', 'calamares', 'bucket'],
  fish: ['fish', 'bangus', 'pompano', 'tanguige', 'seafood', 'sinugba', 'tinola'],
  shrimp: ['shrimp', 'hipon', 'prawn', 'gambas', 'seafood'],
  squid: ['squid', 'calamares', 'seafood'],
  scallops: ['scallops', 'baked scallops', 'seafood', 'shellfish'],

  // Sunset & Parola View
  sunset: ['sunset', 'parola', 'view', 'views', 'seaview', 'ocean view', 'waterfront', 'overwater', 'deck', 'skyline'],
  parola: ['parola', 'lighthouse', 'sunset', 'seaview', 'overwater', 'deck'],
  view: ['view', 'views', 'sunset', 'seaview', 'ocean view', 'waterfront'],
  seaview: ['seaview', 'ocean view', 'waterfront', 'sunset', 'parola'],

  // BBQ & Grill
  bbq: ['bbq', 'barbecue', 'grill', 'grilled', 'charcoal', 'inasal', 'liempo', 'skewers', 'belly'],
  grill: ['grill', 'grilled', 'bbq', 'barbecue', 'charcoal', 'sinugba'],
  barbecue: ['barbecue', 'bbq', 'grill', 'charcoal', 'inasal'],
  inasal: ['inasal', 'chicken inasal', 'bbq', 'barbecue', 'grill', 'grilled', 'chicken', 'paa', 'pecho'],
  sisig: ['sisig', 'pork sisig', 'sizzling', 'pulutan', 'liempo'],

  // Coffee & Cafe
  coffee: ['coffee', 'cafe', 'espresso', 'latte', 'macchiato', 'cappuccino', 'matcha', 'brew', 'beans', 'americano'],
  cafe: ['cafe', 'coffee', 'latte', 'pastry', 'tambayan', 'espresso'],
  artisan: ['artisan', 'specialty', 'handcrafted', 'coffee', 'espresso'],
  latte: ['latte', 'coffee', 'espresso', 'cafe'],

  // Romantic & Date Night
  romantic: ['romantic', 'date', 'date night', 'roses', 'cozy', 'aesthetic', 'candlelight', 'sunset'],
  date: ['date', 'romantic', 'date night', 'aesthetic', 'roses'],
  dinner: ['dinner', 'dining', 'date', 'evening', 'meal'],

  // Budget & Value
  budget: ['budget', 'budget-friendly', 'affordable', 'cheap', 'sulit'],
  affordable: ['affordable', 'budget', 'sulit', 'cheap'],
  sulit: ['sulit', 'budget', 'affordable'],

  // Late Night
  night: ['night', 'late night', 'late-night', 'midnight', 'nightspot', 'chill'],
  late: ['late', 'late night', 'late-night', 'nightspot'],

  // Filipino / Lechon / Buffet / Burgers / Pizza
  lechon: ['lechon', 'kawali', 'belly', 'crispy'],
  buffet: ['buffet', 'eat all you can', 'eat-all-you-can', 'unli'],
  pizza: ['pizza', 'pasta', 'italian'],
  burger: ['burger', 'burgers', 'cheeseburger', 'patty', 'sandwich'],
};

/**
 * Prioritized culinary and ambiance intents
 */
const CULINARY_INTENTS = [
  'bakasi',
  'seafood',
  'bbq',
  'inasal',
  'sisig',
  'burger',
  'coffee',
  'romantic',
  'sunset',
  'parola',
  'late',
  'lechon',
  'pizza',
  'buffet',
  'budget',
];

/**
 * Filter words to ensure menu item relevance strictly matches the search intent
 */
const INTENT_DISH_FILTERS: Record<string, string[]> = {
  coffee: ['coffee', 'latte', 'espresso', 'macchiato', 'cappuccino', 'cold brew', 'matcha', 'frappe', 'brew', 'tea', 'americano'],
  bbq: ['bbq', 'barbecue', 'grill', 'inasal', 'liempo', 'skewers', 'pork', 'sisig', 'chicken', 'belly', 'charcoal'],
  inasal: ['inasal', 'chicken', 'paa', 'pecho', 'bbq', 'grill'],
  sisig: ['sisig', 'sizzling', 'pork'],
  burger: ['burger', 'cheeseburger', 'patty', 'fries'],
  bakasi: ['bakasi', 'eel', 'nilarang', 'linarang', 'puso'],
  seafood: ['seafood', 'fish', 'shrimp', 'squid', 'calamares', 'scallops', 'crab', 'pompano', 'bangus', 'bucket', 'lobster', 'tinola', 'kinilaw'],
  pizza: ['pizza', 'pasta', 'lasagna', 'spaghetti'],
  lechon: ['lechon', 'kawali', 'belly', 'bilao'],
  buffet: ['buffet', 'seafood', 'mix', 'shrimp', 'grill'],
  sunset: ['sunset', 'seafood', 'scallops', 'cooler', 'platter', 'pompano', 'calamares', 'squid', 'pata', 'sisig', 'pasta'],
  romantic: ['pasta', 'pizza', 'wine', 'platter', 'dessert', 'rose', 'sunset', 'scallops', 'bilao', 'steak', 'cake'],
  late: ['beer', 'sisig', 'pork', 'bbq', 'coffee', 'burger', 'wings', 'snack', 'chicken', 'fries', 'float', 'liempo', 'skewers'],
  budget: ['bbq', 'rice', 'inasal', 'coffee', 'macchiato', 'pizza', 'burger', 'fries', 'combo', 'bilao', 'bakasi', 'skewers'],
};

function tokenize(text?: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

function expandQueryTokens(query: string): { tokens: string[]; conceptTokens: Set<string>; primaryIntentKey: string | null } {
  const baseTokens = tokenize(query);
  const conceptTokens = new Set<string>();

  for (const token of baseTokens) {
    conceptTokens.add(token);

    if (SEMANTIC_CONCEPTS[token]) {
      for (const synonym of SEMANTIC_CONCEPTS[token]) {
        conceptTokens.add(synonym);
      }
    }

    for (const [key, synonyms] of Object.entries(SEMANTIC_CONCEPTS)) {
      if (token.includes(key) || key.includes(token)) {
        for (const s of synonyms) conceptTokens.add(s);
      }
    }
  }

  // Identify prioritized culinary / experience intent: check exact base tokens first
  let primaryIntentKey: string | null = null;
  for (const intent of CULINARY_INTENTS) {
    if (baseTokens.includes(intent)) {
      primaryIntentKey = intent;
      break;
    }
  }
  if (!primaryIntentKey) {
    for (const intent of CULINARY_INTENTS) {
      if (conceptTokens.has(intent)) {
        primaryIntentKey = intent;
        break;
      }
    }
  }

  return { tokens: baseTokens, conceptTokens, primaryIntentKey };
}

/**
 * Checks if a specific dish matches the intended query concept
 */
function isDishRelevantToIntent(dishName: string, dishDesc: string, intentKey: string | null, tokens: string[]): boolean {
  const text = `${dishName} ${dishDesc}`.toLowerCase();
  if (intentKey && INTENT_DISH_FILTERS[intentKey]) {
    const requiredKeywords = INTENT_DISH_FILTERS[intentKey];
    return requiredKeywords.some((kw) => text.includes(kw));
  }
  return tokens.some((t) => text.includes(t));
}

/**
 * Fine-grained dish scoring to prioritize dishes that directly match the user query
 */
function scoreMenuItem(
  item: MenuItem,
  primaryIntentKey: string | null,
  baseTokens: string[],
  conceptTokens: Set<string>
): number {
  const nameLower = (item.name || '').toLowerCase();
  const descLower = (item.description || '').toLowerCase();

  let dishScore = 0;

  // 1. Primary culinary intent matching
  if (primaryIntentKey === 'coffee') {
    const coffeeWords = ['coffee', 'latte', 'espresso', 'macchiato', 'cappuccino', 'cold brew', 'americano', 'matcha', 'brew'];
    if (coffeeWords.some((w) => nameLower.includes(w))) {
      dishScore += 65;
    }
  } else if (primaryIntentKey === 'seafood') {
    const seafoodWords = ['seafood', 'fish', 'shrimp', 'squid', 'calamares', 'scallops', 'crab', 'pompano', 'bangus', 'bucket', 'lobster', 'tinola', 'kinilaw'];
    if (seafoodWords.some((w) => nameLower.includes(w))) {
      dishScore += 65;
    }
  } else if (primaryIntentKey === 'bbq') {
    const bbqWords = ['bbq', 'barbecue', 'skewers', 'inasal', 'liempo', 'sisig', 'pork belly', 'charcoal'];
    if (bbqWords.some((w) => nameLower.includes(w))) {
      dishScore += 65;
    }
  } else if (primaryIntentKey === 'bakasi') {
    if (nameLower.includes('bakasi') || nameLower.includes('linarang') || nameLower.includes('nilarang')) {
      dishScore += 75;
    }
  } else if (primaryIntentKey === 'romantic') {
    const romanticWords = ['pasta', 'pizza', 'wine', 'platter', 'dessert', 'rose', 'scallops', 'bilao', 'steak'];
    if (romanticWords.some((w) => nameLower.includes(w))) {
      dishScore += 65;
    }
  } else if (primaryIntentKey && nameLower.includes(primaryIntentKey)) {
    dishScore += 60;
  }

  // 2. Bonus for flagship signature dishes (platters, bilao, buckets, sets)
  const flagshipWords = ['bilao', 'platter', 'bucket', 'signature', 'special', 'fiesta', 'boodle', 'set'];
  if (flagshipWords.some((w) => nameLower.includes(w))) {
    dishScore += 20;
  }

  // 3. Direct match with base query tokens in dish name
  for (const token of baseTokens) {
    if (nameLower.includes(token)) {
      dishScore += 35;
    }
  }

  // 4. Match with primary intent or base tokens in dish description
  if (primaryIntentKey && descLower.includes(primaryIntentKey)) {
    dishScore += 20;
  }
  for (const token of baseTokens) {
    if (descLower.includes(token)) {
      dishScore += 15;
    }
  }

  // 5. Match with concept synonyms in dish name or description
  for (const cToken of conceptTokens) {
    if (nameLower.includes(cToken)) {
      dishScore += 12;
    } else if (descLower.includes(cToken)) {
      dishScore += 6;
    }
  }

  // 6. Penalty for plain drinks/alcohol if query is NOT looking for drinks, bar, or late-night
  const isAlcoholOrBeer = nameLower.includes('beer') || nameLower.includes('pilsen') || nameLower.includes('san miguel');
  if (isAlcoholOrBeer && !conceptTokens.has('night') && !conceptTokens.has('late') && !conceptTokens.has('beer')) {
    dishScore -= 50;
  }

  return dishScore;
}

/**
 * Score a single restaurant against user intent and select best menu matches
 */
function scoreRestaurant(
  restaurant: Restaurant,
  query: string,
  baseTokens: string[],
  conceptTokens: Set<string>,
  primaryIntentKey: string | null
): { rawScore: number; authorityBoost: number; matchedItems: MenuItem[]; reason: string } {
  const qLower = query.toLowerCase().trim();
  const nameLower = (restaurant.name || '').toLowerCase();
  const descLower = (restaurant.description || '').toLowerCase();
  const cuisinesLower = (restaurant.cuisines || []).map((c) => c.toLowerCase());
  const categoryLower = (restaurant.category || '').toLowerCase();
  const slugLower = (restaurant.slug || '').toLowerCase();
  const hoursLower = (restaurant.hours || '').toLowerCase();

  let score = 0;
  let primaryReason = '';

  // --- 1. Check Authority "Best of the Best" Registry ---
  let authorityBoost = 0;
  for (const [intentToken, champions] of Object.entries(BEST_OF_THE_BEST_MAP)) {
    if (baseTokens.includes(intentToken) || conceptTokens.has(intentToken)) {
      const match = champions.find((c) => c.slug === slugLower || slugLower.includes(c.slug) || c.slug.includes(slugLower));
      if (match) {
        if (match.boost > authorityBoost) {
          authorityBoost = match.boost;
          primaryReason = match.reason;
        }
      }
    }
  }

  // --- 2. Direct Name Match ---
  if (nameLower.includes(qLower)) {
    score += 55;
    if (!primaryReason) primaryReason = `Verified establishment name matches "${query}"`;
  } else {
    const nameMatches = baseTokens.filter((t) => nameLower.includes(t));
    if (nameMatches.length > 0) {
      score += (nameMatches.length / baseTokens.length) * 45;
      if (!primaryReason) primaryReason = `Name matches ${nameMatches.join(', ')}`;
    }
  }

  // --- 3. Cuisine & Category Relevance ---
  if (cuisinesLower.some((c) => c.includes(qLower) || qLower.includes(c))) {
    score += 30;
  } else if (categoryLower.includes(qLower) || qLower.includes(categoryLower)) {
    score += 25;
  } else {
    for (const t of baseTokens) {
      if (cuisinesLower.some((c) => c.includes(t))) {
        score += 20;
        break;
      }
    }
  }

  // --- 4. Description & Concept Matching ---
  let descHits = 0;
  for (const cToken of conceptTokens) {
    if (descLower.includes(cToken)) {
      descHits++;
    }
  }
  if (descHits > 0) {
    score += Math.min(25, descHits * 8);
  }

  // --- 5. Operating Hours Match for Late-Night Queries ---
  if (conceptTokens.has('night') || conceptTokens.has('late') || baseTokens.some((t) => t.includes('night') || t.includes('late'))) {
    if (hoursLower.includes('4:00 am')) {
      score += 50;
      if (!primaryReason) primaryReason = 'Open until 4:00 AM daily';
    } else if (hoursLower.includes('3:30 am') || hoursLower.includes('2:00 am')) {
      score += 42;
      if (!primaryReason) primaryReason = 'Open until 3:30 AM on weekends';
    } else if (hoursLower.includes('24 hours') || hoursLower.includes('24h')) {
      score += 38;
      if (!primaryReason) primaryReason = 'Open 24 hours daily';
    } else if (hoursLower.includes('12:00 am') || hoursLower.includes('12:30 am')) {
      score += 25;
      if (!primaryReason) primaryReason = 'Open until 12:00 AM midnight';
    } else if (hoursLower.includes('6:00 pm') || hoursLower.includes('4:00 pm')) {
      score -= 60;
    }
  }

  // --- 6. Special Handling for Romantic / Date Queries ---
  if (conceptTokens.has('romantic') || baseTokens.includes('romantic') || baseTokens.includes('date')) {
    if (slugLower.includes('10000-roses')) {
      score += 45;
      primaryReason = '👑 #1 Romantic Date Landmark with 10,000 Illuminated Roses';
    } else if (slugLower.includes('parola-seaview')) {
      score += 20;
      if (!primaryReason) primaryReason = '✨ Romantic Seaside Lighthouse Sunset Dinner';
    } else if (slugLower.includes('lantaw-floating')) {
      score += 18;
      if (!primaryReason) primaryReason = '✨ Romantic Floating Native Dining by the Water';
    }
  }

  // --- 7. Curated Menu Matching (with strict intent filtering and relevance sorting) ---
  const menuItems = ALL_MENU_ITEMS[slugLower] || ALL_MENU_ITEMS[restaurant.id] || [];
  const candidateItems: { item: MenuItem; dishScore: number }[] = [];

  for (const item of menuItems) {
    const isRelevant = isDishRelevantToIntent(item.name, item.description || '', primaryIntentKey, baseTokens);
    if (isRelevant) {
      const dScore = scoreMenuItem(item, primaryIntentKey, baseTokens, conceptTokens);
      candidateItems.push({ item, dishScore: dScore });
    }
  }

  // Sort candidate items descending by dishScore so the most relevant dishes appear first
  candidateItems.sort((a, b) => b.dishScore - a.dishScore);
  const matchedItems = candidateItems.slice(0, 3).map((c) => c.item);

  if (matchedItems.length > 0) {
    score += Math.min(30, matchedItems.length * 12);
    if (!primaryReason) {
      primaryReason = `Features ${matchedItems.map((i) => i.name).slice(0, 2).join(', ')}`;
    }
  }

  // --- 8. Verified Customer Reviews Match ---
  const reviews = ESTABLISHMENT_REVIEWS[slugLower] || ESTABLISHMENT_REVIEWS[restaurant.id] || [];
  for (const rev of reviews) {
    const comment = (rev.comment || '').toLowerCase();
    if (!comment) continue;
    if (baseTokens.some((t) => comment.includes(t))) {
      score += 10;
      break;
    }
  }

  // --- 9. Star Rating Bonus ---
  const rating = Number(restaurant.avg_rating || 4.5);
  score += Math.min(8, (rating / 5.0) * 8);

  // Combine baseline score + Authority Champion boost into fine-grained raw score
  const rawScore = score + authorityBoost;

  return {
    rawScore,
    authorityBoost,
    matchedItems,
    reason: primaryReason || 'Recommended Cordova establishment',
  };
}

/**
 * Intelligent AI Search & Ranking Engine for Cordova Restaurants
 * Prioritizes the "Best of the Best" tailored to user search intent.
 */
export function aiSearchRestaurants(
  restaurants: Restaurant[],
  query: string,
  category?: string | null
): Restaurant[] {
  const trimmed = (query || '').trim();

  // If no query, filter by category if present
  if (!trimmed) {
    if (!category) return restaurants;
    return restaurants.filter((r) => matchesCategory(r, category));
  }

  const { tokens, conceptTokens, primaryIntentKey } = expandQueryTokens(trimmed);
  if (tokens.length === 0) {
    return restaurants;
  }

  const scoredResults: {
    restaurant: Restaurant;
    rawScore: number;
    authorityBoost: number;
    matchedItems: MenuItem[];
    reason: string;
  }[] = [];

  for (const r of restaurants) {
    if (category && !matchesCategory(r, category)) {
      continue;
    }

    const { rawScore, authorityBoost, matchedItems, reason } = scoreRestaurant(
      r,
      trimmed,
      tokens,
      conceptTokens,
      primaryIntentKey
    );

    // Only include establishments with solid relevance (minimum threshold 30)
    if (rawScore >= 30) {
      scoredResults.push({
        restaurant: { ...r },
        rawScore,
        authorityBoost,
        matchedItems,
        reason,
      });
    }
  }

  // Sort descending by raw score with fine-grained tie-breakers
  scoredResults.sort((a, b) => {
    if (Math.abs(b.rawScore - a.rawScore) > 0.001) {
      return b.rawScore - a.rawScore;
    }
    if (b.authorityBoost !== a.authorityBoost) {
      return b.authorityBoost - a.authorityBoost;
    }
    const ratingB = Number(b.restaurant.avg_rating || 0);
    const ratingA = Number(a.restaurant.avg_rating || 0);
    if (ratingB !== ratingA) {
      return ratingB - ratingA;
    }
    return (b.restaurant.review_count || 0) - (a.restaurant.review_count || 0);
  });

  if (scoredResults.length === 0) {
    return [];
  }

  // Assign clean, monotonic descending display percentage scores
  let prevAssignedPct = 99;

  for (let i = 0; i < scoredResults.length; i++) {
    const item = scoredResults[i];
    let targetPct: number;

    if (i === 0) {
      targetPct = item.rawScore >= 50 ? 99 : Math.max(35, Math.round(item.rawScore));
    } else {
      if (item.rawScore >= 120) {
        targetPct = Math.round(92 + ((item.rawScore - 120) / 40) * 6);
      } else if (item.rawScore >= 90) {
        targetPct = Math.round(84 + ((item.rawScore - 90) / 30) * 7);
      } else if (item.rawScore >= 60) {
        targetPct = Math.round(72 + ((item.rawScore - 60) / 30) * 11);
      } else if (item.rawScore >= 40) {
        targetPct = Math.round(55 + ((item.rawScore - 40) / 20) * 16);
      } else {
        targetPct = Math.round(38 + ((item.rawScore - 30) / 10) * 16);
      }
      targetPct = Math.min(98, Math.max(30, targetPct));

      if (targetPct >= prevAssignedPct) {
        targetPct = Math.max(30, prevAssignedPct - 1);
      }
    }

    prevAssignedPct = targetPct;
    item.restaurant.relevance_score = Number((targetPct / 100).toFixed(2));
    if (item.matchedItems.length > 0) {
      item.restaurant.matched_menu_items = item.matchedItems;
    }
  }

  return scoredResults.map((item) => item.restaurant);
}

/**
 * Robust standard search that supports multi-word queries without requiring exact verbatim substrings
 */
export function standardSearchRestaurants(
  restaurants: Restaurant[],
  query: string,
  category?: string | null
): Restaurant[] {
  const trimmed = (query || '').trim();

  let list = restaurants;
  if (category) {
    list = list.filter((r) => matchesCategory(r, category));
  }

  if (!trimmed) {
    return list;
  }

  const tokens = tokenize(trimmed);
  if (tokens.length === 0) return list;

  return list.filter((r) => {
    const combined = `${r.name} ${r.description || ''} ${r.barangay || ''} ${(r.cuisines || []).join(' ')} ${r.category || ''}`.toLowerCase();
    return tokens.some((token) => combined.includes(token));
  });
}
