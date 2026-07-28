'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api, ApiClientError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import type { PageMeta } from '@/lib/types';

interface HistoryEntry {
  id: string;
  queryParams: {
    cuisines?: string[];
    budgetRange?: string;
    dietaryRestrictions?: string[];
    requiredServices?: string[];
    maxDistanceKm?: number;
    onlyOpenNow?: boolean;
  };
  resultCount: number;
  createdAt: string;
  topResult: {
    id: string;
    name: string;
    slug: string;
    coverImageUrl?: string;
    avgRating: number;
    priceRange: string;
  } | null;
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/recommendations/history?page=${page}&limit=10`);
      setEntries(res.data);
      setMeta(res.meta);
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Failed to load history', 'error');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user, load]);

  if (authLoading) return <Skeleton className="h-64 w-full" />;

  if (!user) {
    return (
      <div className="text-center py-20 text-[var(--text-muted)]">
        <p className="text-4xl mb-3">🔒</p>
        <p>Log in to view your recommendation search history.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Your Search History</h1>
      <p className="text-[var(--text-muted)] mb-6 text-sm">
        A record of your past AI recommendation searches and what came up top.
      </p>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20 text-[var(--text-muted)]">
          <p className="text-4xl mb-3">🕓</p>
          <p>No searches yet — try the AI recommendations page to get started.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="card p-4 flex flex-wrap gap-4 items-center">
                {entry.topResult?.coverImageUrl && (
                  <div className="relative h-16 w-16 rounded-xl overflow-hidden shrink-0 bg-black/5">
                    <Image src={entry.topResult.coverImageUrl} alt={entry.topResult.name} fill className="object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-[200px]">
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {entry.queryParams.cuisines?.map((c) => (
                      <Badge key={c}>{c}</Badge>
                    ))}
                    {entry.queryParams.budgetRange && <Badge color="brand">{entry.queryParams.budgetRange}</Badge>}
                    {entry.queryParams.onlyOpenNow && <Badge color="success">open now</Badge>}
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">
                    {entry.resultCount} result{entry.resultCount === 1 ? '' : 's'} ·{' '}
                    {new Date(entry.createdAt).toLocaleString()}
                  </p>
                </div>
                {entry.topResult ? (
                  <Link href={`/restaurants/${entry.topResult.slug}`} className="text-sm font-medium text-brand-500 hover:underline shrink-0">
                    Top match: {entry.topResult.name} →
                  </Link>
                ) : (
                  <span className="text-sm text-[var(--text-muted)] shrink-0">No matches found</span>
                )}
              </div>
            ))}
          </div>
          {meta && <Pagination meta={meta} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}
