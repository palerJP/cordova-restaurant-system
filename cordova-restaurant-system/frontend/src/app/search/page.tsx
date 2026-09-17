'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchFilterBar, SearchFilterState } from '@/components/SearchFilterBar';
import { RestaurantResultsList } from '@/components/RestaurantResultsList';
import { api } from '@/lib/api';
import type { Restaurant } from '@/lib/types';
import { getAllStaticRestaurants, isRestaurantVisible } from '@/data/restaurants';
import { aiSearchRestaurants } from '@/lib/aiSearch';

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

  const fetchResults = useCallback(async (activeFilters: SearchFilterState) => {
    setLoading(true);
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
        },
        { auth: false }
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
            AI-POWERED SEARCH & RANKING
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white mt-1 mb-3">
            Find the Perfect Cordova Dining Experience
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
            Intelligently ranked by dish relevance, cuisine match, price tier, live distance, and paid subscription boosts.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <SearchFilterBar
          filters={filters}
          onFilterChange={setFilters}
          onSearch={handleSearch}
          loading={loading}
        />

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
