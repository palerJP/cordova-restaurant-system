'use client';

import { useEffect, useState, useCallback } from 'react';
import { api, ApiClientError } from '@/lib/api';
import { useToast } from '@/lib/toast-context';
import { RequireRole } from '@/components/RequireRole';
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
    <RequireRole roles={['admin']}>
      <h1 className="text-2xl font-bold mb-6">Content & Review Moderation</h1>
      <p className="text-[var(--text-muted)] mb-6 text-sm">Reviews flagged by customers or the system awaiting your decision.</p>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : reviews.length === 0 ? (
        <p className="text-[var(--text-muted)]">No flagged reviews right now. 🎉</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <p className="font-medium">
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
              {r.comment && <p className="text-sm text-[var(--text-muted)] mt-2">{r.comment}</p>}
              {r.flagged_reason && <p className="text-xs text-red-500 mt-2">Flag reason: {r.flagged_reason}</p>}
            </div>
          ))}
        </div>
      )}
    </RequireRole>
  );
}
