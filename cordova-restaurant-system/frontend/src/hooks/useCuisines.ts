import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Cuisine } from '@/lib/types';

/**
 * Fetches the cuisines lookup list once. Was previously copy-pasted
 * (identical fetch + error handling) across the homepage, recommendations
 * page, and the "register business" form — centralized here so a change
 * to caching/error behavior only needs to happen in one place.
 */
export function useCuisines(): Cuisine[] {
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);

  useEffect(() => {
    api
      .get('/api/cuisines', { auth: false })
      .then((res) => setCuisines(res.data))
      .catch(() => {});
  }, []);

  return cuisines;
}
