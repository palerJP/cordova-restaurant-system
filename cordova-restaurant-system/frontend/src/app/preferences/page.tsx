'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { api, ApiClientError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { clearTastePreferences, getTastePreferences, saveTastePreferences, type TastePreferences } from '@/lib/taste-preferences';
import type { PriceRange } from '@/lib/types';

const FOOD_TYPES = [
  'Filipino',
  'Seafood',
  'Fast Food',
  'Cafe',
  'Grill & BBQ',
  'Cebuano / Local',
  'Bakasi & Shellfish',
  'Pizza & Pasta',
  'Desserts & Milktea',
  'Resort Dining',
  'Street Food',
];

const DIETARY_OPTIONS = ['HALAL', 'Vegetarian', 'Vegan', 'No Pork', 'Gluten-Free'];

const SERVICES_OPTIONS = [
  'Seaside / Sunset View',
  'Outdoor / Al Fresco',
  'Live Music',
  'Air Conditioned',
  'Dine-In',
  'Takeout & Delivery',
];

const PRICE_RANGES: { value: PriceRange; label: string }[] = [
  { value: 'budget', label: 'Budget' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'expensive', label: 'Expensive' },
  { value: 'premium', label: 'Premium' },
];

export default function PreferencesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFirstTime = searchParams.get('firstTime') === 'true';
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<PriceRange | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    async function loadExistingPreferences() {
      const guestPreferences = getTastePreferences();
      if (!user) {
        if (guestPreferences?.syncedUserId) {
          // Do not show a previous account's preferences to the next guest.
          clearTastePreferences();
        } else if (guestPreferences) {
          setSelectedCuisines(guestPreferences.preferredCuisines);
          setSelectedDietary(guestPreferences.dietaryRestrictions);
          setSelectedServices(guestPreferences.preferredServices);
          setSelectedBudget(guestPreferences.budgetRange);
        }
        setFetching(false);
        return;
      }

      if (guestPreferences) {
        setSelectedCuisines(guestPreferences.preferredCuisines);
        setSelectedDietary(guestPreferences.dietaryRestrictions);
        setSelectedServices(guestPreferences.preferredServices);
        setSelectedBudget(guestPreferences.budgetRange);
      }

      try {
        const res = await api.get('/api/users/me/preferences');
        if (res.data?.preferences) {
          const p = res.data.preferences;
          if (p.preferred_cuisines?.length) setSelectedCuisines(p.preferred_cuisines);
          if (p.dietary_restrictions?.length) setSelectedDietary(p.dietary_restrictions);
          if (p.preferred_services?.length) setSelectedServices(p.preferred_services);
          if (p.budget_range) setSelectedBudget(p.budget_range);
        }
      } catch {
        // guest or no preferences set yet
      } finally {
        setFetching(false);
      }
    }
    loadExistingPreferences();
  }, [authLoading, user]);

  const toggleCuisine = (item: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(item) ? prev.filter((c) => c !== item) : [...prev, item]
    );
  };

  const toggleDietary = (item: string) => {
    setSelectedDietary((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  };

  const toggleService = (item: string) => {
    setSelectedServices((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    );
  };

  const requestedReturnTo = searchParams.get('returnTo');
  const returnTo =
    requestedReturnTo?.startsWith('/') &&
    !requestedReturnTo.startsWith('//') &&
    !requestedReturnTo.startsWith('/recommendations')
      ? requestedReturnTo
      : '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFirstTime && !selectedCuisines.length && !selectedDietary.length && !selectedServices.length && !selectedBudget) {
      toast('Choose at least one taste preference to continue.', 'info');
      return;
    }

    const preferences: TastePreferences = {
      preferredCuisines: selectedCuisines,
      dietaryRestrictions: selectedDietary,
      preferredServices: selectedServices,
      budgetRange: selectedBudget,
    };

    if (!user) {
      saveTastePreferences(preferences);
      toast('Your taste preferences are saved. Let’s explore CordovaEats!', 'success');
      router.push(returnTo);
      return;
    }

    setLoading(true);
    try {
      await api.put('/api/users/me/preferences', preferences);
      saveTastePreferences(preferences, user.id);
      toast('Preferences saved successfully! Welcome to CordovaEats.', 'success');
      router.push(returnTo);
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Failed to save preferences', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center p-4 sm:p-6 my-auto">
      <div className="bg-white dark:bg-[#1a211c] rounded-[2.5rem] max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 text-center border border-amber-200/30 dark:border-stone-800 my-8">
        {/* Brand Header */}
        <div className="space-y-1">
          <div className="relative h-16 w-16 mx-auto mb-1 filter drop-shadow">
            <Image
              src="/cordova_eats_logo.png"
              alt="CordovaEats Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="font-serif text-3xl font-bold text-stone-900 dark:text-white tracking-tight">
            CordovaEats
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm font-medium">
            {isFirstTime
              ? 'Tell us what you enjoy so we can recommend places that fit your taste.'
              : 'Personalize your dining experience & taste preferences'}
          </p>
        </div>

        {fetching ? (
          <div className="py-8 text-center text-stone-400 text-sm">Loading preferences...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            {/* Section 1: Food Types */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2.5 text-center uppercase tracking-wider">
                What food cuisines do you enjoy? (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2 justify-center">
                {FOOD_TYPES.map((type) => {
                  const selected = selectedCuisines.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleCuisine(type)}
                      className={`py-2 px-3.5 rounded-full border text-xs font-serif font-medium transition-all ${
                        selected
                          ? 'border-cordova-green bg-cordova-green text-white shadow-sm font-bold scale-105'
                          : 'border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:border-cordova-green'
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Dietary Restrictions */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2.5 text-center uppercase tracking-wider">
                Dietary Restrictions & Preferences
              </label>
              <div className="flex flex-wrap gap-2 justify-center">
                {DIETARY_OPTIONS.map((item) => {
                  const selected = selectedDietary.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleDietary(item)}
                      className={`py-2 px-3.5 rounded-full border text-xs font-mono font-semibold uppercase tracking-wider transition-all ${
                        selected
                          ? 'border-cordova-green bg-cordova-green text-white shadow-sm scale-105'
                          : 'border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:border-cordova-green'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Dining Atmosphere & Services */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2.5 text-center uppercase tracking-wider">
                Preferred Atmosphere & Amenities
              </label>
              <div className="flex flex-wrap gap-2 justify-center">
                {SERVICES_OPTIONS.map((service) => {
                  const selected = selectedServices.includes(service);
                  return (
                    <button
                      key={service}
                      type="button"
                      onClick={() => toggleService(service)}
                      className={`py-2 px-3.5 rounded-full border text-xs font-sans font-medium transition-all ${
                        selected
                          ? 'border-cordova-gold bg-cordova-gold text-white shadow-sm font-bold scale-105'
                          : 'border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-cordova-gold'
                      }`}
                    >
                      {service}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 4: Price Range */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2 text-center uppercase tracking-wider">
                Target Price Range
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRICE_RANGES.map((pr) => {
                  const selected = selectedBudget === pr.value;
                  return (
                    <button
                      key={pr.value}
                      type="button"
                      onClick={() => setSelectedBudget(pr.value)}
                      className={`py-2.5 px-2 rounded-full border text-xs font-serif font-medium text-center transition-all ${
                        selected
                          ? 'border-cordova-green bg-cordova-green text-white shadow-sm font-bold'
                          : 'border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-cordova-green'
                      }`}
                    >
                      {pr.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit & Skip Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold py-3.5 px-6 rounded-2xl text-sm transition-all duration-200 shadow-md disabled:opacity-50"
              >
                {loading ? 'Saving...' : isFirstTime ? 'Save tastes & continue' : 'Save Preferences'}
              </button>

              <button
                type="button"
                onClick={() => router.push(returnTo)}
                className="w-full bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold py-3 px-6 rounded-2xl text-xs transition-colors"
              >
                {isFirstTime ? 'Skip for now' : 'Back to Home'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
