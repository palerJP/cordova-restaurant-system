import type { MenuItem, MenuCategory } from '@/lib/types';

export const TEN_THOUSAND_ROSES_CATEGORIES: MenuCategory[] = [
  {
    "id": "cat-10kr-1",
    "restaurant_id": "10000-roses-cafe-and-more",
    "name": "Pasta & Pizza",
    "sort_order": 1
  },
  {
    "id": "cat-10kr-2",
    "restaurant_id": "10000-roses-cafe-and-more",
    "name": "Chef Picks & Snacks",
    "sort_order": 2
  },
  {
    "id": "cat-10kr-3",
    "restaurant_id": "10000-roses-cafe-and-more",
    "name": "Special Sets",
    "sort_order": 3
  },
  {
    "id": "cat-10kr-4",
    "restaurant_id": "10000-roses-cafe-and-more",
    "name": "Desserts & Crepe Cakes",
    "sort_order": 4
  },
  {
    "id": "cat-10kr-5",
    "restaurant_id": "10000-roses-cafe-and-more",
    "name": "Espresso & Coffee",
    "sort_order": 5
  },
  {
    "id": "cat-10kr-6",
    "restaurant_id": "10000-roses-cafe-and-more",
    "name": "Pearl Drinks & Milk Tea",
    "sort_order": 6
  },
  {
    "id": "cat-10kr-7",
    "restaurant_id": "10000-roses-cafe-and-more",
    "name": "Ice Blended & Real Fruit Smoothies",
    "sort_order": 7
  },
  {
    "id": "cat-10kr-8",
    "restaurant_id": "10000-roses-cafe-and-more",
    "name": "Coffee-Free & Drinks",
    "sort_order": 8
  }
];

export const TEN_THOUSAND_ROSES_MENU_ITEMS: MenuItem[] = [
  {
    "id": "mi-10kr-1",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-1",
    "category_name": "Pasta & Pizza",
    "name": "Aglio Olio",
    "description": "Classic al dente pasta tossed in fragrant extra virgin olive oil, garlic slivers, and chili flakes.",
    "price": 320,
    "image_url": "",
    "is_available": true,
    "dietary_tags": [
      "pasta",
      "italian",
      "garlic"
    ]
  },
  {
    "id": "mi-10kr-2",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-1",
    "category_name": "Pasta & Pizza",
    "name": "Marinara Pasta",
    "description": "Rich tomato marinara sauce infused with herbs and served over tender pasta. (Barista & Chef Pick)",
    "price": 370,
    "image_url": "",
    "is_available": true,
    "dietary_tags": [
      "pasta",
      "bestseller",
      "italian"
    ]
  },
  {
    "id": "mi-10kr-3",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-1",
    "category_name": "Pasta & Pizza",
    "name": "Carbonara Pasta",
    "description": "Creamy rich egg and parmesan cream sauce with savory bacon bits and black pepper. (Best Seller)",
    "price": 370,
    "image_url": "",
    "is_available": true,
    "dietary_tags": [
      "pasta",
      "bestseller",
      "creamy"
    ]
  },
  {
    "id": "mi-10kr-4",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-1",
    "category_name": "Pasta & Pizza",
    "name": "Bacon Pasta",
    "description": "Savory saut�ed bacon tossed with garlic, herbs, and pasta in a light savory sauce.",
    "price": 370,
    "image_url": "",
    "is_available": true,
    "dietary_tags": [
      "pasta",
      "bacon"
    ]
  },
  {
    "id": "mi-10kr-5",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-1",
    "category_name": "Pasta & Pizza",
    "name": "Margherita Pizza",
    "description": "Crisp crust topped with aromatic tomato sauce, melted mozzarella, and fresh basil leaves. (Best Seller)",
    "price": 395,
    "image_url": "",
    "is_available": true,
    "dietary_tags": [
      "pizza",
      "bestseller",
      "vegetarian"
    ]
  },
  {
    "id": "mi-10kr-6",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-1",
    "category_name": "Pasta & Pizza",
    "name": "Hawaiian Pizza",
    "description": "Fresh baked pizza loaded with sweet pineapple chunks, sliced savory ham, and mozzarella cheese.",
    "price": 395,
    "image_url": "",
    "is_available": true,
    "dietary_tags": [
      "pizza",
      "pineapple",
      "ham"
    ]
  },
  {
    "id": "mi-10kr-7",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-1",
    "category_name": "Pasta & Pizza",
    "name": "Mushroom Pizza",
    "description": "Earthy sliced mushrooms with melted mozzarella and garlic herbs on thin crust.",
    "price": 395,
    "image_url": "",
    "is_available": true,
    "dietary_tags": [
      "pizza",
      "mushroom",
      "vegetarian"
    ]
  },
  {
    "id": "mi-10kr-8",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-2",
    "category_name": "Chef Picks & Snacks",
    "name": "Korean Spicy Noodle",
    "description": "Spicy savory Korean ramen noodles with rich broth and seaweed sesame garnish. (Add Egg +?15, Add Cheese +?30)",
    "price": 195,
    "image_url": "",
    "is_available": true,
    "dietary_tags": [
      "korean",
      "spicy",
      "noodles",
      "bestseller"
    ]
  },
  {
    "id": "mi-10kr-9",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-2",
    "category_name": "Chef Picks & Snacks",
    "name": "French Fries",
    "description": "Crisp golden potato fries lightly salted and served hot with dip.",
    "price": 235,
    "image_url": "",
    "is_available": true,
    "dietary_tags": [
      "fries",
      "snacks"
    ]
  },
  {
    "id": "mi-10kr-10",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-2",
    "category_name": "Chef Picks & Snacks",
    "name": "Cheese French Fries",
    "description": "Golden fries generously drizzled with warm cheddar cheese sauce.",
    "price": 265,
    "image_url": "",
    "is_available": true,
    "dietary_tags": [
      "fries",
      "cheese",
      "snacks"
    ]
  },
  {
    "id": "mi-10kr-11",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-2",
    "category_name": "Chef Picks & Snacks",
    "name": "Cheese Nacho Chips",
    "description": "Crunchy tortilla chips loaded with melted cheese sauce and savory toppings.",
    "price": 265,
    "image_url": "",
    "is_available": true,
    "dietary_tags": [
      "nachos",
      "cheese",
      "snacks"
    ]
  },
  {
    "id": "mi-10kr-12",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-2",
    "category_name": "Chef Picks & Snacks",
    "name": "Mozzarella Cheese Sticks",
    "description": "Crispy breaded mozzarella sticks with stringy melted cheese center. (Special Promo)",
    "price": 265,
    "image_url": "",
    "is_available": true,
    "dietary_tags": [
      "cheese",
      "promo",
      "finger-food"
    ]
  },
  {
    "id": "mi-10kr-13",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-2",
    "category_name": "Chef Picks & Snacks",
    "name": "Pop Dumpling (Mandu)",
    "description": "Crispy bite-sized Korean pork and vegetable dumplings served with savory dip. (Best Seller)",
    "price": 280,
    "image_url": "",
    "is_available": true,
    "dietary_tags": [
      "dumplings",
      "korean",
      "bestseller"
    ]
  },
  {
    "id": "mi-10kr-14",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-2",
    "category_name": "Chef Picks & Snacks",
    "name": "Crispy Calamari",
    "description": "Tender squid rings fried in light seasoned batter, served golden with tartar dip.",
    "price": 320,
    "image_url": "",
    "is_available": true,
    "dietary_tags": [
      "seafood",
      "calamari",
      "crispy"
    ]
  },
  {
    "id": "mi-10kr-15",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-2",
    "category_name": "Chef Picks & Snacks",
    "name": "Nel's Chicken Wings",
    "description": "Juicy fried chicken wings glazed with specialty house sauce. (Best Seller)",
    "price": 360,
    "image_url": "",
    "is_available": true,
    "dietary_tags": [
      "chicken",
      "wings",
      "bestseller"
    ]
  },
  {
    "id": "mi-10kr-16",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-3",
    "category_name": "Special Sets",
    "name": "Pop Dumpling Mandu with 2 Sodas",
    "description": "Crispy Korean pop dumplings set meal served with 2 cold sodas. (Soda can be changed to Beer +?50)",
    "price": 399,
    "image_url": "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "combo",
      "set-meal",
      "bestseller"
    ]
  },
  {
    "id": "mi-10kr-17",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-3",
    "category_name": "Special Sets",
    "name": "Crispy Calamari with 2 Sodas",
    "description": "Golden fried calamari squid rings served with 2 cold sodas. (Soda can be changed to Beer +?50)",
    "price": 439,
    "image_url": "",
    "is_available": true,
    "dietary_tags": [
      "combo",
      "set-meal",
      "seafood"
    ]
  },
  {
    "id": "mi-10kr-18",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-3",
    "category_name": "Special Sets",
    "name": "Nel's Chicken Wings with 2 Sodas",
    "description": "House favorite Nel's chicken wings served with 2 cold sodas. (Soda can be changed to Beer +?50)",
    "price": 479,
    "image_url": "",
    "is_available": true,
    "dietary_tags": [
      "combo",
      "set-meal",
      "chicken"
    ]
  },
  {
    "id": "mi-10kr-19",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-4",
    "category_name": "Desserts & Crepe Cakes",
    "name": "Tiramisu Crepe Cake",
    "description": "Delicate multi-layered French mille crepe with espresso coffee cream and rich cocoa dusting.",
    "price": 185,
    "image_url": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "dessert",
      "crepe-cake",
      "tiramisu"
    ]
  },
  {
    "id": "mi-10kr-20",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-4",
    "category_name": "Desserts & Crepe Cakes",
    "name": "Matcha Crepe Cake",
    "description": "Thin delicate crepe layers infused with Japanese Uji green tea matcha cream.",
    "price": 185,
    "image_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "dessert",
      "matcha",
      "crepe-cake"
    ]
  },
  {
    "id": "mi-10kr-21",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-4",
    "category_name": "Desserts & Crepe Cakes",
    "name": "Cocoa Crepe Cake",
    "description": "Indulgent Belgian cocoa crepe layers filled with dark chocolate cream.",
    "price": 185,
    "image_url": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "dessert",
      "chocolate",
      "crepe-cake"
    ]
  },
  {
    "id": "mi-10kr-22",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-4",
    "category_name": "Desserts & Crepe Cakes",
    "name": "Vanilla Melting Muffin",
    "description": "Warm oven-baked vanilla muffin with a molten lava center that melts in your mouth. (Must Try)",
    "price": 195,
    "image_url": "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "dessert",
      "muffin",
      "must-try"
    ]
  },
  {
    "id": "mi-10kr-23",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-5",
    "category_name": "Espresso & Coffee",
    "name": "Espresso (Hot)",
    "description": "Intense and rich single-shot espresso with golden crema.",
    "price": 130,
    "image_url": "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "coffee",
      "hot",
      "espresso"
    ]
  },
  {
    "id": "mi-10kr-24",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-5",
    "category_name": "Espresso & Coffee",
    "name": "Americano (Hot / Iced)",
    "description": "Bold espresso shots lengthened with hot water or poured over ice (Hot ?135 / Iced ?145).",
    "price": 135,
    "image_url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "coffee",
      "americano"
    ]
  },
  {
    "id": "mi-10kr-25",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-5",
    "category_name": "Espresso & Coffee",
    "name": "Cappuccino (Hot / Iced)",
    "description": "Smooth espresso topped with thick velvety steamed milk foam and cocoa dusting (Hot ?165 / Iced ?175).",
    "price": 165,
    "image_url": "https://images.unsplash.com/photo-1534778101976-62847782c213?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "coffee",
      "cappuccino"
    ]
  },
  {
    "id": "mi-10kr-26",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-5",
    "category_name": "Espresso & Coffee",
    "name": "Cafe Latte (Hot / Iced)",
    "description": "Silky micro-foam steamed milk balanced with rich dark roast espresso (Hot ?165 / Iced ?175).",
    "price": 165,
    "image_url": "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "coffee",
      "latte"
    ]
  },
  {
    "id": "mi-10kr-27",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-5",
    "category_name": "Espresso & Coffee",
    "name": "Cafe Mocha (Hot / Iced)",
    "description": "Espresso infused with rich dark chocolate syrup and steamed milk (Hot ?170 / Iced ?180).",
    "price": 170,
    "image_url": "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "coffee",
      "mocha",
      "chocolate"
    ]
  },
  {
    "id": "mi-10kr-28",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-5",
    "category_name": "Espresso & Coffee",
    "name": "Caramel Latte (Hot / Iced)",
    "description": "Signature espresso and milk drizzled with buttery sweet caramel syrup (Hot ?175 / Iced ?185). (Best Seller)",
    "price": 175,
    "image_url": "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "coffee",
      "caramel",
      "bestseller"
    ]
  },
  {
    "id": "mi-10kr-29",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-5",
    "category_name": "Espresso & Coffee",
    "name": "Vanilla Latte (Hot / Iced)",
    "description": "Fragrant French vanilla syrup combined with espresso and milk (Hot ?170 / Iced ?180).",
    "price": 170,
    "image_url": "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "coffee",
      "vanilla"
    ]
  },
  {
    "id": "mi-10kr-30",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-6",
    "category_name": "Pearl Drinks & Milk Tea",
    "name": "Cafe Latte with Black Pearl (Iced)",
    "description": "Creamy iced latte served with chewy brown sugar tapioca boba pearls.",
    "price": 185,
    "image_url": "https://images.unsplash.com/photo-1558857563-b37cfb9195b8?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "boba",
      "pearl",
      "coffee",
      "iced"
    ]
  },
  {
    "id": "mi-10kr-31",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-6",
    "category_name": "Pearl Drinks & Milk Tea",
    "name": "Cafe Mocha with Black Pearl (Iced)",
    "description": "Iced chocolate mocha infused with black tapioca pearls.",
    "price": 190,
    "image_url": "https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "boba",
      "pearl",
      "mocha",
      "iced"
    ]
  },
  {
    "id": "mi-10kr-32",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-6",
    "category_name": "Pearl Drinks & Milk Tea",
    "name": "Caramel Latte with Black Pearl (Iced)",
    "description": "Iced caramel latte layered over brown sugar black pearls.",
    "price": 195,
    "image_url": "https://images.unsplash.com/photo-1558857563-b37cfb9195b8?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "boba",
      "pearl",
      "caramel",
      "iced"
    ]
  },
  {
    "id": "mi-10kr-33",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-6",
    "category_name": "Pearl Drinks & Milk Tea",
    "name": "Taro Milk Tea with Pearl (Iced)",
    "description": "Sweet and fragrant purple taro milk tea loaded with chewy black pearls.",
    "price": 180,
    "image_url": "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "milktea",
      "taro",
      "boba",
      "iced"
    ]
  },
  {
    "id": "mi-10kr-34",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-6",
    "category_name": "Pearl Drinks & Milk Tea",
    "name": "Okinawa Milk Tea with Pearl (Iced)",
    "description": "Roasted brown sugar Okinawa black milk tea with soft tapioca pearls.",
    "price": 180,
    "image_url": "https://images.unsplash.com/photo-1558857563-b37cfb9195b8?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "milktea",
      "okinawa",
      "boba",
      "iced"
    ]
  },
  {
    "id": "mi-10kr-35",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-6",
    "category_name": "Pearl Drinks & Milk Tea",
    "name": "Matcha Milk Tea with Pearl (Iced)",
    "description": "Earthy Japanese matcha milk tea combined with black boba pearls.",
    "price": 185,
    "image_url": "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "milktea",
      "matcha",
      "boba",
      "iced"
    ]
  },
  {
    "id": "mi-10kr-36",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-6",
    "category_name": "Pearl Drinks & Milk Tea",
    "name": "Wintermelon Milk Tea with Pearl (Iced)",
    "description": "Refreshing sweet wintermelon brewed milk tea with chewy black pearls.",
    "price": 180,
    "image_url": "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "milktea",
      "wintermelon",
      "boba",
      "iced"
    ]
  },
  {
    "id": "mi-10kr-37",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-7",
    "category_name": "Ice Blended & Real Fruit Smoothies",
    "name": "Mocha Frappe (Iced)",
    "description": "Ice blended coffee and dark chocolate frappe crowned with whipped cream. (Best Seller)",
    "price": 185,
    "image_url": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "frappe",
      "mocha",
      "bestseller"
    ]
  },
  {
    "id": "mi-10kr-38",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-7",
    "category_name": "Ice Blended & Real Fruit Smoothies",
    "name": "Nutella Choco Frappe (Iced)",
    "description": "Decadent hazelnut Nutella chocolate blended with ice and whipped cream. (Best Seller)",
    "price": 185,
    "image_url": "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "frappe",
      "nutella",
      "chocolate",
      "bestseller"
    ]
  },
  {
    "id": "mi-10kr-39",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-7",
    "category_name": "Ice Blended & Real Fruit Smoothies",
    "name": "Nutella Mocha Frappe (Iced)",
    "description": "Rich Nutella hazelnut blended with espresso shots and chocolate. (Best Seller)",
    "price": 195,
    "image_url": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "frappe",
      "nutella",
      "coffee",
      "bestseller"
    ]
  },
  {
    "id": "mi-10kr-40",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-7",
    "category_name": "Ice Blended & Real Fruit Smoothies",
    "name": "Matcha Frappe (Iced)",
    "description": "Japanese matcha green tea blended with milk and crushed ice.",
    "price": 180,
    "image_url": "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "frappe",
      "matcha"
    ]
  },
  {
    "id": "mi-10kr-41",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-7",
    "category_name": "Ice Blended & Real Fruit Smoothies",
    "name": "Caramel Frappe (Iced)",
    "description": "Smooth blended caramel coffee drink with whipped topping and caramel drizzle. (New)",
    "price": 190,
    "image_url": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "frappe",
      "caramel"
    ]
  },
  {
    "id": "mi-10kr-42",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-7",
    "category_name": "Ice Blended & Real Fruit Smoothies",
    "name": "Strawberry Yogurt Smoothie (Iced)",
    "description": "Real strawberry fruit blended with creamy tart yogurt.",
    "price": 235,
    "image_url": "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "smoothie",
      "strawberry",
      "yogurt"
    ]
  },
  {
    "id": "mi-10kr-43",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-7",
    "category_name": "Ice Blended & Real Fruit Smoothies",
    "name": "Strawberry and Banana Smoothie (Iced)",
    "description": "Fresh strawberries and ripe bananas blended with crushed ice and milk.",
    "price": 235,
    "image_url": "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "smoothie",
      "banana",
      "strawberry"
    ]
  },
  {
    "id": "mi-10kr-44",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-7",
    "category_name": "Ice Blended & Real Fruit Smoothies",
    "name": "Fresh Mango / Mango Yogurt Smoothie (Iced)",
    "description": "Sweet Cebu mangoes blended fresh or with creamy yogurt.",
    "price": 235,
    "image_url": "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "smoothie",
      "mango",
      "cebu-mango"
    ]
  },
  {
    "id": "mi-10kr-45",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-7",
    "category_name": "Ice Blended & Real Fruit Smoothies",
    "name": "Watermelon Smoothie (Iced)",
    "description": "Crisp fresh red watermelon blended icy cold and refreshing.",
    "price": 235,
    "image_url": "https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "smoothie",
      "watermelon",
      "fruit"
    ]
  },
  {
    "id": "mi-10kr-46",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-8",
    "category_name": "Coffee-Free & Drinks",
    "name": "Signature Chocolate (Hot / Iced)",
    "description": "Rich velvety European hot cocoa or over ice with chocolate swirl (Hot ?140 / Iced ?150). (Best Seller)",
    "price": 140,
    "image_url": "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "chocolate",
      "hot-chocolate",
      "bestseller"
    ]
  },
  {
    "id": "mi-10kr-47",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-8",
    "category_name": "Coffee-Free & Drinks",
    "name": "Matcha Tea Latte (Hot / Iced)",
    "description": "Steamed milk infused with pure green tea matcha powder (Hot ?165 / Iced ?175).",
    "price": 165,
    "image_url": "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "matcha",
      "latte"
    ]
  },
  {
    "id": "mi-10kr-48",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-8",
    "category_name": "Coffee-Free & Drinks",
    "name": "10K Roserita Cocktail (Mango / Strawberry)",
    "description": "Signature fruity cafe margarita blend served with complimentary seasoned peanuts (Plain/Spicy/Garlic/Sweet). (Try It)",
    "price": 350,
    "image_url": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "cocktail",
      "roserita",
      "signature"
    ]
  },
  {
    "id": "mi-10kr-49",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-8",
    "category_name": "Coffee-Free & Drinks",
    "name": "Beer Bucket (5 Bottles)",
    "description": "Bucket of 5 ice-cold beers served with free peanuts (Plain/Spicy/Garlic/Sweet).",
    "price": 499,
    "image_url": "https://images.unsplash.com/photo-1608270191992-d6d71b3e7784?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "beer",
      "alcoholic",
      "bucket"
    ]
  },
  {
    "id": "mi-10kr-50",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-8",
    "category_name": "Coffee-Free & Drinks",
    "name": "San Miguel Beer (Pilsen / Light / Flavored / Red Horse)",
    "description": "Chilled bottle of beer with free seasoned peanuts.",
    "price": 105,
    "image_url": "https://images.unsplash.com/photo-1608270191992-d6d71b3e7784?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "beer",
      "alcoholic"
    ]
  },
  {
    "id": "mi-10kr-51",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-8",
    "category_name": "Coffee-Free & Drinks",
    "name": "Soda Can (Coke, Coke Zero, Sprite, Royal, Cali)",
    "description": "Refreshing chilled 330ml canned soda.",
    "price": 90,
    "image_url": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "soda",
      "beverage"
    ]
  },
  {
    "id": "mi-10kr-52",
    "restaurant_id": "10000-roses-cafe-and-more",
    "category_id": "cat-10kr-8",
    "category_name": "Coffee-Free & Drinks",
    "name": "Bottled Mineral Water (500ml)",
    "description": "Purified mineral drinking water.",
    "price": 55,
    "image_url": "https://images.unsplash.com/photo-1559839914-17aae19cec71?w=600&auto=format&fit=crop&q=80",
    "is_available": true,
    "dietary_tags": [
      "water",
      "beverage"
    ]
  }
];
