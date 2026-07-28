'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from './ui/Skeleton';

/**
 * Leaflet touches `window` at import time, which breaks Next.js SSR.
 * Import this wrapper anywhere you need the map instead of MapView directly.
 */
export const MapViewClient = dynamic(() => import('./MapView').then((m) => m.MapView), {
  ssr: false,
  loading: () => <Skeleton className="h-[420px] w-full rounded-2xl" />,
});
