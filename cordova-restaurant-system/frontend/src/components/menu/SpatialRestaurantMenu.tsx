'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Sparkles,
  X,
  Search,
  Utensils,
  ImageOff,
} from 'lucide-react';
import type { Restaurant, MenuItem, MenuCategory } from '@/lib/types';
import { BURANDAT_PRICE_UNITS } from '@/data/burandatMenu';
import { CASCADJA_IMAGE_ATTRIBUTIONS, CASCADJA_REPRESENTATIVE_IMAGES } from '@/data/cascadjaMenu';
import { catalogDishPhoto } from '@/data/catalogImages';

interface SpatialRestaurantMenuProps {
  restaurant: Restaurant;
  items: MenuItem[];
  categories: MenuCategory[];
}

function DishPhoto({ image, fallback, name }: { image?: string; fallback?: string; name: string }) {
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const source = [image, fallback].find((candidate) => candidate && !failedSources.includes(candidate));
  if (!source) return <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-stone-500 dark:text-stone-400">
    <ImageOff size={25} aria-hidden="true" />
    <span className="text-xs font-medium">Photo unavailable</span>
  </div>;
  return <>
    <Image src={source} alt={name} fill onError={() => setFailedSources((previous) => [...previous, source])}
      className="object-cover group-hover:scale-108 transition-transform duration-500" />
    {source === fallback && source !== image && <span className="absolute bottom-2 left-2 z-10 rounded bg-black/65 px-2 py-1 text-[10px] text-white">Representative photo</span>}
  </>;
}

function getBurandatPriceUnit(item: MenuItem): string {
  return BURANDAT_PRICE_UNITS.get(item.name)
    || item.description?.match(/^Price per (.+)\.$/)?.[1]
    || '';
}

function hasMavericksFoundationCoffeePhoto(item: MenuItem, categories: MenuCategory[]): boolean {
  if (!item.image_url) return false;
  const categoryName = categories.find((category) => category.id === item.category_id)?.name
    || item.category_name
    || '';
  return /foundation coffee/i.test(categoryName)
    || /foundation[-_ ]coffee/i.test(item.image_url);
}

function isEatNRepeatDrinkCard(category: string, image: string): boolean {
  return /^\/images\/eat-n-repeat\/drinks\//i.test(image)
    || /espresso|non[\s-]?coffee|milk[\s-]?tea|shake|smoothie/i.test(category);
}

export function SpatialRestaurantMenu({ restaurant, items = [], categories = [] }: SpatialRestaurantMenuProps) {
  const isRca = restaurant.slug === 'rca-bilao-food-station';
  const isBurandat = restaurant.slug === 'burandat-seafood-bucket';
  const isCascadja = restaurant.slug === 'cascaja-cafe' || restaurant.slug === 'cascadja-cafe';
  const isMavericks = (restaurant.slug || '').includes('mavericks')
    || (restaurant.name || '').toLowerCase().includes('maverick');
  const isEatNRepeat = restaurant.slug === 'eat-n-repeat'
    || /\beat\s*(?:n'?|&)\s*repeat\b/i.test(restaurant.name || '');

  // Selected Category filter
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Show only saved menu records, even when there are fewer than four.
  const allMenuItems = useMemo(() => {
      return items.map((it) => {
        const category = categories.find((c) => c.id === it.category_id)?.name || (it as any).category_name || 'Main Dishes';
        const photo = catalogDishPhoto(restaurant.slug, category, it.name, it.id, it.image_url);
        return {
        id: it.id,
        name: it.name,
        outOfStock: it.is_available === false,
        category,
        price: Number(it.price),
        priceLabel: it.price_label || '',
        startingPrice: it.description?.startsWith('Starting price') || false,
        priceUnit: isBurandat ? getBurandatPriceUnit(it) : '',
        description: it.description || '',
        image: photo.image,
        fallbackImage: photo.fallback,
        tag: photo.representative
          ? 'Representative photo'
          : isMavericks && hasMavericksFoundationCoffeePhoto(it, categories)
          ? 'Representative photo'
          : isCascadja && CASCADJA_REPRESENTATIVE_IMAGES.get(it.name) === it.image_url
          ? 'Representative photo'
          : '',
        photoAttribution: isCascadja && CASCADJA_IMAGE_ATTRIBUTIONS.get(it.name)?.imageUrl === it.image_url
          ? CASCADJA_IMAGE_ATTRIBUTIONS.get(it.name)
          : undefined,
        popular: true,
        };
      });

  }, [items, categories, restaurant.slug, isBurandat, isCascadja, isMavericks]);

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
                : isRca
                  ? <>Prices and photos follow the <a href="https://www.foodpanda.ph/restaurant/dt0y/r-c-a-food-station-cordova" target="_blank" rel="noopener noreferrer" className="underline">Foodpanda listing</a> checked October 6, 2026. Confirm current prices with RCA before ordering.</>
                : isBurandat
                  ? 'Browse Burandat’s seafood, soups, vegetables, noodles, fish, chicken, and pork dishes.'
                : isCascadja
                  ? <>Prices and Cascadja photos follow its <a href="https://www.foodpanda.ph/restaurant/laiy/cascadja-food-and-beverage-house-calan-cordova-laiy" target="_blank" rel="noopener noreferrer" className="underline">Foodpanda menu</a> checked October 7, 2026. Other photos are representative.</>
                : 'Browse dishes and check availability before your visit.'}
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
            <p className="text-sm font-semibold">{allMenuItems.length === 0 ? 'No menu has been added yet.' : 'No dishes match your filters.'}</p>
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
                    {item.image || item.fallbackImage ? (
                      <>
                        <DishPhoto image={item.image} fallback={item.fallbackImage} name={item.name} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                        {isEatNRepeat && isEatNRepeatDrinkCard(item.category, item.image || '') && (
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <Image
                              src="/images/eat-n-repeat/logo.png"
                              alt=""
                              width={56}
                              height={70}
                              className="h-auto w-14 rounded-sm shadow-lg"
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-stone-500 dark:text-stone-400">
                        <ImageOff size={25} aria-hidden="true" />
                        <span className="text-xs font-medium">Photo unavailable</span>
                      </div>
                    )}

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
                        {item.priceLabel || `${item.startingPrice ? 'From ' : ''}₱${item.price.toLocaleString('en-PH')}${item.priceUnit ? `/${item.priceUnit}` : ''}`}
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
                    {item.outOfStock && (
                      <p className="mt-2 inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800 dark:bg-red-950 dark:text-red-200">
                        Out of stock
                      </p>
                    )}
                    {item.description && <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>}
                    {item.photoAttribution && (
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-2">
                        Photo: <a href={item.photoAttribution.sourcePage} target="_blank" rel="noopener noreferrer" className="underline">{item.photoAttribution.credit}</a>
                        {' · '}<a href={item.photoAttribution.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline">{item.photoAttribution.license}</a>
                      </p>
                    )}
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
