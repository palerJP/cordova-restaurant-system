'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  Phone,
  Clock,
  Award,
  MapPin,
  ImageOff,
  ThumbsUp,
  Star,
  Sparkles,
} from 'lucide-react';
import { api, ApiClientError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { Skeleton } from '@/components/ui/Skeleton';
import { MapViewClient } from '@/components/MapViewClient';
import type {
  Restaurant,
  MenuItem,
  MenuCategory,
  Review,
  OperatingHour,
  RestaurantImage,
  Promotion,
} from '@/lib/types';

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user } = useAuth();
  const { toast } = useToast();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hours, setHours] = useState<OperatingHour[]>([]);
  const [gallery, setGallery] = useState<RestaurantImage[]>([]);
  const [activePromotions, setActivePromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'map' | 'reviews'>('overview');

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const detail = await api.get(`/api/restaurants/by-slug/${encodeURIComponent(slug)}?source=browse`, {
        auth: !!user,
      });
      const found: Restaurant = detail.data.restaurant;

      const [menu, reviewsRes, hoursRes, galleryRes, promoRes] = await Promise.all([
        api.get(`/api/restaurants/${found.id}/menu`, { auth: false }),
        api.get(`/api/restaurants/${found.id}/reviews`, { auth: false }),
        api.get(`/api/restaurants/${found.id}/hours`, { auth: false }),
        api.get(`/api/restaurants/${found.id}/images`, { auth: false }),
        api.get(`/api/restaurants/${found.id}/promotions`, { auth: false }),
      ]);

      setRestaurant(found);
      setCategories(menu.data.categories || []);
      setItems(menu.data.items || []);
      setReviews(reviewsRes.data || []);
      setHours(hoursRes.data || []);
      setGallery(galleryRes.data || []);

      const today = new Date().toISOString().slice(0, 10);
      const activePromos = (promoRes.data || []).filter(
        (p: Promotion) => p.status === 'active' && p.end_date >= today
      );
      setActivePromotions(activePromos);
    } catch (err) {
      setRestaurant(null);
    } finally {
      setLoading(false);
    }
  }, [slug, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
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
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-80 w-full rounded-xl" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-24 text-stone-500">
        <p className="text-4xl mb-3">🍽️</p>
        <h2 className="font-serif text-2xl font-bold text-stone-800 dark:text-white mb-2">
          Establishment Not Found
        </h2>
        <p className="text-sm">We couldn&apos;t find the restaurant you were looking for.</p>
        <button
          onClick={() => router.push('/')}
          className="mt-6 inline-flex items-center gap-2 bg-cordova-green text-white text-xs font-semibold px-5 py-2.5 rounded shadow"
        >
          <ArrowLeft size={16} /> Return to Home
        </button>
      </div>
    );
  }

  const locationText = restaurant.barangay
    ? `${restaurant.barangay}, Cordova`
    : restaurant.address || 'Cordova, Cebu';

  const phoneText = restaurant.phone || '+63 912 345 6789';
  const hoursText = hours.length > 0 && !hours[0].is_closed
    ? `${hours[0].open_time.slice(0, 5)} AM - ${hours[0].close_time.slice(0, 5)} PM`
    : '10:00 AM - 8:00 PM';
  const tagText = restaurant.cuisines?.[0]
    ? `${restaurant.cuisines[0]} Cuisine`
    : 'Award-Winning Cuisine';

  const allPhotos = [
    ...(restaurant.cover_image_url ? [{ id: 'cover', image_url: restaurant.cover_image_url }] : []),
    ...gallery,
  ];

  return (
    <div className="min-h-screen bg-cordova-cream dark:bg-[#121614] pb-24">
      {/* HERO COVER SECTION */}
      <section className="relative w-full h-[400px] sm:h-[480px] overflow-hidden bg-stone-900">
        {restaurant.cover_image_url ? (
          <Image
            src={restaurant.cover_image_url}
            alt={restaurant.name}
            fill
            priority
            className="object-cover object-center opacity-85"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-7xl bg-gradient-to-br from-amber-900 to-stone-900">
            🍽️
          </div>
        )}

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30" />

        {/* Top Control Buttons */}
        <div className="absolute top-6 left-6 right-6 z-20 max-w-6xl mx-auto flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md flex items-center justify-center text-stone-800 dark:text-white shadow hover:bg-white transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            onClick={toggleFavorite}
            className="w-10 h-10 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md flex items-center justify-center text-stone-800 dark:text-white shadow hover:bg-white transition-colors"
            aria-label="Favorite"
          >
            <Heart size={18} className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
          </button>
        </div>

        {/* Hero Title & Location Overlay */}
        <div className="absolute bottom-16 left-0 right-0 z-20 px-4">
          <div className="max-w-4xl mx-auto text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 text-cordova-gold text-xs font-semibold tracking-widest uppercase mb-2">
                <Award size={14} /> FEATURED ESTABLISHMENT
              </div>
              {/* Name */}
              <h1 className="font-serif text-4xl sm:text-6xl font-bold text-white tracking-tight drop-shadow-md">
                {restaurant.name}
              </h1>
            </div>

            {/* Location Badge */}
            <div className="flex items-center gap-1.5 text-white/90 text-sm font-medium bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 shrink-0">
              <MapPin size={15} className="text-cordova-gold" />
              <span>{locationText}</span>
            </div>
          </div>
        </div>
      </section>

      {/* OVERLAPPING MAIN CONTAINER */}
      <section className="relative z-30 -mt-10 px-4 max-w-4xl mx-auto">
        {/* ACTIVE PROMOTION BANNER IF AVAILABLE */}
        {activePromotions.length > 0 && (
          <div className="mb-4 bg-gradient-to-r from-amber-500 via-cordova-gold to-amber-600 rounded-xl p-4 sm:p-5 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-amber-300/40">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-black/25 text-amber-200 text-[11px] font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider">
                🎁 Active Special Promotion
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold drop-shadow">
                {activePromotions[0].title}
              </h3>
              {activePromotions[0].description && (
                <p className="text-xs text-amber-50/95 max-w-xl leading-relaxed font-sans">
                  {activePromotions[0].description}
                </p>
              )}
            </div>
            {activePromotions[0].discount_label && (
              <span className="bg-white text-stone-900 font-extrabold text-xs px-3.5 py-1.5 rounded-lg shadow-md shrink-0 uppercase tracking-wider">
                {activePromotions[0].discount_label}
              </span>
            )}
          </div>
        )}

        {/* GUEST SIGN IN / SIGN UP PROMPT BANNER */}
        {!user && (
          <div className="mb-4 bg-gradient-to-r from-[#1b241f] via-stone-900 to-[#1b241f] rounded-xl p-5 sm:p-6 text-white shadow-xl border border-cordova-gold/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-cordova-gold text-xs font-bold uppercase tracking-wider">
                <Sparkles size={16} /> Unlock Best Features
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                Sign in to get personalized recommendations, save favorites & post verified reviews!
              </h3>
              <p className="text-xs text-stone-300">
                Create an account or sign in to experience all interactive CordovaEats features.
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                href="/login"
                className="text-xs font-semibold text-white hover:text-cordova-gold transition-colors px-3.5 py-2 border border-white/20 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-cordova-gold hover:bg-cordova-goldHover text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-colors uppercase tracking-wider"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-[#1a211c] rounded-t-xl shadow-2xl overflow-hidden border border-stone-200/80 dark:border-stone-800/80">
          
          {/* QUICK INFO BAR (3 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-stone-200 dark:border-stone-800 text-center text-xs font-serif divide-y sm:divide-y-0 sm:divide-x divide-stone-200 dark:divide-stone-800 bg-white dark:bg-[#1a211c]">
            <div className="p-4 flex flex-col items-center justify-center gap-1.5">
              <Phone size={18} className="text-cordova-green dark:text-emerald-400" />
              <span className="font-medium text-stone-700 dark:text-stone-300">{phoneText}</span>
            </div>
            <div className="p-4 flex flex-col items-center justify-center gap-1.5">
              <Clock size={18} className="text-cordova-green dark:text-emerald-400" />
              <span className="font-medium text-stone-700 dark:text-stone-300">{hoursText}</span>
            </div>
            <div className="p-4 flex flex-col items-center justify-center gap-1.5">
              <Award size={18} className="text-cordova-gold" />
              <span className="font-semibold italic text-stone-800 dark:text-stone-200">{tagText}</span>
            </div>
          </div>

          {/* TAB NAVIGATION HEADER */}
          <div className="border-t-2 border-cordova-green border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1a211c]">
            <div className="grid grid-cols-4 text-center">
              {(['overview', 'menu', 'map', 'reviews'] as const).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all duration-200 relative ${
                      isActive
                        ? 'text-stone-900 dark:text-white bg-stone-100/70 dark:bg-stone-800/70 border-b-2 border-cordova-gold'
                        : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB CONTENT AREA */}
          <div className="p-6 sm:p-10 min-h-[400px]">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-12">
                {/* Story Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <h2 className="font-serif text-3xl font-bold text-cordova-green dark:text-emerald-400">
                      Our Story
                    </h2>
                    <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed font-sans">
                      {restaurant.description ||
                        `Famous for authentic Cebuano dining and traditional Filipino dishes. Family-owned and dedicated to delivering fresh, local seafood and traditional flavors to every guest.`}
                    </p>
                    <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
                      <p className="font-serif italic text-cordova-gold text-sm">
                        &quot;Where tradition meets excellence&quot;
                      </p>
                    </div>
                  </div>

                  {/* Story Image with Beige Circular Accent */}
                  <div className="relative flex justify-center">
                    <div className="absolute -top-4 -right-4 w-40 h-40 rounded-full bg-amber-100/70 dark:bg-amber-950/30 -z-10" />
                    <div className="relative h-64 w-full rounded-lg overflow-hidden shadow-md border border-stone-200 dark:border-stone-800">
                      <Image
                        src={restaurant.cover_image_url || '/hero_background.png'}
                        alt={restaurant.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Gallery Section */}
                <div>
                  <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mb-6">
                    Gallery
                  </h3>
                  {allPhotos.length === 0 ? (
                    <div className="text-center py-12 text-stone-400">
                      <ImageOff size={32} className="mx-auto mb-2 opacity-60" />
                      <p className="text-xs">No gallery photos uploaded yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {allPhotos.map((img, i) => (
                        <div
                          key={img.id || i}
                          className="relative h-44 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800 shadow-sm border border-stone-200/60 dark:border-stone-800/60"
                        >
                          <Image
                            src={img.image_url}
                            alt={`${restaurant.name} gallery photo`}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MENU TAB */}
            {activeTab === 'menu' && (
              <div>
                <h2 className="font-serif text-3xl font-bold text-cordova-green dark:text-emerald-400 text-center mb-8 tracking-wider uppercase">
                  SIGNATURE DISH
                </h2>

                {items.length === 0 ? (
                  <div className="text-center py-12 text-stone-400">
                    <p className="text-sm">Menu details coming soon.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-stone-50 dark:bg-stone-900 rounded-lg overflow-hidden border border-stone-200 dark:border-stone-800 flex flex-col group shadow-sm"
                      >
                        {/* Dish Photo */}
                        <div className="relative h-44 w-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                          {item.image_url ? (
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-3xl bg-amber-50 dark:bg-stone-800">
                              🍲
                            </div>
                          )}
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-center">
                            <span className="font-serif text-xs font-bold text-cordova-gold uppercase tracking-wider drop-shadow">
                              {item.name}
                            </span>
                          </div>
                        </div>

                        {/* Dish Price & Desc */}
                        <div className="p-3 text-center flex-1 flex flex-col justify-between">
                          <p className="font-semibold text-sm text-stone-800 dark:text-stone-200">
                            ₱{Number(item.price).toFixed(0)}
                          </p>
                          {item.description && (
                            <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MAP TAB */}
            {activeTab === 'map' && (
              <div className="space-y-6">
                <div className="rounded-lg overflow-hidden shadow-md border border-stone-200 dark:border-stone-800">
                  <MapViewClient restaurants={[restaurant]} height="450px" />
                </div>
                <div className="text-center">
                  <p className="font-serif text-base font-semibold text-stone-800 dark:text-white">
                    {restaurant.name}
                  </p>
                  <p className="text-xs text-stone-500 mt-1">{restaurant.address}</p>
                </div>
              </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <div className="space-y-8">
                <h2 className="font-serif text-3xl font-bold text-cordova-green dark:text-emerald-400 tracking-wider uppercase">
                  REVIEWS
                </h2>

                {/* Review List */}
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <div className="bg-stone-100 dark:bg-stone-900 p-8 rounded text-center text-stone-500">
                      <p className="text-sm">No reviews yet. Be the first to share your experience!</p>
                    </div>
                  ) : (
                    reviews.map((r) => (
                      <div
                        key={r.id}
                        className="bg-stone-200/60 dark:bg-stone-800/60 p-6 rounded border-l-4 border-cordova-gold flex flex-col justify-between gap-3 shadow-sm"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-widest">
                            {r.reviewer_name || 'JUAN DELA CRUZ'}
                          </span>
                          <span className="font-mono text-[10px] font-semibold text-stone-500 uppercase tracking-widest">
                            VERIFIED REVIEW
                          </span>
                        </div>

                        <p className="font-serif italic text-stone-800 dark:text-stone-100 text-sm sm:text-base my-2">
                          &apos; {r.comment || 'GREAT FOOD, AMAZING EXPERIENCE!'} &apos;
                        </p>

                        <div className="flex items-center gap-1 text-cordova-gold text-xs">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={13}
                              className={i < r.rating ? 'fill-cordova-gold' : 'text-stone-300 dark:text-stone-700'}
                            />
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Review Form */}
                {user?.role === 'customer' && (
                  <form onSubmit={submitReview} className="bg-stone-50 dark:bg-stone-900 p-6 rounded-lg border border-stone-200 dark:border-stone-800 space-y-4 mt-8">
                    <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">
                      Leave a Review
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500 font-medium">Rating:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="p-1 text-cordova-gold"
                          >
                            <Star
                              size={18}
                              className={star <= reviewRating ? 'fill-cordova-gold' : 'text-stone-300 dark:text-stone-700'}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your thoughts about this restaurant..."
                      className="w-full p-3 rounded bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm outline-none focus:ring-2 focus:ring-cordova-gold/40"
                    />
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-cordova-green hover:bg-cordova-greenHover text-white text-xs font-semibold px-6 py-2.5 rounded shadow transition-colors"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
