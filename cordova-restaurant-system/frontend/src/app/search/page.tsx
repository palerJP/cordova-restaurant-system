'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, Star, MapPin } from 'lucide-react';
import { SearchFilterBar, SearchFilterState } from '@/components/SearchFilterBar';
import { RestaurantResultsList } from '@/components/RestaurantResultsList';
import { api } from '@/lib/api';
import type { Restaurant } from '@/lib/types';
import { getAllStaticRestaurants, isRestaurantVisible } from '@/data/restaurants';
import { aiSearchRestaurants } from '@/lib/aiSearch';
import {
  getRecentlyViewed,
  saveSearchHistory,
  clearRecentlyViewed,
  onActivityChange,
  type RecentlyViewedRestaurant,
} from '@/lib/activity-history';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || searchParams.get('keyword') || '';
  const initialCuisine = searchParams.get('cuisine') || '';

  const [filters, setFilters] = useState<SearchFilterState>({
    keyword: initialQuery,
    cuisine: initialCuisine,
    priceRange: '',
    maxDistanceKm: 10,
    dietaryTags: [],
    userLat: undefined,
    userLng: undefined,
  });

  const [results, setResults] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedRestaurant[]>([]);

  const fetchResults = useCallback(async (activeFilters: SearchFilterState) => {
    setLoading(true);
    if (activeFilters.keyword.trim() || activeFilters.cuisine) {
      saveSearchHistory({
        query: activeFilters.keyword,
        cuisine: activeFilters.cuisine,
        priceRange: activeFilters.priceRange,
        source: 'search',
      });
    }
    try {
      const res = await api.post(
        '/api/search',
        {
          keyword: activeFilters.keyword,
          cuisine: activeFilters.cuisine,
          priceRange: activeFilters.priceRange || undefined,
          maxDistanceKm: activeFilters.maxDistanceKm,
          dietaryTags: activeFilters.dietaryTags,
          userLat: activeFilters.userLat,
          userLng: activeFilters.userLng,
          applyPreferences: activeFilters.applyPreferences,
        },
        { auth: true }
      );

      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setResults(res.data);
      } else {
        // Fallback to static directory with AI semantic search
        const staticList = getAllStaticRestaurants().filter(isRestaurantVisible);
        const filtered = aiSearchRestaurants(staticList, activeFilters.keyword, activeFilters.cuisine);
        setResults(filtered);
      }
    } catch (err) {
      console.warn('API search failed, falling back to static directory', err);
      // Fallback to static directory with AI semantic search
      const staticList = getAllStaticRestaurants().filter(isRestaurantVisible);
      const filtered = aiSearchRestaurants(staticList, activeFilters.keyword, activeFilters.cuisine);
      setResults(filtered);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults(filters);
    setRecentlyViewed(getRecentlyViewed());
    return onActivityChange(() => {
      setRecentlyViewed(getRecentlyViewed());
    });
  }, []);

  const handleSearch = (customFilters?: SearchFilterState) => {
    const active = customFilters || filters;
    fetchResults(active);
  };

  const handleResetFilters = () => {
    const cleared: SearchFilterState = {
      keyword: '',
      cuisine: '',
      priceRange: '',
      maxDistanceKm: 10,
      dietaryTags: [],
      userLat: undefined,
      userLng: undefined,
    };
    setFilters(cleared);
    fetchResults(cleared);
  };

  return (
    <div className="min-h-screen bg-cordova-cream dark:bg-[#121614] pb-20 pt-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-cordova-gold">
            CORDOVA DINING DISCOVERY
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white mt-1 mb-3">
            Find the Perfect Cordova Dining Experience
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
            Search verified establishments, specialties, and local dining spots across Cordova.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <SearchFilterBar
          filters={filters}
          onFilterChange={setFilters}
          onSearch={handleSearch}
          loading={loading}
        />

        {/* Recently Viewed Restaurants Shelf */}
        {recentlyViewed.length > 0 && (
          <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-[#161c18]/70 backdrop-blur-md border border-stone-200/80 dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-cordova-green dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                  Recently Viewed Restaurants
                </h3>
                <span className="text-[11px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-2 py-0.5 rounded-full">
                  {recentlyViewed.length}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/history"
                  className="text-xs font-semibold text-cordova-green dark:text-emerald-400 hover:underline"
                >
                  View Full History →
                </Link>
                <button
                  type="button"
                  onClick={clearRecentlyViewed}
                  className="text-xs text-stone-400 hover:text-red-500 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
              {recentlyViewed.map((item) => (
                <Link
                  key={item.id}
                  href={`/restaurants/${item.slug}`}
                  className="group flex items-center gap-3 min-w-[240px] max-w-[280px] p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900/60 hover:bg-stone-100 dark:hover:bg-stone-800/80 border border-stone-200/60 dark:border-white/5 transition-all duration-200 hover:shadow-sm shrink-0"
                >
                  <div className="relative h-14 w-14 rounded-lg overflow-hidden shrink-0 bg-stone-200 dark:bg-stone-800">
                    {item.coverImageUrl ? (
                      <Image
                        src={item.coverImageUrl}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">🍽️</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-stone-900 dark:text-white truncate group-hover:text-cordova-green dark:group-hover:text-emerald-400">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">
                      {item.avgRating ? (
                        <span className="flex items-center gap-0.5 font-bold text-amber-600 dark:text-amber-400">
                          <Star size={11} className="fill-cordova-gold text-cordova-gold" />
                          {item.avgRating.toFixed(1)}
                        </span>
                      ) : null}
                      {item.category && <span className="truncate">{item.category}</span>}
                      {item.priceRange && (
                        <span className="font-semibold text-stone-600 dark:text-stone-300 uppercase">
                          {item.priceRange}
                        </span>
                      )}
                    </div>
                    {item.barangay && (
                      <p className="text-[10px] text-stone-400 dark:text-stone-500 truncate mt-0.5 flex items-center gap-0.5">
                        <MapPin size={10} /> {item.barangay}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Results List */}
        <RestaurantResultsList
          restaurants={results}
          loading={loading}
          onResetFilters={handleResetFilters}
        />
      </div>
    </div>
  );
}
