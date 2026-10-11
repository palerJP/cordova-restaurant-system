'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { rememberClaimDestination } from '@/lib/claims';

export default function ClaimBusinessLink({ restaurantSlug }: { restaurantSlug?: string }) {
  const { user } = useAuth();
  const [business, setBusiness] = useState<{ id: string; claimed: boolean } | null>(null);
  useEffect(() => {
    let active = true;
    setBusiness(null);
    if (restaurantSlug) {
      api.get('/api/restaurants/by-slug/' + encodeURIComponent(restaurantSlug), { auth: false })
        .then(async response => {
          const id = response.data.restaurant.id;
          const status = await api.get('/api/restaurants/' + id + '/claim-status', { auth: false });
          if (active) setBusiness({ id, claimed: status.data.ownership_claimed });
        })
        .catch(() => { if (active) setBusiness(null); });
    }
    return () => { active = false; };
  }, [restaurantSlug]);
  if (user?.role === 'admin') return null;
  const href = business ? '/dashboard/claims/new?restaurant=' + business.id : '/for-restaurants#claim';
  return <Link
    className="text-sm text-stone-500 dark:text-stone-400 hover:text-cordova-green dark:hover:text-emerald-400 transition-colors"
    href={href}
    onClick={() => { if (business) rememberClaimDestination(business.id); }}
  >{business?.claimed ? 'Report Incorrect Ownership' : 'Claim Your Business'}</Link>;
}
