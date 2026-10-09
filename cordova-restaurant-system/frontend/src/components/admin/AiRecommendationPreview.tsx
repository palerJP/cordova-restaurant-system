'use client';

import { FormEvent, useState } from 'react';
import { api, ApiClientError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import type { RecommendationResult } from '@/lib/types';
import type { AiProviderStatus } from '@/components/admin/AiProviderSettings';

interface PreviewResponse {
  data: RecommendationResult[];
  meta?: { aiProvider?: 'groq' | 'local'; aiSuggestionCount?: number };
}

export function AiRecommendationPreview({ providerStatus }: { providerStatus: AiProviderStatus | null }) {
  const [query, setQuery] = useState('A budget-friendly restaurant with Filipino food and takeout');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<RecommendationResult[] | null>(null);
  const [provider, setProvider] = useState<'groq' | 'local' | null>(null);
  const [copied, setCopied] = useState(false);

  async function preview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim() || loading) return;
    setLoading(true);
    setError(null);
    setCopied(false);
    try {
      const response = await api.post<PreviewResponse>('/api/recommendations/preview', { query: query.trim(), limit: 5 });
      setResults(response.data.slice(0, 5));
      setProvider(response.meta?.aiProvider || 'local');
    } catch (caught) {
      setResults(null);
      setProvider(null);
      setError(caught instanceof ApiClientError ? caught.message : 'Could not preview recommendations.');
    } finally {
      setLoading(false);
    }
  }

  async function copySummary() {
    if (!results?.length) return;
    const lines = results.map((result, index) =>
      `${index + 1}. ${result.restaurant.name} — ${Math.round(result.matchPercentage ?? result.score)}% match. ${result.reason}`);
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
    } catch {
      setError('Could not copy the preview. You can select the results instead.');
    }
  }

  return (
    <section className="bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-lg p-6 space-y-5 shadow-sm">
      <div>
        <h2 className="font-bold text-stone-900 dark:text-white">Try a recommendation</h2>
        <p className="text-sm text-stone-500 mt-1">Preview up to five matches using the current shared model and Groq when connected. This preview does not add customer history or training feedback.</p>
      </div>
      <form onSubmit={preview} className="space-y-3">
        <label htmlFor="ai-preview-query" className="label">Sample customer request</label>
        <textarea id="ai-preview-query" className="input min-h-[88px]" maxLength={500} value={query}
          onChange={(event) => setQuery(event.target.value)} />
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" loading={loading} disabled={!query.trim()}>Preview recommendations</Button>
          {results && results.length > 0 && <Button type="button" variant="secondary" onClick={copySummary}>
            {copied ? 'Copied' : 'Copy results'}
          </Button>}
        </div>
        <p className="text-xs text-stone-500">{!providerStatus
          ? 'Checking the AI connection. Local matching remains available.'
          : providerStatus.configured
            ? 'When available, this request uses Groq. Local matching remains available if it cannot respond.'
            : 'This preview currently uses local matching. Add a Groq key above to include AI suggestions.'}</p>
      </form>
      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {results && <div aria-live="polite" className="space-y-3">
        <p className="text-sm text-stone-500">{results.length === 0 ? 'No matching restaurants found.'
          : provider === 'groq' ? 'Groq helped process this request; CordovaEats supplied the scores and explanations.'
            : 'These matches use local restaurant data and scoring.'}</p>
        {results.map((result) => <div key={result.restaurant.id}
          className="rounded-lg border border-stone-200 dark:border-stone-800 p-3 text-sm">
          <div className="flex justify-between gap-3 font-semibold text-stone-900 dark:text-white">
            <span>{result.restaurant.name}{result.aiSuggested && provider === 'groq' ? ' · Groq selected' : ''}</span>
            <span>{Math.round(result.matchPercentage ?? result.score)}% match</span>
          </div>
          <p className="mt-1 text-stone-600 dark:text-stone-300">{result.reason}</p>
        </div>)}
      </div>}
    </section>
  );
}
