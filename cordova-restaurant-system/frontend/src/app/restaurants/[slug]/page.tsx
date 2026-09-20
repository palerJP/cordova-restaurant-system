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
  Mail,
  Globe,
  Navigation,
  ExternalLink,
  Calendar,
  UtensilsCrossed,
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
import { getVerifiedReviews, addPersistedReview, calculateRestaurantRatingStats } from '@/data/restaurantReviews';
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
import { CSALT_CATEGORIES, CSALT_MENU_ITEMS } from '@/data/csaltMenu';
import { SIP_N_STREET_CATEGORIES, SIP_N_STREET_MENU_ITEMS } from '@/data/sipNStreetMenu';
import { BARRACKS_CATEGORIES, BARRACKS_MENU_ITEMS } from '@/data/barracksMenu';
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

        const isCsalt =
          slug === 'csalt-cafe-cordova' ||
          slug === 'csalt-cafe' ||
          found.slug === 'csalt-cafe-cordova' ||
          found.slug === 'csalt-cafe' ||
          customFound.name.toLowerCase().includes('csalt');

        const isSipNStreet =
          slug === 'sip-n-street-brew-and-refreshments-mu9qvrtr' ||
          slug === 'sip-n-street' ||
          slug === 'sip-n-street-brew-and-refreshments' ||
          found.slug?.includes('sip-n-street') ||
          customFound.name.toLowerCase().includes('sip');

        const isBarracks =
          slug === 'barracks-grill-and-resto-bar' ||
          slug === 'barracks-grill' ||
          slug === 'barracks' ||
          found.slug?.includes('barrack') ||
          customFound.name.toLowerCase().includes('barrack');

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
        } else if (isCsalt) {
          setCategories(CSALT_CATEGORIES.map(c => ({ ...c, restaurant_id: found.id })));
          setItems(CSALT_MENU_ITEMS.map(i => ({ ...i, restaurant_id: found.id })));
        } else if (isSipNStreet) {
          setCategories(SIP_N_STREET_CATEGORIES.map(c => ({ ...c, restaurant_id: found.id })));
          setItems(SIP_N_STREET_MENU_ITEMS.map(i => ({ ...i, restaurant_id: found.id })));
        } else if (isBarracks) {
          setCategories(BARRACKS_CATEGORIES.map(c => ({ ...c, restaurant_id: found.id })));
          setItems(BARRACKS_MENU_ITEMS.map(i => ({ ...i, restaurant_id: found.id })));
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
        const verifiedList = getVerifiedReviews(slug || found.slug || found.id);
        const apiReviews: Review[] = (reviewsRes.data && Array.isArray(reviewsRes.data)) ? reviewsRes.data : [];

        // Combine verifiedList with apiReviews, without duplicates
        const reviewMap = new Map<string, Review>();
        for (const r of verifiedList) {
          reviewMap.set(r.id, r);
        }
        for (const r of apiReviews) {
          reviewMap.set(r.id, r);
        }
        const loadedReviews = Array.from(reviewMap.values()).sort(
          (a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        );

        setReviews(loadedReviews);

        // Sync restaurant stats to match exact reviews
        const dynamicStats = calculateRestaurantRatingStats(loadedReviews);
        setRestaurant((prev) =>
          prev
            ? {
                ...prev,
                review_count: dynamicStats.count,
                avg_rating: dynamicStats.rating,
              }
            : prev
        );

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
    if (!reviewComment.trim()) {
      toast('Please write a brief comment describing your dining experience', 'info');
      return;
    }
    setSubmittingReview(true);
    try {
      const newReviewId = `rev-${Date.now()}`;
      const reviewerName = user?.full_name || 'Verified Cordova Foodie';
      const reviewerAvatar = user?.avatar_url;
      let submittedPhotos: string[] = [...reviewPhotoPreviews];

      try {
        if (reviewPhotos.length > 0) {
          const formData = new FormData();
          formData.append('rating', String(reviewRating));
          if (reviewComment.trim()) formData.append('comment', reviewComment.trim());
          reviewPhotos.forEach((file) => formData.append('photos', file));
          const res = await api.post(`/api/restaurants/${restaurant.id}/reviews`, formData, { isFormData: true });
          if (res?.data?.review?.photos?.length) {
            submittedPhotos = res.data.review.photos;
          }
        } else {
          await api.post(`/api/restaurants/${restaurant.id}/reviews`, {
            rating: reviewRating,
            comment: reviewComment,
          });
        }
      } catch {
        // Continue with real-time local persistence if backend is in mock/offline mode
      }

      const newReviewObj: Review = {
        id: newReviewId,
        restaurant_id: restaurant.id,
        user_id: user?.id || 'usr-guest',
        reviewer_name: reviewerName,
        reviewer_avatar: reviewerAvatar || undefined,
        rating: Number(reviewRating),
        comment: reviewComment.trim(),
        photos: submittedPhotos,
        reactions: { '❤️': 1 },
        status: 'visible',
        created_at: new Date().toISOString(),
        like_count: 0,
        liked_by_me: false,
        visit_type: user ? 'verified diner' : 'guest explorer',
      };

      // Add to persistent storage and get updated list
      const updatedReviews = addPersistedReview(slug || restaurant.slug || restaurant.id, newReviewObj);
      setReviews(updatedReviews);

      // Immediately recalculate accurate rating and review count in state
      const newStats = calculateRestaurantRatingStats(updatedReviews);
      setRestaurant((prev) =>
        prev
          ? {
              ...prev,
              review_count: newStats.count,
              avg_rating: newStats.rating,
            }
          : prev
      );

      setReviewComment('');
      setReviewPhotos([]);
      setReviewPhotoPreviews([]);
      toast('Review submitted! Establishment ratings and review count updated automatically.', 'success');
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

  const hasContactPhone = Boolean(restaurant.phone && restaurant.phone.trim() !== '' && restaurant.phone !== 'N/A' && restaurant.phone !== 'null');
  const hasPublicEmail = Boolean(restaurant.email && restaurant.email.trim() !== '' && restaurant.email !== 'null');
  const phoneText = hasContactPhone ? (restaurant.phone as string) : 'Phone Not Listed';
  const isCurrentlyOpen = restaurant.is_open !== false;
  
  const isSeafood = Boolean(
    (restaurant.name + ' ' + (restaurant.description || '') + ' ' + (restaurant.cuisines || []).join(' ')).toLowerCase().includes('seafood') ||
    (restaurant.name + ' ' + (restaurant.description || '')).toLowerCase().includes('bakasi') ||
    (restaurant.name + ' ' + (restaurant.description || '')).toLowerCase().includes('parola') ||
    (restaurant.name + ' ' + (restaurant.description || '')).toLowerCase().includes('lantaw')
  );

  const hoursText = restaurant.hours || (hours.length > 0 && !hours[0].is_closed
    ? `${hours[0].open_time.slice(0, 5)} - ${hours[0].close_time.slice(0, 5)}`
    : '10:00 AM – 9:00 PM');
    
  const tagText = isSeafood
    ? 'Seafood Specialist'
    : restaurant.cuisines?.[0]
    ? `${restaurant.cuisines[0]} Cuisine`
    : 'Authentic Dining';

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
      <div className="absolute top-[20%] left-[-10%] w-[550px] h-[550px] rounded-full bg-emerald-500/12 dark:bg-emerald-500/18 blur-[130px] pointer-events-none -z-0" />
      <div className="absolute top-[55%] right-[-10%] w-[550px] h-[550px] rounded-full bg-amber-500/12 dark:bg-amber-500/18 blur-[130px] pointer-events-none -z-0" />

      {/* HERO COVER SECTION WITH SPATIAL GLASS DEPTH */}
      <section className="relative w-full h-[430px] sm:h-[500px] overflow-hidden bg-stone-950">
        <Image
          src={heroImageSrc}
          alt={restaurant.name}
          fill
          priority
          unoptimized
          onError={() => setHeroImgError(true)}
          className="object-cover object-center opacity-85 scale-[1.02] transition-transform duration-1000"
        />

        {/* Ambient Dark Gradient Overlay for Maximum Text Clarity */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/35 backdrop-blur-[1.5px]" />

        {/* Top Control Buttons (Spatial Glass Pills) */}
        <div className="absolute top-6 left-6 right-6 z-20 max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="w-11 h-11 rounded-full bg-black/45 dark:bg-black/65 backdrop-blur-2xl flex items-center justify-center text-white shadow-spatial-md hover:bg-black/80 transition-all active:scale-90 border border-white/30"
            aria-label="Back"
          >
            <ArrowLeft size={19} />
          </button>
          <button
            onClick={toggleFavorite}
            className="w-11 h-11 rounded-full bg-black/45 dark:bg-black/65 backdrop-blur-2xl flex items-center justify-center text-white shadow-spatial-md hover:bg-black/80 transition-all active:scale-90 border border-white/30"
            aria-label="Favorite"
          >
            <Heart size={19} className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
          </button>
        </div>

        {/* Hero Title & Location Overlay with Luminous Spatial UI Badges */}
        <div className="absolute bottom-16 left-0 right-0 z-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-end justify-between gap-5">
            <div className="space-y-2">
              {/* Luminous Spatial Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-2xl border border-amber-400/50 text-amber-300 text-xs font-extrabold tracking-widest uppercase shadow-spatial-md ring-1 ring-amber-400/20">
                <Award size={14} className="text-amber-400" />
                <span>FEATURED ESTABLISHMENT</span>
              </div>
              {/* Ultra-Crisp Name with Spatial Shadow */}
              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                {restaurant.name}
              </h1>
            </div>

            {/* Spatial Location Glass Pill */}
            <div className="flex items-center gap-2 text-white text-sm font-bold bg-black/60 backdrop-blur-2xl px-5 py-2.5 rounded-full border border-white/30 shrink-0 shadow-spatial-md ring-1 ring-white/10">
              <MapPin size={16} className="text-amber-400" />
              <span>{locationText}</span>
            </div>
          </div>
        </div>
      </section>

      {/* OVERLAPPING MAIN CONTAINER */}
      <section className="relative z-30 -mt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* ACTIVE PROMOTION BANNER IF AVAILABLE */}
        {activePromotions.length > 0 && (
          <div className="mb-5 bg-gradient-to-r from-amber-500 via-cordova-gold to-amber-600 rounded-3xl p-5 sm:p-6 text-white shadow-spatial-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-amber-300/50 backdrop-blur-2xl ring-1 ring-amber-300/30">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 bg-black/30 text-amber-200 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-amber-200/30">
                🎁 Active Special Promotion
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold drop-shadow">
                {activePromotions[0].title}
              </h3>
              {activePromotions[0].description && (
                <p className="text-xs sm:text-sm text-amber-50 max-w-2xl leading-relaxed font-sans font-medium">
                  {activePromotions[0].description}
                </p>
              )}
            </div>
            {activePromotions[0].discount_label && (
              <span className="bg-white text-stone-950 font-black text-xs px-4 py-2 rounded-2xl shadow-spatial-md shrink-0 uppercase tracking-wider border border-white/40">
                {activePromotions[0].discount_label}
              </span>
            )}
          </div>
        )}

        {/* GUEST SIGN IN / SIGN UP PROMPT BANNER (SPATIAL UI GLASS CAPSULE) */}
        {!user && (
          <div className="mb-6 spatial-glass-capsule rounded-3xl p-6 sm:p-7 text-stone-900 dark:text-white shadow-spatial-lg border border-emerald-500/30 dark:border-emerald-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 backdrop-blur-2xl">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 text-xs font-extrabold uppercase tracking-wider border border-amber-500/30">
                <Sparkles size={14} className="text-amber-500 dark:text-amber-400 animate-pulse" />
                <span>Unlock Best Features</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-white leading-snug">
                Sign in to get personalized recommendations, save favorites & post verified reviews!
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-medium">
                Create an account or sign in to experience all interactive CordovaEats features.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 self-stretch sm:self-auto justify-end">
              <Link
                href="/login"
                className="text-xs font-bold text-stone-800 dark:text-white hover:text-cordova-green dark:hover:text-emerald-400 transition-colors px-5 py-3 border border-stone-300/80 dark:border-white/20 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-center backdrop-blur-md"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-cordova-gold via-amber-500 to-amber-600 hover:from-cordova-goldHover hover:to-amber-700 text-white text-xs font-extrabold px-6 py-3 rounded-xl shadow-spatial-md hover:shadow-spatial-gold-glow transition-all uppercase tracking-wider active:scale-95 text-center border border-white/25"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}

        <div className="spatial-card rounded-3xl shadow-spatial-lg overflow-hidden border border-stone-200/80 dark:border-white/10">
          
          {/* QUICK INFO BAR (4 HIGH-CLARITY SPATIAL TILES: CONTACT, HOURS, CUISINE, LOCATION) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-b border-stone-200/80 dark:border-white/10 text-center divide-y lg:divide-y-0 lg:divide-x divide-stone-200/80 dark:divide-white/10 bg-white/70 dark:bg-white/[0.03]">
            {/* Contact Tile */}
            <div className="p-5 flex flex-col items-center justify-center gap-2 group">
              <div className="w-10 h-10 rounded-full bg-emerald-500/15 dark:bg-emerald-500/25 flex items-center justify-center text-cordova-green dark:text-emerald-400 border border-emerald-400/30">
                <Phone size={18} />
              </div>
              <div className="w-full px-2">
                <p className="font-bold text-sm text-stone-900 dark:text-white text-center select-all">
                  {phoneText}
                </p>
                <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400 mt-0.5">
                  Direct Inquiries & Contact
                </p>
              </div>
            </div>

            {/* Operating Hours Tile */}
            <div className="p-5 flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-amber-500/15 dark:bg-amber-500/25 flex items-center justify-center text-cordova-gold border border-amber-400/30">
                <Clock size={18} />
              </div>
              <div className="w-full px-2">
                <div className="flex items-center justify-center gap-1.5">
                  <span className={isCurrentlyOpen ? "spatial-status-open text-[11px] py-0.5" : "spatial-status-closed text-[11px] py-0.5"}>
                    {isCurrentlyOpen ? "Open Now" : "Closed"}
                  </span>
                </div>
                <p className="font-bold text-xs text-stone-900 dark:text-white mt-1 truncate" title={hoursText}>
                  {hoursText}
                </p>
              </div>
            </div>

            {/* Seafood & Cuisine Tile */}
            <div className="p-5 flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-cyan-500/15 dark:bg-cyan-500/25 flex items-center justify-center text-cyan-600 dark:text-cyan-400 border border-cyan-400/30">
                <Award size={18} />
              </div>
              <div className="w-full px-2">
                <span className="font-extrabold text-sm text-stone-900 dark:text-white truncate block">
                  {tagText}
                </span>
                <p className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 mt-0.5 uppercase tracking-wider truncate">
                  {restaurant.price_range ? restaurant.price_range.toUpperCase() : 'BUDGET'} • {restaurant.category || 'RESTAURANT'}
                </p>
              </div>
            </div>

            {/* Location & Address Tile */}
            <div className="p-5 flex flex-col items-center justify-center gap-2 group">
              <div className="w-10 h-10 rounded-full bg-rose-500/15 dark:bg-rose-500/25 flex items-center justify-center text-rose-600 dark:text-rose-400 border border-rose-400/30">
                <MapPin size={18} />
              </div>
              <div className="w-full px-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('map')}
                  className="font-extrabold text-sm text-stone-900 dark:text-white hover:text-cordova-green dark:hover:text-emerald-400 transition-colors group-hover:underline text-center max-w-full truncate block mx-auto"
                  title="View on Interactive Map"
                >
                  {locationText}
                </button>
                <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400 mt-0.5 truncate text-center" title={restaurant.address || locationText}>
                  {restaurant.address || `${restaurant.barangay || 'Poblacion'}, Cordova, Cebu`}
                </p>
              </div>
            </div>
          </div>

          {/* TAB NAVIGATION HEADER */}
          <div className="border-t-2 border-cordova-green dark:border-emerald-500 border-b border-stone-200/80 dark:border-white/10 bg-white/50 dark:bg-white/[0.02]">
            <div className="grid grid-cols-4 text-center">
              {(['overview', 'menu', 'map', 'reviews'] as const).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 text-xs sm:text-sm font-extrabold tracking-wider uppercase transition-all duration-200 relative ${
                      isActive
                        ? 'text-stone-900 dark:text-white bg-stone-100/90 dark:bg-white/10 border-b-2 border-cordova-gold'
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
                    <p className="text-stone-700 dark:text-stone-200 text-sm sm:text-base leading-relaxed font-sans font-medium">
                      {restaurant.description ||
                        `Famous for authentic Cebuano dining and traditional Filipino dishes. Family-owned and dedicated to delivering fresh, local seafood and traditional flavors to every guest.`}
                    </p>
                    <div className="pt-3 border-t border-stone-200 dark:border-stone-800">
                      <p className="font-serif italic text-cordova-gold text-sm sm:text-base font-semibold">
                        &quot;Where tradition meets excellence in Cordova&quot;
                      </p>
                    </div>
                  </div>

                  {/* Story Image with Circular Accent */}
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
                <form
                  onSubmit={submitReview}
                  className="spatial-card p-6 sm:p-7 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 shadow-spatial-md space-y-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-stone-800">
                    <div className="flex items-center gap-2">
                      <Sparkles size={20} className="text-cordova-gold" />
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 dark:text-white">
                        Write a Spatial Review & Upload Dish Photos
                      </h3>
                    </div>
                    {user ? (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                        Posting as {user.full_name || 'Verified User'}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                        Verified Guest Reviewer
                      </span>
                    )}
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
                      className="w-full p-3.5 rounded-xl bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-inner text-stone-900 dark:text-white"
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

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-cordova-green hover:bg-cordova-greenHover text-white text-xs font-bold px-7 py-3 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-98 flex items-center gap-2"
                    >
                      <Sparkles size={14} />
                      {submittingReview ? 'Posting Review...' : 'Post Review with Spatial Badges'}
                    </button>
                    {!user && (
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        Posting as guest. <Link href="/login" className="text-cordova-green dark:text-emerald-400 font-bold hover:underline">Log in</Link> to save to your personal profile.
                      </p>
                    )}
                  </div>
                </form>
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
