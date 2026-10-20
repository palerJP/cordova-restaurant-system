'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { RestaurantCard } from '@/components/RestaurantCard';
import { RestaurantGridSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import type { Restaurant, PageMeta } from '@/lib/types';

export default function FavoritesPage() {
  return (
    <ProtectedRoute>
      <FavoritesContent />
    </ProtectedRoute>
  );
}

function FavoritesContent() {
  const { user } = useAuth();
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
          <div className="restaurant-grid">
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
