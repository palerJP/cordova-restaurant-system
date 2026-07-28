'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, Share2, Phone, Mail, MapPin, Check, ImageOff, ThumbsUp } from 'lucide-react';
import { api, ApiClientError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { StarRating, Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { RestaurantCard } from '@/components/RestaurantCard';
import { MapViewClient } from '@/components/MapViewClient';
import { amenityLabel } from '@/lib/amenities';
import type {
  Restaurant, MenuItem, MenuCategory, Review, OperatingHour, Promotion, RestaurantImage, Attraction,
} from '@/lib/types';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function RestaurantDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useAuth();
  const { toast } = useToast();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hours, setHours] = useState<OperatingHour[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [gallery, setGallery] = useState<RestaurantImage[]>([]);
  const [similar, setSimilar] = useState<Restaurant[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews' | 'gallery' | 'info'>('menu');

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const detail = await api.get(`/api/restaurants/by-slug/${encodeURIComponent(slug)}?source=browse`, {
        auth: !!user,
      });
      const found: Restaurant = detail.data.restaurant;

      const [menu, reviewsRes, hoursRes, promoRes, galleryRes, similarRes, attractionsRes] = await Promise.all([
        api.get(`/api/restaurants/${found.id}/menu`, { auth: false }),
        api.get(`/api/restaurants/${found.id}/reviews`, { auth: false }),
        api.get(`/api/restaurants/${found.id}/hours`, { auth: false }),
        api.get(`/api/restaurants/${found.id}/promotions`, { auth: false }),
        api.get(`/api/restaurants/${found.id}/images`, { auth: false }),
        api.get(`/api/restaurants/${found.id}/similar`, { auth: false }),
        api.get(`/api/attractions/nearby?lat=${found.latitude}&lng=${found.longitude}&radiusKm=15`, { auth: false }),
      ]);

      setRestaurant(found);
      setCategories(menu.data.categories);
      setItems(menu.data.items);
      setReviews(reviewsRes.data);
      setHours(hoursRes.data);
      setPromotions(promoRes.data);
      setGallery(galleryRes.data);
      setSimilar(similarRes.data);
      setAttractions(attractionsRes.data);
    } catch (err) {
      setRestaurant(null);
    } finally {
      setLoading(false);
    }
  }, [slug, user]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleFavorite = async () => {
    if (!user) {
      toast('Please log in to save favorites', 'info');
      return;
    }
    if (!restaurant) return;
    try {
      if (isFavorite) {
        await api.delete(`/api/restaurants/${restaurant.id}/favorite`);
        toast('Removed from favorites', 'info');
      } else {
        await api.post(`/api/restaurants/${restaurant.id}/favorite`);
        toast('Added to favorites', 'success');
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Something went wrong', 'error');
    }
  };

  const shareRestaurant = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: restaurant?.name, url });
      } catch {
        // user cancelled the native share sheet — not an error
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast('Link copied to clipboard', 'success');
    } catch {
      toast('Could not copy link', 'error');
    }
  };

  const toggleReviewLike = async (reviewId: string) => {
    if (!user) {
      toast('Please log in to mark reviews as helpful', 'info');
      return;
    }
    // Optimistic update — reflect the change immediately, revert if the request fails
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, liked_by_me: !r.liked_by_me, like_count: r.like_count + (r.liked_by_me ? -1 : 1) }
          : r
      )
    );
    try {
      await api.post(`/api/reviews/${reviewId}/like`);
    } catch (err) {
      // revert on failure
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, liked_by_me: !r.liked_by_me, like_count: r.like_count + (r.liked_by_me ? -1 : 1) }
            : r
        )
      );
      toast(err instanceof ApiClientError ? err.message : 'Failed to update', 'error');
    }
  };

  const submitReview = async () => {
    if (!restaurant) return;
    setSubmittingReview(true);
    try {
      const res = await api.post(`/api/restaurants/${restaurant.id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviews((prev) => [res.data.review, ...prev]);
      setReviewComment('');
      toast('Review submitted!', 'success');
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-20 text-[var(--text-muted)]">
        <p className="text-4xl mb-3">🍽️</p>
        <p>Restaurant not found.</p>
      </div>
    );
  }

  const categorized = categories.map((cat) => ({
    category: cat,
    items: items.filter((i) => i.category_id === cat.id),
  }));
  const uncategorized = items.filter((i) => !i.category_id);
  const allPhotos = [
    ...(restaurant.cover_image_url ? [{ id: 'cover', image_url: restaurant.cover_image_url }] : []),
    ...gallery,
  ];

  return (
    <div>
      <div className="relative h-56 sm:h-72 w-full rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5 mb-6 shadow-premium">
        {restaurant.cover_image_url ? (
          <Image src={restaurant.cover_image_url} alt={restaurant.name} fill className="object-cover" priority />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-6xl bg-gradient-to-br from-brand-50 to-transparent dark:from-white/5">
            🍽️
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{restaurant.name}</h1>
          <p className="text-[var(--text-muted)] mt-1 flex items-center gap-1">
            <MapPin size={14} className="shrink-0" /> {restaurant.address}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <StarRating value={Number(restaurant.avg_rating)} size="md" />
            <span className="text-sm text-[var(--text-muted)]">{restaurant.review_count} reviews</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {restaurant.cuisines.map((c) => (
              <Badge key={c}>{c}</Badge>
            ))}
            {restaurant.dietary_options.map((d) => (
              <Badge key={d} color="success">
                {d}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={shareRestaurant} aria-label="Share this restaurant">
            <Share2 size={16} />
          </Button>
          <Button variant={isFavorite ? 'primary' : 'secondary'} onClick={toggleFavorite}>
            <Heart size={16} className={isFavorite ? 'fill-white' : ''} /> {isFavorite ? 'Saved' : 'Save'}
          </Button>
        </div>
      </div>

      {promotions.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-3">
          {promotions.map((p) => (
            <div key={p.id} className="card px-4 py-2.5 border-l-4 border-l-gold-500">
              <p className="font-semibold text-sm">{p.title}</p>
              {p.discount_label && <p className="text-xs text-[var(--text-muted)]">{p.discount_label}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-1 border-b border-[var(--border)] mb-6 overflow-x-auto">
        {(['menu', 'reviews', 'gallery', 'info'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors capitalize whitespace-nowrap ${
              activeTab === tab ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-[var(--text-muted)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'menu' && (
        <div className="space-y-8">
          {categorized.map(
            ({ category, items: catItems }) =>
              catItems.length > 0 && (
                <div key={category.id}>
                  <h3 className="text-lg font-semibold mb-3">{category.name}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {catItems.map((item) => (
                      <MenuItemCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )
          )}
          {uncategorized.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Other Items</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {uncategorized.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}
          {items.length === 0 && <p className="text-[var(--text-muted)]">Menu not yet available.</p>}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-6">
          {user?.role === 'customer' && (
            <div className="card p-4 space-y-3">
              <p className="font-medium">Leave a review</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setReviewRating(star)} aria-label={`Rate ${star} stars`}>
                    <span className={star <= reviewRating ? 'text-gold-500' : 'text-black/15 dark:text-white/15'}>★</span>
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="Share your experience..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
              <Button onClick={submitReview} loading={submittingReview}>
                Submit review
              </Button>
            </div>
          )}

          {reviews.length === 0 ? (
            <p className="text-[var(--text-muted)]">No reviews yet. Be the first!</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{r.reviewer_name}</p>
                  <StarRating value={r.rating} />
                </div>
                {r.comment && <p className="text-sm mt-2 text-[var(--text-muted)]">{r.comment}</p>}
                {r.owner_reply && (
                  <div className="mt-3 pl-3 border-l-2 border-brand-400 text-sm">
                    <p className="font-medium text-xs text-brand-500 mb-0.5">Owner response</p>
                    <p className="text-[var(--text-muted)]">{r.owner_reply}</p>
                  </div>
                )}
                <button
                  onClick={() => toggleReviewLike(r.id)}
                  disabled={!user}
                  className={`mt-3 inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${
                    r.liked_by_me ? 'text-brand-500' : 'text-[var(--text-muted)] hover:text-brand-500'
                  } disabled:opacity-50 disabled:hover:text-[var(--text-muted)]`}
                >
                  <ThumbsUp size={13} className={r.liked_by_me ? 'fill-brand-500' : ''} />
                  Helpful{r.like_count > 0 ? ` (${r.like_count})` : ''}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'gallery' && (
        <div>
          {allPhotos.length === 0 ? (
            <div className="text-center py-16 text-[var(--text-muted)]">
              <ImageOff size={36} className="mx-auto mb-3 opacity-50" />
              <p>No photos yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {allPhotos.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  className="relative aspect-square rounded-xl overflow-hidden bg-black/5"
                >
                  <Image src={photo.image_url} alt={`${restaurant.name} photo ${i + 1}`} fill className="object-cover" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'info' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Operating Hours</h3>
              <ul className="space-y-1 text-sm">
                {DAY_NAMES.map((day, idx) => {
                  const h = hours.find((x) => x.day_of_week === idx);
                  return (
                    <li key={idx} className="flex justify-between">
                      <span className="text-[var(--text-muted)]">{day}</span>
                      <span>{!h || h.is_closed ? 'Closed' : `${h.open_time.slice(0, 5)} – ${h.close_time.slice(0, 5)}`}</span>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 space-y-2 text-sm">
                {restaurant.phone && (
                  <p className="flex items-center gap-2">
                    <Phone size={14} className="text-[var(--text-muted)]" /> {restaurant.phone}
                  </p>
                )}
                {restaurant.email && (
                  <p className="flex items-center gap-2">
                    <Mail size={14} className="text-[var(--text-muted)]" /> {restaurant.email}
                  </p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Location</h3>
              <MapViewClient restaurants={[restaurant]} height="280px" />
            </div>
          </div>

          {restaurant.amenities?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {restaurant.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <Check size={14} className="text-emerald-500 shrink-0" /> {amenityLabel(a)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {attractions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Nearby Attractions</h3>
              <div className="space-y-2">
                {attractions.map((a) => (
                  <div key={a.id} className="card p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-sm">{a.name}</p>
                      {a.description && <p className="text-xs text-[var(--text-muted)] line-clamp-1 mt-0.5">{a.description}</p>}
                    </div>
                    {a.distance_km != null && (
                      <span className="text-xs text-[var(--text-muted)] shrink-0">{a.distance_km.toFixed(1)} km</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {similar.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {similar.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <RestaurantCard restaurant={r} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItemCard({ item }: { item: MenuItem }) {
  return (
    <div className="card p-3 flex gap-3">
      {item.image_url && (
        <div className="relative h-16 w-16 rounded-lg overflow-hidden shrink-0 bg-black/5">
          <Image src={item.image_url} alt={item.name} fill className="object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-2">
          <p className="font-medium text-sm truncate">{item.name}</p>
          <p className="font-semibold text-sm shrink-0">₱{Number(item.price).toFixed(0)}</p>
        </div>
        {item.description && <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-0.5">{item.description}</p>}
        {!item.is_available && (
          <Badge color="warning">Unavailable</Badge>
        )}
      </div>
    </div>
  );
}
