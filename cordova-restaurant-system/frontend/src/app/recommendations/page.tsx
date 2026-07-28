'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useCuisines } from '@/hooks/useCuisines';
import { RestaurantCard } from '@/components/RestaurantCard';
import { RestaurantGridSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import type { RecommendationResult } from '@/lib/types';

const DIETARY_OPTIONS = ['vegetarian', 'vegan', 'halal', 'gluten_free'];
const SERVICE_OPTIONS = [
  { value: 'dine_in', label: 'Dine-in' },
  { value: 'takeout', label: 'Takeout' },
  { value: 'delivery', label: 'Delivery' },
];

export default function RecommendationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { coords, request: requestLocation, loading: geoLoading } = useGeolocation();

  const cuisines = useCuisines();
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState('');
  const [dietary, setDietary] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [maxDistanceKm, setMaxDistanceKm] = useState(5);
  const [onlyOpenNow, setOnlyOpenNow] = useState(false);

  const [results, setResults] = useState<RecommendationResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBreakdownFor, setShowBreakdownFor] = useState<string | null>(null);

  const toggle = (arr: string[], setArr: (v: string[]) => void, value: string) => {
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  const getRecommendations = async () => {
    setLoading(true);
    try {
      const res = await api.post(
        '/api/recommendations',
        {
          preferredCuisines: selectedCuisines,
          budgetRange: budgetRange || undefined,
          dietaryRestrictions: dietary,
          requiredServices: services,
          lat: coords?.lat,
          lng: coords?.lng,
          maxDistanceKm,
          onlyOpenNow,
          limit: 12,
        },
        { auth: !!user }
      );
      setResults(res.data);
    } catch (err) {
      toast('Could not load recommendations. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">AI Restaurant Recommendations</h1>
        <p className="text-[var(--text-muted)] mt-2 max-w-2xl">
          Tell us what you&apos;re in the mood for. Our recommendation engine scores every verified restaurant in
          Cordova on cuisine match, budget fit, distance, dietary compatibility, and rating — then ranks the best
          fits for you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <div className="card p-5 space-y-5 lg:sticky lg:top-20 self-start">
          <div>
            <p className="label mb-2">Cuisines you&apos;re craving</p>
            <div className="flex flex-wrap gap-2">
              {cuisines.map((c) => (
                <button key={c.slug} onClick={() => toggle(selectedCuisines, setSelectedCuisines, c.slug)}>
                  <Badge color={selectedCuisines.includes(c.slug) ? 'brand' : 'neutral'}>{c.name}</Badge>
                </button>
              ))}
            </div>
          </div>

          <Select label="Budget" value={budgetRange} onChange={(e) => setBudgetRange(e.target.value)}>
            <option value="">No preference</option>
            <option value="budget">₱ Budget-friendly</option>
            <option value="moderate">₱₱ Moderate</option>
            <option value="expensive">₱₱₱ Expensive</option>
            <option value="premium">₱₱₱₱ Premium</option>
          </Select>

          <div>
            <p className="label mb-2">Dietary restrictions</p>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((d) => (
                <button key={d} onClick={() => toggle(dietary, setDietary, d)}>
                  <Badge color={dietary.includes(d) ? 'brand' : 'neutral'}>{d.replace('_', ' ')}</Badge>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="label mb-2">Service type needed</p>
            <div className="flex flex-wrap gap-2">
              {SERVICE_OPTIONS.map((s) => (
                <button key={s.value} onClick={() => toggle(services, setServices, s.value)}>
                  <Badge color={services.includes(s.value) ? 'brand' : 'neutral'}>{s.label}</Badge>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label" htmlFor="max-distance">
              Max distance: {maxDistanceKm} km
            </label>
            <input
              id="max-distance"
              type="range"
              min={0.5}
              max={15}
              step={0.5}
              value={maxDistanceKm}
              onChange={(e) => setMaxDistanceKm(parseFloat(e.target.value))}
              className="w-full accent-brand-500"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={onlyOpenNow} onChange={(e) => setOnlyOpenNow(e.target.checked)} className="accent-brand-500" />
            Only show places open right now
          </label>

          <Button variant="secondary" className="w-full" onClick={requestLocation} loading={geoLoading}>
            📍 {coords ? 'Location set' : 'Use my current location'}
          </Button>

          <Button className="w-full" onClick={getRecommendations} loading={loading}>
            Get my recommendations
          </Button>
        </div>

        <div>
          {loading ? (
            <RestaurantGridSkeleton count={6} />
          ) : results === null ? (
            <div className="text-center py-20 text-[var(--text-muted)]">
              <p className="text-5xl mb-3">🤖</p>
              <p>Set your preferences and hit &ldquo;Get my recommendations&rdquo; to see your best matches.</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-20 text-[var(--text-muted)]">
              <p className="text-4xl mb-3">🙁</p>
              <p>No restaurant satisfies all of your constraints. Try loosening a filter (e.g. distance or dietary needs).</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {results.map((r, i) => (
                <motion.div
                  key={r.restaurant.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-2"
                >
                  <RestaurantCard restaurant={r.restaurant} matchScore={r.score} />
                  <p className="text-xs text-[var(--text-muted)] px-1">{r.reason}</p>
                  <button
                    className="text-xs text-brand-500 hover:underline px-1"
                    onClick={() => setShowBreakdownFor(showBreakdownFor === r.restaurant.id ? null : r.restaurant.id)}
                  >
                    {showBreakdownFor === r.restaurant.id ? 'Hide score details' : 'See score details'}
                  </button>
                  {showBreakdownFor === r.restaurant.id && (
                    <div className="card p-3 text-xs space-y-1">
                      <BreakdownRow label="Cuisine match" value={r.scoreBreakdown.cuisineMatch} />
                      <BreakdownRow label="Budget fit" value={r.scoreBreakdown.budgetFit} />
                      <BreakdownRow label="Proximity" value={r.scoreBreakdown.proximity} />
                      <BreakdownRow label="Dietary match" value={r.scoreBreakdown.dietaryMatch} />
                      <BreakdownRow label="Rating" value={r.scoreBreakdown.rating} />
                    </div>
                  )}
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
  return (
    <div className="flex items-center gap-2">
      <span className="w-24 shrink-0 text-[var(--text-muted)]">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
        <div className="h-full bg-brand-500" style={{ width: `${value}%` }} />
      </div>
      <span className="w-8 text-right">{value}</span>
    </div>
  );
}
