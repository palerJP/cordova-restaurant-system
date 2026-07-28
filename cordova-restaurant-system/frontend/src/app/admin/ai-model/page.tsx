'use client';

import { useEffect, useState } from 'react';
import { api, ApiClientError } from '@/lib/api';
import { useToast } from '@/lib/toast-context';
import { RequireRole } from '@/components/RequireRole';
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
    <RequireRole roles={['admin']}>
      <h1 className="text-2xl font-bold mb-1">AI Recommendation Model Tuning</h1>
      <p className="text-[var(--text-muted)] mb-6 text-sm max-w-2xl">
        Adjust how much each factor influences a restaurant&apos;s match score. Weights must sum to 1.0 (100%).
        Changes apply immediately to all future recommendation requests.
      </p>

      {!weights ? (
        <Skeleton className="h-64 w-full max-w-lg" />
      ) : (
        <div className="card p-6 max-w-lg space-y-5">
          {FACTORS.map((f) => (
            <div key={f.key}>
              <div className="flex justify-between text-sm mb-1">
                <label htmlFor={f.key}>{f.label}</label>
                <span className="font-medium">{Math.round(weights[f.key] * 100)}%</span>
              </div>
              <input
                id={f.key}
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={weights[f.key]}
                onChange={(e) => setWeights({ ...weights, [f.key]: parseFloat(e.target.value) })}
                className="w-full accent-brand-500"
              />
            </div>
          ))}

          <div className={`text-sm font-medium ${isValid ? 'text-emerald-500' : 'text-red-500'}`}>
            Total: {Math.round(sum * 100)}% {isValid ? '✓ valid' : '— must equal 100%'}
          </div>

          <Button onClick={save} loading={saving} disabled={!isValid} className="w-full">
            Update AI model
          </Button>
        </div>
      )}
    </RequireRole>
  );
}
