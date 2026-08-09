'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search,
  Utensils,
  Coffee,
  Hotel,
  Fish,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { RestaurantCard } from '@/components/RestaurantCard';
import { RestaurantGridSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import type { Restaurant, PageMeta } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(true);

  // Recommended For You Carousel State & Ref
  const [recommendations, setRecommendations] = useState<{ restaurant: Restaurant; score: number }[]>([]);
  const [recLoading, setRecLoading] = useState(true);
  const recScrollRef = useRef<HTMLDivElement>(null);

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
    } catch {
      setRestaurants([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeCategory, page]);

  const fetchRecommendations = useCallback(async () => {
    setRecLoading(true);
    try {
      // Fetch up to 10 recommended restaurants based on set preferences
      const res = await api.post('/api/recommendations', { limit: 10 }, { auth: !!user });
      if (res.data && Array.isArray(res.data)) {
        setRecommendations(
          res.data.map((r: any) => ({
            restaurant: r.restaurant,
            score: r.score,
          }))
        );
      }
    } catch {
      setRecommendations([]);
    } finally {
      setRecLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const scrollRec = (direction: 'left' | 'right') => {
    if (recScrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      recScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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
            { id: 'restaurants', label: 'Restaurants', icon: Utensils, cuisine: 'restaurants' },
            { id: 'cafes', label: 'Cafés', icon: Coffee, cuisine: 'cafes' },
            { id: 'resorts', label: 'Resorts', icon: Hotel, cuisine: 'resorts' },
            { id: 'seafood', label: 'Seafood', icon: Fish, cuisine: 'seafood' },
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

      {/* RECOMMENDED FOR YOU SWIPEABLE CAROUSEL SECTION */}
      <section className="max-w-6xl mx-auto px-4 mt-20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white">
              Recommended For You
            </h2>
            <div className="h-0.5 w-16 bg-cordova-gold mt-3" />
          </div>

          {/* Swipe / Carousel Control Arrows */}
          {recommendations.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollRec('left')}
                className="p-2.5 rounded-full bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 shadow-sm hover:bg-cordova-green hover:text-white dark:hover:bg-cordova-green transition-colors text-stone-700 dark:text-stone-300"
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scrollRec('right')}
                className="p-2.5 rounded-full bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 shadow-sm hover:bg-cordova-green hover:text-white dark:hover:bg-cordova-green transition-colors text-stone-700 dark:text-stone-300"
                aria-label="Scroll right"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {recLoading ? (
          <RestaurantGridSkeleton count={3} />
        ) : recommendations.length > 0 ? (
          /* Horizontal Swipeable Container */
          <div
            ref={recScrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 pt-2 px-1 scroll-smooth"
          >
            {recommendations.map(({ restaurant, score }, idx) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: Math.min(idx, 8) * 0.06 }}
                className="snap-start shrink-0 w-[290px] sm:w-[320px] lg:w-[350px]"
              >
                <RestaurantCard restaurant={restaurant} matchScore={score} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1a211c] rounded-lg border border-stone-200 dark:border-stone-800 p-8 text-center text-stone-500 max-w-md mx-auto">
            <p className="text-2xl mb-2">✨</p>
            <p className="font-serif font-medium text-stone-800 dark:text-stone-200 mb-1">
              Personalize Your Experience
            </p>
            <p className="text-xs text-stone-500 mb-4">
              Set your food preferences to get personalized restaurant recommendations.
            </p>
            <button
              onClick={() => router.push('/preferences')}
              className="bg-cordova-green hover:bg-cordova-greenHover text-white text-xs font-semibold px-5 py-2.5 rounded shadow"
            >
              Set Preferences
            </button>
          </div>
        )}
      </section>

      {/* ALL ESTABLISHMENTS SECTION */}
      <section className="max-w-6xl mx-auto px-4 mt-20">
        <div className="mb-10">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white capitalize">
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
    </div>
  );
}
