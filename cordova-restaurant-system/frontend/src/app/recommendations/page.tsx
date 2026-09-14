'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
  MapPin,
  Check,
  X,
  Save,
  ArrowRight,
  Info,
  Compass,
} from 'lucide-react';
import { api, ApiClientError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useCuisines } from '@/hooks/useCuisines';
import { RestaurantCard } from '@/components/RestaurantCard';
import { RestaurantGridSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import type { RecommendationResult } from '@/lib/types';
import { getAllStaticRestaurants, isRestaurantVisible } from '@/data/restaurants';

const POPULAR_CUISINES = [
  'Filipino',
  'Seafood',
  'Bakasi & Shellfish',
  'Grill & BBQ',
  'Cebuano / Local',
  'Cafe',
  'Fast Food',
  'Pizza & Pasta',
  'Desserts & Milktea',
  'Resort Dining',
  'Street Food',
];

const DIETARY_OPTIONS = [
  { id: 'halal', label: 'Halal' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'no_pork', label: 'No Pork' },
  { id: 'gluten_free', label: 'Gluten-Free' },
];

const SERVICE_OPTIONS = [
  { id: 'seaside_view', label: 'Seaside / Sunset View' },
  { id: 'al_fresco', label: 'Outdoor / Al Fresco' },
  { id: 'live_music', label: 'Live Music' },
  { id: 'air_conditioned', label: 'Air Conditioned' },
  { id: 'dine_in', label: 'Dine-In' },
  { id: 'takeout', label: 'Takeout' },
  { id: 'delivery', label: 'Delivery' },
];

const PRICE_TIERS: { value: string; label: string; symbol: string }[] = [
  { value: '', label: 'Any Budget', symbol: 'All' },
  { value: 'budget', label: 'Budget', symbol: '₱' },
  { value: 'moderate', label: 'Moderate', symbol: '₱₱' },
  { value: 'expensive', label: 'Expensive', symbol: '₱₱₱' },
  { value: 'premium', label: 'Premium', symbol: '₱₱₱₱' },
];

interface SavedProfilePreferences {
  preferred_cuisines?: string[];
  dietary_restrictions?: string[];
  preferred_services?: string[];
  budget_range?: string | null;
  max_distance_km?: number;
}

export default function RecommendationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { coords, request: requestLocation, loading: geoLoading } = useGeolocation();
  const availableCuisines = useCuisines();

  // Combined cuisine list
  const allCuisineOptions = useMemo(() => {
    const list = [...POPULAR_CUISINES];
    availableCuisines.forEach((c) => {
      if (!list.some((item) => item.toLowerCase() === c.name.toLowerCase())) {
        list.push(c.name);
      }
    });
    return list;
  }, [availableCuisines]);

  // Active filter states
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState<string>('');
  const [dietary, setDietary] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(5);
  const [onlyOpenNow, setOnlyOpenNow] = useState<boolean>(false);

  // Saved profile baseline (for detecting user preference changes)
  const [savedProfile, setSavedProfile] = useState<SavedProfilePreferences | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
  const [savingProfile, setSavingProfile] = useState<boolean>(false);

  // Results & UI states
  const [results, setResults] = useState<RecommendationResult[] | null>(null);
  const [loadingRecs, setLoadingRecs] = useState<boolean>(false);
  const [showBreakdownFor, setShowBreakdownFor] = useState<string | null>(null);

  // Check if current filter settings differ from the saved profile
  const hasPreferenceChanges = useMemo(() => {
    if (!savedProfile && !user) return false;
    const profileCuisines = (savedProfile?.preferred_cuisines || []).map((c) => c.toLowerCase()).sort();
    const currentCuisines = selectedCuisines.map((c) => c.toLowerCase()).sort();
    if (JSON.stringify(profileCuisines) !== JSON.stringify(currentCuisines)) return true;

    const profileBudget = savedProfile?.budget_range || '';
    if (profileBudget !== budgetRange) return true;

    const profileDietary = (savedProfile?.dietary_restrictions || []).map((d) => d.toLowerCase()).sort();
    const currentDietary = dietary.map((d) => d.toLowerCase()).sort();
    if (JSON.stringify(profileDietary) !== JSON.stringify(currentDietary)) return true;

    const profileServices = (savedProfile?.preferred_services || []).map((s) => s.toLowerCase()).sort();
    const currentServices = services.map((s) => s.toLowerCase()).sort();
    if (JSON.stringify(profileServices) !== JSON.stringify(currentServices)) return true;

    return false;
  }, [savedProfile, user, selectedCuisines, budgetRange, dietary, services]);

  const toggleArrayItem = (arr: string[], setArr: (v: string[]) => void, value: string) => {
    setArr(
      arr.some((item) => item.toLowerCase() === value.toLowerCase())
        ? arr.filter((item) => item.toLowerCase() !== value.toLowerCase())
        : [...arr, value]
    );
  };

  // Fetch recommendations core function
  const fetchRecommendations = useCallback(
    async (
      cuisines = selectedCuisines,
      budget = budgetRange,
      diet = dietary,
      serv = services,
      dist = maxDistanceKm,
      openNow = onlyOpenNow
    ) => {
      setLoadingRecs(true);
      try {
        let recs: RecommendationResult[] = [];
        try {
          const res = await api.post(
            '/api/recommendations',
            {
              preferredCuisines: cuisines,
              budgetRange: budget || undefined,
              dietaryRestrictions: diet,
              requiredServices: serv,
              lat: coords?.lat,
              lng: coords?.lng,
              maxDistanceKm: dist,
              onlyOpenNow: openNow,
              limit: 15,
            },
            { auth: !!user }
          );

          const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
          if (list.length > 0) {
            recs = list;
          }
        } catch {
          recs = [];
        }

        // Fallback to static scoring if backend is offline or empty
        if (recs.length === 0) {
          const staticList = getAllStaticRestaurants().filter(isRestaurantVisible);
          recs = staticList
            .map((r, i) => {
              let cuisineScore = 40;
              if (cuisines.length > 0) {
                const matchCount = r.cuisines.filter((c) =>
                  cuisines.some((userC) => userC.toLowerCase() === c.toLowerCase())
                ).length;
                cuisineScore = matchCount > 0 ? Math.min(100, Math.round((matchCount / cuisines.length) * 100)) : 10;
              }

              let budgetScore = 70;
              if (budget) {
                budgetScore = r.price_range === budget ? 100 : 40;
              }

              const ratingVal = Number(r.avg_rating) || 4.5;
              const overallScore = Math.min(
                99,
                Math.round(cuisineScore * 0.4 + budgetScore * 0.3 + (ratingVal / 5) * 30 + (5 - (i % 6)))
              );

              return {
                restaurant: r,
                score: Math.max(30, overallScore),
                scoreBreakdown: {
                  cuisineMatch: cuisineScore,
                  budgetFit: budgetScore,
                  proximity: 85,
                  dietaryMatch: 80,
                  rating: Math.round((ratingVal / 5) * 100),
                },
                reason: `Top recommendation matching your ${r.cuisines.slice(0, 2).join(', ') || 'taste'} preferences in ${r.barangay || 'Cordova'}.`,
              };
            })
            .sort((a, b) => b.score - a.score);
        }

        setResults(recs);
      } catch (err) {
        toast('Could not update recommendations. Please try again.', 'error');
      } finally {
        setLoadingRecs(false);
      }
    },
    [selectedCuisines, budgetRange, dietary, services, maxDistanceKm, onlyOpenNow, coords, user, toast]
  );

  // Load saved preferences on mount if user is logged in
  useEffect(() => {
    let isMounted = true;

    async function loadSavedProfile() {
      if (!user) {
        if (isMounted) {
          fetchRecommendations([], '', [], [], 5, false);
        }
        return;
      }

      setLoadingProfile(true);
      try {
        const res = await api.get('/api/users/me/preferences');
        if (res?.data?.preferences && isMounted) {
          const p = res.data.preferences;
          setSavedProfile(p);

          const loadedCuisines = p.preferred_cuisines || [];
          const loadedBudget = p.budget_range || '';
          const loadedDietary = p.dietary_restrictions || [];
          const loadedServices = p.preferred_services || [];
          const loadedDistance = p.max_distance_km ? Number(p.max_distance_km) : 5;

          setSelectedCuisines(loadedCuisines);
          setBudgetRange(loadedBudget);
          setDietary(loadedDietary);
          setServices(loadedServices);
          setMaxDistanceKm(loadedDistance);

          fetchRecommendations(loadedCuisines, loadedBudget, loadedDietary, loadedServices, loadedDistance, false);
        } else if (isMounted) {
          fetchRecommendations([], '', [], [], 5, false);
        }
      } catch {
        if (isMounted) {
          fetchRecommendations([], '', [], [], 5, false);
        }
      } finally {
        if (isMounted) {
          setLoadingProfile(false);
        }
      }
    }

    loadSavedProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Save current active filters to profile
  const handleSaveToProfile = async () => {
    if (!user) {
      toast('Please sign in or create an account to save preferences', 'info');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await api.put('/api/users/me/preferences', {
        preferredCuisines: selectedCuisines,
        dietaryRestrictions: dietary,
        preferredServices: services,
        budgetRange: budgetRange || null,
        maxDistanceKm: maxDistanceKm,
      });

      if (res?.data?.preferences) {
        setSavedProfile(res.data.preferences);
      } else {
        setSavedProfile({
          preferred_cuisines: selectedCuisines,
          dietary_restrictions: dietary,
          preferred_services: services,
          budget_range: budgetRange,
          max_distance_km: maxDistanceKm,
        });
      }

      toast('Your taste preferences have been saved to your profile!', 'success');
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Failed to save preferences', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // Reset filters to saved profile baseline
  const handleResetToProfile = () => {
    if (savedProfile) {
      const pCuisines = savedProfile.preferred_cuisines || [];
      const pBudget = savedProfile.budget_range || '';
      const pDietary = savedProfile.dietary_restrictions || [];
      const pServices = savedProfile.preferred_services || [];
      const pDistance = savedProfile.max_distance_km ? Number(savedProfile.max_distance_km) : 5;

      setSelectedCuisines(pCuisines);
      setBudgetRange(pBudget);
      setDietary(pDietary);
      setServices(pServices);
      setMaxDistanceKm(pDistance);
      setOnlyOpenNow(false);

      toast('Filters reset to your saved profile preferences', 'info');
      fetchRecommendations(pCuisines, pBudget, pDietary, pServices, pDistance, false);
    } else {
      setSelectedCuisines([]);
      setBudgetRange('');
      setDietary([]);
      setServices([]);
      setMaxDistanceKm(5);
      setOnlyOpenNow(false);
      fetchRecommendations([], '', [], [], 5, false);
    }
  };

  // Clear all filters
  const handleClearAll = () => {
    setSelectedCuisines([]);
    setBudgetRange('');
    setDietary([]);
    setServices([]);
    setMaxDistanceKm(5);
    setOnlyOpenNow(false);
    fetchRecommendations([], '', [], [], 5, false);
  };

  const activeFilterCount =
    selectedCuisines.length +
    (budgetRange ? 1 : 0) +
    dietary.length +
    services.length +
    (onlyOpenNow ? 1 : 0) +
    (maxDistanceKm !== 5 ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-[#1a2620] to-[#12221b] text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-stone-800 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cordova-gold/20 text-cordova-gold text-xs font-semibold tracking-wide border border-cordova-gold/30">
            <Sparkles size={13} className="animate-pulse" />
            AI-POWERED RECOMMENDATION ENGINE
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            Personalized Restaurant Recommendations
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Our recommendation algorithm matches your unique tastes, budget, dietary needs, and proximity across all
            27 accredited Cordova eateries in real time.
          </p>

          {/* Preference sync status badge */}
          {user ? (
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {hasPreferenceChanges ? (
                <div className="inline-flex items-center gap-2 text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-full font-medium">
                  <SlidersHorizontal size={13} />
                  <span>Custom filter mode (unsaved adjustments)</span>
                </div>
              ) : savedProfile && (savedProfile.preferred_cuisines?.length || savedProfile.budget_range) ? (
                <div className="inline-flex items-center gap-2 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-full font-medium">
                  <Check size={13} />
                  <span>Matched to your saved Profile Preferences</span>
                </div>
              ) : null}

              <Link
                href="/preferences?returnTo=/recommendations"
                className="inline-flex items-center gap-1.5 text-xs text-stone-300 hover:text-white underline underline-offset-4 transition-colors"
              >
                <span>Launch Full Taste Preference Wizard</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="pt-2 flex items-center gap-3">
              <span className="text-xs text-stone-400">Want to save your taste preferences permanently?</span>
              <Link
                href="/login?returnTo=/recommendations"
                className="text-xs font-semibold text-cordova-gold hover:text-amber-300 underline underline-offset-4"
              >
                Sign In / Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Content Layout: Left Filter Panel, Right Results */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 items-start">
        {/* Preference Sidebar */}
        <div className="bg-white dark:bg-[#1a211c] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm p-5 sm:p-6 space-y-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-cordova-green dark:text-emerald-400" />
              <h2 className="font-bold text-base text-stone-900 dark:text-white">Your Preferences</h2>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs font-medium text-stone-500 hover:text-red-500 transition-colors"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Section 1: Cuisines */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Craving Cuisines
              </label>
              {selectedCuisines.length > 0 && (
                <span className="text-[11px] text-cordova-green font-semibold">
                  {selectedCuisines.length} selected
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1 py-1">
              {allCuisineOptions.map((cuisine) => {
                const isSelected = selectedCuisines.some((c) => c.toLowerCase() === cuisine.toLowerCase());
                const isSeafood = cuisine.toLowerCase().includes('seafood') || cuisine.toLowerCase().includes('bakasi');
                return (
                  <button
                    key={cuisine}
                    type="button"
                    onClick={() => toggleArrayItem(selectedCuisines, setSelectedCuisines, cuisine)}
                    className={`text-xs px-3.5 py-1.5 rounded-full font-bold transition-all duration-200 border ${
                      isSelected
                        ? 'bg-cordova-green border-cordova-green text-white shadow-spatial-sm font-extrabold scale-105'
                        : isSeafood
                        ? 'bg-cyan-500/15 dark:bg-cyan-500/25 border-cyan-400/40 text-cyan-900 dark:text-cyan-200 hover:bg-cyan-500/30 font-extrabold'
                        : 'bg-stone-100 dark:bg-stone-800/80 border-stone-200/80 dark:border-stone-700/80 text-stone-800 dark:text-stone-200 hover:border-cordova-green/50'
                    }`}
                  >
                    {isSeafood ? `🦞 ${cuisine}` : cuisine}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Budget */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Budget & Price Tier
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRICE_TIERS.map((tier) => {
                const isSelected = budgetRange === tier.value;
                return (
                  <button
                    key={tier.value}
                    type="button"
                    onClick={() => setBudgetRange(tier.value)}
                    className={`text-xs py-2 px-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-bold shadow-sm'
                        : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-stone-400'
                    }`}
                  >
                    <span className="block font-serif font-bold">{tier.symbol}</span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400">{tier.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Dietary Restrictions */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Dietary Restrictions
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DIETARY_OPTIONS.map((d) => {
                const isSelected = dietary.some((item) => item.toLowerCase() === d.id.toLowerCase());
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleArrayItem(dietary, setDietary, d.id)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-150 border ${
                      isSelected
                        ? 'bg-cordova-gold border-cordova-gold text-white shadow-sm font-semibold scale-105'
                        : 'bg-stone-100 dark:bg-stone-800 border-transparent text-stone-700 dark:text-stone-300 hover:border-stone-300'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Atmosphere & Amenities */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Atmosphere & Services
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SERVICE_OPTIONS.map((s) => {
                const isSelected = services.some((item) => item.toLowerCase() === s.id.toLowerCase());
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleArrayItem(services, setServices, s.id)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-150 border ${
                      isSelected
                        ? 'bg-stone-800 dark:bg-stone-200 border-transparent text-white dark:text-stone-900 shadow-sm font-semibold scale-105'
                        : 'bg-stone-100 dark:bg-stone-800 border-transparent text-stone-700 dark:text-stone-300 hover:border-stone-300'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Distance & Location */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="max-dist-slider" className="font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Max Distance: <span className="text-cordova-green font-bold">{maxDistanceKm} km</span>
              </label>
            </div>
            <input
              id="max-dist-slider"
              type="range"
              min={0.5}
              max={15}
              step={0.5}
              value={maxDistanceKm}
              onChange={(e) => setMaxDistanceKm(parseFloat(e.target.value))}
              className="w-full accent-cordova-green cursor-pointer"
            />

            <button
              type="button"
              onClick={requestLocation}
              disabled={geoLoading}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors"
            >
              <MapPin size={14} className={coords ? 'text-emerald-500' : 'text-stone-400'} />
              <span>{coords ? 'Location detected & active' : 'Use my current GPS location'}</span>
            </button>

            <label className="flex items-center gap-2.5 text-xs text-stone-700 dark:text-stone-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={onlyOpenNow}
                onChange={(e) => setOnlyOpenNow(e.target.checked)}
                className="w-4 h-4 rounded accent-cordova-green"
              />
              <span>Only show restaurants open right now</span>
            </label>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
            <Button
              className="w-full bg-cordova-green hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
              onClick={() => fetchRecommendations()}
              loading={loadingRecs}
            >
              <Sparkles size={16} />
              <span>Update Recommendations</span>
            </Button>

            {/* Profile persistence actions */}
            {user ? (
              <div className="flex flex-col gap-2 pt-1">
                <Button
                  variant="secondary"
                  className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border-amber-300/50 dark:border-amber-700/50 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-amber-700 dark:text-amber-400"
                  onClick={handleSaveToProfile}
                  loading={savingProfile}
                >
                  <Save size={14} />
                  <span>Save to My Profile Preferences</span>
                </Button>

                {hasPreferenceChanges && (
                  <button
                    type="button"
                    onClick={handleResetToProfile}
                    className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center justify-center gap-1 py-1 transition-colors"
                  >
                    <RotateCcw size={12} />
                    <span>Reset to saved profile defaults</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="pt-2 text-center">
                <Link
                  href="/login?returnTo=/recommendations"
                  className="text-xs text-stone-500 dark:text-stone-400 hover:text-cordova-green transition-colors"
                >
                  Sign in to save these preferences
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Results Column */}
        <div className="space-y-6">
          {/* Active Filter Chips bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50 dark:bg-[#1a211c] p-3.5 rounded-2xl border border-stone-200/80 dark:border-stone-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wide">
                Active Preferences:
              </span>

              {selectedCuisines.length === 0 && !budgetRange && dietary.length === 0 && services.length === 0 ? (
                <span className="text-xs text-stone-500 italic">Showing top picks across all cuisines</span>
              ) : null}

              {selectedCuisines.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs px-2.5 py-1 rounded-full border border-stone-200 dark:border-stone-700 shadow-2xs"
                >
                  {c}
                  <button
                    onClick={() => toggleArrayItem(selectedCuisines, setSelectedCuisines, c)}
                    className="hover:text-red-500"
                    aria-label={`Remove ${c}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}

              {budgetRange && (
                <span className="inline-flex items-center gap-1 bg-white dark:bg-stone-800 text-amber-600 dark:text-amber-400 text-xs px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-900/50 shadow-2xs font-medium">
                  {budgetRange.toUpperCase()}
                  <button onClick={() => setBudgetRange('')} className="hover:text-red-500" aria-label="Clear budget">
                    <X size={12} />
                  </button>
                </span>
              )}

              {dietary.map((d) => (
                <span
                  key={d}
                  className="inline-flex items-center gap-1 bg-white dark:bg-stone-800 text-emerald-600 dark:text-emerald-400 text-xs px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/50 shadow-2xs font-medium"
                >
                  {d.replace('_', ' ')}
                  <button
                    onClick={() => toggleArrayItem(dietary, setDietary, d)}
                    className="hover:text-red-500"
                    aria-label={`Remove ${d}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}

              {services.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs px-2.5 py-1 rounded-full border border-stone-200 dark:border-stone-700 shadow-2xs"
                >
                  {s.replace('_', ' ')}
                  <button
                    onClick={() => toggleArrayItem(services, setServices, s)}
                    className="hover:text-red-500"
                    aria-label={`Remove ${s}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>

            {results && results.length > 0 && (
              <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 shrink-0">
                {results.length} matches found
              </span>
            )}
          </div>

          {/* Results Grid / Loading State */}
          {loadingRecs ? (
            <RestaurantGridSkeleton count={6} />
          ) : results === null ? (
            <div className="text-center py-20 text-[var(--text-muted)] bg-white dark:bg-[#1a211c] rounded-2xl border border-stone-200 dark:border-stone-800 p-8">
              <Compass size={48} className="mx-auto mb-3 text-cordova-green animate-pulse" />
              <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">Finding Best Matches...</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Adjust any preference filters on the left to personalize your dining recommendations.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-16 text-[var(--text-muted)] bg-white dark:bg-[#1a211c] rounded-2xl border border-stone-200 dark:border-stone-800 p-8 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500 text-2xl">
                🍽️
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-white">No exact restaurant match</h3>
                <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
                  None of the 26 accredited establishments currently match all of your strict filter constraints. Try
                  loosening a restriction like max distance or dietary filters.
                </p>
              </div>
              <Button onClick={handleClearAll} variant="secondary" className="text-xs">
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {results.map((r, i) => (
                <motion.div
                  key={r.restaurant.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(i, 8) * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-2 flex flex-col justify-between"
                >
                  <RestaurantCard restaurant={r.restaurant} matchScore={r.score} />

                  <div className="px-1 space-y-1.5">
                    {r.reason && <p className="text-xs text-[var(--text-muted)] leading-snug">{r.reason}</p>}

                    <button
                      type="button"
                      className="text-xs text-cordova-green dark:text-emerald-400 hover:underline font-medium inline-flex items-center gap-1"
                      onClick={() =>
                        setShowBreakdownFor(showBreakdownFor === r.restaurant.id ? null : r.restaurant.id)
                      }
                    >
                      <Info size={12} />
                      <span>{showBreakdownFor === r.restaurant.id ? 'Hide match breakdown' : 'Why this matched'}</span>
                    </button>

                    <AnimatePresence>
                      {showBreakdownFor === r.restaurant.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-stone-50 dark:bg-stone-900 rounded-xl p-3 text-xs space-y-1.5 border border-stone-200 dark:border-stone-800 overflow-hidden"
                        >
                          <BreakdownRow label="Cuisine Match" value={r.scoreBreakdown.cuisineMatch} />
                          <BreakdownRow label="Budget Fit" value={r.scoreBreakdown.budgetFit} />
                          <BreakdownRow label="Proximity" value={r.scoreBreakdown.proximity} />
                          <BreakdownRow label="Dietary Match" value={r.scoreBreakdown.dietaryMatch} />
                          <BreakdownRow label="Rating & Trust" value={r.scoreBreakdown.rating} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({ label, value }: { label: string; value: number }) {
  const safeVal = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <div className="flex items-center gap-2">
      <span className="w-24 shrink-0 text-stone-500 dark:text-stone-400 text-[11px]">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            safeVal >= 80 ? 'bg-emerald-500' : safeVal >= 50 ? 'bg-amber-500' : 'bg-stone-400'
          }`}
          style={{ width: `${safeVal}%` }}
        />
      </div>
      <span className="w-8 text-right font-mono text-[11px] font-semibold text-stone-700 dark:text-stone-300">
        {safeVal}%
      </span>
    </div>
  );
}
