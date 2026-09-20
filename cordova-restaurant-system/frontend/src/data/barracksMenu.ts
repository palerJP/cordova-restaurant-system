import type { MenuItem, MenuCategory } from '@/lib/types';

export const BARRACKS_CATEGORIES: MenuCategory[] = [
  {
    "id": "cat-barracks-1",
    "restaurant_id": "barracks-grill-and-resto-bar",
    "name": "Signature Favorites",
    "sort_order": 1
  },
  {
    "id": "cat-barracks-2",
    "restaurant_id": "barracks-grill-and-resto-bar",
    "name": "Frontline Plates",
    "sort_order": 2
  },
  {
    "id": "cat-barracks-3",
    "restaurant_id": "barracks-grill-and-resto-bar",
    "name": "Tactical Bites",
    "sort_order": 3
  },
  {
    "id": "cat-barracks-4",
    "restaurant_id": "barracks-grill-and-resto-bar",
    "name": "Full Combat Meals",
    "sort_order": 4
  },
  {
    "id": "cat-barracks-5",
    "restaurant_id": "barracks-grill-and-resto-bar",
    "name": "Comfort Bowls",
    "sort_order": 5
  },
  {
    "id": "cat-barracks-6",
    "restaurant_id": "barracks-grill-and-resto-bar",
    "name": "Battle Pizzas",
    "sort_order": 6
  },
  {
    "id": "cat-barracks-7",
    "restaurant_id": "barracks-grill-and-resto-bar",
    "name": "Carb Reloads",
    "sort_order": 7
  },
  {
    "id": "cat-barracks-8",
    "restaurant_id": "barracks-grill-and-resto-bar",
    "name": "Extra Support",
    "sort_order": 8
  }
];

export const BARRACKS_MENU_ITEMS: MenuItem[] = [
  {
      "id": "mi-barracks-01",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-1",
      "category_name": "Signature Favorites",
      "name": "Barracks Crispy Pata",
      "description": "Crispy deep-fried whole pork leg served with special spiced soy-vinegar dip.",
      "price": 899,
      "image_url": "/images/barracks/barracks-crispy-pata.jpg",
      "is_available": true,
      "dietary_tags": [
          "pork",
          "crispy",
          "signature",
          "bestseller"
      ]
  },
  {
      "id": "mi-barracks-02",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-1",
      "category_name": "Signature Favorites",
      "name": "Barracks Golden Half Fried Chicken",
      "description": "Golden fried half chicken seasoned with Barracks special spice blend.",
      "price": 249,
      "image_url": "/images/barracks/barracks-golden-half-fried-chicken.jpg",
      "is_available": true,
      "dietary_tags": [
          "chicken",
          "crispy",
          "signature"
      ]
  },
  {
      "id": "mi-barracks-03",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-1",
      "category_name": "Signature Favorites",
      "name": "Crispy Pork Mask",
      "description": "Deep-fried seasoned pork mask bites, exceptionally crunchy and savory.",
      "price": 299,
      "image_url": "/images/barracks/crispy-pork-mask.jpg",
      "is_available": true,
      "dietary_tags": [
          "pork",
          "crispy",
          "pulutan"
      ]
  },
  {
      "id": "mi-barracks-04",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-1",
      "category_name": "Signature Favorites",
      "name": "Barracks Lechon Kawali",
      "description": "Golden crispy pork belly slabs with tender juicy meat inside.",
      "price": 329,
      "image_url": "/images/barracks/barracks-lechon-kawali.jpg",
      "is_available": true,
      "dietary_tags": [
          "pork",
          "crispy",
          "classic",
          "bestseller"
      ]
  },
  {
      "id": "mi-barracks-05",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-2",
      "category_name": "Frontline Plates",
      "name": "Shanghai Lumpia",
      "description": "Crispy golden fried spring rolls stuffed with savory minced pork and vegetables.",
      "price": 119,
      "image_url": "/images/barracks/shanghai-lumpia.jpg",
      "is_available": true,
      "dietary_tags": [
          "pork",
          "appetizer",
          "crispy"
      ]
  },
  {
      "id": "mi-barracks-06",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-2",
      "category_name": "Frontline Plates",
      "name": "Garlic Butter Chicken",
      "description": "Tender fried chicken bites tossed in rich garlic butter glaze.",
      "price": 209,
      "image_url": "/images/barracks/garlic-butter-chicken.jpg",
      "is_available": true,
      "dietary_tags": [
          "chicken",
          "garlic-butter"
      ]
  },
  {
      "id": "mi-barracks-07",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-2",
      "category_name": "Frontline Plates",
      "name": "Spicy Buffalo Wings",
      "description": "Crispy chicken wings tossed in fiery buffalo sauce.",
      "price": 219,
      "image_url": "/images/barracks/spicy-buffalo-wings.jpg",
      "is_available": true,
      "dietary_tags": [
          "chicken",
          "spicy",
          "wings"
      ]
  },
  {
      "id": "mi-barracks-08",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-2",
      "category_name": "Frontline Plates",
      "name": "Chicken Cordon Bleu",
      "description": "Breaded chicken breast roll stuffed with ham and melting cheese.",
      "price": 219,
      "image_url": "/images/barracks/chicken-cordon-bleu.jpg",
      "is_available": true,
      "dietary_tags": [
          "chicken",
          "cheese",
          "classic"
      ]
  },
  {
      "id": "mi-barracks-09",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-2",
      "category_name": "Frontline Plates",
      "name": "Bangus Ala Pobre",
      "description": "Pan-fried milkfish fillet topped with toasted garlic and savory sauce.",
      "price": 279,
      "image_url": "/images/barracks/bangus-ala-pobre.jpg",
      "is_available": true,
      "dietary_tags": [
          "seafood",
          "fish"
      ]
  },
  {
      "id": "mi-barracks-10",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-2",
      "category_name": "Frontline Plates",
      "name": "Gambas Ajillo",
      "description": "Succulent shrimp sauteed in olive oil, toasted garlic, and chili flakes.",
      "price": 279,
      "image_url": "/images/barracks/gambas-ajillo.jpg",
      "is_available": true,
      "dietary_tags": [
          "seafood",
          "shrimp",
          "spicy"
      ]
  },
  {
      "id": "mi-barracks-11",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-2",
      "category_name": "Frontline Plates",
      "name": "Garlic Butter Shrimp",
      "description": "Fresh prawns bathed in savory melted butter and minced garlic sauce.",
      "price": 279,
      "image_url": "/images/barracks/garlic-butter-shrimp.jpg",
      "is_available": true,
      "dietary_tags": [
          "seafood",
          "shrimp",
          "garlic-butter"
      ]
  },
  {
      "id": "mi-barracks-12",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-2",
      "category_name": "Frontline Plates",
      "name": "Shrimp Tempura",
      "description": "Japanese-style crispy batter-fried succulent shrimp with dipping sauce.",
      "price": 279,
      "image_url": "/images/barracks/shrimp-tempura.jpg",
      "is_available": true,
      "dietary_tags": [
          "seafood",
          "shrimp",
          "crispy"
      ]
  },
  {
      "id": "mi-barracks-13",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-2",
      "category_name": "Frontline Plates",
      "name": "Chicken & Fries",
      "description": "Crispy chicken cuts served with golden french fries.",
      "price": 279,
      "image_url": "/images/barracks/chicken-and-fries.jpg",
      "is_available": true,
      "dietary_tags": [
          "chicken",
          "fries"
      ]
  },
  {
      "id": "mi-barracks-14",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-3",
      "category_name": "Tactical Bites",
      "name": "Crispy Ginabot",
      "description": "Cebuano favorite deep-fried crispy pork chitterlings (mesentery).",
      "price": 109,
      "image_url": "/images/barracks/crispy-ginabot.jpg",
      "is_available": true,
      "dietary_tags": [
          "pork",
          "crispy",
          "local-favorite"
      ]
  },
  {
      "id": "mi-barracks-15",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-3",
      "category_name": "Tactical Bites",
      "name": "Crispy Chicken Skin",
      "description": "Deep-fried seasoned chicken skin crisped to golden perfection.",
      "price": 109,
      "image_url": "/images/barracks/crispy-chicken-skin.jpg",
      "is_available": true,
      "dietary_tags": [
          "chicken",
          "crispy",
          "pulutan"
      ]
  },
  {
      "id": "mi-barracks-16",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-3",
      "category_name": "Tactical Bites",
      "name": "French Fries",
      "description": "Classic golden potato french fries served hot and crispy.",
      "price": 109,
      "image_url": "/images/barracks/french-fries.jpg",
      "is_available": true,
      "dietary_tags": [
          "snack",
          "vegetarian"
      ]
  },
  {
      "id": "mi-barracks-17",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-3",
      "category_name": "Tactical Bites",
      "name": "Kropek",
      "description": "Crispy fried prawn crackers served with spiced vinegar dip.",
      "price": 109,
      "image_url": "/images/barracks/kropek.jpg",
      "is_available": true,
      "dietary_tags": [
          "snack",
          "crispy"
      ]
  },
  {
      "id": "mi-barracks-18",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-3",
      "category_name": "Tactical Bites",
      "name": "Onion Rings",
      "description": "Battered and deep-fried golden crispy white onion rings.",
      "price": 109,
      "image_url": "/images/barracks/onion-rings.jpg",
      "is_available": true,
      "dietary_tags": [
          "snack",
          "vegetarian",
          "crispy"
      ]
  },
  {
      "id": "mi-barracks-19",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-3",
      "category_name": "Tactical Bites",
      "name": "Dynamite",
      "description": "Green chili peppers stuffed with savory filling and cheese, wrapped and fried.",
      "price": 109,
      "image_url": "/images/barracks/dynamite.jpg",
      "is_available": true,
      "dietary_tags": [
          "spicy",
          "appetizer",
          "crispy"
      ]
  },
  {
      "id": "mi-barracks-20",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-3",
      "category_name": "Tactical Bites",
      "name": "Cabbage with Egg Stir-Fry",
      "description": "Quick-sauteed fresh shredded cabbage scrambled with egg.",
      "price": 129,
      "image_url": "/images/barracks/cabbage-with-egg-stir-fry.jpg",
      "is_available": true,
      "dietary_tags": [
          "vegetable",
          "egg"
      ]
  },
  {
      "id": "mi-barracks-21",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-3",
      "category_name": "Tactical Bites",
      "name": "Sizzling Spicy Hungarian",
      "description": "Sliced Hungarian sausage sauteed with onions and spicy sauce on a sizzling plate.",
      "price": 149,
      "image_url": "/images/barracks/sizzling-spicy-hungarian.jpg",
      "is_available": true,
      "dietary_tags": [
          "sausage",
          "spicy",
          "sizzling"
      ]
  },
  {
      "id": "mi-barracks-22",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-3",
      "category_name": "Tactical Bites",
      "name": "Cheese Tempura with Fries",
      "description": "Crispy battered melting cheese sticks served with hot french fries.",
      "price": 209,
      "image_url": "/images/barracks/cheese-tempura-with-fries.jpg",
      "is_available": true,
      "dietary_tags": [
          "cheese",
          "fries",
          "snack"
      ]
  },
  {
      "id": "mi-barracks-23",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-3",
      "category_name": "Tactical Bites",
      "name": "Chicken Fingers",
      "description": "Breaded tender chicken strips fried golden, served with dipping sauce.",
      "price": 209,
      "image_url": "/images/barracks/chicken-fingers.jpg",
      "is_available": true,
      "dietary_tags": [
          "chicken",
          "crispy"
      ]
  },
  {
      "id": "mi-barracks-24",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-3",
      "category_name": "Tactical Bites",
      "name": "Crispy Sweet Chili Chicken",
      "description": "Crispy fried chicken pieces tossed in a sweet and mildly spicy glaze.",
      "price": 209,
      "image_url": "/images/barracks/crispy-sweet-chili-chicken.jpg",
      "is_available": true,
      "dietary_tags": [
          "chicken",
          "sweet-chili",
          "crispy"
      ]
  },
  {
      "id": "mi-barracks-25",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-3",
      "category_name": "Tactical Bites",
      "name": "Pork Katsu",
      "description": "Japanese-style breaded deep-fried pork cutlet with savory katsu sauce.",
      "price": 209,
      "image_url": "/images/barracks/pork-katsu.jpg",
      "is_available": true,
      "dietary_tags": [
          "pork",
          "crispy",
          "japanese"
      ]
  },
  {
      "id": "mi-barracks-26",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-3",
      "category_name": "Tactical Bites",
      "name": "Pork Sisig",
      "description": "Classic minced savory pork with onions and seasonings.",
      "price": 209,
      "image_url": "/images/barracks/pork-sisig.jpg",
      "is_available": true,
      "dietary_tags": [
          "pork",
          "sisig",
          "pulutan",
          "bestseller"
      ]
  },
  {
      "id": "mi-barracks-27",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-3",
      "category_name": "Tactical Bites",
      "name": "Calamares",
      "description": "Tender squid rings coated in seasoned batter and fried golden crisp.",
      "price": 279,
      "image_url": "/images/barracks/calamares.jpg",
      "is_available": true,
      "dietary_tags": [
          "seafood",
          "squid",
          "crispy"
      ]
  },
  {
      "id": "mi-barracks-28",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-3",
      "category_name": "Tactical Bites",
      "name": "Chicken & Mushroom Salpicao",
      "description": "Savory sauteed chicken cubes with fresh mushrooms in garlic Worcestershire sauce.",
      "price": 279,
      "image_url": "/images/barracks/chicken-and-mushroom-salpicao.jpg",
      "is_available": true,
      "dietary_tags": [
          "chicken",
          "mushroom",
          "garlic"
      ]
  },
  {
      "id": "mi-barracks-29",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-4",
      "category_name": "Full Combat Meals",
      "name": "Sizzling Burger Steak",
      "description": "Beef patties smothered in savory mushroom gravy on a sizzling hot plate.",
      "price": 209,
      "image_url": "/images/barracks/sizzling-burger-steak.jpg",
      "is_available": true,
      "dietary_tags": [
          "beef",
          "sizzling",
          "meal"
      ]
  },
  {
      "id": "mi-barracks-30",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-4",
      "category_name": "Full Combat Meals",
      "name": "Sizzling Chicken",
      "description": "Juicy seasoned chicken thigh cutlet served sizzling with rich gravy.",
      "price": 209,
      "image_url": "/images/barracks/sizzling-chicken.jpg",
      "is_available": true,
      "dietary_tags": [
          "chicken",
          "sizzling",
          "meal"
      ]
  },
  {
      "id": "mi-barracks-31",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-4",
      "category_name": "Full Combat Meals",
      "name": "Sizzling Pork Chop",
      "description": "Thick grilled pork chop served on a sizzling hot plate with gravy.",
      "price": 209,
      "image_url": "/images/barracks/sizzling-pork-chop.jpg",
      "is_available": true,
      "dietary_tags": [
          "pork",
          "sizzling",
          "meal"
      ]
  },
  {
      "id": "mi-barracks-32",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-4",
      "category_name": "Full Combat Meals",
      "name": "Sizzling Pork Sisig",
      "description": "Sizzling hot minced pork sisig topped with egg and fresh calamansi.",
      "price": 209,
      "image_url": "/images/barracks/sizzling-pork-sisig-meal.jpg",
      "is_available": true,
      "dietary_tags": [
          "pork",
          "sisig",
          "sizzling",
          "meal"
      ]
  },
  {
      "id": "mi-barracks-33",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-4",
      "category_name": "Full Combat Meals",
      "name": "Sizzling Pork Steak",
      "description": "Tender pork steak simmered in soy-calamansi sauce with caramelized onion rings.",
      "price": 209,
      "image_url": "/images/barracks/sizzling-pork-steak.jpg",
      "is_available": true,
      "dietary_tags": [
          "pork",
          "sizzling",
          "meal"
      ]
  },
  {
      "id": "mi-barracks-34",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-4",
      "category_name": "Full Combat Meals",
      "name": "Grilled Pork Belly",
      "description": "Chargrilled marinated pork belly with smoky flavor and savory basting sauce.",
      "price": 209,
      "image_url": "/images/barracks/grilled-pork-belly.jpg",
      "is_available": true,
      "dietary_tags": [
          "pork",
          "grilled",
          "bbq"
      ]
  },
  {
      "id": "mi-barracks-35",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-4",
      "category_name": "Full Combat Meals",
      "name": "Grilled Tuna",
      "description": "Fresh grilled tuna cutlet seasoned with sea salt, pepper, and calamansi.",
      "price": 209,
      "image_url": "/images/barracks/grilled-tuna.jpg",
      "is_available": true,
      "dietary_tags": [
          "seafood",
          "fish",
          "grilled"
      ]
  },
  {
      "id": "mi-barracks-36",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-5",
      "category_name": "Comfort Bowls",
      "name": "Egg Drop Soup",
      "description": "Warm and silky egg ribbon soup with subtle savory broth.",
      "price": 129,
      "image_url": "/images/barracks/egg-drop-soup.jpg",
      "is_available": true,
      "dietary_tags": [
          "soup",
          "egg",
          "comfort"
      ]
  },
  {
      "id": "mi-barracks-37",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-5",
      "category_name": "Comfort Bowls",
      "name": "Special Lomi",
      "description": "Thick egg noodles in a rich hearty broth loaded with pork, meatballs, and vegetables.",
      "price": 219,
      "image_url": "/images/barracks/special-lomi.jpg",
      "is_available": true,
      "dietary_tags": [
          "noodles",
          "soup",
          "comfort"
      ]
  },
  {
      "id": "mi-barracks-38",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-5",
      "category_name": "Comfort Bowls",
      "name": "Tinolang Isda",
      "description": "Traditional fresh fish ginger soup with lemongrass, chili leaves, and tomatoes.",
      "price": 249,
      "image_url": "/images/barracks/tinolang-isda.jpg",
      "is_available": true,
      "dietary_tags": [
          "seafood",
          "fish",
          "soup",
          "traditional"
      ]
  },
  {
      "id": "mi-barracks-39",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-5",
      "category_name": "Comfort Bowls",
      "name": "Sinigang Hipon",
      "description": "Tangy tamarind soup with fresh succulent shrimp and farm vegetables.",
      "price": 279,
      "image_url": "/images/barracks/sinigang-hipon.jpg",
      "is_available": true,
      "dietary_tags": [
          "seafood",
          "shrimp",
          "soup",
          "sinigang"
      ]
  },
  {
      "id": "mi-barracks-40",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-5",
      "category_name": "Comfort Bowls",
      "name": "Sinigang Baboy",
      "description": "Classic sour tamarind broth with tender pork cuts and crisp kangkong.",
      "price": 279,
      "image_url": "/images/barracks/sinigang-baboy.jpg",
      "is_available": true,
      "dietary_tags": [
          "pork",
          "soup",
          "sinigang",
          "classic"
      ]
  },
  {
      "id": "mi-barracks-41",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-6",
      "category_name": "Battle Pizzas",
      "name": "Hawaiian Beef",
      "description": "Sweet pineapple chunks, seasoned ground beef, tomato sauce, and mozzarella cheese. Any 3 for \u20b1699.",
      "price": 249,
      "image_url": "/images/barracks/hawaiian-beef-pizza.jpg",
      "is_available": true,
      "dietary_tags": [
          "pizza",
          "beef",
          "pineapple",
          "promo"
      ]
  },
  {
      "id": "mi-barracks-42",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-6",
      "category_name": "Battle Pizzas",
      "name": "Bacon",
      "description": "Crispy savory bacon bits over rich mozzarella and tomato sauce. Any 3 for \u20b1699.",
      "price": 249,
      "image_url": "/images/barracks/bacon-pizza.jpg",
      "is_available": true,
      "dietary_tags": [
          "pizza",
          "bacon",
          "pork",
          "promo"
      ]
  },
  {
      "id": "mi-barracks-43",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-6",
      "category_name": "Battle Pizzas",
      "name": "Pepperoni",
      "description": "Generously topped with spicy pepperoni slices and melted mozzarella. Any 3 for \u20b1699.",
      "price": 249,
      "image_url": "/images/barracks/pepperoni-pizza.jpg",
      "is_available": true,
      "dietary_tags": [
          "pizza",
          "pepperoni",
          "promo"
      ]
  },
  {
      "id": "mi-barracks-44",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-6",
      "category_name": "Battle Pizzas",
      "name": "Beef & Cheddar",
      "description": "Savory seasoned beef paired with golden melted cheddar and mozzarella. Any 3 for \u20b1699.",
      "price": 249,
      "image_url": "/images/barracks/beef-and-cheddar-pizza.jpg",
      "is_available": true,
      "dietary_tags": [
          "pizza",
          "beef",
          "cheddar",
          "promo"
      ]
  },
  {
      "id": "mi-barracks-45",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-6",
      "category_name": "Battle Pizzas",
      "name": "Meat Trio",
      "description": "Hearty blend of ground beef, bacon, and sausage on melted mozzarella. Any 3 for \u20b1699.",
      "price": 249,
      "image_url": "/images/barracks/meat-trio-pizza.jpg",
      "is_available": true,
      "dietary_tags": [
          "pizza",
          "meat-lovers",
          "promo"
      ]
  },
  {
      "id": "mi-barracks-46",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-6",
      "category_name": "Battle Pizzas",
      "name": "Sausage Supreme",
      "description": "Loaded with sliced specialty sausages, bell peppers, and mozzarella. Any 3 for \u20b1699.",
      "price": 249,
      "image_url": "/images/barracks/sausage-supreme-pizza.jpg",
      "is_available": true,
      "dietary_tags": [
          "pizza",
          "sausage",
          "promo"
      ]
  },
  {
      "id": "mi-barracks-47",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-7",
      "category_name": "Carb Reloads",
      "name": "Cheesy Beef Burger",
      "description": "Juicy grilled beef patty with melted cheese, lettuce, and special burger sauce.",
      "price": 259,
      "image_url": "/images/barracks/cheesy-beef-burger.jpg",
      "is_available": true,
      "dietary_tags": [
          "burger",
          "beef",
          "cheese"
      ]
  },
  {
      "id": "mi-barracks-48",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-7",
      "category_name": "Carb Reloads",
      "name": "Spaghetti Filipino-Style",
      "description": "Sweet-style meat sauce with sliced hotdogs and grated cheddar cheese.",
      "price": 219,
      "image_url": "/images/barracks/spaghetti-filipino-style.jpg",
      "is_available": true,
      "dietary_tags": [
          "pasta",
          "spaghetti",
          "sweet-style"
      ]
  },
  {
      "id": "mi-barracks-49",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-7",
      "category_name": "Carb Reloads",
      "name": "Spicy Garlic Shrimp Spaghetti",
      "description": "Spaghetti tossed with sauteed prawns, olive oil, garlic, and chili flakes.",
      "price": 269,
      "image_url": "/images/barracks/spicy-garlic-shrimp-spaghetti.jpg",
      "is_available": true,
      "dietary_tags": [
          "pasta",
          "seafood",
          "shrimp",
          "spicy"
      ]
  },
  {
      "id": "mi-barracks-50",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-7",
      "category_name": "Carb Reloads",
      "name": "Bihon Guisado",
      "description": "Stir-fried rice noodles with meat, vegetables, and savory soy-garlic seasoning.",
      "price": 219,
      "image_url": "/images/barracks/bihon-guisado.jpg",
      "is_available": true,
      "dietary_tags": [
          "noodles",
          "pancit",
          "classic"
      ]
  },
  {
      "id": "mi-barracks-51",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-7",
      "category_name": "Carb Reloads",
      "name": "Pancit Canton",
      "description": "Thick egg noodles stir-fried with pork cuts, shrimp, and crisp vegetables.",
      "price": 229,
      "image_url": "/images/barracks/pancit-canton.jpg",
      "is_available": true,
      "dietary_tags": [
          "noodles",
          "canton",
          "classic"
      ]
  },
  {
      "id": "mi-barracks-52",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-7",
      "category_name": "Carb Reloads",
      "name": "Special Bam-I",
      "description": "Cebuano favorite blend of stir-fried canton and bihon noodles with savory toppings.",
      "price": 259,
      "image_url": "/images/barracks/special-bam-i.jpg",
      "is_available": true,
      "dietary_tags": [
          "noodles",
          "bam-i",
          "cebuano",
          "bestseller"
      ]
  },
  {
      "id": "mi-barracks-53",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-8",
      "category_name": "Extra Support",
      "name": "Plain Rice",
      "description": "Steamed fragrant white rice (single cup).",
      "price": 30,
      "image_url": "/images/barracks/plain-rice.jpg",
      "is_available": true,
      "dietary_tags": [
          "rice",
          "side"
      ]
  },
  {
      "id": "mi-barracks-54",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-8",
      "category_name": "Extra Support",
      "name": "Garlic Rice",
      "description": "Fried white rice tossed with aromatic golden toasted garlic.",
      "price": 40,
      "image_url": "/images/barracks/garlic-rice.jpg",
      "is_available": true,
      "dietary_tags": [
          "rice",
          "garlic",
          "side"
      ]
  },
  {
      "id": "mi-barracks-55",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "category_id": "cat-barracks-8",
      "category_name": "Extra Support",
      "name": "Platter Rice",
      "description": "Generous platter of steamed white rice good for sharing (4-5 persons).",
      "price": 129,
      "image_url": "/images/barracks/platter-rice.jpg",
      "is_available": true,
      "dietary_tags": [
          "rice",
          "sharing",
          "platter"
      ]
  },
];
