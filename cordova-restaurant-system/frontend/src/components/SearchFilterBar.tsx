import { useState, useEffect } from 'react';
import { Search, MapPin, SlidersHorizontal, X, Compass, DollarSign, Utensils, Sparkles, Check, Clock } from 'lucide-react';
import type { PriceRange } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { api } from '@/lib/api';
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
  cuisine: string;
  priceRange: string;
  maxDistanceKm: number;
  dietaryTags: string[];
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

const CATEGORIES = [
  'All Categories',
  'Seafood',
  'Filipino',
  'Restaurant',
  'Fast Food',
  'Cafe',
  'Street Food',
  'Resto Bar',
  'Pizza',
];

const PRICE_TIERS: { label: string; value: PriceRange }[] = [
  { label: '₱ Budget', value: 'budget' },
  { label: '₱₱ Moderate', value: 'moderate' },
  { label: '₱₱₱ Expensive', value: 'expensive' },
  { label: '₱₱₱₱ Premium', value: 'premium' },
];

const DIETARY_OPTIONS = [
  { label: 'Vegetarian', value: 'vegetarian' },
  { label: 'Vegan', value: 'vegan' },
  { label: 'Halal', value: 'halal' },
  { label: 'Gluten-Free', value: 'gluten_free' },
  { label: 'Pescatarian', value: 'pescatarian' },
];

export function SearchFilterBar({
  filters,
  onFilterChange,
  onSearch,
  loading = false,
}: SearchFilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const [loadingPrefs, setLoadingPrefs] = useState(false);
  const [appliedPrefSummary, setAppliedPrefSummary] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    setRecentSearches(getSearchHistory());
    return onActivityChange(() => {
      setRecentSearches(getSearchHistory());
    });
  }, []);

  const handleApplyPreferences = async () => {
    if (!user) {
      toast('Please log in or sign up to personalize search with your taste preferences', 'info');
      return;
    }

    if (filters.applyPreferences) {
      // Toggle off
      const next = { ...filters, applyPreferences: false };
      onFilterChange(next);
      onSearch(next);
      setAppliedPrefSummary(null);
      toast('Preference personalization turned off', 'info');
      return;
    }

    setLoadingPrefs(true);
    try {
      const res = await api.get('/api/users/me/preferences');
      const prefs = res.data?.preferences;
      if (
        !prefs ||
        (!prefs.preferred_cuisines?.length && !prefs.budget_range && !prefs.dietary_restrictions?.length)
      ) {
        toast('No saved taste preferences found. Set them in your profile!', 'info');
        return;
      }

      const nextFilters: SearchFilterState = {
        ...filters,
        applyPreferences: true,
        priceRange: prefs.budget_range || filters.priceRange,
        dietaryTags:
          Array.isArray(prefs.dietary_restrictions) && prefs.dietary_restrictions.length > 0
            ? Array.from(new Set([...filters.dietaryTags, ...prefs.dietary_restrictions]))
            : filters.dietaryTags,
      };

      if (!filters.cuisine && prefs.preferred_cuisines?.[0]) {
        const matchedCat = CATEGORIES.find(
          (c) =>
            c.toLowerCase() === prefs.preferred_cuisines[0].toLowerCase() ||
            prefs.preferred_cuisines[0].toLowerCase().includes(c.toLowerCase())
        );
        if (matchedCat) nextFilters.cuisine = matchedCat;
      }

      const summaryParts: string[] = [];
      if (prefs.preferred_cuisines?.length) summaryParts.push(prefs.preferred_cuisines.slice(0, 2).join(', '));
      if (prefs.budget_range) summaryParts.push(prefs.budget_range.toUpperCase());
      if (prefs.dietary_restrictions?.length) summaryParts.push(prefs.dietary_restrictions.join(', '));

      setAppliedPrefSummary(summaryParts.join(' • '));
      onFilterChange(nextFilters);
      onSearch(nextFilters);
      toast('Applied your taste preferences to this search!', 'success');
    } catch {
      toast('Could not retrieve preferences. Please try again.', 'error');
    } finally {
      setLoadingPrefs(false);
    }
  };

  const handleKeywordChange = (keyword: string) => {
    onFilterChange({ ...filters, keyword });
  };

  const handleCuisineChange = (cuisine: string) => {
    const next = cuisine === 'All Categories' || cuisine === 'All Cuisines' ? '' : cuisine;
    onFilterChange({ ...filters, cuisine: next });
  };

  const handlePriceChange = (priceRange: string) => {
    const next = filters.priceRange === priceRange ? '' : priceRange;
    onFilterChange({ ...filters, priceRange: next });
  };

  const handleDietaryToggle = (tag: string) => {
    const exists = filters.dietaryTags.includes(tag);
    const dietaryTags = exists
      ? filters.dietaryTags.filter((t) => t !== tag)
      : [...filters.dietaryTags, tag];
    onFilterChange({ ...filters, dietaryTags });
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    setLocationStatus('Locating you...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setLocationStatus('Location set!');
        onFilterChange({
          ...filters,
          userLat: pos.coords.latitude,
          userLng: pos.coords.longitude,
        });
      },
      (err) => {
        setLocating(false);
        setLocationStatus('Could not retrieve location');
        console.warn('Geolocation error:', err);
      },
      { timeout: 8000 }
    );
  };

  const handleClear = () => {
    const cleared: SearchFilterState = {
      keyword: '',
      cuisine: '',
      priceRange: '',
      maxDistanceKm: 10,
      dietaryTags: [],
      userLat: undefined,
      userLng: undefined,
      applyPreferences: false,
    };
    onFilterChange(cleared);
    onSearch(cleared);
    setLocationStatus(null);
    setAppliedPrefSummary(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filters.keyword.trim() || filters.cuisine) {
      saveSearchHistory({
        query: filters.keyword,
        cuisine: filters.cuisine,
        priceRange: filters.priceRange,
        source: 'search',
      });
    }
    onSearch();
  };

  const activeFilterCount =
    (filters.cuisine ? 1 : 0) +
    (filters.priceRange ? 1 : 0) +
    (filters.dietaryTags.length > 0 ? 1 : 0) +
    (filters.userLat != null ? 1 : 0) +
    (filters.applyPreferences ? 1 : 0);

  return (
    <div className="bg-white/80 dark:bg-[#161c18]/80 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-2xl shadow-spatial-md p-4 sm:p-6 mb-8 transition-all duration-300">
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

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all shrink-0 ${
              showAdvanced || activeFilterCount > 0
                ? 'border-cordova-green text-cordova-green bg-cordova-green/10 dark:bg-emerald-500/15'
                : 'border-stone-300/80 dark:border-white/10 text-stone-700 dark:text-stone-300 hover:bg-stone-100/80 dark:hover:bg-white/10'
            }`}
          >
            <SlidersHorizontal size={14} />
            <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-cordova-green to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-spatial-sm transition-all disabled:opacity-50 active:scale-95"
          >
            {loading ? (
              <span>Searching...</span>
            ) : (
              <>
                <Search size={15} />
                <span>Search & Rank</span>
              </>
            )}
          </button>
        </div>
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
                      cuisine: item.cuisine || filters.cuisine,
                    };
                    saveSearchHistory({
                      query: item.query,
                      cuisine: item.cuisine,
                      priceRange: item.priceRange,
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

      {/* Advanced Filter Drawer */}
      {showAdvanced && (
        <div className="mt-6 pt-5 border-t border-stone-200 dark:border-stone-800 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Taste Preferences Quick-Apply Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30">
            <div className="flex items-center gap-2.5">
              <Sparkles size={18} className="text-cordova-gold shrink-0 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-stone-900 dark:text-white">
                  Personalize with My Taste Preferences
                </p>
                <p className="text-[11px] text-stone-600 dark:text-stone-300">
                  {appliedPrefSummary
                    ? `Active profile filters: ${appliedPrefSummary}`
                    : 'Auto-apply your saved favorite cuisines, budget tier, and dietary needs'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleApplyPreferences}
              disabled={loadingPrefs}
              className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs ${
                filters.applyPreferences
                  ? 'bg-cordova-green text-white hover:bg-emerald-700'
                  : 'bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:border-cordova-gold'
              }`}
            >
              {loadingPrefs ? (
                'Loading...'
              ) : filters.applyPreferences ? (
                <>
                  <Check size={13} />
                  <span>Preferences Active (Click to Clear)</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} className="text-cordova-gold" />
                  <span>Apply My Profile Tastes</span>
                </>
              )}
            </button>
          </div>
          {/* Row 1: Cuisine & Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Category Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2 flex items-center gap-1.5">
                <Utensils size={13} className="text-cordova-gold" />
                <span>Establishment Category</span>
              </label>
              <select
                value={filters.cuisine || 'All Categories'}
                onChange={(e) => handleCuisineChange(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-cordova-green"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2 flex items-center gap-1.5">
                <DollarSign size={13} className="text-cordova-gold" />
                <span>Price Range</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRICE_TIERS.map((tier) => {
                  const isSelected = filters.priceRange === tier.value;
                  return (
                    <button
                      key={tier.value}
                      type="button"
                      onClick={() => handlePriceChange(tier.value)}
                      className={`px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-cordova-green text-white shadow-sm ring-2 ring-cordova-green/30'
                          : 'bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-cordova-gold'
                      }`}
                    >
                      {tier.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 2: Proximity Slider & Geolocation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Compass size={13} className="text-cordova-gold" />
                  <span>Max Proximity: {filters.maxDistanceKm} km</span>
                </label>
              </div>
              <input
                type="range"
                min={1}
                max={25}
                step={1}
                value={filters.maxDistanceKm}
                onChange={(e) =>
                  onFilterChange({ ...filters, maxDistanceKm: Number(e.target.value) })
                }
                className="w-full accent-cordova-green h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                <span>1 km (Near)</span>
                <span>10 km</span>
                <span>25 km (Whole Island)</span>
              </div>
            </div>

            {/* Geolocation Button */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2 flex items-center gap-1.5">
                <MapPin size={13} className="text-cordova-gold" />
                <span>Your Location</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={locating}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                    filters.userLat != null
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                      : 'bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-cordova-gold'
                  }`}
                >
                  <MapPin size={13} />
                  <span>
                    {locating
                      ? 'Locating...'
                      : filters.userLat != null
                      ? 'Location Applied'
                      : 'Use My Current Location'}
                  </span>
                </button>

                {filters.userLat != null && (
                  <button
                    type="button"
                    onClick={() => {
                      onFilterChange({ ...filters, userLat: undefined, userLng: undefined });
                      setLocationStatus(null);
                    }}
                    className="text-xs text-stone-400 hover:text-red-500"
                  >
                    Clear Location
                  </button>
                )}
              </div>
              {locationStatus && (
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                  {locationStatus}
                </p>
              )}
            </div>
          </div>

          {/* Row 3: Dietary Tags */}
          <div className="pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2">
              Dietary Options
            </label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((opt) => {
                const isSelected = filters.dietaryTags.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleDietaryToggle(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-cordova-green text-white shadow-sm ring-1 ring-cordova-green'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reset Filters */}
          {activeFilterCount > 0 && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-semibold text-stone-500 hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <X size={14} />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
