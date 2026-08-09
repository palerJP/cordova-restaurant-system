'use client';

import { useEffect, useState, useCallback } from 'react';
import { api, ApiClientError } from '@/lib/api';
import { useToast } from '@/lib/toast-context';
import { StarRating } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ReviewModerationPage() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/reviews/flagged?limit=50');
      setReviews(res.data);
    } catch (err) {
      setReviews([]);
      toast(err instanceof ApiClientError ? err.message : 'Failed to load flagged reviews', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const moderate = async (id: string, status: 'visible' | 'removed') => {
    try {
      await api.patch(`/api/admin/reviews/${id}/moderate`, { status });
      toast(status === 'visible' ? 'Review restored' : 'Review removed', 'success');
      load();
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Failed', 'error');
    }
  };

  return (
    <div>
      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-2">
        Content & Review Moderation
      </h1>
      <p className="text-stone-500 mb-6 text-sm">
        Reviews flagged by customers or the system awaiting your decision.
      </p>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : reviews.length === 0 ? (
        <div className="bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-lg p-12 text-center text-stone-500">
          <p className="text-3xl mb-2">🎉</p>
          <p className="font-serif font-semibold text-stone-800 dark:text-stone-200">
            No flagged reviews right now
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-lg p-5 shadow-sm">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <p className="font-serif font-bold text-stone-900 dark:text-white">
                    {r.reviewer_name} → {r.restaurant_name}
                  </p>
                  <StarRating value={r.rating} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => moderate(r.id, 'visible')}>Restore</Button>
                  <Button variant="secondary" onClick={() => moderate(r.id, 'removed')}>
                    Remove permanently
                  </Button>
                </div>
              </div>
              {r.comment && <p className="text-sm text-stone-600 dark:text-stone-300 mt-2 italic">&apos;{r.comment}&apos;</p>}
              {r.flagged_reason && <p className="text-xs text-red-500 font-semibold mt-2">Flag reason: {r.flagged_reason}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
