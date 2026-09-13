import type { MenuItem, MenuCategory } from '@/lib/types';

export const TAYTAYAN_CATEGORIES: MenuCategory[] = [
  {
    "id": "cat-taytayan-1",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "name": "Short Orders & Appetizers",
    "sort_order": 1
  },
  {
    "id": "cat-taytayan-2",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "name": "All Day Breakfast",
    "sort_order": 2
  },
  {
    "id": "cat-taytayan-3",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "name": "Native Soups & Broths",
    "sort_order": 3
  },
  {
    "id": "cat-taytayan-4",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "name": "Manok Bisaya (Native Chicken)",
    "sort_order": 4
  },
  {
    "id": "cat-taytayan-5",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "name": "Seafood Specialties",
    "sort_order": 5
  },
  {
    "id": "cat-taytayan-6",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "name": "Kanding (Goat Dishes)",
    "sort_order": 6
  },
  {
    "id": "cat-taytayan-7",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "name": "Charcoal Grilled & BBQ",
    "sort_order": 7
  },
  {
    "id": "cat-taytayan-8",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "name": "Meat & Pork Dishes",
    "sort_order": 8
  },
  {
    "id": "cat-taytayan-9",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "name": "Rice & Extras",
    "sort_order": 9
  },
  {
    "id": "cat-taytayan-10",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "name": "Beverages & Cold Drinks",
    "sort_order": 10
  },
  {
    "id": "cat-taytayan-11",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "name": "Coffee",
    "sort_order": 11
  }
];

export const TAYTAYAN_MENU_ITEMS: MenuItem[] = [
  {
    "id": "mi-taytayan-1",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-1",
    "category_name": "Short Orders & Appetizers",
    "name": "chicharon bulaklak",
    "description": "For reference: Crispy chicharon bulaklak with a rich, savory bite.",
    "price": 312,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/Products/64548739.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-2",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-1",
    "category_name": "Short Orders & Appetizers",
    "name": "pancit canton/gisado",
    "description": "For reference: Stir-fried noodles with vegetables, meat, and savory sauce, a flavorful Filipino comfort dish.",
    "price": 324,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/Products/64548742.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-3",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-1",
    "category_name": "Short Orders & Appetizers",
    "name": "french fries",
    "description": "For reference: Golden and crispy potato fries.",
    "price": 90,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/Products/64548750.jpg",
    "is_available": true,
    "dietary_tags": [
      "vegetarian"
    ]
  },
  {
    "id": "mi-taytayan-4",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-1",
    "category_name": "Short Orders & Appetizers",
    "name": "chop suey",
    "description": "For reference: Chop suey with stir-fried vegetables.",
    "price": 336,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/Products/64548755.jpg",
    "is_available": true,
    "dietary_tags": [
      "vegetarian"
    ]
  },
  {
    "id": "mi-taytayan-5",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-1",
    "category_name": "Short Orders & Appetizers",
    "name": "pinakbet",
    "description": "For reference: Flavorful pinakbet with a mix of fresh vegetables.",
    "price": 276,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/Products/64548763.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-6",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-1",
    "category_name": "Short Orders & Appetizers",
    "name": "spring rolls",
    "description": "For reference only: Crispy fried or fresh rolls filled with vegetables and sometimes meat.",
    "price": 144,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/Products/64548766.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-7",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-1",
    "category_name": "Short Orders & Appetizers",
    "name": "lomi",
    "description": "For reference: Enjoy a hearty bowl of Filipino-style noodle soup with tender meat, vegetables, and a savory broth.",
    "price": 336,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/products/64548772.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-8",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-1",
    "category_name": "Short Orders & Appetizers",
    "name": "calamares",
    "description": "For reference: Delicious deep-fried squid rings.",
    "price": 408,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/Products/64548774.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-9",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-1",
    "category_name": "Short Orders & Appetizers",
    "name": "lumpia shanghai",
    "description": "For reference only: Delight in the crispy and flavorful goodness of Lumpia Shanghai!",
    "price": 324,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/Products/64548778.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-10",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-1",
    "category_name": "Short Orders & Appetizers",
    "name": "kropek",
    "description": "For reference only: Dive into a delightful snacking experience with the Kropek, the light and airy shrimp chips that pack a punch of umami goodness.",
    "price": 70,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/Products/64548784.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-11",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-1",
    "category_name": "Short Orders & Appetizers",
    "name": "eggplant salad",
    "description": "For reference: Smoky and tangy eggplant salad with fresh flavors.",
    "price": 216,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/Products/64548787.jpg",
    "is_available": true,
    "dietary_tags": [
      "vegetarian"
    ]
  },
  {
    "id": "mi-taytayan-12",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-2",
    "category_name": "All Day Breakfast",
    "name": "chorizo binungkag",
    "description": "For reference: Spicy sausage mixed with eggs, served with rice and vegetables for a hearty meal.",
    "price": 264,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/LH/qm4q-listing.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-13",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-2",
    "category_name": "All Day Breakfast",
    "name": "corned beef",
    "description": "For reference: A savory, tender corned beef dish with a rich familiar taste.",
    "price": 264,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/products/64548791.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-14",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-3",
    "category_name": "Native Soups & Broths",
    "name": "utan bisaya",
    "description": "For reference: Hearty vegetable soup with a rich flavor.",
    "price": 276,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/Products/64548748.jpg",
    "is_available": true,
    "dietary_tags": [
      "vegetarian"
    ]
  },
  {
    "id": "mi-taytayan-15",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-3",
    "category_name": "Native Soups & Broths",
    "name": "balbacua",
    "description": "For reference only: Indulge in the authentic taste of the Balbacua, a culinary delight that showcases the unique blend of local herbs and spices.",
    "price": 384,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/Products/64548758.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-16",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-3",
    "category_name": "Native Soups & Broths",
    "name": "cansi",
    "description": "For reference: Sour and savory with a deeply comforting beef broth.",
    "price": 540,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/LH/qm4q-listing.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-17",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-3",
    "category_name": "Native Soups & Broths",
    "name": "sinigang shrimp",
    "description": "For reference only: Sinigang shrimp, a flavorful and tangy seafood soup.",
    "price": 420,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/LH/qm4q-listing.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-18",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-3",
    "category_name": "Native Soups & Broths",
    "name": "sinigang pork",
    "description": "For reference: Pork in sour tamarind soup.",
    "price": 408,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/products/64548785.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-19",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-3",
    "category_name": "Native Soups & Broths",
    "name": "tambayan",
    "description": "For reference: A savory broth with tender meat, vegetables, and aromatic spices, perfect for sharing.",
    "price": 276,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/Products/64548786.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-20",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-3",
    "category_name": "Native Soups & Broths",
    "name": "linarang bakasi",
    "description": "For reference: Rich, savory, zesty, and satisfying.",
    "price": 228,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/LH/qm4q-listing.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-21",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-3",
    "category_name": "Native Soups & Broths",
    "name": "pocher0",
    "description": "For reference: A flavorful broth with tender meat, vegetables, and aromatic herbs, served hot.",
    "price": 648,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/Products/64548793.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-22",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-4",
    "category_name": "Manok Bisaya (Native Chicken)",
    "name": "deep fried",
    "description": "For reference: Crispy fried chicken served with a flavorful dipping sauce and traditional sides.",
    "price": 564,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/products/64548746.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-23",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-4",
    "category_name": "Manok Bisaya (Native Chicken)",
    "name": "tinola",
    "description": "For reference only: A comforting Filipino soup made with chicken, green papaya, and leafy greens in a ginger-flavored broth.",
    "price": 456,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/Products/64548769.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-24",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-5",
    "category_name": "Seafood Specialties",
    "name": "crispy squid",
    "description": "For reference: Deep-fried crispy baby squid.",
    "price": 408,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/Products/64548740.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-25",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-5",
    "category_name": "Seafood Specialties",
    "name": "squid adobao",
    "description": "For reference: Savory Squid Adobao.",
    "price": 408,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/Products/64548776.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-26",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-5",
    "category_name": "Seafood Specialties",
    "name": "shrimp in garlic",
    "description": "For reference: Succulent shrimp sautéed in aromatic garlic, creating a flavorful and savory seafood delight.",
    "price": 360,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/LH/qm4q-listing.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-27",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-5",
    "category_name": "Seafood Specialties",
    "name": "sa-ang",
    "description": "For reference: A flavorful dish featuring marinated meat, grilled to perfection, often served with fresh herbs.",
    "price": 288,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/Products/64548782.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-28",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-5",
    "category_name": "Seafood Specialties",
    "name": "baked scallops",
    "description": "For reference: Indulge in the succulent flavors of Baked Scallops.",
    "price": 252,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/Products/64548797.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-29",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-6",
    "category_name": "Kanding (Goat Dishes)",
    "name": "sinampalocan",
    "description": "For reference: A sour tamarind soup with tender goat meat and vegetables, served hot.",
    "price": 372,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/Products/64548741.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-30",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-6",
    "category_name": "Kanding (Goat Dishes)",
    "name": "kilawin",
    "description": "For reference: A tangy and refreshing dish, perfect for those who enjoy a zesty, citrus-marinated flavor.",
    "price": 252,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/Products/64548757.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-31",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-6",
    "category_name": "Kanding (Goat Dishes)",
    "name": "kaldereta",
    "description": "For reference: Filipino-style tomato-based stew.",
    "price": 468,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/Products/64548783.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-32",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-7",
    "category_name": "Charcoal Grilled & BBQ",
    "name": "pork barbeque",
    "description": "For reference: Tender pork barbecue with a smoky, slightly sweet glaze, perfect for a flavorful bite.",
    "price": 70,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/Products/64548752.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-33",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-7",
    "category_name": "Charcoal Grilled & BBQ",
    "name": "tuna panga - small",
    "description": "For reference: Grilled small tuna belly, tender and flavorful, served with a zesty sauce.",
    "price": 156,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/LH/qm4q-listing.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-34",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-7",
    "category_name": "Charcoal Grilled & BBQ",
    "name": "spicy isaw",
    "description": "For reference: Grilled skewers of marinated intestines, seasoned with spices, offering a smoky and savory flavor.",
    "price": 60,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/Products/64548762.jpg",
    "is_available": true,
    "dietary_tags": [
      "spicy"
    ]
  },
  {
    "id": "mi-taytayan-35",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-7",
    "category_name": "Charcoal Grilled & BBQ",
    "name": "tuna panga - large",
    "description": "For reference: Grilled large tuna belly, tender and flavorful, served with a zesty sauce.",
    "price": 324,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/LH/qm4q-listing.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-36",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-7",
    "category_name": "Charcoal Grilled & BBQ",
    "name": "grilled squid",
    "description": "For reference only: Savor the irresistible goodness of this Grilled Squid, as the tender and smoky flavor leaves a lasting impression.",
    "price": 408,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/LH/qm4q-listing.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-37",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-8",
    "category_name": "Meat & Pork Dishes",
    "name": "crispy pata",
    "description": "For reference: Crispy pata with a crunchy skin and tender, flavorful meat.",
    "price": 780,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/Products/64548751.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-38",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-8",
    "category_name": "Meat & Pork Dishes",
    "name": "sizzling sisig",
    "description": "For reference: Crispy and flavorful sizzling sisig.",
    "price": 252,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/Products/64548754.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-39",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-8",
    "category_name": "Meat & Pork Dishes",
    "name": "chili chicken",
    "description": "For reference: Spicy chicken dish, often deep-fried and tossed in a tangy chili sauce.",
    "price": 420,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/Products/64548768.jpg",
    "is_available": true,
    "dietary_tags": [
      "spicy"
    ]
  },
  {
    "id": "mi-taytayan-40",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-8",
    "category_name": "Meat & Pork Dishes",
    "name": "lechon kawali",
    "description": "For reference only: Delicious crispy pork belly.",
    "price": 408,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/Products/64548770.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-41",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-8",
    "category_name": "Meat & Pork Dishes",
    "name": "battered chicken",
    "description": "For reference: Crispy Battered Chicken.",
    "price": 384,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/Products/64548779.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-42",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-8",
    "category_name": "Meat & Pork Dishes",
    "name": "sweet & sour pork",
    "description": "For reference: Tangy and savory sweet & sour pork with a perfect balance of flavors.",
    "price": 432,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/Products/64548792.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-43",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-8",
    "category_name": "Meat & Pork Dishes",
    "name": "Dinuguan",
    "description": "New",
    "price": 210,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/Products/91320169.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-44",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-9",
    "category_name": "Rice & Extras",
    "name": "taytayan fried rice",
    "description": "For reference: Savory fried rice with vegetables, spices, and a hint of smokiness, served hot.",
    "price": 250,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/LH/qm4q-listing.jpg",
    "is_available": true,
    "dietary_tags": [
      "vegetarian"
    ]
  },
  {
    "id": "mi-taytayan-45",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-9",
    "category_name": "Rice & Extras",
    "name": "unli rice (per cup)",
    "description": "For reference: Unlimited rice served by the cup, perfect for hearty meals and satisfying appetites.",
    "price": 50,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/LH/qm4q-listing.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-46",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-10",
    "category_name": "Beverages & Cold Drinks",
    "name": "1L Coke",
    "description": "For reference: Quench your thirst with Coke.",
    "price": 90,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/products/64548743.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-47",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-10",
    "category_name": "Beverages & Cold Drinks",
    "name": "Coke Mismo",
    "description": "For reference: Classic Coke Mismo with a crisp, refreshing taste.",
    "price": 50,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/products/66831510.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-48",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-10",
    "category_name": "Beverages & Cold Drinks",
    "name": "Coke Zero",
    "description": "For reference: Crisp and refreshing cola with zero sugar.",
    "price": 80,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/products/67182399.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-49",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-10",
    "category_name": "Beverages & Cold Drinks",
    "name": "Sprite Mismo",
    "description": "For reference: A cold and fizzy Sprite in a convenient bottle.",
    "price": 50,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/products/66831512.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-50",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-10",
    "category_name": "Beverages & Cold Drinks",
    "name": "bottled water",
    "description": "For reference: Refreshing bottled water to keep you hydrated throughout the day.",
    "price": 30,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/products/64548744.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-51",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-10",
    "category_name": "Beverages & Cold Drinks",
    "name": "shakes",
    "description": "For reference: Cold and creamy with smooth, sweet flavors.",
    "price": 110,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/LH/qm4q-listing.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-52",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-10",
    "category_name": "Beverages & Cold Drinks",
    "name": "Del Monte Pineapple Juice",
    "description": "For Reference: Refreshing pineapple juice from Del Monte.",
    "price": 80,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/products/67182384.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-53",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-10",
    "category_name": "Beverages & Cold Drinks",
    "name": "Del Monte Mango Juice",
    "description": "For reference: Sweet and juicy with a tropical mango burst.",
    "price": 80,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/products/67182387.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-54",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-10",
    "category_name": "Beverages & Cold Drinks",
    "name": "Del Monte 4 Season",
    "description": "For reference: Refreshing Del Monte 4 Season.",
    "price": 80,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/products/67182388.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-55",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-10",
    "category_name": "Beverages & Cold Drinks",
    "name": "Del Monte Pineapple Orange Juice",
    "description": "For reference: A refreshing blend of sweet pineapple and tangy orange for a tropical juice experience.",
    "price": 80,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/products/67182393.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-56",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-10",
    "category_name": "Beverages & Cold Drinks",
    "name": "San Mig Light",
    "description": "For reference: Light and crisp San Mig Light with a smooth malt flavor.",
    "price": 80,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/products/67182395.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-57",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-10",
    "category_name": "Beverages & Cold Drinks",
    "name": "San Mig Pilsen",
    "description": "For reference only: San Miguel Pale Pilsen is the original Pilsen beer, representing a classic style that has stood the test of time and captivated beer enthusiasts worldwide.",
    "price": 80,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/products/67182396.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-58",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-10",
    "category_name": "Beverages & Cold Drinks",
    "name": "Red Horse Stallion",
    "description": "For reference: A smooth, strong beer with a rich flavor, perfect for those who love a bold brew.",
    "price": 80,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/products/67182397.jpg",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-59",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-11",
    "category_name": "Coffee",
    "name": "cafe latte",
    "description": "For reference: Velvety cafe latte with a smooth coffee-milk balance.",
    "price": 95,
    "image_url": "",
    "is_available": true,
    "dietary_tags": [
      "vegetarian"
    ]
  },
  {
    "id": "mi-taytayan-60",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-11",
    "category_name": "Coffee",
    "name": "americano",
    "description": "For reference only: Bold and rich coffee with a smooth finish.",
    "price": 90,
    "image_url": "",
    "is_available": true,
    "dietary_tags": []
  },
  {
    "id": "mi-taytayan-61",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-11",
    "category_name": "Coffee",
    "name": "cappuccino",
    "description": "For Reference: A rich, bold espresso flavor balanced with milk, creating a smooth and velvety coffee experience.",
    "price": 95,
    "image_url": "https://images.deliveryhero.io/image/fd-ph/Products/64548767.jpg",
    "is_available": true,
    "dietary_tags": [
      "vegetarian"
    ]
  },
  {
    "id": "mi-taytayan-62",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-11",
    "category_name": "Coffee",
    "name": "coffee press (unli)",
    "description": "For reference: Unlimited brewed coffee served in a press, rich in flavor and aroma.",
    "price": 95,
    "image_url": "",
    "is_available": true,
    "dietary_tags": [
      "vegetarian"
    ]
  },
  {
    "id": "mi-taytayan-63",
    "restaurant_id": "taytayan-pinoy-restaurant",
    "category_id": "cat-taytayan-11",
    "category_name": "Coffee",
    "name": "espresso",
    "description": "For reference: Strong, bold espresso with deep, roasted coffee flavors.",
    "price": 90,
    "image_url": "",
    "is_available": true,
    "dietary_tags": []
  }
];
