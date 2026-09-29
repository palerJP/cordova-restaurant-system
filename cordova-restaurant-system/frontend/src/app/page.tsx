'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search,
  Utensils,
  Coffee,
  Flame,
  Pizza,
  Wine,
  Zap,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { getTastePreferences, hasTastePreferences } from '@/lib/taste-preferences';
import { RestaurantCard } from '@/components/RestaurantCard';
import { RestaurantGridSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import type { Restaurant, PageMeta, MatchedPreferences } from '@/lib/types';
import { isRestaurantVisible, getAllStaticRestaurants, normalizeKey, matchesCategory } from '@/data/restaurants';
import { standardSearchRestaurants } from '@/lib/aiSearch';

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [hasPassedTasteGate, setHasPassedTasteGate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(true);

  // Recommended For You Carousel State & Ref
  const [recommendations, setRecommendations] = useState<{
    restaurant: Restaurant;
    score: number;
    matchedPreferences?: MatchedPreferences;
    reason?: string;
  }[]>([]);
  const [recLoading, setRecLoading] = useState(true);
  const recScrollRef = useRef<HTMLDivElement>(null);
  const establishmentsRef = useRef<HTMLDivElement>(null);

  const PAGE_SIZE = 6;

  useEffect(() => {
    if (authLoading) return;
    if (!user && !hasTastePreferences()) {
      router.replace('/preferences?firstTime=true&returnTo=%2F');
      return;
    }
    setHasPassedTasteGate(true);
  }, [authLoading, user, router]);

  // Debounce typing in search input to prevent network spam and UI stutter
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 280);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (establishmentsRef.current) {
      establishmentsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      let apiList: Restaurant[] = [];
      const queryTerm = debouncedQuery.trim();

      if (queryTerm) {
        try {
          const params = new URLSearchParams();
          params.set('q', queryTerm);
          if (activeCategory && activeCategory !== 'restaurants') params.set('cuisines', activeCategory);
          params.set('limit', '100');

          const res = await api.get(`/api/restaurants?${params.toString()}`, { auth: false });
          if (res.data && Array.isArray(res.data) && res.data.length > 0) {
            apiList = res.data;
          }
        } catch {
          apiList = [];
        }
      } else {
        try {
          const params = new URLSearchParams();
          if (activeCategory && activeCategory !== 'restaurants') params.set('cuisines', activeCategory);
          params.set('limit', '100');

          const res = await api.get(`/api/restaurants?${params.toString()}`, { auth: false });
          if (res.data && Array.isArray(res.data)) {
            apiList = res.data;
          }
        } catch {
          apiList = [];
        }
      }

      // Static fallback list with customizations applied
      const staticList = getAllStaticRestaurants().filter(isRestaurantVisible);
      const map = new Map<string, Restaurant>();

      if (apiList.length > 0) {
        for (const item of apiList) {
          const key = normalizeKey(item.slug || item.name);
          map.set(key, item);
        }
      } else {
        for (const item of staticList) {
          map.set(normalizeKey(item.slug), item);
        }
      }

      let all: Restaurant[] = [];

      if (queryTerm) {
        if (apiList.length > 0) {
          all = Array.from(map.values()).filter(isRestaurantVisible);
        } else {
          all = standardSearchRestaurants(staticList, queryTerm, activeCategory);
        }
      } else {
        all = Array.from(map.values()).filter(isRestaurantVisible);
        // Filter by active category
        if (activeCategory) {
          all = all.filter((r) => matchesCategory(r, activeCategory));
        }
      }

      const totalCount = all.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
      const currentPage = Math.min(page, totalPages);
      const startIndex = (currentPage - 1) * PAGE_SIZE;
      const pagedList = all.slice(startIndex, startIndex + PAGE_SIZE);

      setRestaurants(pagedList);
      setMeta({
        page: currentPage,
        limit: PAGE_SIZE,
        totalCount,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      });
    } catch {
      setRestaurants([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, activeCategory, page]);

  const fetchRecommendations = useCallback(async () => {
    setRecLoading(true);
    try {
      let recList: {
        restaurant: Restaurant;
        score: number;
        matchedPreferences?: MatchedPreferences;
        reason?: string;
      }[] = [];
      let recommendationsApiResponded = false;
      try {
        const guestPreferences = user ? null : getTastePreferences();
        const res = await api.post('/api/recommendations', {
          preferredCuisines: guestPreferences?.preferredCuisines || [],
          dietaryRestrictions: guestPreferences?.dietaryRestrictions || [],
          requiredServices: guestPreferences?.preferredServices || [],
          budgetRange: guestPreferences?.budgetRange || undefined,
          limit: 10,
        }, { auth: !!user });
        recommendationsApiResponded = true;
        if (res.data && Array.isArray(res.data)) {
          recList = res.data
            .filter((r: any) => isRestaurantVisible(r.restaurant))
            .map((r: any) => ({
              restaurant: r.restaurant,
              score: r.matchPercentage || Math.round(r.score),
              matchedPreferences: r.matchedPreferences,
              reason: r.reason,
            }));
        }
      } catch {
        recList = [];
      }

      // Use generic offline fallback only for guests; never bypass a user's saved constraints.
      if (recList.length === 0 && !recommendationsApiResponded && !user) {
        const staticList = getAllStaticRestaurants().filter(isRestaurantVisible);
        recList = staticList.slice(0, 8).map((r, i) => ({
          restaurant: r,
          score: 96 - i * 3,
        }));
      }

      setRecommendations(recList);
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
    setDebouncedQuery(searchQuery);
    setPage(1);
    if (establishmentsRef.current) {
      establishmentsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  if (!hasPassedTasteGate) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-cordova-cream dark:bg-[#121614]">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cordova-cream dark:bg-[#121614] pb-20 relative overflow-hidden">
      {/* AMBIENT SPATIAL LIGHTING ACCENTS */}
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-[120px] pointer-events-none -z-0" />
      <div className="absolute top-[45%] right-[-10%] w-[550px] h-[550px] rounded-full bg-amber-500/10 dark:bg-amber-500/15 blur-[130px] pointer-events-none -z-0" />
      <div className="absolute top-[75%] left-[10%] w-[600px] h-[600px] rounded-full bg-emerald-600/8 dark:bg-emerald-600/10 blur-[140px] pointer-events-none -z-0" />

      {/* HERO SECTION */}
      <section className="relative w-full h-[520px] sm:h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <Image
          src="/hero_background.png"
          alt="CordovaEats Dining Experience"
          fill
          priority
          className="object-cover object-center"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/80 backdrop-blur-[1px]" />

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
              style={{ objectFit: 'contain' }}
              priority
            />
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-serif text-5xl sm:text-7xl lg:text-8xl font-extrabold text-white tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)] mb-2"
          >
            CordovaEats
          </motion.h1>

          {/* Subtitle Line with Frosted Glass Plate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-xl border border-white/20 shadow-spatial-sm my-3"
          >
            <span className="h-[1px] w-6 sm:w-10 bg-amber-400" />
            <span className="text-amber-300 font-extrabold tracking-[0.25em] uppercase text-xs sm:text-sm drop-shadow">
              CORDOVA&apos;S CULINARY JOURNEY
            </span>
            <span className="h-[1px] w-6 sm:w-10 bg-amber-400" />
          </motion.div>

          {/* Tagline / Description with High Legibility */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-white font-serif text-base sm:text-xl max-w-2xl mt-2 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] font-medium"
          >
            Where island flavors meet sophisticated dining. Discover authentic seafood, traditional
            Filipino cuisine, and artisan cafés along the CCLEX Bridge route.
          </motion.p>
        </div>

        {/* Bottom Fade Gradient into page background */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-cordova-cream dark:from-[#121614] to-transparent pointer-events-none" />
      </section>

      {/* FLOATING SPATIAL SEARCH BAR SECTION */}
      <section className="relative z-20 -mt-12 px-4 max-w-3xl mx-auto group">
        {/* Spatial Ambient Glow Backlight */}
        <div className="absolute -inset-1.5 rounded-3xl blur-2xl opacity-60 dark:opacity-40 transition-all duration-500 pointer-events-none -z-10 bg-gradient-to-r from-emerald-500/25 via-teal-500/20 to-amber-500/25" />

        <form
          onSubmit={handleSearchSubmit}
          className="relative rounded-2xl transition-all duration-300 p-2 sm:p-2.5 flex items-center gap-2 backdrop-blur-2xl bg-white/90 dark:bg-[#161e18]/90 border border-white/80 dark:border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.08),inset_0_1px_1.5px_rgba(255,255,255,0.9)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.4),inset_0_1px_1.5px_rgba(255,255,255,0.12)] ring-1 ring-black/[0.04] dark:ring-white/[0.05]"
        >
          <div className="flex items-center pl-3 text-stone-500 shrink-0">
            <Search size={20} className="text-emerald-700 dark:text-emerald-400" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search restaurants, fresh seafood, BBQ, cafes..."
            className="flex-1 px-2.5 py-3 bg-transparent text-sm sm:text-base outline-none font-sans font-medium transition-colors text-stone-900 dark:text-white placeholder:text-stone-500 dark:placeholder:text-stone-400"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setDebouncedQuery('');
                setPage(1);
              }}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/10 transition-colors"
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}

          {/* Search Action Button */}
          <button
            type="submit"
            className="bg-gradient-to-r from-cordova-gold via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-600 text-white p-3 sm:px-5 sm:py-3 rounded-xl transition-all duration-200 shrink-0 shadow-spatial-md active:scale-95 border border-white/30 flex items-center justify-center gap-1.5 font-bold"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
        </form>
      </section>

      {/* EXPLORE BY CATEGORY SECTION */}
      <section className="max-w-6xl mx-auto px-4 mt-20 relative z-10">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-white">
            Explore by Category
          </h2>
          <div className="h-1 w-20 bg-cordova-gold mx-auto mt-3 rounded-full shadow-spatial-sm" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
          {[
            { id: 'restaurant', label: 'Restaurant', icon: Utensils, cuisine: 'Restaurant' },
            { id: 'fastfood', label: 'Fast Food', icon: Zap, cuisine: 'Fast Food' },
            { id: 'cafe', label: 'Cafe', icon: Coffee, cuisine: 'Cafe' },
            { id: 'streetfood', label: 'Street Food', icon: Flame, cuisine: 'Street Food' },
            { id: 'restobar', label: 'Resto Bar', icon: Wine, cuisine: 'Resto Bar' },
            { id: 'pizza', label: 'Pizza & Pasta', icon: Pizza, cuisine: 'Pizza' },
          ].map((cat) => {
            const IconComp = cat.icon;
            const isSelected = activeCategory === cat.cuisine;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.cuisine)}
                className={`spatial-card p-5 flex flex-col items-center justify-center gap-3 transition-all duration-300 group rounded-3xl ${
                  isSelected
                    ? 'border-cordova-gold dark:border-cordova-gold ring-2 ring-cordova-gold/40 bg-amber-500/15 dark:bg-amber-500/20 shadow-spatial-md scale-[1.04]'
                    : 'bg-white/90 dark:bg-[#16201a]/90 hover:border-cordova-gold/70 dark:hover:border-cordova-gold/70'
                }`}
              >
                <div className="text-cordova-gold group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">
                  <IconComp size={28} strokeWidth={2} />
                </div>
                <span className="font-serif text-xs sm:text-sm font-extrabold text-center text-stone-900 dark:text-stone-100 group-hover:text-cordova-green dark:group-hover:text-emerald-400 transition-colors">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* RECOMMENDED FOR YOU SWIPEABLE CAROUSEL SECTION */}
      <section className="max-w-6xl mx-auto px-4 mt-20 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-cordova-gold animate-pulse drop-shadow-sm" />
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white">
                Recommended For You
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
              {user
                ? 'Ranked for your saved preferences and personalized by your feedback.'
                : 'Top-rated culinary hotspots and local favorites in Cordova.'}
            </p>
            <div className="h-0.5 w-16 bg-cordova-gold mt-3 rounded-full" />
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            {user ? (
              <button
                onClick={() => router.push('/profile#taste-preferences')}
                className="text-xs font-semibold text-cordova-green dark:text-emerald-400 hover:text-emerald-600 transition-colors px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm shadow-spatial-sm hover:scale-105 active:scale-95"
              >
                Adjust Preferences
              </button>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="text-xs font-semibold text-cordova-gold hover:text-amber-500 transition-colors px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 backdrop-blur-sm shadow-spatial-sm hover:scale-105 active:scale-95"
              >
                Personalize Tastes
              </button>
            )}

            {/* Swipe / Carousel Control Arrows */}
            {recommendations.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollRec('left')}
                  className="p-2.5 rounded-full bg-white/80 dark:bg-[#1a221d]/80 backdrop-blur-md border border-stone-200/80 dark:border-white/10 shadow-spatial-sm hover:bg-cordova-green hover:text-white dark:hover:bg-emerald-700 dark:hover:text-white transition-all text-stone-700 dark:text-stone-300 active:scale-90"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => scrollRec('right')}
                  className="p-2.5 rounded-full bg-white/80 dark:bg-[#1a221d]/80 backdrop-blur-md border border-stone-200/80 dark:border-white/10 shadow-spatial-sm hover:bg-cordova-green hover:text-white dark:hover:bg-emerald-700 dark:hover:text-white transition-all text-stone-700 dark:text-stone-300 active:scale-90"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        {recLoading ? (
          <RestaurantGridSkeleton count={3} />
        ) : recommendations.length > 0 ? (
          /* Horizontal Swipeable Container */
          <div
            ref={recScrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 pt-2 px-1 scroll-smooth"
          >
            {recommendations.map(({ restaurant, score, matchedPreferences, reason }, idx) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: Math.min(idx, 8) * 0.06 }}
                className="snap-start shrink-0 w-[290px] sm:w-[320px] lg:w-[350px]"
              >
                <RestaurantCard
                  restaurant={restaurant}
                  matchScore={score}
                  matchedPreferences={matchedPreferences}
                  suggestionReason={reason}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="spatial-card p-8 text-center text-stone-500 max-w-md mx-auto">
            <p className="text-2xl mb-2">✨</p>
            <p className="font-serif font-medium text-stone-800 dark:text-stone-200 mb-1">
              Personalize Your Experience
            </p>
            <p className="text-xs text-stone-500 mb-4">
              Set your food preferences to get personalized restaurant recommendations.
            </p>
            <button
              onClick={() => router.push(user ? '/profile#taste-preferences' : '/login')}
              className="bg-cordova-green hover:bg-cordova-greenHover text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-spatial-sm active:scale-95"
            >
              Set Preferences
            </button>
          </div>
        )}
      </section>

      {/* ALL ESTABLISHMENTS SECTION */}
      <section ref={establishmentsRef} className="max-w-6xl mx-auto px-4 mt-24 scroll-mt-6 relative z-10">
        {/* Active Search Feedback Banner */}
        {debouncedQuery.trim() && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 sm:p-5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-300/40 dark:border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xl shadow-spatial-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Search size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-200/60 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
                    Search Active
                  </span>
                  <p className="text-sm sm:text-base font-bold text-stone-900 dark:text-white">
                    Showing results for &ldquo;{debouncedQuery}&rdquo;
                  </p>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                  {meta?.totalCount ?? restaurants.length} {meta?.totalCount === 1 ? 'establishment matches' : 'establishments match'} your query in Cordova
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setSearchQuery('');
                setDebouncedQuery('');
                setPage(1);
              }}
              className="text-xs font-bold text-emerald-800 dark:text-emerald-200 hover:text-emerald-950 dark:hover:text-white px-3.5 py-2 rounded-xl bg-emerald-200/50 hover:bg-emerald-200 dark:bg-emerald-800/40 dark:hover:bg-emerald-800/80 transition-all flex items-center gap-1.5 shrink-0 border border-emerald-300/50 dark:border-emerald-600/50 shadow-spatial-sm active:scale-95"
            >
              <X size={14} />
              <span>Clear Search</span>
            </button>
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white capitalize">
              {debouncedQuery.trim()
                ? `Search Results for "${debouncedQuery}"`
                : (activeCategory ? `${activeCategory} Establishments` : 'All Establishments')}
            </h2>
            <div className="h-0.5 w-16 bg-cordova-gold mt-3 rounded-full" />
          </div>
        </div>

        {loading ? (
          <RestaurantGridSkeleton count={6} />
        ) : restaurants.length === 0 ? (
          <div className="spatial-card p-12 text-center text-stone-500 max-w-md mx-auto">
            <p className="text-3xl mb-3">🍽️</p>
            <p className="font-serif text-lg font-medium text-stone-800 dark:text-stone-200 mb-1">
              No establishments found
            </p>
            <p className="text-xs text-stone-500">
              {debouncedQuery.trim()
                ? `No restaurants found matching "${debouncedQuery}". Try a different search term.`
                : 'Try adjusting your search query or selecting a different category.'}
            </p>
            {(activeCategory || searchQuery || debouncedQuery) && (
              <button
                onClick={() => {
                  setActiveCategory(null);
                  setSearchQuery('');
                  setDebouncedQuery('');
                  setPage(1);
                }}
                className="mt-4 text-xs font-semibold text-cordova-green dark:text-emerald-400 hover:underline"
              >
                Clear search & filters
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
                <Pagination meta={meta} onPageChange={handlePageChange} />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
