'use client';

import { useState, useEffect, useCallback, useMemo, type FormEvent } from 'react';
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
  ThumbsUp,
  ThumbsDown,
  Search,
} from 'lucide-react';
import { api, ApiClientError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { getTastePreferences } from '@/lib/taste-preferences';
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

interface AiPreferenceSnapshot {
  preferredCuisines: string[];
  budgetRange: string | null;
  dietaryRestrictions: string[];
  requiredServices: string[];
  maxDistanceKm: number | null;
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
  const [sortBy, setSortBy] = useState<'match' | 'rating' | 'distance' | 'price'>('match');
  const [loadingRecs, setLoadingRecs] = useState<boolean>(false);
  const [showBreakdownFor, setShowBreakdownFor] = useState<string | null>(null);
  const [feedbackEnabled, setFeedbackEnabled] = useState<boolean>(false);
  const [feedbackSavingId, setFeedbackSavingId] = useState<string | null>(null);
  const [feedbackByRestaurant, setFeedbackByRestaurant] = useState<Record<string, number>>({});
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiFilterSummary, setAiFilterSummary] = useState<string[]>([]);
  const [aiPreferenceSnapshot, setAiPreferenceSnapshot] = useState<AiPreferenceSnapshot | null>(null);
  const [aiProvider, setAiProvider] = useState<'openai' | 'local' | null>(null);
  const [personalization, setPersonalization] = useState<{
    mode: 'learned' | 'global_model' | 'preference_match';
    feedbackCount: number;
    positiveCount: number;
    negativeCount: number;
    minimumFeedback: number;
    globalModelTrainingExamples?: number;
  } | null>(null);

  // Computed sorted results based on active sorting criteria
  const sortedResults = useMemo(() => {
    if (!results) return null;
    const list = [...results];
    if (sortBy === 'rating') {
      list.sort((a, b) => Number(b.restaurant.avg_rating || 0) - Number(a.restaurant.avg_rating || 0));
    } else if (sortBy === 'distance') {
      list.sort((a, b) => (a.restaurant.distance_km ?? 999) - (b.restaurant.distance_km ?? 999));
    } else if (sortBy === 'price') {
      const order: Record<string, number> = { budget: 1, moderate: 2, expensive: 3, premium: 4 };
      list.sort((a, b) => (order[a.restaurant.price_range] || 2) - (order[b.restaurant.price_range] || 2));
    } else {
      list.sort((a, b) => (b.matchPercentage || b.score) - (a.matchPercentage || a.score));
    }
    return list;
  }, [results, sortBy]);

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
      openNow = onlyOpenNow,
      query = aiPrompt
    ) => {
      setLoadingRecs(true);
      try {
        let recs: RecommendationResult[] = [];
        let backendResponded = false;
        try {
          const res = await api.post(
            '/api/recommendations',
            {
              preferredCuisines: cuisines,
              budgetRange: budget || undefined,
              dietaryRestrictions: diet,
              requiredServices: serv,
              query: query.trim() || undefined,
              lat: coords?.lat,
              lng: coords?.lng,
              maxDistanceKm: dist,
              onlyOpenNow: openNow,
              limit: 15,
            },
            { auth: !!user }
          );

          backendResponded = true;
          const modelStatus = res?.meta?.personalization;
          const interpretedFilters = res?.meta?.aiFilters?.summary;
          setAiFilterSummary(Array.isArray(interpretedFilters) ? interpretedFilters : []);
          setAiPreferenceSnapshot(res?.meta?.aiFilters?.filters || null);
          setAiProvider(res?.meta?.aiProvider === 'openai' ? 'openai' : 'local');
          if (modelStatus) {
            setPersonalization(modelStatus);
            setFeedbackByRestaurant(modelStatus.feedbackByRestaurant || {});
          }
          const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
          if (list.length > 0) {
            recs = list;
          }
        } catch {
          recs = [];
          setAiFilterSummary([]);
          setAiPreferenceSnapshot(null);
          setAiProvider(null);
        }

        setFeedbackEnabled(backendResponded && !!user);

        // Keep an offline fallback, but never undo strict safety filters.
        if (!backendResponded) {
          setPersonalization(null);
          setFeedbackByRestaurant({});
          setAiPreferenceSnapshot(null);
          setAiProvider(null);
          if (query.trim()) {
            setResults([]);
            toast('AI filtering is unavailable right now. Please try your request again shortly.', 'error');
            return;
          }
          const coreServices = serv.filter((service) =>
            ['dine_in', 'takeout', 'delivery'].includes(service.toLowerCase().replace(/[-\s]/g, '_'))
          );
          const staticList = getAllStaticRestaurants()
            .filter(isRestaurantVisible)
            .filter((restaurant) => {
              if (openNow && restaurant.is_open !== true) return false;
              const offeredDietary = (restaurant.dietary_options || []).map((item) =>
                item.toLowerCase().replace(/[-_\s]/g, '')
              );
              if (diet.some((item) => !offeredDietary.includes(item.toLowerCase().replace(/[-_\s]/g, '')))) {
                return false;
              }
              if (coreServices.length > 0) {
                const offeredServices = (restaurant.services_offered || []).map((item) =>
                  item.toLowerCase().replace(/[-\s]/g, '_')
                );
                if (!coreServices.some((item) => offeredServices.includes(item.toLowerCase().replace(/[-\s]/g, '_')))) {
                  return false;
                }
              }
              if (coords && restaurant.latitude != null && restaurant.longitude != null) {
                const radians = (value: number) => (value * Math.PI) / 180;
                const dLat = radians(Number(restaurant.latitude) - coords.lat);
                const dLng = radians(Number(restaurant.longitude) - coords.lng);
                const a =
                  Math.sin(dLat / 2) ** 2 +
                  Math.cos(radians(coords.lat)) *
                    Math.cos(radians(Number(restaurant.latitude))) *
                    Math.sin(dLng / 2) ** 2;
                const distanceKm = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                if (distanceKm > dist) return false;
              }
              return true;
            });
          recs = staticList
            .map((r, i) => {
              const matchedCuisines = r.cuisines.filter((c) =>
                cuisines.some((userC) => {
                  const uc = userC.toLowerCase().trim();
                  const rc = c.toLowerCase().trim();
                  return rc.includes(uc) || uc.includes(rc);
                })
              );
              let cuisineScore = cuisines.length > 0
                ? (matchedCuisines.length > 0 ? Math.min(100, Math.round((matchedCuisines.length / cuisines.length) * 100)) : 15)
                : 65;

              let budgetScore = 65;
              let budgetFit = true;
              if (budget) {
                budgetFit = r.price_range === budget;
                budgetScore = budgetFit ? 100 : 40;
              }

              const matchedDietary = (r.dietary_options || []).filter((d) =>
                diet.some((userD) => d.toLowerCase().replace(/[-_\s]/g, '') === userD.toLowerCase().replace(/[-_\s]/g, ''))
              );
              const dietaryScore = diet.length > 0 ? Math.round((matchedDietary.length / diet.length) * 100) : 100;

              const matchedServices = [
                ...(r.services_offered || []),
                ...(r.amenities || []),
              ].filter((s) =>
                serv.some((userS) => {
                  const us = userS.toLowerCase().replace(/[-_\s/]/g, '');
                  const rs = s.toLowerCase().replace(/[-_\s/]/g, '');
                  return rs.includes(us) || us.includes(rs);
                })
              );
              const servicesScore = serv.length > 0 ? Math.round((matchedServices.length / serv.length) * 100) : 80;

              const ratingVal = Number(r.avg_rating) || 4.5;
              const overallScore = Math.min(
                99,
                Math.round(
                  cuisineScore * 0.35 +
                  budgetScore * 0.25 +
                  dietaryScore * 0.15 +
                  (ratingVal / 5) * 20 +
                  (servicesScore / 100) * 5
                )
              );

              const reasons: string[] = [];
              if (matchedCuisines.length) reasons.push(`matches your taste for ${matchedCuisines.slice(0, 2).join(' & ')}`);
              if (matchedServices.length) reasons.push(`offers ${matchedServices[0].replace(/_/g, ' ')}`);
              if (budget && budgetFit) reasons.push(`fits your ${r.price_range} budget`);
              if (ratingVal >= 4.5) reasons.push(`rated ${ratingVal.toFixed(1)}★`);

              const reason = reasons.length
                ? `Recommended because it ${reasons.slice(0, 2).join(' and ')} in ${r.barangay || 'Cordova'}.`
                : `Top local Cordova recommendation in ${r.barangay || 'Cordova'}.`;

              return {
                restaurant: r,
                score: Math.max(40, overallScore),
                matchPercentage: Math.max(40, overallScore),
                matchedPreferences: {
                  cuisines: matchedCuisines,
                  dietary: matchedDietary,
                  services: matchedServices,
                  budgetFit,
                  isNear: true,
                },
                scoreBreakdown: {
                  cuisineMatch: cuisineScore,
                  budgetFit: budgetScore,
                  proximity: 85,
                  dietaryMatch: dietaryScore,
                  rating: Math.round((ratingVal / 5) * 100),
                  servicesMatch: servicesScore,
                },
                reason,
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
      [selectedCuisines, budgetRange, dietary, services, maxDistanceKm, onlyOpenNow, coords, user, toast, aiPrompt]
    );

  const submitRecommendationFeedback = async (restaurantId: string, sentiment: 1 | -1) => {
    if (!user || !feedbackEnabled) return;
    setFeedbackSavingId(restaurantId);
    try {
      await api.post('/api/recommendations/feedback', {
        restaurantId,
        sentiment,
        preferredCuisines: [...new Set([...selectedCuisines, ...(aiPreferenceSnapshot?.preferredCuisines || [])])],
        budgetRange: budgetRange || aiPreferenceSnapshot?.budgetRange || undefined,
        dietaryRestrictions: [...new Set([...dietary, ...(aiPreferenceSnapshot?.dietaryRestrictions || [])])],
        requiredServices: [...new Set([...services, ...(aiPreferenceSnapshot?.requiredServices || [])])],
        maxDistanceKm: aiPreferenceSnapshot?.maxDistanceKm ?? maxDistanceKm,
        lat: coords?.lat,
        lng: coords?.lng,
      });
      setFeedbackByRestaurant((current) => ({ ...current, [restaurantId]: sentiment }));
      toast('Thanks — your feedback will personalize future matches.', 'success');
      await fetchRecommendations();
    } catch {
      toast('Could not save your recommendation feedback. Please try again.', 'error');
    } finally {
      setFeedbackSavingId(null);
    }
  };

  // Load saved preferences on mount if user is logged in
  useEffect(() => {
    let isMounted = true;

    async function loadSavedProfile() {
      if (!user) {
        if (isMounted) {
          const guestPreferences = getTastePreferences();
          const cuisines = guestPreferences?.preferredCuisines || [];
          const budget = guestPreferences?.budgetRange || '';
          const diet = guestPreferences?.dietaryRestrictions || [];
          const preferredServices = guestPreferences?.preferredServices || [];
          setSelectedCuisines(cuisines);
          setBudgetRange(budget);
          setDietary(diet);
          setServices(preferredServices);
          fetchRecommendations(cuisines, budget, diet, preferredServices, 5, false);
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
    setAiPrompt('');
    setAiFilterSummary([]);
    setSelectedCuisines([]);
    setBudgetRange('');
    setDietary([]);
    setServices([]);
    setMaxDistanceKm(5);
    setOnlyOpenNow(false);
    fetchRecommendations([], '', [], [], 5, false, '');
  };

  const handleAiPromptSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    fetchRecommendations(selectedCuisines, budgetRange, dietary, services, maxDistanceKm, onlyOpenNow, aiPrompt);
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
              AI interprets your request into cuisine, dietary, budget, distance, availability, and atmosphere preferences. Firm requirements filter the results; the machine-learning ranker scores the matches and learns from your feedback.
            </p>

            <form onSubmit={handleAiPromptSubmit} className="pt-2 space-y-2.5">
              <label htmlFor="ai-recommendation-prompt" className="block text-xs font-semibold text-stone-200">
                Describe what you want to eat or experience
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="ai-recommendation-prompt"
                  value={aiPrompt}
                  onChange={(event) => setAiPrompt(event.target.value)}
                  placeholder="Try: halal seafood by the sea under ₱500, open now"
                  maxLength={500}
                  className="flex-1 min-w-0 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-stone-400 outline-none focus:border-cordova-gold"
                />
                <Button
                  type="submit"
                  disabled={!aiPrompt.trim() || loadingRecs}
                  loading={loadingRecs}
                  className="shrink-0 rounded-xl bg-cordova-gold px-4 py-3 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-50"
                >
                  <Search size={15} className="mr-1.5 inline" />
                  Ask AI
                </Button>
              </div>
              {aiFilterSummary.length > 0 && (
                <p className="text-xs text-emerald-200" aria-live="polite">
                  AI filters applied: {aiFilterSummary.join(' · ')}
                </p>
              )}
              {aiProvider && (
                <p className="text-xs text-stone-400" aria-live="polite">
                  {aiProvider === 'openai'
                    ? 'External OpenAI suggestions are active.'
                    : 'Local recommendation mode. Add OPENAI_API_KEY to the backend environment to enable external suggestions.'}
                </p>
              )}
              <p className="text-[11px] text-stone-400">
                When enabled, your prompt and restaurant details are sent to OpenAI to prepare suggestions.
              </p>
            </form>

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

            {sortedResults && sortedResults.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                  {sortedResults.length} recommendations
                </span>
                {personalization && (
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    {personalization.mode === 'learned'
                      ? `Personalized ML score · ${personalization.feedbackCount} learning signals`
                      : personalization.mode === 'global_model'
                        ? `Global ML score · trained with ${personalization.globalModelTrainingExamples || 0} signals`
                        : `Preference score · global model needs ${personalization.minimumFeedback} signals, including 2 positive and 2 negative`}
                  </span>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-stone-500">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-stone-800 dark:text-stone-200 shadow-2xs outline-none"
                  >
                    <option value="match">ML Match Score</option>
                    <option value="rating">Top Rated (★)</option>
                    <option value="distance">Nearest Distance</option>
                    <option value="price">Budget (₱ to ₱₱₱₱)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Results Grid / Loading State */}
          {loadingRecs ? (
            <RestaurantGridSkeleton count={6} />
          ) : sortedResults === null ? (
            <div className="text-center py-20 text-[var(--text-muted)] bg-white dark:bg-[#1a211c] rounded-2xl border border-stone-200 dark:border-stone-800 p-8">
              <Compass size={48} className="mx-auto mb-3 text-cordova-green animate-pulse" />
              <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">Finding Best Matches...</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Adjust any preference filters on the left to personalize your dining recommendations.
              </p>
            </div>
          ) : sortedResults.length === 0 ? (
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
              {sortedResults.map((r, i) => (
                <motion.div
                  key={r.restaurant.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(i, 8) * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-2 flex flex-col justify-between"
                >
                  <RestaurantCard
                    restaurant={r.restaurant}
                    matchScore={r.matchPercentage || Math.round(r.score)}
                    matchedPreferences={r.matchedPreferences}
                    suggestionReason={r.reason}
                  />

                  <div className="px-1 space-y-1.5">
                    {r.aiSuggested && (
                      <span className="inline-flex rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-800 dark:bg-violet-950/60 dark:text-violet-200">
                        OpenAI suggestion
                      </span>
                    )}
                    {r.reason && <p className="text-xs text-[var(--text-muted)] leading-snug">{r.reason}</p>}

                    {feedbackEnabled && (
                      <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                        <span>Was this a good match?</span>
                        <button
                          type="button"
                          disabled={feedbackSavingId === r.restaurant.id}
                          aria-label="This recommendation is helpful"
                          aria-pressed={feedbackByRestaurant[r.restaurant.id] === 1}
                          onClick={() => submitRecommendationFeedback(r.restaurant.id, 1)}
                          className={`rounded-md p-1 transition-colors disabled:opacity-50 ${
                            feedbackByRestaurant[r.restaurant.id] === 1
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'hover:bg-stone-100 dark:hover:bg-stone-800'
                          }`}
                        >
                          <ThumbsUp size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={feedbackSavingId === r.restaurant.id}
                          aria-label="This recommendation is not helpful"
                          aria-pressed={feedbackByRestaurant[r.restaurant.id] === -1}
                          onClick={() => submitRecommendationFeedback(r.restaurant.id, -1)}
                          className={`rounded-md p-1 transition-colors disabled:opacity-50 ${
                            feedbackByRestaurant[r.restaurant.id] === -1
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'hover:bg-stone-100 dark:hover:bg-stone-800'
                          }`}
                        >
                          <ThumbsDown size={14} />
                        </button>
                      </div>
                    )}

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
                          {r.scoreBreakdown.servicesMatch !== undefined && (
                            <BreakdownRow label="Services / Ambiance" value={r.scoreBreakdown.servicesMatch} />
                          )}
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
