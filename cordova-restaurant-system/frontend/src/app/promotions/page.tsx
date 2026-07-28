'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import type { Promotion } from '@/lib/types';

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/api/promotions?limit=20', { auth: false })
      .then((res) => setPromotions(res.data))
      .catch(() => setPromotions([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Current Promotions</h1>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : promotions.length === 0 ? (
        <p className="text-[var(--text-muted)]">No active promotions right now — check back soon!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {promotions.map((p) => (
            <Link key={p.id} href={`/restaurants/${p.restaurant_slug}`} className="card p-4 flex gap-4 hover:shadow-lg transition-shadow">
              {p.image_url && (
                <div className="relative h-20 w-20 rounded-xl overflow-hidden shrink-0 bg-black/5">
                  <Image src={p.image_url} alt={p.title} fill className="object-cover" />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold">{p.title}</p>
                <p className="text-sm text-[var(--text-muted)] mt-0.5">{p.restaurant_name}</p>
                {p.discount_label && (
                  <div className="mt-1.5">
                    <Badge color="brand">{p.discount_label}</Badge>
                  </div>
                )}
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  Until {new Date(p.end_date).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
