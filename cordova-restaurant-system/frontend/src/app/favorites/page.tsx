'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { RestaurantCard } from '@/components/RestaurantCard';
import { RestaurantGridSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import type { Restaurant, PageMeta } from '@/lib/types';

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api
      .get(`/api/favorites?page=${page}&limit=9`)
      .then((res) => {
        setRestaurants(res.data);
        setMeta(res.meta);
      })
      .catch(() => setRestaurants([]))
      .finally(() => setLoading(false));
  }, [user, page]);

  if (authLoading) return <RestaurantGridSkeleton count={6} />;

  if (!user) {
    return (
      <div className="text-center py-20 text-[var(--text-muted)]">
        <p className="text-4xl mb-3">🔒</p>
        <p>Log in to view your saved favorites.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Your Favorites</h1>
      {loading ? (
        <RestaurantGridSkeleton count={6} />
      ) : restaurants.length === 0 ? (
        <div className="text-center py-20 text-[var(--text-muted)]">
          <p className="text-4xl mb-3">🤍</p>
          <p>You haven&apos;t saved any restaurants yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {restaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
          {meta && <Pagination meta={meta} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}
