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
  Camera,
  X,
  Maximize2,
  CheckCircle2,
  MessageSquare,
  Smile,
  UploadCloud,
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
import { applyRestaurantCustomization, getStaticRestaurantBySlug } from '@/data/restaurants';
import { MCDONALDS_CATEGORIES, MCDONALDS_MENU_ITEMS } from '@/data/mcdonaldsMenu';
import { PAPSY_CATEGORIES, PAPSY_MENU_ITEMS } from '@/data/papsyMenu';
import { PAROLA_CATEGORIES, PAROLA_MENU_ITEMS } from '@/data/parolaMenu';
import { HORIZON_CATEGORIES, HORIZON_MENU_ITEMS } from '@/data/horizonMenu';
import { EAT_N_REPEAT_CATEGORIES, EAT_N_REPEAT_MENU_ITEMS } from '@/data/eatNRepeatMenu';
import { STUFFED_N_FRIED_CATEGORIES, STUFFED_N_FRIED_MENU_ITEMS } from '@/data/stuffedNFriedMenu';
import { TAYTAYAN_CATEGORIES, TAYTAYAN_MENU_ITEMS } from '@/data/taytayanMenu';
import { TITA_KIMS_CATEGORIES, TITA_KIMS_MENU_ITEMS } from '@/data/titaKimsMenu';
import { CAFE_MAFIA_CATEGORIES, CAFE_MAFIA_MENU_ITEMS } from '@/data/cafeMafiaMenu';
import { DON_MACCHIATOS_CATEGORIES, DON_MACCHIATOS_MENU_ITEMS } from '@/data/donMacchiatosMenu';
import { ALBERTOS_CATEGORIES, ALBERTOS_MENU_ITEMS } from '@/data/albertosMenu';
import { TEN_THOUSAND_ROSES_CATEGORIES, TEN_THOUSAND_ROSES_MENU_ITEMS } from '@/data/tenThousandRosesMenu';
import { ABY_ROAD_CATEGORIES, ABY_ROAD_MENU_ITEMS } from '@/data/abyRoadMenu';
import { SpatialRestaurantMenu } from '@/components/menu/SpatialRestaurantMenu';

const SPATIAL_EMOJIS = [
  { emoji: '❤️', label: 'Love it' },
  { emoji: '😋', label: 'Yummy' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '👏', label: 'Bravo' },
  { emoji: '🦞', label: 'Bakasi/Fresh' },
];

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
  const [reviewPhotos, setReviewPhotos] = useState<File[]>([]);
  const [reviewPhotoPreviews, setReviewPhotoPreviews] = useState<string[]>([]);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [userReactions, setUserReactions] = useState<Record<string, string>>({});
  const [submittingReview, setSubmittingReview] = useState(false);
  const [heroImgError, setHeroImgError] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let found: Restaurant | null = null;
      try {
        const detail = await api.get(`/api/restaurants/by-slug/${encodeURIComponent(slug)}?source=browse`, {
          auth: !!user,
        });
        found = detail.data.restaurant;
      } catch {
        found = getStaticRestaurantBySlug(slug);
      }

      if (!found) {
        setRestaurant(null);
        return;
      }

      const customFound = applyRestaurantCustomization(found);
      setRestaurant(customFound);

      try {
        const [menu, reviewsRes, hoursRes, galleryRes, promoRes] = await Promise.all([
          api.get(`/api/restaurants/${found.id}/menu`, { auth: false }).catch(() => ({ data: {} })),
          api.get(`/api/restaurants/${found.id}/reviews`, { auth: false }).catch(() => ({ data: [] })),
          api.get(`/api/restaurants/${found.id}/hours`, { auth: false }).catch(() => ({ data: [] })),
          api.get(`/api/restaurants/${found.id}/images`, { auth: false }).catch(() => ({ data: [] })),
          api.get(`/api/restaurants/${found.id}/promotions`, { auth: false }).catch(() => ({ data: [] })),
        ]);

        const isMcDo =
          slug === 'mcdonalds-cordova' ||
          found.slug === 'mcdonalds-cordova' ||
          customFound.name.toLowerCase().includes('mcdonald');

        const isPapsy =
          slug === 'papsys-bbq' ||
          found.slug === 'papsys-bbq' ||
          customFound.name.toLowerCase() === 'papsys bbq' ||
          customFound.name.toLowerCase() === "papsy's bbq";

        const isParola =
          slug === 'parola-seaview-restaurant' ||
          found.slug === 'parola-seaview-restaurant' ||
          customFound.name.toLowerCase().includes('parola');

        const isHorizon =
          slug === 'horizon-bean-cafe' ||
          found.slug === 'horizon-bean-cafe' ||
          customFound.name.toLowerCase().includes('horizon');

        const isEatNRepeat =
          slug === 'eat-n-repeat' ||
          found.slug === 'eat-n-repeat' ||
          customFound.name.toLowerCase().includes('eat n repeat') ||
          customFound.name.toLowerCase().includes("eat n' repeat") ||
          customFound.name.toLowerCase().includes('eat & repeat');

        const isStuffedNFried =
          slug === 'stuffed-n-fried-cordova' ||
          found.slug === 'stuffed-n-fried-cordova' ||
          customFound.name.toLowerCase().includes('stuffed');

        const isTaytayan =
          slug === 'taytayan-pinoy-restaurant' ||
          found.slug === 'taytayan-pinoy-restaurant' ||
          customFound.name.toLowerCase().includes('taytayan');

        const isTitaKims =
          slug === 'tita-kims' ||
          found.slug === 'tita-kims' ||
          customFound.name.toLowerCase().includes('tita kim') ||
          customFound.name.toLowerCase().includes("tita's kim") ||
          customFound.name.toLowerCase().includes("titas kim");

        const isCafeMafia =
          slug === 'cafe-mafia' ||
          slug === 'cafe-mafia-cordova' ||
          found.slug === 'cafe-mafia' ||
          found.slug === 'cafe-mafia-cordova' ||
          customFound.name.toLowerCase().includes('cafe mafia') ||
          customFound.name.toLowerCase().includes('mafia');

        const isDonMacchiatos =
          slug === 'don-macchiatos-cordova' ||
          slug === 'don-macchiatos' ||
          found.slug === 'don-macchiatos-cordova' ||
          found.slug === 'don-macchiatos' ||
          customFound.name.toLowerCase().includes('don macchiato') ||
          customFound.name.toLowerCase().includes('macchiatos');

        const isAlbertos =
          slug === 'albertos-pizza-cordova' ||
          slug === 'albertos-pizza' ||
          slug === 'albertos' ||
          found.slug === 'albertos-pizza-cordova' ||
          found.slug === 'albertos-pizza' ||
          customFound.name.toLowerCase().includes('alberto');

        const isTenThousandRoses =
          slug === '10000-roses-cafe-and-more' ||
          slug === '10000-roses' ||
          slug === '10000-roses-cafe' ||
          found.slug === '10000-roses-cafe-and-more' ||
          customFound.name.toLowerCase().includes('10,000 roses') ||
          customFound.name.toLowerCase().includes('10000 roses');

        const isAbyRoad =
          slug === 'aby-road-resto-bar' ||
          slug === 'aby-road' ||
          found.slug === 'aby-road-resto-bar' ||
          customFound.name.toLowerCase().includes('aby road') ||
          customFound.name.toLowerCase().includes('abyroad');

        if (menu.data?.items?.length) {
          setCategories(menu.data.categories || []);
          setItems(menu.data.items);
        } else if (isMcDo) {
          setCategories(MCDONALDS_CATEGORIES.map(c => ({ ...c, restaurant_id: found.id })));
          setItems(MCDONALDS_MENU_ITEMS.map(i => ({ ...i, restaurant_id: found.id })));
        } else if (isPapsy) {
          setCategories(PAPSY_CATEGORIES.map(c => ({ ...c, restaurant_id: found.id })));
          setItems(PAPSY_MENU_ITEMS.map(i => ({ ...i, restaurant_id: found.id })));
        } else if (isParola) {
          setCategories(PAROLA_CATEGORIES.map(c => ({ ...c, restaurant_id: found.id })));
          setItems(PAROLA_MENU_ITEMS.map(i => ({ ...i, restaurant_id: found.id })));
        } else if (isHorizon) {
          setCategories(HORIZON_CATEGORIES.map(c => ({ ...c, restaurant_id: found.id })));
          setItems(HORIZON_MENU_ITEMS.map(i => ({ ...i, restaurant_id: found.id })));
        } else if (isEatNRepeat) {
          setCategories(EAT_N_REPEAT_CATEGORIES.map(c => ({ ...c, restaurant_id: found.id })));
          setItems(EAT_N_REPEAT_MENU_ITEMS.map(i => ({ ...i, restaurant_id: found.id })));
        } else if (isStuffedNFried) {
          setCategories(STUFFED_N_FRIED_CATEGORIES.map(c => ({ ...c, restaurant_id: found.id })));
          setItems(STUFFED_N_FRIED_MENU_ITEMS.map(i => ({ ...i, restaurant_id: found.id })));
        } else if (isTaytayan) {
          setCategories(TAYTAYAN_CATEGORIES.map(c => ({ ...c, restaurant_id: found.id })));
          setItems(TAYTAYAN_MENU_ITEMS.map(i => ({ ...i, restaurant_id: found.id })));
        } else if (isTitaKims) {
          setCategories(TITA_KIMS_CATEGORIES.map(c => ({ ...c, restaurant_id: found.id })));
          setItems(TITA_KIMS_MENU_ITEMS.map(i => ({ ...i, restaurant_id: found.id })));
        } else if (isCafeMafia) {
          setCategories(CAFE_MAFIA_CATEGORIES.map(c => ({ ...c, restaurant_id: found.id })));
          setItems(CAFE_MAFIA_MENU_ITEMS.map(i => ({ ...i, restaurant_id: found.id })));
        } else if (isDonMacchiatos) {
          setCategories(DON_MACCHIATOS_CATEGORIES.map(c => ({ ...c, restaurant_id: found.id })));
          setItems(DON_MACCHIATOS_MENU_ITEMS.map(i => ({ ...i, restaurant_id: found.id })));
        } else if (isAlbertos) {
          setCategories(ALBERTOS_CATEGORIES.map(c => ({ ...c, restaurant_id: found.id })));
          setItems(ALBERTOS_MENU_ITEMS.map(i => ({ ...i, restaurant_id: found.id })));
        } else if (isTenThousandRoses) {
          setCategories(TEN_THOUSAND_ROSES_CATEGORIES.map(c => ({ ...c, restaurant_id: found.id })));
          setItems(TEN_THOUSAND_ROSES_MENU_ITEMS.map(i => ({ ...i, restaurant_id: found.id })));
        } else if (isAbyRoad) {
          setCategories(ABY_ROAD_CATEGORIES.map(c => ({ ...c, restaurant_id: found.id })));
          setItems(ABY_ROAD_MENU_ITEMS.map(i => ({ ...i, restaurant_id: found.id })));
        } else {
          setCategories(menu.data?.categories?.length ? menu.data.categories : [
            { id: 'cat-1', restaurant_id: found.id, name: 'House Specialties', sort_order: 1 },
            { id: 'cat-2', restaurant_id: found.id, name: 'Beverages & Desserts', sort_order: 2 },
          ]);
          setItems(menu.data?.items?.length ? menu.data.items : [
            {
              id: 'item-1',
              restaurant_id: found.id,
              category_id: 'cat-1',
              name: `${customFound.name} Signature Platter`,
              description: 'Fresh local dish prepared with authentic flavors and traditional island ingredients.',
              price: 220,
              is_available: true,
              dietary_tags: [],
            },
            {
              id: 'item-2',
              restaurant_id: found.id,
              category_id: 'cat-1',
              name: 'Special House Recipe',
              description: 'Daily selection of grilled or cooked specialty.',
              price: 180,
              is_available: true,
              dietary_tags: [],
            },
            {
              id: 'item-3',
              restaurant_id: found.id,
              category_id: 'cat-2',
              name: 'Iced Island Refreshment',
              description: 'Chilled signature house beverage.',
              price: 75,
              is_available: true,
              dietary_tags: ['vegetarian'],
            }
          ]);
        }
        setReviews(reviewsRes.data?.length ? reviewsRes.data : [
          {
            id: 'rev-1',
            restaurant_id: found.id,
            user_id: 'u-1',
            reviewer_name: 'Cordova Diner',
            rating: 5,
            comment: 'Great food, friendly service, and a relaxing vibe in Cordova!',
            created_at: new Date().toISOString(),
            status: 'visible',
            like_count: 4,
            liked_by_me: false,
          }
        ]);
        setHours(hoursRes.data?.length ? hoursRes.data : [0, 1, 2, 3, 4, 5, 6].map(d => ({
          day_of_week: d,
          open_time: '08:00',
          close_time: '21:00',
          is_closed: false,
        })));
        setGallery(galleryRes.data || []);

        const today = new Date().toISOString().slice(0, 10);
        const activePromos = (promoRes.data || []).filter(
          (p: Promotion) => p.status === 'active' && p.end_date >= today
        );
        setActivePromotions(activePromos);
      } catch {
        // Fallback data already initialized
      }
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (reviewPhotos.length + files.length > 5) {
      toast('Maximum 5 dish photos allowed per review', 'info');
      return;
    }
    const newPhotos = [...reviewPhotos, ...files];
    setReviewPhotos(newPhotos);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setReviewPhotoPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removePhoto = (idx: number) => {
    const updatedPhotos = reviewPhotos.filter((_, i) => i !== idx);
    const updatedPreviews = reviewPhotoPreviews.filter((_, i) => i !== idx);
    if (reviewPhotoPreviews[idx]) URL.revokeObjectURL(reviewPhotoPreviews[idx]);
    setReviewPhotos(updatedPhotos);
    setReviewPhotoPreviews(updatedPreviews);
  };

  const toggleHelpful = async (reviewId: string) => {
    if (!user) {
      toast('Please log in to mark reviews as helpful', 'info');
      return;
    }
    try {
      const res = await api.post(`/api/reviews/${reviewId}/like`);
      const isLiked = res.data?.liked;
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                liked_by_me: isLiked,
                like_count: Math.max(0, r.like_count + (isLiked ? 1 : -1)),
              }
            : r
        )
      );
      toast(isLiked ? 'Marked review as helpful!' : 'Removed helpful vote', 'info');
    } catch {
      toast('Failed to update helpful vote', 'error');
    }
  };

  const reactToReview = async (reviewId: string, emoji: string) => {
    if (!user) {
      toast('Please log in to react to reviews', 'info');
      return;
    }
    setUserReactions((prev) => ({ ...prev, [reviewId]: emoji }));
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id !== reviewId) return r;
        const currentReactions = { ...(r.reactions || {}) };
        currentReactions[emoji] = (currentReactions[emoji] || 0) + 1;
        return { ...r, reactions: currentReactions };
      })
    );
    try {
      await api.post(`/api/reviews/${reviewId}/react`, { emoji });
    } catch {
      // Ignore background reaction sync errors
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    setSubmittingReview(true);
    try {
      let res;
      if (reviewPhotos.length > 0) {
        const formData = new FormData();
        formData.append('rating', String(reviewRating));
        if (reviewComment.trim()) formData.append('comment', reviewComment.trim());
        reviewPhotos.forEach((file) => formData.append('photos', file));
        res = await api.post(`/api/restaurants/${restaurant.id}/reviews`, formData, { isFormData: true });
      } else {
        res = await api.post(`/api/restaurants/${restaurant.id}/reviews`, {
          rating: reviewRating,
          comment: reviewComment,
        });
      }
      const newReview = res.data.review;
      setReviews((prev) => [newReview, ...prev]);
      setReviewComment('');
      setReviewPhotos([]);
      setReviewPhotoPreviews([]);
      toast('Review submitted with spatial badges!', 'success');
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-80 w-full rounded-2xl" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-64 w-full rounded-2xl" />
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

  const phoneText = restaurant.phone || 'N/A';
  const hoursText = restaurant.hours || (hours.length > 0 && !hours[0].is_closed
    ? `${hours[0].open_time.slice(0, 5)} AM - ${hours[0].close_time.slice(0, 5)} PM`
    : 'Hours currently unlisted');
  const tagText = restaurant.cuisines?.[0]
    ? `${restaurant.cuisines[0]} Cuisine`
    : 'Award-Winning Cuisine';

  const allPhotos = [
    ...(restaurant.cover_image_url ? [{ id: 'cover', image_url: restaurant.cover_image_url }] : []),
    ...gallery,
  ];

  const categoryKey = restaurant.category || 'Restaurant';
  const fallbackHeroImage =
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

  const heroImageSrc =
    !heroImgError &&
    restaurant.cover_image_url &&
    restaurant.cover_image_url.trim() !== ''
      ? restaurant.cover_image_url
      : fallbackHeroImage;

  return (
    <div className="min-h-screen bg-cordova-cream dark:bg-[#121614] pb-24 relative overflow-hidden">
      {/* Ambient Lighting Background Accents */}
      <div className="absolute top-[25%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-[120px] pointer-events-none -z-0" />
      <div className="absolute top-[60%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/10 dark:bg-amber-500/15 blur-[120px] pointer-events-none -z-0" />

      {/* HERO COVER SECTION */}
      <section className="relative w-full h-[400px] sm:h-[480px] overflow-hidden bg-stone-900">
        <Image
          src={heroImageSrc}
          alt={restaurant.name}
          fill
          priority
          unoptimized
          onError={() => setHeroImgError(true)}
          className="object-cover object-center opacity-85"
        />

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30 backdrop-blur-[1px]" />

        {/* Top Control Buttons */}
        <div className="absolute top-6 left-6 right-6 z-20 max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-xl flex items-center justify-center text-stone-800 dark:text-white shadow-spatial-sm hover:bg-white dark:hover:bg-black/80 transition-all active:scale-90 border border-white/20"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            onClick={toggleFavorite}
            className="w-10 h-10 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-xl flex items-center justify-center text-stone-800 dark:text-white shadow-spatial-sm hover:bg-white dark:hover:bg-black/80 transition-all active:scale-90 border border-white/20"
            aria-label="Favorite"
          >
            <Heart size={18} className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
          </button>
        </div>

        {/* Hero Title & Location Overlay */}
        <div className="absolute bottom-16 left-0 right-0 z-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 text-cordova-gold text-xs font-semibold tracking-widest uppercase mb-2 drop-shadow">
                <Award size={14} /> FEATURED ESTABLISHMENT
              </div>
              {/* Name */}
              <h1 className="font-serif text-4xl sm:text-6xl font-bold text-white tracking-tight drop-shadow-md">
                {restaurant.name}
              </h1>
            </div>

            {/* Location Badge */}
            <div className="flex items-center gap-1.5 text-white/95 text-sm font-medium bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shrink-0 shadow-spatial-sm">
              <MapPin size={15} className="text-cordova-gold" />
              <span>{locationText}</span>
            </div>
          </div>
        </div>
      </section>

      {/* OVERLAPPING MAIN CONTAINER */}
      <section className="relative z-30 -mt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* ACTIVE PROMOTION BANNER IF AVAILABLE */}
        {activePromotions.length > 0 && (
          <div className="mb-4 bg-gradient-to-r from-amber-500 via-cordova-gold to-amber-600 rounded-2xl p-4 sm:p-5 text-white shadow-spatial-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-amber-300/40 backdrop-blur-md">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-black/25 text-amber-200 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
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
              <span className="bg-white text-stone-900 font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-md shrink-0 uppercase tracking-wider">
                {activePromotions[0].discount_label}
              </span>
            )}
          </div>
        )}

        {/* GUEST SIGN IN / SIGN UP PROMPT BANNER */}
        {!user && (
          <div className="mb-4 bg-gradient-to-r from-[#1b241f] via-stone-900 to-[#1b241f] rounded-2xl p-5 sm:p-6 text-white shadow-spatial-lg border border-cordova-gold/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xl">
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
                className="text-xs font-semibold text-white hover:text-cordova-gold transition-colors px-4 py-2 border border-white/20 rounded-xl hover:bg-white/10"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-cordova-gold to-amber-600 hover:from-cordova-goldHover hover:to-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-spatial-sm transition-all uppercase tracking-wide active:scale-95"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}

        <div className="spatial-card rounded-2xl shadow-spatial-lg overflow-hidden border border-stone-200/80 dark:border-white/10">
          
          {/* QUICK INFO BAR (3 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-stone-200/80 dark:border-white/10 text-center text-xs font-serif divide-y sm:divide-y-0 sm:divide-x divide-stone-200/80 dark:divide-white/10 bg-white/60 dark:bg-white/[0.02]">
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
          <div className="border-t-2 border-cordova-green dark:border-emerald-500 border-b border-stone-200/80 dark:border-white/10 bg-white/40 dark:bg-white/[0.01]">
            <div className="grid grid-cols-4 text-center">
              {(['overview', 'menu', 'map', 'reviews'] as const).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all duration-200 relative ${
                      isActive
                        ? 'text-stone-900 dark:text-white bg-stone-100/80 dark:bg-white/10 border-b-2 border-cordova-gold font-bold'
                        : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-black/[0.02] dark:hover:bg-white/[0.03]'
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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  <div className="lg:col-span-7 space-y-4">
                    <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cordova-green dark:text-emerald-400">
                      Our Story
                    </h2>
                    <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed font-sans">
                      {restaurant.description ||
                        `Famous for authentic Cebuano dining and traditional Filipino dishes. Family-owned and dedicated to delivering fresh, local seafood and traditional flavors to every guest.`}
                    </p>
                    <div className="pt-3 border-t border-stone-200 dark:border-stone-800">
                      <p className="font-serif italic text-cordova-gold text-sm sm:text-base">
                        &quot;Where tradition meets excellence&quot;
                      </p>
                    </div>
                  </div>

                  {/* Story Image with Beige Circular Accent */}
                  <div className="lg:col-span-5 relative flex justify-center">
                    <div className="absolute -top-4 -right-4 w-48 h-48 rounded-full bg-amber-100/70 dark:bg-amber-950/30 -z-10" />
                    <div className="relative h-72 sm:h-80 w-full rounded-2xl overflow-hidden shadow-spatial-md border border-stone-200 dark:border-stone-800">
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
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-6">
                    Gallery
                  </h3>
                  {allPhotos.length === 0 ? (
                    <div className="text-center py-12 text-stone-400">
                      <ImageOff size={32} className="mx-auto mb-2 opacity-60" />
                      <p className="text-xs">No gallery photos uploaded yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                      {allPhotos.map((img, i) => (
                        <div
                          key={img.id || i}
                          className="relative h-48 sm:h-56 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 shadow-spatial-sm border border-stone-200/60 dark:border-stone-800/60 group"
                        >
                          <Image
                            src={img.image_url}
                            alt={`${restaurant.name} gallery photo`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
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
              <SpatialRestaurantMenu
                restaurant={restaurant}
                items={items}
                categories={categories}
              />
            )}

            {/* MAP TAB */}
            {activeTab === 'map' && (
              <div className="space-y-6">
                <div className="rounded-2xl overflow-hidden shadow-spatial-md border border-stone-200 dark:border-stone-800">
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
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-200/80 dark:border-stone-800/80">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
                      <span>Customer Reviews</span>
                      <span className="text-xs font-sans font-semibold bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-full text-stone-600 dark:text-stone-300">
                        {reviews.length} total
                      </span>
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      Verified guest feedback, emoji reactions & foodie badges
                    </p>
                  </div>
                </div>

                {/* Review Cards */}
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <div className="text-center py-12 text-stone-400">
                      <p className="text-sm">No reviews yet. Be the first to review!</p>
                    </div>
                  ) : (
                    reviews.map((r) => {
                      const reviewerInitials = (r.reviewer_name || 'Anonymous User')
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase();

                      return (
                        <div
                          key={r.id}
                          className="spatial-card p-5 sm:p-6 rounded-2xl bg-white/70 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 shadow-spatial-sm space-y-4 transition-all duration-300 hover:shadow-spatial-md"
                        >
                          {/* Reviewer Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                {reviewerInitials}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-sm text-stone-900 dark:text-white">
                                    {r.reviewer_name || 'Anonymous Foodie'}
                                  </h4>
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                    <CheckCircle2 size={10} /> Verified Guest
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                                  <span>{new Date(r.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                  {r.visit_type && (
                                    <>
                                      <span>•</span>
                                      <span className="capitalize">{r.visit_type}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Star Rating Badge */}
                            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-2.5 py-1 rounded-full">
                              <Star size={13} className="fill-cordova-gold text-cordova-gold" />
                              <span className="text-xs font-bold text-stone-800 dark:text-amber-200">
                                {r.rating}.0
                              </span>
                            </div>
                          </div>

                          {/* Review Comment */}
                          {r.comment && (
                            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-sans pl-1">
                              {r.comment}
                            </p>
                          )}

                          {/* Uploaded Dish Photos */}
                          {r.photos && r.photos.length > 0 && (
                            <div className="flex flex-wrap gap-2.5 pt-1">
                              {r.photos.map((photoUrl, pIdx) => (
                                <button
                                  key={pIdx}
                                  type="button"
                                  onClick={() => setLightboxImage(photoUrl)}
                                  className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 shadow-sm group cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                  <Image
                                    src={photoUrl}
                                    alt={`Dish photo ${pIdx + 1} by ${r.reviewer_name}`}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                                  />
                                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                    <Maximize2 size={16} />
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Spatial Reactions & Helpful Row */}
                          <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80 flex flex-wrap items-center justify-between gap-3">
                            {/* Emoji Reactions Bar */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              {SPATIAL_EMOJIS.map(({ emoji, label }) => {
                                const count = r.reactions?.[emoji] || 0;
                                const isSelected = userReactions[r.id] === emoji;
                                return (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => reactToReview(r.id, emoji)}
                                    title={label}
                                    className={`spatial-pill group px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all duration-200 cursor-pointer select-none ${
                                      isSelected
                                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-400/30'
                                        : 'bg-stone-100/80 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-stone-700 dark:text-stone-300'
                                    } hover:scale-105 active:scale-95 shadow-sm`}
                                  >
                                    <span className="text-sm group-hover:scale-125 transition-transform duration-200">
                                      {emoji}
                                    </span>
                                    {count > 0 && (
                                      <span className="text-[11px] font-bold opacity-90">
                                        {count}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Helpful Upvote Button */}
                            <button
                              type="button"
                              onClick={() => toggleHelpful(r.id)}
                              className={`spatial-pill px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                                r.liked_by_me
                                  ? 'bg-emerald-600 text-white border border-emerald-500 shadow-sm'
                                  : 'bg-stone-100/80 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 text-stone-600 dark:text-stone-300 hover:border-emerald-500/60'
                              } hover:scale-105 active:scale-95`}
                            >
                              <ThumbsUp size={12} className={r.liked_by_me ? 'fill-white' : ''} />
                              <span>Helpful</span>
                              {r.like_count > 0 && <span>({r.like_count})</span>}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add Review Form */}
                {user?.role === 'customer' ? (
                  <form
                    onSubmit={submitReview}
                    className="spatial-card p-6 sm:p-7 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 shadow-spatial-md space-y-5"
                  >
                    <div className="flex items-center gap-2 pb-3 border-b border-stone-200 dark:border-stone-800">
                      <Sparkles size={20} className="text-cordova-gold" />
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 dark:text-white">
                        Write a Spatial Review & Upload Dish Photos
                      </h3>
                    </div>

                    {/* Star Selector */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-2">
                        Your Overall Rating
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5 p-2 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="p-1 text-cordova-gold hover:scale-125 transition-transform"
                            >
                              <Star
                                size={22}
                                className={
                                  star <= reviewRating
                                    ? 'fill-cordova-gold text-cordova-gold drop-shadow'
                                    : 'text-stone-300 dark:text-stone-600'
                                }
                              />
                            </button>
                          ))}
                        </div>
                        <span className="text-xs font-bold text-stone-600 dark:text-stone-300 ml-2">
                          {reviewRating === 5 && '🌟 Outstanding Culinary Experience!'}
                          {reviewRating === 4 && '✨ Very Good & Tasty!'}
                          {reviewRating === 3 && '👍 Good / Average'}
                          {reviewRating === 2 && '👎 Needs Improvement'}
                          {reviewRating === 1 && '⚠️ Poor Experience'}
                        </span>
                      </div>
                    </div>

                    {/* Review Text */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                        Your Dining Feedback
                      </label>
                      <textarea
                        rows={3}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Tell the Cordova community about the signature dishes, taste quality, ambiance, and service..."
                        className="w-full p-3.5 rounded-xl bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-inner"
                      />
                    </div>

                    {/* Dish Photos Attachment Section */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                        Add Dish Photos <span className="text-stone-400 font-normal">(Optional, up to 5 photos)</span>
                      </label>

                      <div className="flex flex-wrap items-center gap-3">
                        <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 border border-dashed border-stone-300 dark:border-stone-600 text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2 transition-colors">
                          <Camera size={16} className="text-emerald-500" />
                          <span>Attach Food Photos</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                          />
                        </label>

                        {/* Selected Photo Previews */}
                        {reviewPhotoPreviews.map((previewUrl, pIdx) => (
                          <div
                            key={pIdx}
                            className="relative h-14 w-14 rounded-lg overflow-hidden border border-stone-300 dark:border-stone-700 shadow-sm group"
                          >
                            <Image
                              src={previewUrl}
                              alt="Dish preview"
                              fill
                              className="object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(pIdx)}
                              className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] hover:bg-red-700"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-cordova-green hover:bg-cordova-greenHover text-white text-xs font-bold px-7 py-3 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-98 flex items-center gap-2"
                    >
                      <Sparkles size={14} />
                      {submittingReview ? 'Posting Review...' : 'Post Review with Spatial Badges'}
                    </button>
                  </form>
                ) : !user ? (
                  <div className="spatial-card p-6 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-center">
                    <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                      Want to review this restaurant and share food photos?
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 mb-3">
                      Log in to post your review and earn Cordova Foodie Badges.
                    </p>
                    <Link
                      href="/login"
                      className="inline-block px-5 py-2 rounded-xl bg-cordova-green hover:bg-cordova-greenHover text-white text-xs font-bold shadow-sm transition-all"
                    >
                      Log In to Review
                    </Link>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Full-Screen Lightbox Modal for Dish Photos */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full h-[70vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightboxImage}
              alt="Full size dish view"
              fill
              className="object-contain rounded-xl"
            />
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white hover:bg-black/90 flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
