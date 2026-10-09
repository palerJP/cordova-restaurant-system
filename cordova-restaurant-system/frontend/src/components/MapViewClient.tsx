'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from './ui/Skeleton';

/**
 * MapViewClient wraps MapView dynamically to prevent SSR hydration mismatches
 * while loading client-side Google Maps SDK and DOM objects.
 */
export const MapViewClient = dynamic(
  () => import('./MapView').then((m) => m.MapView || m.default),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[420px] w-full rounded-2xl" />,
  }
);

export default MapViewClient;
