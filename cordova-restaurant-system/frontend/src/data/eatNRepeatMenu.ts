import type { MenuItem, MenuCategory } from '@/lib/types';

// Prices and photos supplied in the updated Eat n Repeat food menu and the two drink menus.
// The earlier food document repeats the first twelve food items at the same prices.
export const EAT_N_REPEAT_CATEGORIES: MenuCategory[] = [
  {
    "id": "mc-eat-source-01",
    "restaurant_id": "eat-n-repeat",
    "name": "LAMAW SERIES",
    "sort_order": 1
  },
  {
    "id": "mc-eat-source-02",
    "restaurant_id": "eat-n-repeat",
    "name": "JAPAN / KOREAN",
    "sort_order": 2
  },
  {
    "id": "mc-eat-source-03",
    "restaurant_id": "eat-n-repeat",
    "name": "SIZZLING",
    "sort_order": 3
  },
  {
    "id": "mc-eat-source-04",
    "restaurant_id": "eat-n-repeat",
    "name": "FILIPINO DISHES",
    "sort_order": 4
  },
  {
    "id": "mc-eat-source-05",
    "restaurant_id": "eat-n-repeat",
    "name": "FOOD ADD-ONS",
    "sort_order": 5
  },
  {
    "id": "mc-eat-source-06",
    "restaurant_id": "eat-n-repeat",
    "name": "SNACKS",
    "sort_order": 6
  },
  {
    "id": "mc-eat-source-07",
    "restaurant_id": "eat-n-repeat",
    "name": "ESPRESSO SERIES",
    "sort_order": 7
  },
  {
    "id": "mc-eat-source-08",
    "restaurant_id": "eat-n-repeat",
    "name": "NON-COFFEE SERIES",
    "sort_order": 8
  },
  {
    "id": "mc-eat-source-09",
    "restaurant_id": "eat-n-repeat",
    "name": "MILKTEA SERIES",
    "sort_order": 9
  },
  {
    "id": "mc-eat-source-10",
    "restaurant_id": "eat-n-repeat",
    "name": "SHAKE / SMOOTHIES",
    "sort_order": 10
  }
];

type SourceItem = { category: string; name: string; price: number; imageUrl: string | null };
const SOURCE_ITEMS: SourceItem[] = [
  {
    "category": "LAMAW SERIES",
    "name": "Lamaw Siomai",
    "price": 89,
    "imageUrl": "/images/eat-n-repeat/food/lamaw-lamaw-siomai.jpg"
  },
  {
    "category": "LAMAW SERIES",
    "name": "Lamaw Lumpia",
    "price": 99,
    "imageUrl": "/images/eat-n-repeat/food/lamaw-lamaw-lumpia.jpg"
  },
  {
    "category": "LAMAW SERIES",
    "name": "Lamaw Spam",
    "price": 110,
    "imageUrl": "/images/eat-n-repeat/food/lamaw-lamaw-spam.jpg"
  },
  {
    "category": "LAMAW SERIES",
    "name": "Lamaw Combo",
    "price": 140,
    "imageUrl": "/images/eat-n-repeat/food/lamaw-lamaw-combo.jpg"
  },
  {
    "category": "JAPAN / KOREAN",
    "name": "Curry Katsu",
    "price": 185,
    "imageUrl": "/images/eat-n-repeat/food/japan-korean-curry-katsu.jpg"
  },
  {
    "category": "JAPAN / KOREAN",
    "name": "Tonkatsu",
    "price": 149,
    "imageUrl": "/images/eat-n-repeat/food/japan-korean-tonkatsu.jpg"
  },
  {
    "category": "JAPAN / KOREAN",
    "name": "Teriyaki",
    "price": 120,
    "imageUrl": "/images/eat-n-repeat/food/japan-korean-teriyaki.jpg"
  },
  {
    "category": "JAPAN / KOREAN",
    "name": "Special Ramen",
    "price": 180,
    "imageUrl": "/images/eat-n-repeat/food/japan-korean-special-ramen.jpg"
  },
  {
    "category": "SIZZLING",
    "name": "Sisig w/ Spam",
    "price": 129,
    "imageUrl": "/images/eat-n-repeat/food/sizzling-sisig-w-spam.jpg"
  },
  {
    "category": "SIZZLING",
    "name": "Sisig w/ Siomai",
    "price": 129,
    "imageUrl": "/images/eat-n-repeat/food/sizzling-sisig-w-siomai.jpg"
  },
  {
    "category": "SIZZLING",
    "name": "Sisig w/ Lumpia",
    "price": 120,
    "imageUrl": "/images/eat-n-repeat/food/sizzling-sisig-w-lumpia.jpg"
  },
  {
    "category": "SIZZLING",
    "name": "Sisig Platter",
    "price": 150,
    "imageUrl": "/images/eat-n-repeat/food/sizzling-sisig-platter.jpg"
  },
  {
    "category": "SIZZLING",
    "name": "Combo",
    "price": 179,
    "imageUrl": null
  },
  {
    "category": "FILIPINO DISHES",
    "name": "Spaghetti",
    "price": 180,
    "imageUrl": "/images/eat-n-repeat/food/filipino-spaghetti.jpg"
  },
  {
    "category": "FILIPINO DISHES",
    "name": "Carbonara",
    "price": 180,
    "imageUrl": "/images/eat-n-repeat/food/filipino-carbonara.jpg"
  },
  {
    "category": "FILIPINO DISHES",
    "name": "Liempo",
    "price": 179,
    "imageUrl": "/images/eat-n-repeat/food/filipino-liempo.jpg"
  },
  {
    "category": "FILIPINO DISHES",
    "name": "Pesto Buttered",
    "price": 179,
    "imageUrl": null
  },
  {
    "category": "FOOD ADD-ONS",
    "name": "Lumpia",
    "price": 15,
    "imageUrl": "/images/eat-n-repeat/food/addons-lumpia.jpg"
  },
  {
    "category": "FOOD ADD-ONS",
    "name": "Siomai",
    "price": 15,
    "imageUrl": "/images/eat-n-repeat/food/addons-siomai.jpg"
  },
  {
    "category": "FOOD ADD-ONS",
    "name": "Spam",
    "price": 15,
    "imageUrl": "/images/eat-n-repeat/food/addons-spam.jpg"
  },
  {
    "category": "FOOD ADD-ONS",
    "name": "Egg",
    "price": 15,
    "imageUrl": "/images/eat-n-repeat/food/addons-egg.jpg"
  },
  {
    "category": "FOOD ADD-ONS",
    "name": "Rice",
    "price": 15,
    "imageUrl": "/images/eat-n-repeat/food/addons-rice.jpg"
  },
  {
    "category": "SNACKS",
    "name": "Ham & Cheese",
    "price": 90,
    "imageUrl": "/images/eat-n-repeat/food/snacks-ham-cheese.jpg"
  },
  {
    "category": "SNACKS",
    "name": "Double Bacon",
    "price": 110,
    "imageUrl": "/images/eat-n-repeat/food/snacks-double-bacon.jpg"
  },
  {
    "category": "SNACKS",
    "name": "Fries",
    "price": 129,
    "imageUrl": "/images/eat-n-repeat/food/snacks-fries.jpg"
  },
  {
    "category": "SNACKS",
    "name": "Nachos",
    "price": 150,
    "imageUrl": "/images/eat-n-repeat/food/snacks-nachos.jpg"
  },
  {
    "category": "SNACKS",
    "name": "Carbonara Katsu",
    "price": 250,
    "imageUrl": "/images/eat-n-repeat/food/snacks-carbonara-katsu.jpg"
  },
  {
    "category": "SNACKS",
    "name": "3lt",
    "price": 110,
    "imageUrl": null
  },
  {
    "category": "SNACKS",
    "name": "The Hangover",
    "price": 130,
    "imageUrl": null
  },
  {
    "category": "ESPRESSO SERIES",
    "name": "Americano (Small)",
    "price": 95,
    "imageUrl": "/images/eat-n-repeat/drinks/espresso-americano.png"
  },
  {
    "category": "ESPRESSO SERIES",
    "name": "Americano (Medium)",
    "price": 110,
    "imageUrl": "/images/eat-n-repeat/drinks/espresso-americano.png"
  },
  {
    "category": "ESPRESSO SERIES",
    "name": "Dirty Matcha (Small)",
    "price": 120,
    "imageUrl": "/images/eat-n-repeat/drinks/espresso-dirty-matcha.png"
  },
  {
    "category": "ESPRESSO SERIES",
    "name": "Dirty Matcha (Medium)",
    "price": 150,
    "imageUrl": "/images/eat-n-repeat/drinks/espresso-dirty-matcha.png"
  },
  {
    "category": "ESPRESSO SERIES",
    "name": "Latte (Spanish Latte) (Small)",
    "price": 110,
    "imageUrl": "/images/eat-n-repeat/drinks/espresso-latte-spanish-latte.png"
  },
  {
    "category": "ESPRESSO SERIES",
    "name": "Latte (Spanish Latte) (Medium)",
    "price": 130,
    "imageUrl": "/images/eat-n-repeat/drinks/espresso-latte-spanish-latte.png"
  },
  {
    "category": "ESPRESSO SERIES",
    "name": "Biscoff (Small)",
    "price": 130,
    "imageUrl": "/images/eat-n-repeat/drinks/espresso-biscoff.png"
  },
  {
    "category": "ESPRESSO SERIES",
    "name": "Biscoff (Medium)",
    "price": 150,
    "imageUrl": "/images/eat-n-repeat/drinks/espresso-biscoff.png"
  },
  {
    "category": "ESPRESSO SERIES",
    "name": "White Chocolate Latte (Small)",
    "price": 120,
    "imageUrl": "/images/eat-n-repeat/drinks/espresso-white-chocolate-latte.png"
  },
  {
    "category": "ESPRESSO SERIES",
    "name": "White Chocolate Latte (Medium)",
    "price": 150,
    "imageUrl": "/images/eat-n-repeat/drinks/espresso-white-chocolate-latte.png"
  },
  {
    "category": "ESPRESSO SERIES",
    "name": "Caramel Macchiato (Small)",
    "price": 120,
    "imageUrl": "/images/eat-n-repeat/drinks/espresso-caramel-macchiato.png"
  },
  {
    "category": "ESPRESSO SERIES",
    "name": "Caramel Macchiato (Medium)",
    "price": 140,
    "imageUrl": "/images/eat-n-repeat/drinks/espresso-caramel-macchiato.png"
  },
  {
    "category": "ESPRESSO SERIES",
    "name": "Salted Caramel (Small)",
    "price": 120,
    "imageUrl": "/images/eat-n-repeat/drinks/espresso-salted-caramel.png"
  },
  {
    "category": "ESPRESSO SERIES",
    "name": "Salted Caramel (Medium)",
    "price": 150,
    "imageUrl": "/images/eat-n-repeat/drinks/espresso-salted-caramel.png"
  },
  {
    "category": "NON-COFFEE SERIES",
    "name": "Matcha (Small)",
    "price": 110,
    "imageUrl": "/images/eat-n-repeat/drinks/non-coffee-matcha.png"
  },
  {
    "category": "NON-COFFEE SERIES",
    "name": "Matcha (Medium)",
    "price": 130,
    "imageUrl": "/images/eat-n-repeat/drinks/non-coffee-matcha.png"
  },
  {
    "category": "NON-COFFEE SERIES",
    "name": "Hazelnut Mocha (Small)",
    "price": 110,
    "imageUrl": "/images/eat-n-repeat/drinks/non-coffee-hazelnut-mocha.png"
  },
  {
    "category": "NON-COFFEE SERIES",
    "name": "Hazelnut Mocha (Medium)",
    "price": 130,
    "imageUrl": "/images/eat-n-repeat/drinks/non-coffee-hazelnut-mocha.png"
  },
  {
    "category": "NON-COFFEE SERIES",
    "name": "Matcha Cream (Small)",
    "price": 120,
    "imageUrl": "/images/eat-n-repeat/drinks/non-coffee-matcha-cream.png"
  },
  {
    "category": "NON-COFFEE SERIES",
    "name": "Matcha Cream (Medium)",
    "price": 140,
    "imageUrl": "/images/eat-n-repeat/drinks/non-coffee-matcha-cream.png"
  },
  {
    "category": "NON-COFFEE SERIES",
    "name": "Strawberry Cream (Small)",
    "price": 110,
    "imageUrl": "/images/eat-n-repeat/drinks/non-coffee-strawberry-cream.png"
  },
  {
    "category": "NON-COFFEE SERIES",
    "name": "Strawberry Cream (Medium)",
    "price": 130,
    "imageUrl": "/images/eat-n-repeat/drinks/non-coffee-strawberry-cream.png"
  },
  {
    "category": "NON-COFFEE SERIES",
    "name": "Chocolate (Small)",
    "price": 110,
    "imageUrl": "/images/eat-n-repeat/drinks/non-coffee-chocolate.png"
  },
  {
    "category": "NON-COFFEE SERIES",
    "name": "Chocolate (Medium)",
    "price": 130,
    "imageUrl": "/images/eat-n-repeat/drinks/non-coffee-chocolate.png"
  },
  {
    "category": "NON-COFFEE SERIES",
    "name": "Mango Graham Mocha (Small)",
    "price": 120,
    "imageUrl": "/images/eat-n-repeat/drinks/non-coffee-mango-graham-mocha.png"
  },
  {
    "category": "NON-COFFEE SERIES",
    "name": "Mango Graham Mocha (Medium)",
    "price": 150,
    "imageUrl": "/images/eat-n-repeat/drinks/non-coffee-mango-graham-mocha.png"
  },
  {
    "category": "NON-COFFEE SERIES",
    "name": "Biscoff (Small)",
    "price": 120,
    "imageUrl": "/images/eat-n-repeat/drinks/non-coffee-biscoff.png"
  },
  {
    "category": "NON-COFFEE SERIES",
    "name": "Biscoff (Medium)",
    "price": 150,
    "imageUrl": "/images/eat-n-repeat/drinks/non-coffee-biscoff.png"
  },
  {
    "category": "MILKTEA SERIES",
    "name": "Matcha (Small)",
    "price": 99,
    "imageUrl": "/images/eat-n-repeat/drinks/milktea-matcha.png"
  },
  {
    "category": "MILKTEA SERIES",
    "name": "Matcha (Medium)",
    "price": 119,
    "imageUrl": "/images/eat-n-repeat/drinks/milktea-matcha.png"
  },
  {
    "category": "MILKTEA SERIES",
    "name": "Caramel (Small)",
    "price": 99,
    "imageUrl": "/images/eat-n-repeat/drinks/milktea-caramel.png"
  },
  {
    "category": "MILKTEA SERIES",
    "name": "Caramel (Medium)",
    "price": 119,
    "imageUrl": "/images/eat-n-repeat/drinks/milktea-caramel.png"
  },
  {
    "category": "MILKTEA SERIES",
    "name": "Okinawa (Small)",
    "price": 99,
    "imageUrl": "/images/eat-n-repeat/drinks/milktea-okinawa.png"
  },
  {
    "category": "MILKTEA SERIES",
    "name": "Okinawa (Medium)",
    "price": 119,
    "imageUrl": "/images/eat-n-repeat/drinks/milktea-okinawa.png"
  },
  {
    "category": "MILKTEA SERIES",
    "name": "Strawberry (Small)",
    "price": 99,
    "imageUrl": "/images/eat-n-repeat/drinks/milktea-strawberry.png"
  },
  {
    "category": "MILKTEA SERIES",
    "name": "Strawberry (Medium)",
    "price": 119,
    "imageUrl": "/images/eat-n-repeat/drinks/milktea-strawberry.png"
  },
  {
    "category": "MILKTEA SERIES",
    "name": "Wintermelon (Small)",
    "price": 99,
    "imageUrl": "/images/eat-n-repeat/drinks/milktea-wintermelon.png"
  },
  {
    "category": "MILKTEA SERIES",
    "name": "Wintermelon (Medium)",
    "price": 119,
    "imageUrl": "/images/eat-n-repeat/drinks/milktea-wintermelon.png"
  },
  {
    "category": "MILKTEA SERIES",
    "name": "Hershey’s (Small)",
    "price": 99,
    "imageUrl": "/images/eat-n-repeat/drinks/milktea-hersheys.png"
  },
  {
    "category": "MILKTEA SERIES",
    "name": "Hershey’s (Medium)",
    "price": 119,
    "imageUrl": "/images/eat-n-repeat/drinks/milktea-hersheys.png"
  },
  {
    "category": "MILKTEA SERIES",
    "name": "Chessy Mango (Small)",
    "price": 110,
    "imageUrl": "/images/eat-n-repeat/drinks/milktea-chessy-mango.png"
  },
  {
    "category": "MILKTEA SERIES",
    "name": "Chessy Mango (Medium)",
    "price": 129,
    "imageUrl": "/images/eat-n-repeat/drinks/milktea-chessy-mango.png"
  },
  {
    "category": "SHAKE / SMOOTHIES",
    "name": "Matcha",
    "price": 130,
    "imageUrl": "/images/eat-n-repeat/drinks/shakes-matcha.png"
  },
  {
    "category": "SHAKE / SMOOTHIES",
    "name": "Avocado",
    "price": 130,
    "imageUrl": "/images/eat-n-repeat/drinks/shakes-avocado.png"
  },
  {
    "category": "SHAKE / SMOOTHIES",
    "name": "Chocolate",
    "price": 130,
    "imageUrl": "/images/eat-n-repeat/drinks/shakes-chocolate.png"
  },
  {
    "category": "SHAKE / SMOOTHIES",
    "name": "Strawberry",
    "price": 130,
    "imageUrl": "/images/eat-n-repeat/drinks/shakes-strawberry.png"
  },
  {
    "category": "SHAKE / SMOOTHIES",
    "name": "Cookies & Cream",
    "price": 130,
    "imageUrl": "/images/eat-n-repeat/drinks/shakes-cookies-cream.png"
  },
  {
    "category": "SHAKE / SMOOTHIES",
    "name": "Mango Banana",
    "price": 130,
    "imageUrl": "/images/eat-n-repeat/drinks/shakes-mango-banana.png"
  },
  {
    "category": "SHAKE / SMOOTHIES",
    "name": "Banana Strawberry",
    "price": 130,
    "imageUrl": "/images/eat-n-repeat/drinks/shakes-banana-strawberry.png"
  }
];

const categoryIds = new Map(EAT_N_REPEAT_CATEGORIES.map((category) => [category.name, category.id]));

export const EAT_N_REPEAT_MENU_ITEMS: MenuItem[] = SOURCE_ITEMS.map((item, index) => ({
  id: `mi-eat-source-${String(index + 1).padStart(3, '0')}`,
  restaurant_id: 'eat-n-repeat',
  category_id: categoryIds.get(item.category)!,
  category_name: item.category,
  name: item.name,
  description: '',
  price: item.price,
  image_url: item.imageUrl ?? undefined,
  is_available: true,
  dietary_tags: [],
}));
