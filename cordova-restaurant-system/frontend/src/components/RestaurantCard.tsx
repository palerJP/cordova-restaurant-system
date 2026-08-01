'use client';

import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';
import type { Restaurant } from '@/lib/types';

export const RestaurantCard = memo(function RestaurantCard({
  restaurant,
  matchScore,
}: {
  restaurant: Restaurant;
  matchScore?: number;
}) {
  const ratingVal = Number(restaurant.avg_rating || 4.5).toFixed(1);
  const locationText = restaurant.barangay
    ? `${restaurant.barangay}, Cordova`
    : restaurant.address || 'Cordova, Cebu';

  return (
    <div className="bg-white dark:bg-[#1a211c] rounded-lg border border-stone-200/80 dark:border-stone-800/80 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full group">
      {/* Cover Image */}
      <div className="relative h-48 sm:h-52 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
        {restaurant.cover_image_url ? (
          <Image
            src={restaurant.cover_image_url}
            alt={restaurant.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-4xl bg-gradient-to-br from-amber-50 to-stone-100 dark:from-stone-800 dark:to-stone-900">
            🍽️
          </div>
        )}
        {matchScore !== undefined && (
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-cordova-green text-white text-xs font-semibold px-2.5 py-1 rounded shadow-sm">
              {Math.round(matchScore)}% match
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div className="space-y-2">
          {/* Title */}
          <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-white leading-tight group-hover:text-cordova-green transition-colors">
            {restaurant.name}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300">
            <MapPin size={14} className="text-cordova-gold shrink-0" />
            <span className="truncate">{locationText}</span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 text-xs font-semibold text-stone-800 dark:text-stone-200">
            <Star size={14} className="fill-cordova-gold text-cordova-gold" />
            <span>{ratingVal}</span>
          </div>
        </div>

        {/* Action Button */}
        <Link
          href={`/restaurants/${restaurant.slug}`}
          className="w-full bg-cordova-green hover:bg-cordova-greenHover text-white font-medium text-sm py-2.5 rounded text-center transition-colors duration-200 shadow-sm block mt-2"
        >
          View Details
        </Link>
      </div>
    </div>
  );
});
