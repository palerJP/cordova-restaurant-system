import type { Restaurant } from '@/lib/types';
import { getRestaurantReviewStats } from './restaurantReviews';

/**
 * ============================================================================
 * 🍽️ RESTAURANT FRONTEND DIRECTORY & CUSTOMIZATIONS
 * ============================================================================
 * All 27 verified Cordova restaurants, organized and numbered with verified
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
    description: 'A cozy neighborhood cafe in Cordova known for its premium coffee brews, refreshers, pastries, and late-night chill vibe.',
    address: 'Unit 3, JMP Building, Purok 1 San Miguel Road, San Miguel, Cordova, Cebu',
    phone: '0975 174 5866',
    hours: '10:00 AM – 12:00 AM (Daily)',
  },

  // 2. Grillhouse Cordova BBQ (Papsy's BBQ)
  'grillhouse-cordova-bbq': {
    name: 'Grillhouse Cordova BBQ (Papsy\'s BBQ)',
    category: 'Fast Food',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9N4HYtH1Bcb1QfplVolrNrR0fV2St3wEqU1dXS4sYa80-tR1w4MiEFAo&s=10',
    barangay: 'Bangbang',
    description: 'A popular Filipino casual dining restaurant known for its charcoal-grilled specialties, chicken inasal, unli-rice, and family bundles.',
    address: 'Gaisano Grand Mall Cordova, San Miguel Road, Bangbang, Cordova, Cebu',
    phone: '0927 296 4811',
    hours: '9:00 AM – 9:00 PM (Daily)',
  },
  'papsys-bbq': {
    name: 'Grillhouse Cordova BBQ (Papsy\'s BBQ)',
    category: 'Fast Food',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9N4HYtH1Bcb1QfplVolrNrR0fV2St3wEqU1dXS4sYa80-tR1w4MiEFAo&s=10',
    barangay: 'Bangbang',
    description: 'A popular Filipino casual dining restaurant known for its charcoal-grilled specialties, chicken inasal, unli-rice, and family bundles.',
    address: 'Gaisano Grand Mall Cordova, San Miguel Road, Bangbang, Cordova, Cebu',
    phone: '0927 296 4811',
    hours: '9:00 AM – 9:00 PM (Daily)',
  },

  // 3. Street Food Park @ Cordova Roro Port
  'street-food-park': {
    name: 'Street Food Park @ Cordova Roro Port',
    category: 'Street Food',
    coverImage: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80',
    barangay: 'Poblacion',
    description: 'A vibrant open-air seaside food plaza at the Cordova RORO Port baywalk serving fresh seafood, local barbecue, kwek-kwek, and street treats.',
    address: 'Poblacion Roro Port Road, Poblacion, Cordova, Cebu',
    phone: '0917 000 0000',
    hours: '4:00 PM – 11:30 PM (Daily)',
  },

  // 4. ABY ROAD Resto Bar
  'aby-road-resto-bar': {
    name: 'ABY ROAD Resto Bar',
    category: 'Resto Bar',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5Kp2YeaylbA53UcCROxnangSIQ2YUsJqB4hx0nIhYoPxKqG-rz4-Z0uo&s=10',
    barangay: 'Bangbang',
    description: 'Beatles-inspired restobar famous for its "Sarap na, sulit pa!" big discount bestsellers: sizzling pork sisig, buffalo chicken, crispy fried chicken, pork sinigang, pancit canton, and lechon kawali.',
    address: 'Bang-Bang - Day-As Road, Bangbang, Cordova, Cebu',
    phone: '(032) 238 5718',
    hours: '10:00 AM – 2:00 AM (Sun–Thu), 10:00 AM – 3:30 AM (Fri–Sat)',
  },

  // 5. Eat n' Repeat Cordova
  'eat-n-repeat': {
    name: 'Eat n\' Repeat Cordova',
    category: 'Cafe',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfQN23Tk3arzxnvZgYwgrZTOYhPgijf_4p5q3K621FO-181pCjRTDDMTE&s=10',
    barangay: 'Bangbang',
    description: 'Aesthetic and Instagram-worthy cafe and tambayan offering specialty coffee, milk tea, silog meals, waffles, and late-night snacks.',
    address: 'Cordova Crossroad, Behind Gaisano Grand Mall, Bangbang, Cordova, Cebu',
    phone: '0915 151 6595',
    hours: '9:00 AM – 12:00 AM (Daily)',
  },

  // 6. Taytayan Pinoy Restaurant
  'taytayan-pinoy-restaurant': {
    name: 'Taytayan Pinoy Restaurant',
    category: 'Restaurant',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAYNgM2l1VWAjy1lHThQ1WNwLiI44JDAfo8aQqPS-wKw&s',
    barangay: 'Pilipog',
    description: 'Scenic open-air waterfront native restaurant near the CCLEX bridge serving traditional Cebuano lutong-bahay, sinugba, and fresh seafood.',
    address: 'Mahogani Street, Pilipog, Cordova, Cebu',
    phone: '(032) 412 3783',
    hours: '10:00 AM – 2:00 PM & 5:00 PM – 10:00 PM (Mon–Fri), 10:00 AM – 3:00 PM & 5:00 PM – 10:00 PM (Sat–Sun)',
  },

  // 7. STUFFED N' FRIED Cordova Branch 
  'stuffed-n-fried-cordova': {
    name: 'STUFFED N\' FRIED Cordova Branch',
    category: 'Restaurant',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSub4cBCkl0sLPiZn-BhNhb7c4hdfE3MRFGRLD74LABAA&s=10',
    barangay: 'Gabi',
    description: 'Popular local chicken specialty house in Cebu known for its signature double-fried 15-spice whole chicken, crispy lechon kawali, and ngohiong.',
    address: 'Mahayahay Street / 1911 M.L. Quezon National Highway, Gabi, Cordova, Cebu',
    phone: '0975 985 6145',
    hours: '10:30 AM – 9:00 PM (Daily)',
  },
  'stuffed-n-fried-cordova-branch': {
    name: 'STUFFED N\' FRIED Cordova Branch',
    category: 'Restaurant',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSub4cBCkl0sLPiZn-BhNhb7c4hdfE3MRFGRLD74LABAA&s=10',
    barangay: 'Gabi',
    description: 'Popular local chicken specialty house in Cebu known for its signature double-fried 15-spice whole chicken, crispy lechon kawali, and ngohiong.',
    address: 'Mahayahay Street / 1911 M.L. Quezon National Highway, Gabi, Cordova, Cebu',
    phone: '0975 985 6145',
    hours: '10:30 AM – 9:00 PM (Daily)',
  },

  // 8. McDonald's Cordova 
  'mcdonalds-cordova': {
    name: 'McDonald\'s Cordova',
    category: 'Fast Food',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUBuFiPDiQi0bDijKV76uMXADQD2DVL6JlpKeaD0zy17-sGjV6caPB9Z6r&s=10',
    barangay: 'San Miguel',
    description: '24/7 fast-food restaurant with Drive-Thru and McDelivery, serving Chicken McDo, Big Mac, world-famous fries, and McCafé beverages.',
    address: 'Babag II Road / San Miguel Road, San Miguel, Cordova, Cebu',
    phone: '0968 851 0931',
    hours: 'Open 24 hours (Daily)',
  },

  // 9. Barracks Grill and Resto
  'barracks-grill-and-resto-bar': {
    name: 'Barracks Grill and Resto',
    category: 'Resto Bar',
    coverImage: 'https://lh3.googleusercontent.com/grass-cs/ACvplmP1_ZIZux8LEYKASSCkThb2Q5Xfp8toCwBgS6gR0yYblz4-nHIdDYzdpQMjKUn7jXu5G9wYNFod4dWcCTSvjT9sCay87OKunPdMMUupTd3j7StpHg43j3LIzG2a_KFUd1xr1AFL=s294-w294-h220-n-k-no',
    barangay: 'Gabi',
    description: 'Casual nightspot and grill bar in Ajoya Subdivision featuring charcoal-grilled meats, sizzling appetizers, cold beer, and late-night dining.',
    address: 'Ajoya Subdivision Commercial Area, Gabi, Cordova, Cebu',
    phone: '0977 328 7689',
    hours: '5:00 PM – 4:00 AM (Daily)',
  },

  // 10. BRIC Food Park 
  'bric-food-park': {
    name: 'BRIC Food Park',
    category: 'Street Food',
    coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
    barangay: 'San Miguel',
    description: 'A vibrant open-air community food park featuring a wide variety of food kiosks, Pau\'s Grill BBQ, ramen, milk tea, and al fresco seating.',
    address: 'San Miguel Road, San Miguel, Cordova, Cebu',
    phone: '0917 149 6503',
    hours: '3:30 PM – 11:30 PM (Daily)',
  },

  // 11. RCA Food Station
  'rca-bilao-food-station': {
    name: 'RCA Food Station',
    category: 'Restaurant',
    coverImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
    barangay: 'Gabi',
    description: 'Known for Cebuano stir-fried pansit bam-i bilao trays, crispy boneless lechon belly, kakanin, and custom Filipino party food packages.',
    address: 'Sitio Mahayahay (beside Gabi Health Center), Gabi, Cordova, Cebu',
    phone: '(032) 326 8766',
    hours: '8:00 AM – 4:00 PM (Bilao/Catering), 5:00 PM – 10:00 PM (Street Food, Tue–Sun)',
  },

  // 12. Mavericks Cafe
  'mavericks-by-the-baker-street': {
    name: 'Mavericks Cafe',
    category: 'Cafe',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQu11QAkAvQPNZ0Y4r8_IbqwVvIJxwA2-bk15_VEO_zKcHOiSdH6-5VH4Sw&s=10',
    barangay: 'Gabi',
    description: 'Creative bakery, specialty coffee lounge, and aesthetic hangout beside Benthel Asia School of Technology, offering artisan pastries and brews.',
    address: 'Gabi Road (beside Benthel Asia School of Technology), Gabi, Cordova, Cebu',
    phone: '0920 527 6233',
    hours: '2:00 PM – 10:00 PM (Tue–Thu), 3:00 PM – 11:00 PM (Fri–Sun), Closed Mon',
  },
 
  // 13. Entoy's Bakasihan
  'entoys-bakasihan': {
    name: 'Entoy\'s Bakasihan',
    category: 'Restaurant',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNCj7x2CFrrKVmn4OCdP_c3QLiciyRFdV0CyqWzXXm4-bNfD447vK7R78o&s=10',
    barangay: 'Buagsong',
    description: 'World-famous seaside eatery featured on Netflix\'s Street Food: Asia, renowned for its signature saltwater reef eel stew (nilarang na bakasi).',
    address: 'Buagsong Barangay Road (Wharf area), Buagsong, Cordova, Cebu',
    phone: '0966 931 7531',
    hours: '6:00 AM – 6:00 PM (Daily)',
  },

  // 14. Tita Kim's
  'tita-kims': {
    name: "Tita Kim's",
    category: 'Restaurant',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQukvKATrQQW_HUYIbjrG6X6b9KNlzpQz5qlo3DJuung&s=10',
    barangay: 'Gabi',
    description: 'Popular budget-friendly all-you-can-eat Filipino buffet restaurant along the National Highway featuring fresh seafood, meats, and Filipino comfort dishes for ₱299 only.',
    address: 'Lot 747, National Highway, Purok 5 (beside Cordoville Leisure Park), Gabi, Cordova, Cebu',
    phone: '0998 868 8573',
    hours: '5:00 PM – 10:00 PM (Tue–Fri), 11:30 AM – 10:00 PM (Sat–Sun), Closed Mon',
  },

  // 15. Burandat Seafood Bucket
  'burandat-seafood-bucket': {
    name: 'Burandat Seafood Bucket',
    category: 'Restaurant',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnfjHmw1Us3mlI-tffQq2II3E62OOo-9HD_C5SkWUykDQHElwEa0m7Suar&s=10',
    barangay: 'Gabi',
    description: 'Coastal seafood dining spot in Gabi known for cajun seafood boil buckets, unlimited fresh crabs and shrimps, and grilled seaside catches.',
    address: 'Purok 2 (near Gabi Chapel & CPC), Gabi, Cordova, Cebu',
    phone: '0916 473 3656',
    hours: '10:00 AM – 9:00 PM (Daily; Unlimited Seafood Fri–Sat 4pm-9pm, Sun 12pm-9pm)',
  },

  // 16. CSalt Café
  'csalt-cafe-cordova': {
    name: 'CSalt Café',
    category: 'Cafe',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQe-86il0KEf6Gh0WJs_q-X3I8tGbhjWomjoBkTJBGbBw&s=10',
    barangay: 'Poblacion',
    description: 'Rooftop coffee shop at Quinn Haven Commercial Building offering panoramic ocean views, specialty sea salt lattes, matcha, and pastries.',
    address: '3rd Floor, Quinn Haven Commercial Building, Sitio Ubos (across RHU), Poblacion, Cordova, Cebu',
    phone: 'Not Available',
    email: 'namicoffee.corp@gmail.com',
    hours: '1:00 PM – 11:00 PM (Mon–Fri), 12:00 NN – 12:00 MN (Sat–Sun)',
  },
  'csalt-cafe': {
    name: 'CSalt Café',
    category: 'Cafe',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQe-86il0KEf6Gh0WJs_q-X3I8tGbhjWomjoBkTJBGbBw&s=10',
    barangay: 'Poblacion',
    description: 'Rooftop coffee shop at Quinn Haven Commercial Building offering panoramic ocean views, specialty sea salt lattes, matcha, and pastries.',
    address: '3rd Floor, Quinn Haven Commercial Building, Sitio Ubos (across RHU), Poblacion, Cordova, Cebu',
    phone: 'Not Available',
    email: 'namicoffee.corp@gmail.com',
    hours: '1:00 PM – 11:00 PM (Mon–Fri), 12:00 NN – 12:00 MN (Sat–Sun)',
  },

  // 17. Cafe Mafia
  'cafe-mafia': {
    name: 'Cafe Mafia',
    category: 'Cafe',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQn_riqkNLK4YjVNUrYSCXKc5N22V82mhWXzQ4UFs0Tx8u_yOL9-5XN5kn4&s=10',
    barangay: 'Dapitan',
    description: 'A cozy neighborhood cafe and burger spot at The Carwash Mafia complex in Dapitan, famous for handcrafted Mafia Premium Burgers, loaded fries, and artisan coffee.',
    address: 'Purok 1 (The Carwash Mafia), Dapitan, Cordova, Cebu',
    phone: '0917 321 0453',
    hours: '9:00 AM – 9:00 PM (Daily)',
  },

  // 18. Solea Mactan Resort
  'solea-mactan-resort': {
    name: 'Solea Mactan Resort',
    category: 'Restaurant',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJs8-gUFPgl9cU83YnTf5__Fp_8BhFL8IlfKPl9fcQzl1rzsB2MdLjWhyc&s=10',
    barangay: 'Alegria',
    description: 'Premier beachfront resort dining featuring Earth All-Day Dining buffet, Salt & Sky Rooftop Lounge, international cuisine, and cocktails.',
    address: 'Victor Wahing Street, Alegria, Cordova, Cebu',
    phone: '(032) 517 8889',
    email: 'info@soleahotels.com',
    hours: 'Earth Dining: 6:00 AM – 10:00 PM; Salt & Sky Rooftop: 4:00 PM – 1:00 AM (Daily)',
  },
  'solea-mactan-restaurant': {
    name: 'Solea Mactan Resort',
    category: 'Restaurant',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJs8-gUFPgl9cU83YnTf5__Fp_8BhFL8IlfKPl9fcQzl1rzsB2MdLjWhyc&s=10',
    barangay: 'Alegria',
    description: 'Premier beachfront resort dining featuring Earth All-Day Dining buffet, Salt & Sky Rooftop Lounge, international cuisine, and cocktails.',
    address: 'Victor Wahing Street, Alegria, Cordova, Cebu',
    phone: '(032) 517 8889',
    email: 'info@soleahotels.com',
    hours: 'Earth Dining: 6:00 AM – 10:00 PM; Salt & Sky Rooftop: 4:00 PM – 1:00 AM (Daily)',
  },

  // 19. Husby's Grill
  'husbys-grill': {
    name: 'Husby’s Grill',
    category: 'Restaurant',
    coverImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/2a/96/d7/visit-us-at-manuel-l.jpg?w=600&h=-1&s=1',
    barangay: 'Gabi',
    description: 'Previously an outdoor grill restaurant along M.L. Quezon Road known for Filipino grilled tuna belly and baby back ribs. (Permanently Closed).',
    address: 'Manuel L. Quezon Road (beside Calda Pizza), Gabi, Cordova, Cebu',
    phone: '+63 917 138 3144',
    hours: 'Permanently Closed',
  },

  // 20. Sungka Native Restaurant
  'sungka-native-restaurant': {
    name: 'Sungka Native Restaurant',
    category: 'Restaurant',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYiZGOakQCISH5JLE9XpMaq7c834bHYQ2Pv8nmzfxhdn6ZopUeMouJ5nY&s=10',
    barangay: 'Day-as',
    description: 'Scenic native waterfront dining featuring private bamboo cottages surrounding a large koi pond, serving authentic Filipino dishes and seafood.',
    address: 'Day-as Barangay Road (across RR Dress Shop), Day-as, Cordova, Cebu',
    phone: 'Not Available',
    email: 'sungkanative@gmail.com',
    hours: '11:00 AM – 10:00 PM (Daily)',
  },

  // 21. Lantaw Floating Native Restaurant
  'lantaw-floating-native-restaurant': {
    name: 'Lantaw Floating Native Restaurant',
    category: 'Restaurant',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuOl7HxrmSXr2JW-b5lLt0iRWS7hh_ObrmQKrIpIT3WQe99Zm3s-C1kjw&s=10',
    barangay: 'Day-as',
    description: 'Iconic floating native restaurant on the Day-as waterfront offering sunset views across the Mactan channel, Cordova Express, and seafood feasts.',
    address: 'Sa Baybayon, Day-as Wharf, Day-as, Cordova, Cebu',
    phone: '0985 052 3061',
    hours: '11:00 AM – 9:00 PM (Daily)',
  },

  // 22. Alberto's Pizza Cordova
  'albertos-pizza-cordova': {
    name: 'Alberto’s Pizza Cordova',
    category: 'Pizza',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc1MHHZ0YdgZ6T7yKZsr3ms71ihX6gDgQPOM7_3fWQ6RucKdjph9uKAdY&s=10',
    barangay: 'Gabi',
    description: 'Beloved homegrown Cebuano pizzeria in Lucing Tan Building serving budget-friendly freshly baked pizzas with direct local delivery.',
    address: 'Lucing Tan Building, Purok 5 (across San Roque College), Gabi, Cordova, Cebu',
    phone: '0925 871 4539',
    hours: '8:00 AM – 12:00 Midnight (Daily)',
  },

  // 23. Cascaja Cafe
  'cascaja-cafe': {
    name: 'Cascaja Cafe',
    category: 'Cafe',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaMHiYg94wzeeK6oPQ5FTQczijAWKvc6mCLFWa1_FHW2uxgFuFfns-Gi0&s=10',
    barangay: 'Poblacion',
    description: 'Cozy coffee shop located across Kasadya Park N\' Play offering espresso drinks, frappes, DIY ramen bowls, and savory sizzling rice meals.',
    address: 'Calan New Road (across Kasadya Park N\' Play), Poblacion, Cordova, Cebu',
    phone: '+63 995 755 0983',
    hours: '10:00 AM – 12:00 Midnight (Daily)',
  },
  'cascadja-cafe': {
    name: 'Cascaja Cafe',
    category: 'Cafe',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaMHiYg94wzeeK6oPQ5FTQczijAWKvc6mCLFWa1_FHW2uxgFuFfns-Gi0&s=10',
    barangay: 'Poblacion',
    description: 'Cozy coffee shop located across Kasadya Park N\' Play offering espresso drinks, frappes, DIY ramen bowls, and savory sizzling rice meals.',
    address: 'Calan New Road (across Kasadya Park N\' Play), Poblacion, Cordova, Cebu',
    phone: '+63 995 755 0983',
    hours: '10:00 AM – 12:00 Midnight (Daily)',
  },

  // 24. Don Macchiatos Cordova
  'don-macchiatos-cordova': {
    name: 'Don Macchiatos Cordova',
    category: 'Cafe',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2kgd78I8cpTbhSrOOc3ZfSq9BO0clYam57_rgDI3UviCc_tuXlsO2VJry&s=10',
    barangay: 'San Miguel',
    description: 'Popular budget-friendly ₱39 coffee brand serving iced caramel macchiatos, matcha lattes, strawberry milk, and quick grab-and-go drinks.',
    address: 'San Miguel Road / Poblacion, San Miguel, Cordova, Cebu',
    phone: '0918 596 7413',
    hours: '8:00 AM – 10:00 PM (Daily)',
  },

  // 25. Parola Seaview Restaurant
  'parola-seaview-restaurant': {
    name: 'Parola Seaview Restaurant',
    category: 'Restaurant',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSL7EJmXtZI_6OP_IOn3cdEknylsIq8N-5D7mLaGIpgfPDot9rz1oMJ1vk&s=10',
    barangay: 'Poblacion',
    description: 'Large open-air seaside restaurant built around an illuminated lighthouse at the Cordova RORO Port jetty, famous for seafood and sunset views.',
    address: 'End of Roro Port Road (Lighthouse Jetty), Poblacion, Cordova, Cebu',
    phone: '0947 990 8561',
    hours: '11:00 AM – 9:00 PM (Mon–Fri), 10:00 AM – 9:00 PM (Sat–Sun)',
  },

  // 26. 10,000 Roses Cafe & More
  '10000-roses-cafe-and-more': {
    name: '10,000 Roses Cafe & More',
    category: 'Cafe',
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRY-gDUjXc0GWAZGac7KeR3AWR2ZyPLpAqZzWVcplRkWXIajolwprvnDykK&s=10',
    barangay: 'Day-as',
    description: 'World-famous seaside cafe attraction surrounded by 10,000 glowing LED white roses, serving rose lattes, wood-fired pizza, and pasta.',
    address: 'Day-as Barangay Road (Cordova Tourism Center), Day-as, Cordova, Cebu',
    phone: '0956 839 9427',
    hours: '2:00 PM – 10:00 PM (Daily)',
  },

  // Additional registered restaurant
  'the-latte-cafe-mtvn5h2j': {
    name: 'The Latte Cafe',
    category: 'Cafe',
    coverImage: '/uploads/restaurant-images/1789051635858-84ac1f64fd21d402.jpg',
    barangay: 'Gabi',
    description: 'An aesthetic, pet-friendly neighborhood coffee shop serving specialty brews, fresh smoothies, pasta, burgers and all-day breakfast.',
    address: 'The Latte Cafe, Andalucia Crest, Gabi, Cordova, Cebu',
    phone: '0910 618 1758',
    hours: '8:00 AM – 10:00 PM (Daily)',
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
  if (list.length === 0 || text.includes('pinoy') || text.includes('filipino') || text.includes('cebuano') || text.includes('lutong-bahay') || text.includes('native')) {
    list.push('Filipino');
  }
  return Array.from(new Set(list));
}

function inferPriceRange(name: string, description: string = ''): 'budget' | 'moderate' | 'expensive' | 'premium' {
  const text = `${name} ${description}`.toLowerCase();
  if (text.includes('resort') || text.includes('fine') || text.includes('solea')) return 'premium';
  if (text.includes('resto bar') || text.includes('bucket') || text.includes('parola') || text.includes('taytayan') || text.includes('sungka') || text.includes('roses') || text.includes('lantaw')) return 'moderate';
  if (text.includes('expensive') || text.includes('luxury')) return 'expensive';
  return 'budget';
}

const ORDERED_UNIQUE_KEYS = [
  'horizon-bean-cafe',
  'grillhouse-cordova-bbq',
  'street-food-park',
  'aby-road-resto-bar',
  'eat-n-repeat',
  'taytayan-pinoy-restaurant',
  'stuffed-n-fried-cordova',
  'mcdonalds-cordova',
  'barracks-grill-and-resto-bar',
  'bric-food-park',
  'rca-bilao-food-station',
  'mavericks-by-the-baker-street',
  'entoys-bakasihan',
  'tita-kims',
  'burandat-seafood-bucket',
  'csalt-cafe-cordova',
  'cafe-mafia',
  'solea-mactan-resort',
  'husbys-grill',
  'sungka-native-restaurant',
  'lantaw-floating-native-restaurant',
  'albertos-pizza-cordova',
  'cascaja-cafe',
  'don-macchiatos-cordova',
  'parola-seaview-restaurant',
  '10000-roses-cafe-and-more',
  'the-latte-cafe-mtvn5h2j',
];

const KNOWN_COORDINATES: Record<string, [number, number]> = {
  'horizon-bean-cafe': [10.2550, 123.9480],
  'grillhouse-cordova-bbq': [10.2561, 123.9459],
  'papsys-bbq': [10.2561, 123.9459],
  'street-food-park': [10.2540, 123.9515],
  'aby-road-resto-bar': [10.2510, 123.9460],
  'eat-n-repeat': [10.2520, 123.9470],
  'taytayan-pinoy-restaurant': [10.2540, 123.9440],
  'stuffed-n-fried-cordova': [10.2485, 123.9510],
  'stuffed-n-fried-cordova-branch': [10.2485, 123.9510],
  'mcdonalds-cordova': [10.2550, 123.9490],
  'barracks-grill-and-resto-bar': [10.2470, 123.9530],
  'bric-food-park': [10.2560, 123.9500],
  'rca-bilao-food-station': [10.2490, 123.9525],
  'mavericks-by-the-baker-street': [10.2488, 123.9515],
  'entoys-bakasihan': [10.2450, 123.9460],
  'tita-kims': [10.2475, 123.9540],
  'burandat-seafood-bucket': [10.2465, 123.9500],
  'csalt-cafe-cordova': [10.2537, 123.9481],
  'csalt-cafe': [10.2537, 123.9481],
  'cafe-mafia': [10.2580, 123.9475],
  'solea-mactan-resort': [10.2390, 123.9600],
  'solea-mactan-restaurant': [10.2390, 123.9600],
  'husbys-grill': [10.2482, 123.9535],
  'sungka-native-restaurant': [10.2670, 123.9680],
  'lantaw-floating-native-restaurant': [10.2685, 123.9700],
  'albertos-pizza-cordova': [10.2492, 123.9512],
  'cascaja-cafe': [10.2570, 123.9465],
  'cascadja-cafe': [10.2570, 123.9465],
  'don-macchiatos-cordova': [10.2555, 123.9495],
  'parola-seaview-restaurant': [10.2540, 123.9510],
  '10000-roses-cafe-and-more': [10.2690, 123.9705],
  'the-latte-cafe-mtvn5h2j': [10.26556, 123.96443],
};

export function getAllStaticRestaurants(): Restaurant[] {
  const result: Restaurant[] = [];
  let index = 1;

  for (const key of ORDERED_UNIQUE_KEYS) {
    const config = RESTAURANT_CUSTOMIZATIONS[key];
    if (!config || config.hidden) continue;

    const slug = slugifyKey(key);
    const cuisines = inferCuisines(config.name, config.description, config.barangay);
    const priceRange = inferPriceRange(config.name, config.description);
    const coords = KNOWN_COORDINATES[key] || [10.2500 + (index * 0.0012) % 0.02, 123.9480 + (index * 0.0015) % 0.02];

    const reviewStats = getRestaurantReviewStats(slug);

    result.push({
      id: `static-${slug}`,
      owner_id: 'owner-static',
      name: config.name || key,
      category: config.category,
      slug: slug,
      description: config.description || `Welcome to ${config.name || key} in Cordova, Cebu.`,
      address: config.address || (config.barangay ? `${config.barangay}, Cordova, Cebu` : 'Cordova, Cebu'),
      barangay: config.barangay || 'Cordova',
      latitude: coords[0],
      longitude: coords[1],
      phone: config.phone && config.phone !== 'Not Available' ? config.phone : undefined,
      email: config.email,
      hours: config.hours,
      price_range: priceRange,
      services_offered: ['dine_in', 'takeout'],
      cover_image_url: config.coverImage || undefined,
      status: 'verified',
      avg_rating: reviewStats.rating,
      review_count: reviewStats.count,
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
  const reviewStats = getRestaurantReviewStats(restaurant.slug || restaurant.id);

  return {
    ...restaurant,
    name: custom?.name || restaurant.name,
    category: custom?.category || restaurant.category,
    cover_image_url:
      custom?.coverImage !== undefined && custom?.coverImage !== null && custom?.coverImage.trim() !== ''
        ? custom.coverImage
        : restaurant.cover_image_url,
    barangay: custom?.barangay || restaurant.barangay,
    description: custom?.description || restaurant.description,
    address: custom?.address || restaurant.address,
    phone: custom?.phone && custom?.phone !== 'Not Available' ? custom.phone : restaurant.phone,
    email: custom?.email || restaurant.email,
    hours: custom?.hours || (restaurant as any)?.hours,
    review_count: reviewStats.count > 0 ? reviewStats.count : (restaurant.review_count || 0),
    avg_rating: reviewStats.rating > 0 ? reviewStats.rating : (Number(restaurant.avg_rating) || 5.0),
  };
}
