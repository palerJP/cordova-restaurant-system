'use client';

import { useState, useEffect } from 'react';
import { Search, X, Clock } from 'lucide-react';
import {
  getSearchHistory,
  saveSearchHistory,
  deleteSearchHistoryItem,
  clearSearchHistory,
  onActivityChange,
  type SearchHistoryItem,
} from '@/lib/activity-history';

export interface SearchFilterState {
  keyword: string;
  cuisine?: string;
  priceRange?: string;
  maxDistanceKm?: number;
  dietaryTags?: string[];
  userLat?: number;
  userLng?: number;
  applyPreferences?: boolean;
}

interface SearchFilterBarProps {
  filters: SearchFilterState;
  onFilterChange: (newFilters: SearchFilterState) => void;
  onSearch: (filters?: SearchFilterState) => void;
  loading?: boolean;
}

export function SearchFilterBar({
  filters,
  onFilterChange,
  onSearch,
  loading = false,
}: SearchFilterBarProps) {
  const [recentSearches, setRecentSearches] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    setRecentSearches(getSearchHistory());
    return onActivityChange(() => {
      setRecentSearches(getSearchHistory());
    });
  }, []);

  const handleKeywordChange = (keyword: string) => {
    onFilterChange({ ...filters, keyword });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filters.keyword.trim()) {
      saveSearchHistory({
        query: filters.keyword.trim(),
        source: 'search',
      });
    }
    onSearch();
  };

  return (
    <div className="bg-white/80 dark:bg-[#161c18]/80 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-2xl shadow-spatial-md p-4 sm:p-5 mb-8 transition-all duration-300">
      {/* Primary Search Bar Form */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
          />
          <input
            type="text"
            value={filters.keyword}
            onChange={(e) => handleKeywordChange(e.target.value)}
            placeholder="Search restaurants, dishes (e.g. Bangus, Pizza, Baked Scallops)..."
            className="w-full pl-10 pr-10 py-3 text-sm bg-stone-100/70 dark:bg-black/30 border border-stone-200/80 dark:border-white/10 rounded-xl text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-cordova-green/50 backdrop-blur-sm"
          />
          {filters.keyword && (
            <button
              type="button"
              onClick={() => handleKeywordChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-cordova-green to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-7 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-spatial-sm transition-all disabled:opacity-50 active:scale-95"
        >
          {loading ? (
            <span>Searching...</span>
          ) : (
            <>
              <Search size={15} />
              <span>Search</span>
            </>
          )}
        </button>
      </form>

      {/* Quick Recent Searches Bar */}
      {recentSearches.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-3.5 border-t border-stone-200/60 dark:border-white/5 mt-3.5">
          <div className="flex items-center gap-1 text-[11px] font-bold text-stone-500 dark:text-stone-400 mr-1 uppercase tracking-wider">
            <Clock size={12} className="text-cordova-gold" />
            <span>Recent:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 flex-1">
            {recentSearches.slice(0, 6).map((item) => (
              <span
                key={item.id}
                className="group inline-flex items-center gap-1 bg-stone-100/90 dark:bg-[#202923] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-stone-700 dark:text-stone-300 text-xs px-2.5 py-1 rounded-lg transition-all duration-200 border border-stone-200/80 dark:border-white/10 hover:border-emerald-400/50"
              >
                <button
                  type="button"
                  onClick={() => {
                    const updated = {
                      ...filters,
                      keyword: item.query,
                    };
                    saveSearchHistory({
                      query: item.query,
                      source: 'search',
                    });
                    onFilterChange(updated);
                    onSearch(updated);
                  }}
                  className="hover:text-cordova-green dark:hover:text-emerald-400 cursor-pointer font-medium"
                >
                  {item.query}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSearchHistoryItem(item.id);
                  }}
                  className="text-stone-400 hover:text-red-500 dark:hover:text-red-400 p-0.5 rounded transition-colors"
                  title="Remove from history"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={clearSearchHistory}
              className="text-[11px] text-stone-400 hover:text-red-500 dark:hover:text-red-400 underline ml-auto px-1 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
