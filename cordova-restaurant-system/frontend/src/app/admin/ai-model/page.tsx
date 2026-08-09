'use client';

import { useEffect, useState } from 'react';
import { api, ApiClientError } from '@/lib/api';
import { useToast } from '@/lib/toast-context';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

const FACTORS = [
  { key: 'cuisineWeight', label: 'Cuisine match' },
  { key: 'budgetWeight', label: 'Budget fit' },
  { key: 'proximityWeight', label: 'Proximity' },
  { key: 'dietaryWeight', label: 'Dietary match' },
  { key: 'ratingWeight', label: 'Restaurant rating' },
] as const;

export default function AiModelPage() {
  const { toast } = useToast();
  const [weights, setWeights] = useState<Record<string, number> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/api/recommendations/weights').then((res) => {
      setWeights({
        cuisineWeight: Number(res.data.cuisine_weight),
        budgetWeight: Number(res.data.budget_weight),
        proximityWeight: Number(res.data.proximity_weight),
        dietaryWeight: Number(res.data.dietary_weight),
        ratingWeight: Number(res.data.rating_weight),
      });
    }).catch(() => {});
  }, []);

  const sum = weights ? Object.values(weights).reduce((a, b) => a + b, 0) : 0;
  const isValid = Math.abs(sum - 1) < 0.01;

  const save = async () => {
    if (!weights || !isValid) return;
    setSaving(true);
    try {
      await api.patch('/api/recommendations/weights', weights);
      toast('AI recommendation model updated', 'success');
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-2">
        AI Recommendation Model Tuning
      </h1>
      <p className="text-stone-500 mb-6 text-sm max-w-2xl">
        Adjust how much each factor influences a restaurant&apos;s match score. Weights must sum to 1.0 (100%).
        Changes apply immediately to all future recommendation requests.
      </p>

      {!weights ? (
        <Skeleton className="h-64 w-full max-w-lg" />
      ) : (
        <div className="bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-lg p-6 max-w-lg space-y-5 shadow-sm">
          {FACTORS.map((f) => (
            <div key={f.key}>
              <div className="flex justify-between text-sm mb-1 font-medium text-stone-800 dark:text-stone-200">
                <label htmlFor={f.key}>{f.label}</label>
                <span className="font-bold text-cordova-green dark:text-emerald-400">{Math.round(weights[f.key] * 100)}%</span>
              </div>
              <input
                id={f.key}
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={weights[f.key]}
                onChange={(e) => setWeights({ ...weights, [f.key]: parseFloat(e.target.value) })}
                className="w-full accent-cordova-green cursor-pointer"
              />
            </div>
          ))}

          <div className={`text-sm font-semibold ${isValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
            Total: {Math.round(sum * 100)}% {isValid ? '✓ valid' : '— must equal 100%'}
          </div>

          <Button onClick={save} loading={saving} disabled={!isValid} className="w-full">
            Update AI model
          </Button>
        </div>
      )}
    </div>
  );
}
