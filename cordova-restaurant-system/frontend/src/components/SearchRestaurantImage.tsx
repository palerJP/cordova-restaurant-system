'use client';

import { useState } from 'react';
import Image from 'next/image';
import { applyRestaurantCustomization } from '@/data/restaurants';
import { API_URL } from '@/lib/api';
import type { Restaurant } from '@/lib/types';

export function SearchRestaurantImage({ restaurant }: { restaurant: Restaurant }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const cover = applyRestaurantCustomization(restaurant).cover_image_url?.trim();
  const source = cover?.startsWith('/uploads/') ? `${API_URL}${cover}` : cover;
  const image = source && source !== failedSource ? source : '/cordova_eats_logo.png';

  return (
    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-stone-100 dark:bg-white/10">
      <Image src={image} alt={restaurant.name} fill unoptimized sizes="48px"
        className={image === '/cordova_eats_logo.png' ? 'object-contain p-1' : 'object-cover'}
        onError={() => { if (source) setFailedSource(source); }} />
    </div>
  );
}
