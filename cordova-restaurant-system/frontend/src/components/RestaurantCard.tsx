'use client';

import { memo, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';
import type { Restaurant } from '@/lib/types';
import { applyRestaurantCustomization } from '@/data/restaurants';
import { getRestaurantReviewStats, normalizeKey } from '@/data/restaurantReviews';

export const RestaurantCard = memo(function RestaurantCard({
  restaurant: rawRestaurant,
  matchScore,
}: {
  restaurant: Restaurant;
  matchScore?: number;
}) {
  const restaurant = applyRestaurantCustomization(rawRestaurant);
  const [imgError, setImgError] = useState(false);
  const [stats, setStats] = useState(() =>
    getRestaurantReviewStats(restaurant.slug || restaurant.id || restaurant.name || '')
  );

  useEffect(() => {
    const current = getRestaurantReviewStats(restaurant.slug || restaurant.id || restaurant.name || '');
    setStats(current);

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const updatedSlug = customEvent.detail?.slugOrId;
      const rawSlug = customEvent.detail?.rawSlugOrId;
      if (!updatedSlug && !rawSlug) return;

      const normCard = normalizeKey(restaurant.slug || restaurant.id || restaurant.name || '');
      const normUpdated = normalizeKey(updatedSlug || '');
      const normRaw = normalizeKey(rawSlug || '');

      if (
        normCard === normUpdated ||
        normCard === normRaw ||
        (normUpdated && normCard.includes(normUpdated)) ||
        (normRaw && normCard.includes(normRaw))
      ) {
        if (customEvent.detail?.stats) {
          setStats(customEvent.detail.stats);
        } else {
          setStats(getRestaurantReviewStats(restaurant.slug || restaurant.id || restaurant.name || ''));
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('cordova_review_updated', handleUpdate);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('cordova_review_updated', handleUpdate);
      }
    };
  }, [restaurant.slug, restaurant.id, restaurant.name]);

  const ratingVal = stats.rating ? stats.rating.toFixed(1) : Number(restaurant.avg_rating || 5.0).toFixed(1);
  const reviewCount = stats.count !== undefined ? stats.count : (restaurant.review_count || 0);
  const locationText = restaurant.barangay
    ? `${restaurant.barangay}, Cordova`
    : restaurant.address || 'Cordova, Cebu';

  const isSponsored = Boolean(restaurant.isSponsored || rawRestaurant.isSponsored);
  const displayScore =
    matchScore !== undefined
      ? matchScore
      : restaurant.relevance_score !== undefined
      ? Math.round(restaurant.relevance_score * 100)
      : undefined;

  const categoryKey = restaurant.category || 'Restaurant';
  const fallbackImage =
    (restaurant.name.toLowerCase().includes('bbq') || restaurant.name.toLowerCase().includes('grill') || restaurant.name.toLowerCase().includes('papsy'))
      ? 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&auto=format&fit=crop&q=85'
      : (restaurant.name.toLowerCase().includes('seafood') || restaurant.name.toLowerCase().includes('bakasi') || restaurant.name.toLowerCase().includes('parola') || restaurant.name.toLowerCase().includes('lantaw'))
      ? 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=1200&auto=format&fit=crop&q=85'
      : categoryKey === 'Cafe'
      ? 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=85'
      : categoryKey === 'Pizza'
      ? 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&auto=format&fit=crop&q=85'
      : categoryKey === 'Fast Food'
      ? 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=1200&auto=format&fit=crop&q=85'
      : categoryKey === 'Street Food'
      ? 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=85'
      : categoryKey === 'Resto Bar'
      ? 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&auto=format&fit=crop&q=85'
      : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&auto=format&fit=crop&q=85';

  const imageSrc =
    !imgError &&
    restaurant.cover_image_url &&
    restaurant.cover_image_url.trim() !== ''
      ? restaurant.cover_image_url
      : fallbackImage;

  const isSeafood = Boolean(
    (restaurant.name + ' ' + (restaurant.description || '') + ' ' + (restaurant.cuisines || []).join(' ')).toLowerCase().includes('seafood') ||
    (restaurant.name + ' ' + (restaurant.description || '')).toLowerCase().includes('bakasi') ||
    (restaurant.name + ' ' + (restaurant.description || '')).toLowerCase().includes('parola') ||
    (restaurant.name + ' ' + (restaurant.description || '')).toLowerCase().includes('lantaw')
  );

  return (
    <div className={`spatial-card overflow-hidden flex flex-col h-full group transition-all duration-300 rounded-3xl ${
      isSponsored
        ? 'border-amber-400/70 dark:border-amber-500/50 ring-2 ring-amber-400/30 shadow-spatial-md'
        : 'border-stone-200/80 dark:border-white/10'
    }`}>
      {/* Cover Image Container */}
      <div className="relative h-48 sm:h-52 w-full bg-stone-100 dark:bg-stone-800/80 overflow-hidden">
        <Image
          src={imageSrc}
          alt={restaurant.name}
          fill
          unoptimized
          onError={() => setImgError(true)}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Ambient Gradient Overlay for depth & contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges Row */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
          {/* Left Badges (Sponsored or Cuisine Specialty) */}
          <div className="flex items-center gap-1.5">
            {isSponsored ? (
              <span className="bg-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-spatial-sm backdrop-blur-md flex items-center gap-1 border border-white/30">
                <span className="text-xs">★</span> Sponsored
              </span>
            ) : isSeafood ? (
              <span className="bg-cyan-600/90 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-spatial-sm backdrop-blur-md flex items-center gap-1 border border-white/20">
                🦞 Seafood
              </span>
            ) : null}
          </div>

          {/* Right Badges (Match Score) */}
          {displayScore !== undefined && (
            <span className="bg-emerald-700/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow-spatial-sm backdrop-blur-md border border-white/30">
              {Math.round(displayScore)}% match
            </span>
          )}
        </div>

        {/* Bottom Image Badges (Barangay Pill & Live Status) */}
        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-white text-xs">
          <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-white/20">
            {restaurant.barangay || 'Cordova'}
          </span>
          {restaurant.is_open === false ? (
            <span className="spatial-status-closed text-[10px] py-0.5 px-2 bg-red-600/90 text-white border-white/20">
              Closed
            </span>
          ) : (
            <span className="spatial-status-open text-[10px] py-0.5 px-2 bg-emerald-600/90 text-white border-white/20">
              Open Now
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div className="space-y-3">
          {/* Title & Price Category */}
          <div>
            <h3 className="font-serif text-xl font-extrabold text-stone-900 dark:text-white leading-tight group-hover:text-cordova-green dark:group-hover:text-emerald-400 transition-colors">
              {restaurant.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider">
                {restaurant.price_range ? restaurant.price_range.toUpperCase() : 'BUDGET'}
              </span>
              <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300">
                • {isSeafood ? 'Seafood Specialist' : restaurant.category || restaurant.cuisines?.[0] || 'Restaurant'}
              </span>
            </div>
          </div>

          {/* Location & Distance */}
          <div className="flex items-center justify-between text-xs text-stone-700 dark:text-stone-200">
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin size={14} className="text-cordova-gold shrink-0" />
              <span className="truncate font-medium">{locationText}</span>
            </div>
            {restaurant.distance_km != null && (
              <span className="shrink-0 text-stone-600 dark:text-stone-300 font-bold ml-2 px-2 py-0.5 rounded-full bg-stone-100 dark:bg-white/10">
                {restaurant.distance_km} km
              </span>
            )}
          </div>

          {/* Rating & Review Count */}
          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-stone-100 dark:border-white/5">
            <div className="flex items-center gap-1.5 font-bold text-stone-900 dark:text-stone-100">
              <Star size={14} className="fill-cordova-gold text-cordova-gold" />
              <span>{ratingVal}</span>
              <span className="text-stone-500 dark:text-stone-400 font-normal">
                ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            {restaurant.phone && (
              <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 truncate max-w-[120px]">
                {restaurant.phone}
              </span>
            )}
          </div>

          {/* Matched Menu Items Preview */}
          {restaurant.matched_menu_items && restaurant.matched_menu_items.length > 0 && (
            <div className="pt-2 border-t border-stone-100 dark:border-white/5">
              <p className="text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Matching specialties:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {restaurant.matched_menu_items.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-block bg-amber-500/15 text-amber-900 dark:text-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-500/30 backdrop-blur-sm"
                  >
                    {item.name} (₱{item.price})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Link
          href={`/restaurants/${restaurant.slug}`}
          className="w-full bg-cordova-green hover:bg-cordova-greenHover dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-extrabold text-xs uppercase tracking-wider py-3 rounded-2xl text-center transition-all duration-200 shadow-spatial-sm hover:shadow-spatial-glow active:scale-[0.98] block mt-1 border border-white/15"
        >
          View Details
        </Link>
      </div>
    </div>
  );
});
