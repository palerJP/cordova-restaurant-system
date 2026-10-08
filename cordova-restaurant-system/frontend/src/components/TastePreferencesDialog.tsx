'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Sparkles, Utensils, X } from 'lucide-react';
import { api, ApiClientError } from '@/lib/api';
import { useToast } from '@/lib/toast-context';
import type { PriceRange } from '@/lib/types';

interface TastePreferencesDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

interface StoredPreferences {
  preferred_cuisines?: string[] | null;
  dietary_restrictions?: string[] | null;
  preferred_services?: string[] | null;
  budget_range?: PriceRange | null;
  max_distance_km?: number | string | null;
  home_latitude?: number | string | null;
  home_longitude?: number | string | null;
}

const FOOD_TYPES = [
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

const SERVICES_OPTIONS = [
  { id: 'seaside_view', label: 'Seaside / Sunset View' },
  { id: 'al_fresco', label: 'Outdoor / Al Fresco' },
  { id: 'live_music', label: 'Live Music' },
  { id: 'air_conditioned', label: 'Air Conditioned' },
  { id: 'dine_in', label: 'Dine-In' },
  { id: 'takeout', label: 'Takeout' },
  { id: 'delivery', label: 'Delivery' },
];

const PRICE_RANGES: { value: PriceRange; label: string; symbol: string }[] = [
  { value: 'budget', label: 'Budget', symbol: '₱' },
  { value: 'moderate', label: 'Moderate', symbol: '₱₱' },
  { value: 'expensive', label: 'Expensive', symbol: '₱₱₱' },
  { value: 'premium', label: 'Premium', symbol: '₱₱₱₱' },
];

const DIETARY_ALIASES: Record<string, string[]> = {
  'no pork': ['no_pork'],
  'gluten-free': ['gluten_free'],
};

const SERVICE_ALIASES: Record<string, string[]> = {
  'seaside / sunset view': ['seaside_view'],
  'outdoor / al fresco': ['al_fresco'],
  'live music': ['live_music'],
  'air conditioned': ['air_conditioned'],
  'dine-in': ['dine_in'],
  'takeout & delivery': ['takeout', 'delivery'],
};

function normalizeSavedOptions(values: string[], aliases: Record<string, string[]>): string[] {
  return [...new Set(values.flatMap((value) => aliases[value.toLowerCase()] ?? [value]))];
}

function toggleSelection(values: string[], value: string): string[] {
  const selected = values.some((item) => item.toLowerCase() === value.toLowerCase());
  return selected
    ? values.filter((item) => item.toLowerCase() !== value.toLowerCase())
    : [...values, value];
}

function optionsIncludingSaved(options: { id: string; label: string }[], saved: string[]) {
  const extra = saved
    .filter((value) => !options.some((option) => option.id.toLowerCase() === value.toLowerCase()))
    .map((value) => ({ id: value, label: value.replace(/_/g, ' ') }));
  return [...options, ...extra];
}

function coordinateOrNull(value: number | string | null | undefined): number | null {
  if (value == null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function TastePreferencesDialog({ open, onClose, onSaved }: TastePreferencesDialogProps) {
  const { showToast } = useToast();
  const dialogId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const savingRef = useRef(false);
  const requestIdRef = useRef(0);
  onCloseRef.current = onClose;

  const [cuisines, setCuisines] = useState<string[]>([]);
  const [dietary, setDietary] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [budget, setBudget] = useState<PriceRange | null>(null);
  const [distance, setDistance] = useState(5);
  const [homeLatitude, setHomeLatitude] = useState<number | null>(null);
  const [homeLongitude, setHomeLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  savingRef.current = saving;

  const loadPreferences = async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setFetchFailed(false);
    setError('');
    try {
      const result = await api.get<{ data?: { preferences?: StoredPreferences | null } }>('/api/users/me/preferences');
      if (requestId !== requestIdRef.current) return;
      const saved = result.data?.preferences;
      setCuisines(Array.isArray(saved?.preferred_cuisines) ? saved.preferred_cuisines : []);
      setDietary(Array.isArray(saved?.dietary_restrictions)
        ? normalizeSavedOptions(saved.dietary_restrictions, DIETARY_ALIASES)
        : []);
      setServices(Array.isArray(saved?.preferred_services)
        ? normalizeSavedOptions(saved.preferred_services, SERVICE_ALIASES)
        : []);
      setBudget(saved?.budget_range ?? null);
      const savedDistance = Number(saved?.max_distance_km);
      setDistance(Number.isFinite(savedDistance) && savedDistance > 0 ? savedDistance : 5);
      setHomeLatitude(coordinateOrNull(saved?.home_latitude));
      setHomeLongitude(coordinateOrNull(saved?.home_longitude));
    } catch (cause) {
      if (requestId !== requestIdRef.current) return;
      setFetchFailed(true);
      setError(cause instanceof ApiClientError ? cause.message : 'Could not load your preferences. Please try again.');
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      void loadPreferences();
    } else {
      requestIdRef.current += 1;
    }
    return () => { requestIdRef.current += 1; };
    // Load once per opening. Retry uses the button below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (!savingRef.current) onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        )
      );
      if (!focusable.length) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open]);

  const handleClose = () => {
    if (!saving) onClose();
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading || saving || fetchFailed) return;
    setSaving(true);
    setError('');
    try {
      await api.put('/api/users/me/preferences', {
        preferredCuisines: cuisines,
        dietaryRestrictions: dietary,
        preferredServices: services,
        budgetRange: budget,
        maxDistanceKm: distance,
        homeLatitude,
        homeLongitude,
      });
      showToast('Taste preferences saved successfully!', 'success');
      onSaved();
      onClose();
    } catch (cause) {
      setError(cause instanceof ApiClientError ? cause.message : 'Could not save your preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!open || typeof document === 'undefined') return null;

  const cuisineOptions = optionsIncludingSaved(FOOD_TYPES.map((id) => ({ id, label: id })), cuisines);
  const dietaryOptions = optionsIncludingSaved(DIETARY_OPTIONS, dietary);
  const serviceOptions = optionsIncludingSaved(SERVICES_OPTIONS, services);

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-stone-950/70 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${dialogId}-title`}
        aria-describedby={`${dialogId}-description`}
        tabIndex={-1}
        className="spatial-card flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl outline-none dark:bg-[#1a211c]"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-stone-200/70 px-5 py-4 dark:border-white/10 sm:px-7">
          <div>
            <h2 id={`${dialogId}-title`} className="flex items-center gap-2 font-serif text-xl font-bold text-stone-900 dark:text-white sm:text-2xl">
              <Utensils size={20} className="text-cordova-gold" aria-hidden />
              Taste & Dining Preferences
            </h2>
            <p id={`${dialogId}-description`} className="mt-1 text-xs text-stone-500 dark:text-stone-400">
              Adjust what matters to you, then refresh your recommendations.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            disabled={saving}
            aria-label="Close preferences"
            className="shrink-0 rounded-full p-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cordova-green disabled:opacity-50 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-stone-500 dark:text-stone-400" role="status">
            <Loader2 size={18} className="animate-spin" aria-hidden />
            Loading your preferences...
          </div>
        ) : fetchFailed ? (
          <div className="space-y-4 px-6 py-8 text-center">
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <button type="button" onClick={() => void loadPreferences()} className="rounded-xl bg-cordova-green px-4 py-2 text-sm font-semibold text-white hover:bg-cordova-greenHover">
              Try again
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 space-y-6 overflow-y-auto px-5 py-5 sm:px-7">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-cordova-green dark:text-emerald-400">
                <Sparkles size={12} aria-hidden /> Powers AI Recommendations
              </div>

              <fieldset>
                <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Favorite Cuisines & Food Types
                </legend>
                <div className="flex flex-wrap gap-2">
                  {cuisineOptions.map((option) => {
                    const selected = cuisines.some((value) => value.toLowerCase() === option.id.toLowerCase());
                    return (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setCuisines((current) => toggleSelection(current, option.id))}
                        className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-cordova-green ${selected ? 'border-cordova-green bg-cordova-green text-white dark:border-emerald-500 dark:bg-emerald-600' : 'border-stone-200 bg-white/70 text-stone-800 hover:border-cordova-green/50 dark:border-white/10 dark:bg-white/5 dark:text-stone-200'}`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Dietary Restrictions & Preferences
                </legend>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map((option) => {
                    const selected = dietary.some((value) => value.toLowerCase() === option.id.toLowerCase());
                    return (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setDietary((current) => toggleSelection(current, option.id))}
                        className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-cordova-green ${selected ? 'border-cordova-gold bg-cordova-gold text-white' : 'border-stone-200 bg-white/70 text-stone-800 hover:border-cordova-gold/50 dark:border-white/10 dark:bg-white/5 dark:text-stone-200'}`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Preferred Atmosphere & Amenities
                </legend>
                <div className="flex flex-wrap gap-2">
                  {serviceOptions.map((option) => {
                    const selected = services.some((value) => value.toLowerCase() === option.id.toLowerCase());
                    return (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setServices((current) => toggleSelection(current, option.id))}
                        className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-cordova-green ${selected ? 'border-stone-900 bg-stone-900 text-white dark:border-white dark:bg-white dark:text-stone-900' : 'border-stone-200 bg-white/70 text-stone-700 hover:border-stone-400 dark:border-white/10 dark:bg-white/5 dark:text-stone-300'}`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="grid gap-5 border-t border-stone-200/70 pt-5 dark:border-white/10 sm:grid-cols-2">
                <fieldset>
                  <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">Target Price Range</legend>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" aria-pressed={budget === null} onClick={() => setBudget(null)} className={`rounded-xl border px-2 py-2.5 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-cordova-green ${budget === null ? 'border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-400' : 'border-stone-200 bg-white/70 text-stone-700 dark:border-white/10 dark:bg-white/5 dark:text-stone-300'}`}>
                      Any price
                    </button>
                    {PRICE_RANGES.map((range) => (
                      <button
                        key={range.value}
                        type="button"
                        aria-pressed={budget === range.value}
                        onClick={() => setBudget(range.value)}
                        className={`rounded-xl border px-2 py-2.5 text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-cordova-green ${budget === range.value ? 'border-amber-500 bg-amber-500/15 font-bold text-amber-700 dark:text-amber-400' : 'border-stone-200 bg-white/70 text-stone-700 dark:border-white/10 dark:bg-white/5 dark:text-stone-300'}`}
                      >
                        <span className="block font-bold">{range.symbol}</span>
                        <span>{range.label}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label htmlFor={`${dialogId}-distance`} className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">Max Distance Radius</label>
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-cordova-green dark:text-emerald-400">{distance} km</span>
                  </div>
                  <input
                    id={`${dialogId}-distance`}
                    type="range"
                    min={1}
                    max={Math.max(15, distance)}
                    step={0.5}
                    value={distance}
                    onChange={(event) => setDistance(Number(event.target.value))}
                    className="mt-3 w-full cursor-pointer accent-cordova-green"
                  />
                  <p className="mt-2 text-[11px] text-stone-400">Recommendations will prioritize restaurants within {distance} km of your location in Cordova.</p>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-stone-200/70 px-5 py-4 dark:border-white/10 sm:px-7">
              {error && <p role="alert" className="mr-auto text-xs text-red-600 dark:text-red-400">{error}</p>}
              <button type="button" onClick={handleClose} disabled={saving} className="rounded-xl px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 disabled:opacity-50 dark:text-stone-300 dark:hover:bg-white/10">Cancel</button>
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cordova-gold to-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-spatial-sm transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cordova-gold disabled:opacity-60">
                {saving && <Loader2 size={14} className="animate-spin" aria-hidden />}
                Save Preferences
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
