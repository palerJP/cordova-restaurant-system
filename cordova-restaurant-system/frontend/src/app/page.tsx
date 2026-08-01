'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search,
  Utensils,
  Coffee,
  Hotel,
  Fish,
  Camera,
  MessageCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { RestaurantCard } from '@/components/RestaurantCard';
import { RestaurantGridSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import type { Restaurant, PageMeta } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (activeCategory) params.set('cuisines', activeCategory);
      params.set('page', String(page));
      params.set('limit', '6');

      const res = await api.get(`/api/restaurants?${params.toString()}`, { auth: false });
      setRestaurants(res.data);
      setMeta(res.meta);
    } catch (err) {
      setRestaurants([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeCategory, page]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchRestaurants();
    }
  };

  const handleCategoryClick = (categorySlug: string) => {
    if (activeCategory === categorySlug) {
      setActiveCategory(null);
    } else {
      setActiveCategory(categorySlug);
    }
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-cordova-cream dark:bg-[#121614] pb-16 relative">
      {/* HERO SECTION */}
      <section className="relative w-full h-[520px] sm:h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <Image
          src="/hero_background.png"
          alt="CordovaEats Dining Experience"
          fill
          priority
          className="object-cover object-center"
        />

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/75" />

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          {/* Large Hero Emblem */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative h-28 w-28 sm:h-36 sm:w-36 mb-2 filter drop-shadow-2xl"
          >
            <Image
              src="/cordova_eats_logo.png"
              alt="CordovaEats Emblem"
              fill
              className="object-contain"
              priority
            />
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-serif text-5xl sm:text-7xl font-bold text-white tracking-tight drop-shadow-md mb-2"
          >
            CordovaEats
          </motion.h1>

          {/* Subtitle Line */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex items-center gap-3 my-2"
          >
            <span className="h-[1px] w-8 sm:w-12 bg-cordova-gold/80" />
            <span className="text-cordova-gold font-semibold tracking-[0.25em] uppercase text-xs sm:text-sm">
              CORDOVA&apos;S CULINARY JOURNEY
            </span>
            <span className="h-[1px] w-8 sm:w-12 bg-cordova-gold/80" />
          </motion.div>

          {/* Tagline / Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="italic text-gray-200 font-serif text-sm sm:text-lg max-w-2xl mt-2 leading-relaxed opacity-95"
          >
            Where island flavors meet sophisticated dining. Discover authentic seafood, traditional
            Filipino cuisine, and artisan cafés along the CCLEX Bridge route.
          </motion.p>
        </div>

        {/* Bottom Fade Gradient into page background */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cordova-cream dark:from-[#121614] to-transparent pointer-events-none" />
      </section>

      {/* SEARCH BAR SECTION */}
      <section className="relative z-20 -mt-10 px-4 max-w-3xl mx-auto">
        <form
          onSubmit={handleSearchSubmit}
          className="bg-white dark:bg-[#1a211c] rounded border border-stone-200 dark:border-stone-800 shadow-lg p-2 flex items-center gap-2"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for restaurants, cuisines, or dishes..."
            className="flex-1 px-4 py-3 bg-transparent text-stone-800 dark:text-stone-100 placeholder:text-stone-400 text-sm outline-none font-sans"
          />
          <button
            type="submit"
            className="bg-cordova-gold hover:bg-cordova-goldHover text-white p-3.5 rounded transition-colors duration-200 shrink-0"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
        </form>
      </section>

      {/* EXPLORE BY CATEGORY SECTION */}
      <section className="max-w-6xl mx-auto px-4 mt-20">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white">
            Explore by Category
          </h2>
          <div className="h-0.5 w-16 bg-cordova-gold mx-auto mt-3" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 max-w-4xl mx-auto">
          {[
            { id: 'restaurants', label: 'Restaurants', icon: Utensils, cuisine: 'Filipino' },
            { id: 'cafes', label: 'Cafés', icon: Coffee, cuisine: 'Coffee & Desserts' },
            { id: 'resorts', label: 'Resorts', icon: Hotel, cuisine: 'Resort Dining' },
            { id: 'seafood', label: 'Seafood', icon: Fish, cuisine: 'Seafood' },
          ].map((cat) => {
            const IconComp = cat.icon;
            const isSelected = activeCategory === cat.cuisine;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.cuisine)}
                className={`bg-white dark:bg-[#1a211c] border rounded-lg p-6 sm:p-8 flex flex-col items-center justify-center gap-3.5 transition-all duration-300 group shadow-sm hover:shadow-md ${
                  isSelected
                    ? 'border-cordova-gold ring-2 ring-cordova-gold/30 bg-amber-50/40 dark:bg-amber-950/20'
                    : 'border-stone-200/80 dark:border-stone-800/80 hover:border-cordova-gold'
                }`}
              >
                <div className="text-cordova-gold group-hover:scale-110 transition-transform duration-300">
                  <IconComp size={32} strokeWidth={1.75} />
                </div>
                <span className="font-serif text-base font-bold text-stone-800 dark:text-stone-200 group-hover:text-cordova-green transition-colors">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ALL ESTABLISHMENTS SECTION */}
      <section className="max-w-6xl mx-auto px-4 mt-20">
        <div className="mb-10">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white">
            {activeCategory ? `${activeCategory} Establishments` : 'All Establishments'}
          </h2>
          <div className="h-0.5 w-16 bg-cordova-gold mt-3" />
        </div>

        {loading ? (
          <RestaurantGridSkeleton count={6} />
        ) : restaurants.length === 0 ? (
          <div className="bg-white dark:bg-[#1a211c] rounded-lg border border-stone-200 dark:border-stone-800 p-12 text-center text-stone-500 max-w-md mx-auto">
            <p className="text-3xl mb-3">🍽️</p>
            <p className="font-serif text-lg font-medium text-stone-800 dark:text-stone-200 mb-1">
              No establishments found
            </p>
            <p className="text-xs text-stone-500">
              Try adjusting your search query or selecting a different category.
            </p>
            {(activeCategory || searchQuery) && (
              <button
                onClick={() => {
                  setActiveCategory(null);
                  setSearchQuery('');
                  setPage(1);
                }}
                className="mt-4 text-xs font-semibold text-cordova-green hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant, idx) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(idx, 6) * 0.05 }}
                >
                  <RestaurantCard restaurant={restaurant} />
                </motion.div>
              ))}
            </div>

            {meta && meta.totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination meta={meta} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </section>

      {/* FLOATING CHAT BUTTON (FAB) */}
      <button
        onClick={() => router.push('/recommendations')}
        title="AI Food Assistant"
        className="fixed bottom-6 right-6 z-50 bg-[#F59E0B] hover:bg-[#D97706] text-white p-4 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center"
        aria-label="AI Food Assistant"
      >
        <MessageCircle size={24} fill="currentColor" className="text-white" />
      </button>
    </div>
  );
}
