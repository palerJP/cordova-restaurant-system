'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiClientError } from '@/lib/api';
import { useToast } from '@/lib/toast-context';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { AiProviderSettings, type AiProviderStatus } from '@/components/admin/AiProviderSettings';
import { AiRecommendationPreview } from '@/components/admin/AiRecommendationPreview';

const FACTORS = [
  { key: 'cuisineWeight', label: 'Cuisine match' },
  { key: 'budgetWeight', label: 'Budget fit' },
  { key: 'proximityWeight', label: 'Proximity' },
  { key: 'dietaryWeight', label: 'Dietary match' },
  { key: 'ratingWeight', label: 'Restaurant rating' },
] as const;

interface ActiveModel {
  id: string;
  trainingExamples: number;
  positiveExamples: number;
  negativeExamples: number;
  trainedBy: string | null;
  trainedAt: string;
}

interface TrainingStatus {
  totalExamples: number;
  positiveExamples: number;
  negativeExamples: number;
  minimumExamples: number;
  minimumPerClass: number;
  canTrain: boolean;
  versionCount: number;
  activeModel: ActiveModel | null;
  recentVersions: Array<{
    id: string;
    trainingExamples: number;
    positiveExamples: number;
    negativeExamples: number;
    trainedAt: string;
    isActive: boolean;
  }>;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export default function AiModelPage() {
  const { toast } = useToast();
  const [weights, setWeights] = useState<Record<string, number> | null>(null);
  const [loadingWeights, setLoadingWeights] = useState(true);
  const [weightsError, setWeightsError] = useState<string | null>(null);
  const [aiProviderStatus, setAiProviderStatus] = useState<AiProviderStatus | null>(null);
  const [saving, setSaving] = useState(false);
  const [training, setTraining] = useState(false);
  const [loadingTrainingStatus, setLoadingTrainingStatus] = useState(true);
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus | null>(null);
  const [trainingStatusError, setTrainingStatusError] = useState<string | null>(null);

  const loadTrainingStatus = useCallback(async () => {
    setLoadingTrainingStatus(true);
    try {
      const response = await api.get<{ data: TrainingStatus }>('/api/recommendations/training');
      setTrainingStatus(response.data);
      setTrainingStatusError(null);
    } catch (err) {
      setTrainingStatus(null);
      setTrainingStatusError(err instanceof ApiClientError ? err.message : 'Could not load model training status.');
    } finally {
      setLoadingTrainingStatus(false);
    }
  }, []);

  const loadWeights = useCallback(async () => {
    setLoadingWeights(true);
    setWeightsError(null);
    try {
      const res = await api.get('/api/recommendations/weights');
      setWeights({
        cuisineWeight: Number(res.data.cuisine_weight),
        budgetWeight: Number(res.data.budget_weight),
        proximityWeight: Number(res.data.proximity_weight),
        dietaryWeight: Number(res.data.dietary_weight),
        ratingWeight: Number(res.data.rating_weight),
      });
    } catch (error) {
      setWeightsError(error instanceof ApiClientError ? error.message : 'Could not load the preference weights.');
    } finally {
      setLoadingWeights(false);
    }
  }, []);

  useEffect(() => {
    void loadWeights();
    void loadTrainingStatus();
  }, [loadWeights, loadTrainingStatus]);

  const sum = weights ? Object.values(weights).reduce((a, b) => a + b, 0) : 0;
  const isValid = Boolean(weights && Object.values(weights).every((weight) => Number.isFinite(weight) && weight >= 0 && weight <= 1) && Math.abs(sum - 1) < 0.005);

  const save = async () => {
    if (!weights || !isValid || saving || training) return;
    setSaving(true);
    try {
      const response = await api.patch<{ meta?: { training?: { trained?: boolean; reason?: string; trainingExamples?: number } } }>(
        '/api/recommendations/weights',
        weights
      );
      const result = response.meta?.training;
      if (result?.trained) {
        toast(`Weights saved. The shared model was updated using ${result.trainingExamples} signals.`, 'success');
      } else if (result?.reason === 'insufficient_feedback') {
        toast('Weights updated. More positive and negative feedback is needed before training.', 'success');
      } else if (result?.reason === 'training_failed') {
        toast('Weights saved, but training failed. Retry from the training section.', 'error');
      } else {
        toast('AI recommendation weights updated', 'success');
      }
      await loadTrainingStatus();
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const trainModel = async () => {
    if (!trainingStatus?.canTrain || training || saving || loadingTrainingStatus) return;
    setTraining(true);
    try {
      const response = await api.post<{ data: { trained: boolean; reason?: string; trainingExamples?: number } }>(
        '/api/recommendations/training'
      );
      if (response.data.trained) {
        toast(`Shared model updated using ${response.data.trainingExamples} signals.`, 'success');
      } else {
        toast('Not enough feedback to train yet. Collect more positive and negative signals.', 'error');
      }
      await loadTrainingStatus();
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Model training failed', 'error');
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-2">
          AI Recommendations
        </h1>
        <p className="text-stone-500 text-sm max-w-2xl">
          Connect Groq for request understanding and restaurant suggestions. Train CordovaEats’ shared recommendation model with customer feedback to improve matching.
        </p>
      </div>

      <AiProviderSettings onStatusChange={setAiProviderStatus} />

      {loadingWeights ? (
        <Skeleton className="h-64 w-full max-w-lg" />
      ) : weightsError ? (
        <div role="alert" className="text-sm text-red-600 dark:text-red-400">{weightsError} <Button variant="secondary" size="sm" onClick={loadWeights}>Retry</Button></div>
      ) : !weights ? null : (
        <section className="bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-lg p-6 max-w-lg space-y-5 shadow-sm">
          <div>
            <h2 className="font-bold text-stone-900 dark:text-white">Preference scoring weights</h2>
            <p className="text-xs text-stone-500 mt-1">
              Set the importance of each preference when a trained shared or personal model is unavailable. Saving also attempts to train a new shared model from current feedback.
            </p>
          </div>
          {FACTORS.map((factor) => (
            <div key={factor.key}>
              <div className="flex justify-between text-sm mb-1 font-medium text-stone-800 dark:text-stone-200">
                <label htmlFor={factor.key}>{factor.label}</label>
                <span className="font-bold text-cordova-green dark:text-emerald-400">
                  {Math.round(weights[factor.key] * 100)}%
                </span>
              </div>
              <input
                id={factor.key}
                type="range"
                aria-label={factor.label}
                aria-valuetext={`${Math.round(weights[factor.key] * 100)} percent`}
                min={0}
                max={1}
                step={0.01}
                value={weights[factor.key]}
                onChange={(event) => setWeights({ ...weights, [factor.key]: parseFloat(event.target.value) })}
                className="w-full accent-cordova-green cursor-pointer"
              />
            </div>
          ))}
          <div className={`text-sm font-semibold ${isValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
            Total: {Math.round(sum * 100)}% {isValid ? '✓ ready to save' : '— must equal 100%'}
          </div>
          <Button onClick={save} loading={saving} disabled={!isValid} className="w-full">
            Save weights and retrain
          </Button>
        </section>
      )}

      <section className="bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-lg p-6 max-w-2xl space-y-5 shadow-sm">
        <div>
          <h2 className="font-bold text-stone-900 dark:text-white">Train the shared recommendation model</h2>
          <p className="text-xs text-stone-500 mt-1">
            Learn from helpful or not-helpful feedback, favorites, and visible restaurant reviews. A new version takes effect immediately for customers who do not yet have a personal model. Training updates CordovaEats’ model; it does not retrain Groq.
          </p>
        </div>

        {loadingTrainingStatus ? (
          <Skeleton className="h-24 w-full" />
        ) : trainingStatusError ? (
          <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-800 dark:text-amber-200">
            Training status unavailable: {trainingStatusError}. Confirm database migration 010 has been applied.
          </div>
        ) : trainingStatus ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Metric label="Training signals" value={trainingStatus.totalExamples} />
              <Metric label="Positive" value={trainingStatus.positiveExamples} />
              <Metric label="Negative" value={trainingStatus.negativeExamples} />
              <Metric label="Model versions" value={trainingStatus.versionCount} />
            </div>

            <div className="rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 text-sm">
              {trainingStatus.activeModel ? (
                <div className="space-y-1 text-stone-700 dark:text-stone-300">
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400">An active shared model is serving recommendations.</p>
                  <p>Last trained: {formatDate(trainingStatus.activeModel.trainedAt)}</p>
                  <p>
                    Model data: {trainingStatus.activeModel.trainingExamples} signals
                    {' '}({trainingStatus.activeModel.positiveExamples} positive, {trainingStatus.activeModel.negativeExamples} negative)
                  </p>
                </div>
              ) : (
                <p className="text-stone-600 dark:text-stone-300">No shared model has been trained yet. Customers without a personal model receive recommendations based on preference weights.</p>
              )}
              <p className="text-xs text-stone-500 mt-2">
                Training requires at least {trainingStatus.minimumExamples} total signals, with at least {trainingStatus.minimumPerClass} positive and {trainingStatus.minimumPerClass} negative.
              </p>
            </div>

            <Button
              onClick={trainModel}
              loading={training}
              disabled={!trainingStatus.canTrain}
            >
              {trainingStatus.activeModel ? 'Train new model version' : 'Train shared model'}
            </Button>

            {trainingStatus.recentVersions.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200">Recent training versions</h3>
                <div className="divide-y divide-stone-200 dark:divide-stone-800 rounded-lg border border-stone-200 dark:border-stone-800">
                  {trainingStatus.recentVersions.map((version) => (
                    <div key={version.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-xs">
                      <span className="text-stone-600 dark:text-stone-300">{formatDate(version.trainedAt)}</span>
                      <span className="text-stone-500">
                        {version.trainingExamples} signals · {version.positiveExamples} positive / {version.negativeExamples} negative
                      </span>
                      {version.isActive && (
                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 font-semibold text-emerald-800 dark:text-emerald-300">
                          Active
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </section>
      <AiRecommendationPreview providerStatus={aiProviderStatus} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-3">
      <div className="text-xl font-bold text-stone-900 dark:text-white">{value}</div>
      <div className="text-[11px] text-stone-500">{label}</div>
    </div>
  );
}
