'use client';

import { motion } from 'framer-motion';
import { RestaurantCard } from '@/components/RestaurantCard';
import { RestaurantGridSkeleton } from '@/components/ui/Skeleton';
import type { Restaurant } from '@/lib/types';
import { Sparkles, Info } from 'lucide-react';

interface RestaurantResultsListProps {
  restaurants: Restaurant[];
  loading: boolean;
  onResetFilters?: () => void;
}

export function RestaurantResultsList({
  restaurants,
  loading,
  onResetFilters,
}: RestaurantResultsListProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-48 bg-stone-200 dark:bg-stone-800 rounded animate-pulse" />
        <RestaurantGridSkeleton count={6} />
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-xl p-12 text-center text-stone-500 max-w-md mx-auto my-8 shadow-sm">
        <p className="text-4xl mb-3">🔍</p>
        <h3 className="font-serif text-lg font-bold text-stone-800 dark:text-stone-200 mb-1">
          No establishments found
        </h3>
        <p className="text-xs text-stone-500 mb-4">
          Try loosening your filters, broadening distance, or searching a different keyword.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="bg-cordova-green hover:bg-cordova-greenHover text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            Clear All Filters
          </button>
        )}
      </div>
    );
  }

  const sponsoredCount = restaurants.filter((r) => r.isSponsored).length;

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <Sparkles size={20} className="text-cordova-gold" />
            <span>AI Ranked Results ({restaurants.length})</span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Ranked by relevance (text, cuisine, price, distance, rating) with paid subscription boosts.
          </p>
        </div>

        {sponsoredCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800/80">
            <Info size={13} className="shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Top {sponsoredCount} featured results are sponsored</span>
          </div>
        )}
      </div>

      {/* Grid of Restaurant Cards */}
      <div className="restaurant-grid">
        {restaurants.map((restaurant, idx) => (
          <motion.div
            key={restaurant.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: Math.min(idx, 9) * 0.05 }}
          >
            <RestaurantCard restaurant={restaurant} source="search" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
