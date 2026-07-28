'use client';

import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge } from './ui/Badge';
import { StarRating } from './ui/Badge';
import type { Restaurant } from '@/lib/types';

const PRICE_LABEL: Record<string, string> = {
  budget: '₱',
  moderate: '₱₱',
  expensive: '₱₱₱',
  premium: '₱₱₱₱',
};

/**
 * Memoized since this renders in lists (Browse grid, Recommendations,
 * Similar Restaurants, Favorites) — without this, every card in a list
 * re-renders whenever the parent page re-renders for any reason (toggling
 * grid/map view, dark mode, unrelated filter changes), even though the
 * restaurant data itself hasn't changed.
 */
export const RestaurantCard = memo(function RestaurantCard({
  restaurant,
  matchScore,
}: {
  restaurant: Restaurant;
  matchScore?: number;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="h-full"
    >
      <Link
        href={`/restaurants/${restaurant.slug}`}
        className="card block h-full overflow-hidden group hover:shadow-card-hover transition-shadow duration-300"
      >
        <div className="relative h-40 w-full overflow-hidden bg-black/5 dark:bg-white/5">
          {restaurant.cover_image_url ? (
            <Image
              src={restaurant.cover_image_url}
              alt={restaurant.name}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-4xl bg-gradient-to-br from-brand-50 to-transparent dark:from-white/5">
              🍽️
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {matchScore !== undefined && (
            <div className="absolute top-2 right-2">
              <span className="badge bg-brand-600 text-white font-semibold">
                {Math.round(matchScore)}% match
              </span>
            </div>
          )}
          {restaurant.distance_km != null && (
            <div className="absolute bottom-2 left-2">
              <span className="badge bg-black/55 text-white backdrop-blur-sm">
                {restaurant.distance_km.toFixed(1)} km away
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-tight group-hover:text-brand-500 transition-colors">
              {restaurant.name}
            </h3>
            <span className="text-sm text-[var(--text-muted)] shrink-0">{PRICE_LABEL[restaurant.price_range]}</span>
          </div>
          <p className="text-sm text-[var(--text-muted)] mt-1 line-clamp-1">{restaurant.address}</p>
          <div className="flex items-center justify-between mt-2.5">
            <StarRating value={Number(restaurant.avg_rating)} />
            <span className="text-xs text-[var(--text-muted)]">{restaurant.review_count} reviews</span>
          </div>
          {restaurant.cuisines?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {restaurant.cuisines.slice(0, 3).map((c) => (
                <Badge key={c}>{c}</Badge>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
});
