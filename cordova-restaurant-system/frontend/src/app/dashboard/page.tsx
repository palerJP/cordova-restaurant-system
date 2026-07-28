'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { RequireRole } from '@/components/RequireRole';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { RestaurantGridSkeleton } from '@/components/ui/Skeleton';
import type { Restaurant, BusinessStatus } from '@/lib/types';

const STATUS_COLOR: Record<BusinessStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  verified: 'success',
  pending: 'warning',
  rejected: 'danger',
  suspended: 'danger',
};

export default function DashboardPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/api/restaurants/mine')
      .then((res) => setRestaurants(res.data))
      .catch(() => setRestaurants([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <RequireRole roles={['owner', 'admin']}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">My Businesses</h1>
        <Link href="/dashboard/new">
          <Button>+ Register a new business</Button>
        </Link>
      </div>

      {loading ? (
        <RestaurantGridSkeleton count={3} />
      ) : restaurants.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-4xl mb-3">🏪</p>
          <p className="text-[var(--text-muted)] mb-4">You haven&apos;t registered a business yet.</p>
          <Link href="/dashboard/new">
            <Button>Register your first business</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {restaurants.map((r) => (
            <Link key={r.id} href={`/dashboard/${r.id}`} className="card p-4 hover:shadow-lg transition-shadow block">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{r.name}</h3>
                <Badge color={STATUS_COLOR[r.status]}>{r.status}</Badge>
              </div>
              <p className="text-sm text-[var(--text-muted)] mt-1">{r.address}</p>
              {r.status === 'rejected' && r.rejection_reason && (
                <p className="text-xs text-red-500 mt-2">Reason: {r.rejection_reason}</p>
              )}
              <div className="flex items-center gap-3 mt-3 text-xs text-[var(--text-muted)]">
                <span>👁️ {r.view_count} views</span>
                <span>⭐ {Number(r.avg_rating).toFixed(1)} ({r.review_count})</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </RequireRole>
  );
}
