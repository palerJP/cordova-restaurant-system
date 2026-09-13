'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Sparkles,
  X,
  Search,
  Utensils,
} from 'lucide-react';
import type { Restaurant, MenuItem, MenuCategory } from '@/lib/types';

interface SpatialRestaurantMenuProps {
  restaurant: Restaurant;
  items: MenuItem[];
  categories: MenuCategory[];
}

// Curated signature dishes & fallback category menus tailored for Cordova restaurants
const CATEGORY_DEFAULT_MENUS: Record<
  string,
  {
    heroDish: {
      name: string;
      tagline: string;
      price: number;
      image: string;
      description: string;
      hotspots: { x: number; y: number; title: string; desc: string }[];
    };
    menuItems: {
      name: string;
      category: string;
      price: number;
      description: string;
      image: string;
      tag: string;
      popular?: boolean;
    }[];
  }
> = {
  Cafe: {
    heroDish: {
      name: 'Artisan Spanish Latte & Toast',
      tagline: 'CREAMY • BOLD • ROASTED',
      price: 185,
      image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80',
      description: 'Slow-dripped Arabica espresso infused with condensed milk and velvety steamed milk.',
      hotspots: [
        { x: 30, y: 35, title: 'Single-Origin Arabica', desc: 'Freshly ground and pulled at 9 bars of pressure.' },
        { x: 65, y: 55, title: 'Velvety Micro-Foam', desc: 'Steamed to silky perfection with subtle sweet notes.' },
        { x: 45, y: 75, title: 'Artisan Glaze', desc: 'Caramelized sugar drizzle with cinnamon dusting.' },
      ],
    },
    menuItems: [
      {
        name: 'Spanish Latte (Iced/Hot)',
        category: 'Coffee & Espresso',
        price: 165,
        description: 'Rich espresso layered over sweetened milk and ice.',
        image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80',
        tag: '⭐ Bestseller',
        popular: true,
      },
      {
        name: 'Caramel Macchiato',
        category: 'Coffee & Espresso',
        price: 175,
        description: 'Freshly steamed milk with vanilla-flavored syrup marked with espresso and caramel.',
        image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=600&auto=format&fit=crop&q=80',
        tag: '✨ House Favorite',
      },
      {
        name: 'Creamy Carbonara Pasta',
        category: 'Mains & Pasta',
        price: 245,
        description: 'Al dente fettuccine tossed in rich egg yolk, parmesan cheese, and crispy bacon bits.',
        image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&auto=format&fit=crop&q=80',
        tag: '🍝 Must Try',
        popular: true,
      },
      {
        name: 'Avocado Sourdough Toast',
        category: 'Snacks & Toast',
        price: 195,
        description: 'Toasted sourdough topped with mashed ripe avocado, poached egg, and chili flakes.',
        image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80',
        tag: '🌿 Healthy',
      },
      {
        name: 'Matcha Green Tea Cooler',
        category: 'Beverages',
        price: 170,
        description: 'Authentic ceremonial grade Uji matcha with oat milk and honey drizzle.',
        image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80',
        tag: '🍵 Refreshing',
      },
      {
        name: 'Choco Lava Cake',
        category: 'Desserts',
        price: 160,
        description: 'Warm molten dark chocolate cake served with vanilla bean ice cream.',
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
        tag: '🍫 Sweet Treat',
      },
    ],
  },
  'Fast Food': {
    heroDish: {
      name: 'Signature Crispy Crunch Burger',
      tagline: 'CRUNCHY • JUICY • SIZZLING',
      price: 210,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
      description: 'Flame-grilled 100% beef patty with melted cheddar, crispy bacon, and smoky secret sauce on toasted brioche.',
      hotspots: [
        { x: 35, y: 30, title: 'Toasted Golden Brioche', desc: 'Butter-toasted artisan bun with golden shine.' },
        { x: 55, y: 50, title: 'Flame-Grilled Beef Patty', desc: 'Seasoned to perfection and seared for rich juiciness.' },
        { x: 45, y: 70, title: 'Secret Smokey Sauce', desc: 'House recipe blend of roasted garlic, smoked paprika, and honey.' },
      ],
    },
    menuItems: [
      {
        name: 'Double Cheeseburger Deluxe',
        category: 'Burgers',
        price: 240,
        description: 'Two pure beef patties, double cheddar cheese, lettuce, tomato, and special sauce.',
        image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
        tag: '🔥 Top Seller',
        popular: true,
      },
      {
        name: 'Crispy Fried Chicken (2 Pcs)',
        category: 'Chicken & Combos',
        price: 195,
        description: 'Crisp and juicy golden fried chicken with warm savory gravy and steamed rice.',
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
        tag: '🍗 Bestseller',
        popular: true,
      },
      {
        name: 'Loaded Cheesy Bacon Fries',
        category: 'Sides',
        price: 145,
        description: 'Golden fries smothered in melted cheese sauce, sour cream, and crispy bacon bits.',
        image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80',
        tag: '🧀 Cheesy',
      },
      {
        name: 'Spicy Buffalo Wings (6 Pcs)',
        category: 'Chicken & Combos',
        price: 230,
        description: 'Tender chicken wings tossed in tangy cayenne pepper glaze served with ranch dip.',
        image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80',
        tag: '🌶️ Spicy',
      },
      {
        name: 'Thick Vanilla Milkshake',
        category: 'Drinks',
        price: 120,
        description: 'Hand-spun ice cream milkshake with whipped cream and cherry on top.',
        image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80',
        tag: '🥤 Classic',
      },
    ],
  },
  Pizza: {
    heroDish: {
      name: 'Artisan Brick-Oven Supreme Pizza',
      tagline: 'WOOD-FIRED • CRISPY CRUST • CHEESY',
      price: 495,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
      description: 'Hand-stretched dough baked in wood fire with mozzarella, pepperoni, bell peppers, olives, and basil.',
      hotspots: [
        { x: 30, y: 35, title: 'Crispy Leopard Crust', desc: 'Fermented 48 hours and charred over mangrove wood.' },
        { x: 60, y: 45, title: '100% Mozzarella Blend', desc: 'Rich, stringy, melted cheese pull with olive oil.' },
        { x: 45, y: 65, title: 'San Marzano Tomato Sauce', desc: 'Slow-simmered vine-ripened tomatoes and fresh herbs.' },
      ],
    },
    menuItems: [
      {
        name: 'Quattro Formaggi (4 Cheese)',
        category: 'Pizzas',
        price: 480,
        description: 'Mozzarella, Gorgonzola, Parmesan, and Fontina cheese with a touch of honey.',
        image: 'https://images.unsplash.com/photo-1573821663912-569905455b1c?w=600&auto=format&fit=crop&q=80',
        tag: '🧀 Cheese Lover',
        popular: true,
      },
      {
        name: 'Pepperoni Feast Pizza',
        category: 'Pizzas',
        price: 460,
        description: 'Generous layers of premium cured pepperoni, spicy tomato sauce, and herbs.',
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80',
        tag: '🍕 Classic',
        popular: true,
      },
      {
        name: 'Creamy Truffle Pasta',
        category: 'Pasta',
        price: 320,
        description: 'Penne in decadent white truffle cream sauce with sauteed wild mushrooms.',
        image: 'https://images.unsplash.com/photo-1621996346565-e3adc6d7d0f4?w=600&auto=format&fit=crop&q=80',
        tag: '✨ Chef Choice',
      },
      {
        name: 'Garlic Butter Parmesan Wings',
        category: 'Appetizers',
        price: 260,
        description: 'Crispy tossed chicken in garlic herb butter and grated aged parmesan.',
        image: 'https://images.unsplash.com/photo-1527477321055-43615b6294a5?w=600&auto=format&fit=crop&q=80',
        tag: '🧄 Savory',
      },
    ],
  },
  'Resto Bar': {
    heroDish: {
      name: 'Sizzling Ribeye Steak & Cocktails',
      tagline: 'SIZZLING • CHARGRILLED • VIBRANT',
      price: 580,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
      description: 'Prime cut ribeye steak grilled to medium-rare on a piping hot skillet with peppercorn gravy and garlic butter.',
      hotspots: [
        { x: 35, y: 35, title: 'Flame-Seared Ribeye', desc: 'Marbled prime beef seared for caramelized crust.' },
        { x: 60, y: 50, title: 'Garlic Herb Compound Butter', desc: 'Melts over hot steak for unmatched richness.' },
        { x: 45, y: 70, title: 'Peppercorn Red Wine Sauce', desc: 'Simmered with crushed peppercorns and red wine reduction.' },
      ],
    },
    menuItems: [
      {
        name: 'Crispy Pork Sisig on Cast Iron',
        category: 'Bar Chow & Sizzlers',
        price: 280,
        description: 'Minced crispy pork face and belly with onions, chili, calamansi, and fresh farm egg.',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
        tag: '🔥 Island Legend',
        popular: true,
      },
      {
        name: 'Gambas Al Ajillo (Garlic Shrimp)',
        category: 'Bar Chow & Sizzlers',
        price: 340,
        description: 'Fresh local shrimp sauteed in olive oil, toasted garlic, and spicy paprika.',
        image: 'https://images.unsplash.com/photo-1559742811-82286364ceaf?w=600&auto=format&fit=crop&q=80',
        tag: '🦐 Seafood',
        popular: true,
      },
      {
        name: 'Cordova Sunset Mojito',
        category: 'Signature Cocktails',
        price: 190,
        description: 'White rum, fresh mint leaves, lime juice, brown sugar, and sparkling soda.',
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
        tag: '🍹 Signature Drink',
      },
      {
        name: 'Smoked BBQ Ribs Full Rack',
        category: 'Mains',
        price: 620,
        description: 'Slow-smoked baby back ribs glazed in hickory honey BBQ sauce with butter corn.',
        image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&auto=format&fit=crop&q=80',
        tag: '🍖 Generous Share',
      },
    ],
  },
  // Default Seafood / Traditional Filipino Restaurant
  Restaurant: {
    heroDish: {
      name: 'Cordova Seafood Platter & Bakasi Special',
      tagline: 'FRESH CATCH • CHARCOAL GRILLED • CEBUANO',
      price: 680,
      image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80',
      description: 'Generous feast of charcoal-grilled pompano, garlic butter scallops, bakasi eel soup, and grilled squid.',
      hotspots: [
        { x: 30, y: 35, title: 'Fresh Daily Catch', desc: 'Directly sourced every morning from Cordova fishing boats.' },
        { x: 65, y: 45, title: 'Baked Cheesy Garlic Scallops', desc: 'Broiled in rich butter, minced garlic, and melted cheese.' },
        { x: 45, y: 70, title: 'Charcoal Smoke Infusion', desc: 'Grilled over coconut husks for authentic Cebuano aroma.' },
      ],
    },
    menuItems: [
      {
        name: 'Grilled Stuffed Squid (Inihaw na Pusit)',
        category: 'Seafood & Grills',
        price: 360,
        description: 'Fresh whole squid stuffed with onions, tomatoes, and herbs, basted in sweet-savory soy glaze.',
        image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
        tag: '⭐ House Signature',
        popular: true,
      },
      {
        name: 'Baked Scallops with Cheese & Garlic',
        category: 'Seafood & Grills',
        price: 320,
        description: 'Locally harvested scallops broiled in golden butter, garlic, and melted cheddar.',
        image: 'https://images.unsplash.com/photo-1625944525533-a5868999824a?w=600&auto=format&fit=crop&q=80',
        tag: '🐚 Seafood Classic',
        popular: true,
      },
      {
        name: 'Cordova Bakasi Soup (Reef Eel Soup)',
        category: 'Soups & Traditional',
        price: 250,
        description: 'Famous Cordova delicacy simmered in ginger, lemongrass, tomatoes, and native spices.',
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80',
        tag: '🏆 Cordova Legend',
        popular: true,
      },
      {
        name: 'Crispy Pork Pata Especial',
        category: 'Traditional Favorites',
        price: 650,
        description: 'Deep-fried pork knuckle with crackling skin and tender meat, served with spiced vinegar dip.',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
        tag: '🔥 Family Feast',
      },
      {
        name: 'Sinigang na Lapu-Lapu sa Miso',
        category: 'Soups & Traditional',
        price: 420,
        description: 'Fresh grouper fish in sour tamarind and fermented soybean broth with island greens.',
        image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80',
        tag: '🌿 Sour & Savory',
      },
      {
        name: 'Buko Halo-Halo Tropical Supreme',
        category: 'Desserts',
        price: 180,
        description: 'Served inside a fresh young coconut shell with shaved ice, ube, leche flan, and sweet fruits.',
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&auto=format&fit=crop&q=80',
        tag: '🥥 Island Sweet',
      },
    ],
  },
};

export function SpatialRestaurantMenu({ restaurant, items = [], categories = [] }: SpatialRestaurantMenuProps) {
  const categoryKey = restaurant.category || 'Restaurant';
  const defaultData = CATEGORY_DEFAULT_MENUS[categoryKey] || CATEGORY_DEFAULT_MENUS.Restaurant;

  // Selected Category filter
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Merge API items with curated default items if API items are sparse
  const allMenuItems = useMemo(() => {
    if (items.length >= 4) {
      return items.map((it) => ({
        id: it.id,
        name: it.name,
        category: categories.find((c) => c.id === it.category_id)?.name || (it as any).category_name || 'Main Dishes',
        price: Number(it.price),
        description: it.description || 'Crafted fresh with traditional Cordova flavors.',
        image: it.image_url || defaultData.heroDish.image,
        tag: '✨ Chef Special',
        popular: true,
      }));
    }

    // Combine any existing with default items
    const defaults = defaultData.menuItems.map((it, idx) => ({
      id: `curated-${idx}`,
      ...it,
    }));

    if (items.length > 0) {
      const customOnes = items.map((it) => ({
        id: it.id,
        name: it.name,
        category: categories.find((c) => c.id === it.category_id)?.name || 'House Specialties',
        price: Number(it.price),
        description: it.description || 'Special house recipe prepared daily.',
        image: it.image_url || defaultData.heroDish.image,
        tag: '⭐ Signature',
        popular: true,
      }));
      return [...customOnes, ...defaults];
    }

    return defaults;
  }, [items, categories, defaultData]);

  // List of unique categories for tabs
  const categoryTabs = useMemo(() => {
    const set = new Set<string>();
    allMenuItems.forEach((i) => set.add(i.category));
    return ['All', ...Array.from(set)];
  }, [allMenuItems]);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return allMenuItems.filter((item) => {
      const matchesCat = activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [allMenuItems, activeCategory, searchQuery]);

  const isTitaKims = (restaurant.slug || '').includes('tita-kim') || (restaurant.name || '').toLowerCase().includes('tita');

  return (
    <div className="space-y-8">
      {/* 🍴 CATEGORIZED MENU BROWSER */}
      <section className="space-y-8">
        {/* Eat-All-You-Can Top Announcement Banner for Tita Kim's */}
        {isTitaKims && (
          <div className="relative overflow-hidden p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-amber-500/20 via-emerald-600/15 to-amber-500/20 border-2 border-amber-400/40 backdrop-blur-xl shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="shrink-0 px-4 py-2.5 rounded-2xl bg-amber-500 text-stone-950 font-black text-2xl sm:text-3xl shadow-lg border border-amber-300">
                  ₱299
                </div>
                <div>
                  <h4 className="font-serif text-lg sm:text-xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                    Eat all you can for ₱299
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold uppercase tracking-wider">
                      Unlimited Buffet
                    </span>
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                    Eat all you can for ₱299 only! Dishes vary daily depending on available ingredients. All dishes below are included in the buffet.
                  </p>
                </div>
              </div>
              <div className="shrink-0 hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black/40 text-amber-300 text-xs font-bold border border-white/10">
                <Sparkles size={13} className="text-amber-400" />
                <span>All 14 Dishes Included</span>
              </div>
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-cordova-gold animate-pulse" />
              <h3 className="font-serif text-3xl font-bold text-stone-900 dark:text-white">
                Explore Full Menu
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
              {isTitaKims
                ? 'All dishes below are included in the ₱299 Eat-All-You-Can buffet.'
                : 'Freshly crafted delicacies and island favorites ready for your order.'}
            </p>
          </div>

          {/* Menu Search Bar */}
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes..."
              className="w-full pl-9 pr-8 py-2.5 text-xs bg-white/80 dark:bg-black/30 backdrop-blur-md border border-stone-200/80 dark:border-white/10 rounded-xl text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-cordova-green/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Category Pill Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categoryTabs.map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all shrink-0 select-none ${
                  isSelected
                    ? 'bg-gradient-to-r from-cordova-green to-emerald-700 text-white shadow-spatial-sm border border-emerald-400/40 scale-105'
                    : 'bg-white/80 dark:bg-white/5 hover:bg-stone-100 dark:hover:bg-white/10 text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-white/10 backdrop-blur-md'
                }`}
              >
                {cat === 'All' ? '✨ All Dishes' : cat}
              </button>
            );
          })}
        </div>

        {/* Dish Grid */}
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center text-stone-400 bg-white/40 dark:bg-white/5 rounded-2xl border border-stone-200/60 dark:border-white/10">
            <Utensils size={36} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">No menu dishes found matching &quot;{searchQuery}&quot;</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
              }}
              className="mt-3 text-xs text-cordova-green dark:text-emerald-400 font-bold underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(idx, 6) * 0.05 }}
                className="group relative bg-white/80 dark:bg-[#161c18]/80 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl overflow-hidden shadow-spatial-sm hover:shadow-spatial-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Dish Card Top / Image */}
                <div>
                  <div className="relative h-48 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                    {/* Tag Badge */}
                    {item.tag && (
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                        <span>{item.tag}</span>
                      </div>
                    )}

                    {/* Price Badge or Buffet Indicator (no ₱299 on individual dishes for Tita Kim's) */}
                    {isTitaKims ? (
                      <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-emerald-700/90 backdrop-blur-md text-emerald-100 font-medium text-xs shadow-md border border-emerald-400/30 flex items-center gap-1">
                        <Sparkles size={11} className="text-emerald-300" />
                        <span>Included in Buffet</span>
                      </div>
                    ) : (
                      <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-amber-500/95 backdrop-blur-md text-white font-bold text-sm shadow-md border border-amber-300/40">
                        ₱{item.price}
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cordova-gold">
                      {item.category}
                    </span>
                    <h4 className="font-serif text-base font-bold text-stone-900 dark:text-white group-hover:text-cordova-green dark:group-hover:text-emerald-400 transition-colors mt-0.5">
                      {item.name}
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default SpatialRestaurantMenu;
