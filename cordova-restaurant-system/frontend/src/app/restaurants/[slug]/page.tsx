'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RestaurantHours } from '@/components/RestaurantHours';
import Image from 'next/image';
import { catalogImage } from '@/data/catalogImages';
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
  Eye,
} from 'lucide-react';
import {
  recordRestaurantView,
  getRecentlyViewed,
  onActivityChange,
  type RecentlyViewedRestaurant,
} from '@/lib/activity-history';
import { api, ApiClientError } from '@/lib/api';
import { ReservationForm } from '@/components/reservations/ReservationForm';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { ReportReview } from '@/components/ReportReview';
import { ReviewActions } from '@/components/ReviewActions';
import { Skeleton } from '@/components/ui/Skeleton';
import { MapViewClient } from '@/components/MapViewClient';
import { VisitHighlights } from '@/components/VisitHighlights';
import type {
  Restaurant,
  MenuItem,
  MenuCategory,
  Review,
  RestaurantImage,
  Promotion,
} from '@/lib/types';
import { applyRestaurantCustomization, getStaticRestaurantBySlug, hasOriginalRestaurantLogo } from '@/data/restaurants';
import { useLiveReviewStats, refreshReviewStats } from '@/lib/live-review-stats';
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
  const [reviewsPage,setReviewsPage] = useState(1);
  const [reviewsTotal,setReviewsTotal] = useState(0);
  const [reviewsPages,setReviewsPages] = useState(1);
  const [reviewsError,setReviewsError] = useState(false);
  const [reviewsLoading,setReviewsLoading] = useState(true);
  const liveStats=useLiveReviewStats(slug);
  const [gallery, setGallery] = useState<RestaurantImage[]>([]);
  const [activePromotions, setActivePromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'map' | 'reviews'>('overview');
  useEffect(() => {
    if (!loading && new URLSearchParams(window.location.search).get('tab') === 'reservations') {
      setActiveTab('overview');
      document.getElementById('reservations')?.scrollIntoView({ block: 'start' });
    }
  }, [slug, loading]);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewPhotos, setReviewPhotos] = useState<File[]>([]);
  const [reviewPhotoPreviews, setReviewPhotoPreviews] = useState<string[]>([]);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const reactionRequests=useRef(new Set<string>());
  const [reactionBusy,setReactionBusy]=useState<Record<string,boolean>>({});
  const [submittingReview, setSubmittingReview] = useState(false);
  const [heroImgError, setHeroImgError] = useState(false);
  const [recentViews, setRecentViews] = useState<RecentlyViewedRestaurant[]>([]);

  useEffect(() => {
    const updateRecent = () => {
      setRecentViews(getRecentlyViewed().filter((r) => r.slug !== slug && r.id !== restaurant?.id));
    };
    updateRecent();
    return onActivityChange(updateRecent);
  }, [slug, restaurant?.id]);

  const reviewRestaurantId=restaurant?.id;
  useEffect(() => {
    if (!reviewRestaurantId || reviewRestaurantId.startsWith('static-')) {
      setReviews([]);setReviewsTotal(0);setReviewsLoading(false);setReviewsError(Boolean(reviewRestaurantId));return;
    }
    const controller=new AbortController();
    let pending=false;
    setReviewsLoading(true);
    const refresh=async()=>{
      if(pending || document.visibilityState==='hidden') return;
      pending=true;
      try {
        const res=await api.get('/api/restaurants/'+reviewRestaurantId+'/reviews?limit=12&page='+reviewsPage,{auth:false,cache:'no-store',signal:controller.signal});
        if(controller.signal.aborted) return;
        if(!Array.isArray(res.data) || !res.meta) throw new Error('Invalid reviews response');
        if(reviewsPage>res.meta.totalPages) {setReviewsPage(res.meta.totalPages);return;}
        setReviews(res.data);setReviewsTotal(res.meta.totalCount);setReviewsPages(res.meta.totalPages);setReviewsError(false);
      } catch {
        if(!controller.signal.aborted) setReviewsError(true);
      } finally {pending=false;if(!controller.signal.aborted)setReviewsLoading(false);}
    };
    void refresh();
    const timer=window.setInterval(refresh,20000);
    window.addEventListener('focus',refresh);window.addEventListener('online',refresh);
    window.addEventListener('cordova_review_updated',refresh);document.addEventListener('visibilitychange',refresh);
    return ()=>{controller.abort();window.clearInterval(timer);window.removeEventListener('focus',refresh);window.removeEventListener('online',refresh);window.removeEventListener('cordova_review_updated',refresh);document.removeEventListener('visibilitychange',refresh);};
  },[reviewRestaurantId,reviewsPage,liveStats?.revision,liveStats?.review_count]);

  useEffect(()=>{
    if(liveStats) setRestaurant(current=>current ? {...current,review_count:liveStats.review_count,avg_rating:liveStats.avg_rating} : current);
  },[liveStats]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let found: Restaurant | null = null;
      try {
        const requestedSource = new URLSearchParams(window.location.search).get('source');
        const viewSource = requestedSource === 'recommendation' || requestedSource === 'search' ? requestedSource : 'browse';
        const detail = await api.get(`/api/restaurants/by-slug/${encodeURIComponent(slug)}?source=${viewSource}`, {
          auth: !!user,
        });
        found = detail.data.restaurant;
      } catch {
        found = process.env.NODE_ENV === 'production' ? null : getStaticRestaurantBySlug(slug);
      }

      if (!found) {
        setRestaurant(null);
        return;
      }

      const customFound = applyRestaurantCustomization(found);
      setRestaurant(customFound);

      recordRestaurantView({
        id: customFound.id,
        name: customFound.name,
        slug: customFound.slug || slug,
        coverImageUrl: customFound.cover_image_url,
        avgRating: customFound.avg_rating,
        reviewCount: customFound.review_count,
        priceRange: customFound.price_range,
        category: customFound.category,
        address: customFound.address,
        barangay: customFound.barangay,
      });

      try {
        const [menu, galleryRes, promoRes] = await Promise.all([
          api.get(`/api/restaurants/${found.id}/menu`, { auth: false }).catch(() => ({ data: {} })),
          api.get(`/api/restaurants/${found.id}/images`, { auth: false }).catch(() => ({ data: [] })),
          api.get(`/api/restaurants/${found.id}/promotions`, { auth: false }).catch(() => ({ data: [] })),
        ]);

        // Saved API records are the sole source of menu content.
        setCategories(Array.isArray(menu.data?.categories) ? menu.data.categories : []);
        setItems(Array.isArray(menu.data?.items) ? menu.data.items : []);
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

  const reactToReview = async (reviewId:string,emoji:string)=>{
    if(!user){toast('Please log in to react to reviews','info');return;}
    if(reactionRequests.current.has(reviewId))return;
    reactionRequests.current.add(reviewId);setReactionBusy(current=>({...current,[reviewId]:true}));
    try{
      const res=await api.post('/api/reviews/'+reviewId+'/react',{emoji});
      setReviews(current=>current.map(review=>review.id===reviewId?{...review,reactions:res.data.reactions,my_reaction:res.data.my_reaction}:review));
      void refreshReviewStats();
    }catch(error){toast(error instanceof Error?error.message:'Unable to update reaction','error');}
    finally{reactionRequests.current.delete(reviewId);setReactionBusy(current=>({...current,[reviewId]:false}));}
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    if (!user || user.role !== 'customer') {
      toast('Please sign in with a diner account to post a review.', 'info');
      return;
    }
    if (!reviewComment.trim()) {
      toast('Please write a brief comment describing your dining experience', 'info');
      return;
    }
    setSubmittingReview(true);
    try {
      if (!user) throw new Error('Please sign in to write a review');
      let response: { success: boolean; data?: { review?: Review } };
      if (reviewPhotos.length > 0) {
        const formData = new FormData();
        formData.append('rating', String(reviewRating));
        formData.append('comment', reviewComment.trim());
        reviewPhotos.forEach((file) => formData.append('photos', file));
        response = await api.post(`/api/restaurants/${restaurant.id}/reviews`, formData, { isFormData: true });
      } else {
        response = await api.post(`/api/restaurants/${restaurant.id}/reviews`, { rating: reviewRating, comment: reviewComment.trim() });
      }
      if (!response?.success || !response.data?.review?.id) {
        throw new Error('Review submission did not return a saved review');
      }
      const saved = response.data.review;
      const newReviewObj: Review = { ...saved, reviewer_name: user.full_name, reviewer_avatar: user.avatar_url || undefined, like_count: 0, liked_by_me: false };
      setReviewsPage(1);
      setReviews((current) => [newReviewObj, ...current.filter((review) => review.id !== newReviewObj.id)].slice(0, 12));
      setReviewsTotal((current) => current + 1);
      window.dispatchEvent(new Event('cordova_review_updated'));
      void refreshReviewStats();

      setReviewComment('');
      setReviewPhotos([]);
      reviewPhotoPreviews.forEach((preview) => URL.revokeObjectURL(preview));
      setReviewPhotoPreviews([]);
      toast('Review submitted successfully.', 'success');
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Failed to submit review. Please try again.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container py-8 space-y-6">
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
  
  const isSeafood = Boolean(
    (restaurant.name + ' ' + (restaurant.description || '') + ' ' + (restaurant.cuisines || []).join(' ')).toLowerCase().includes('seafood') ||
    (restaurant.name + ' ' + (restaurant.description || '')).toLowerCase().includes('bakasi') ||
    (restaurant.name + ' ' + (restaurant.description || '')).toLowerCase().includes('parola') ||
    (restaurant.name + ' ' + (restaurant.description || '')).toLowerCase().includes('lantaw')
  );

  const tagText = isSeafood
    ? 'Seafood Specialist'
    : restaurant.cuisines?.[0]
    ? `${restaurant.cuisines[0]} Cuisine`
    : 'Authentic Dining';

  const allPhotos = [
    ...(restaurant.cover_image_url ? [{ id: 'cover', image_url: restaurant.cover_image_url }] : []),
    ...gallery.map((photo) => ({ ...photo, image_url: catalogImage(photo.image_url) || photo.image_url })),
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

  const isRcaLogo = restaurant.slug === 'rca-bilao-food-station';
  const heroImageSrc =
    !heroImgError &&
    restaurant.cover_image_url &&
    restaurant.cover_image_url.trim() !== ''
      ? restaurant.cover_image_url
      : fallbackHeroImage;
  const showOriginalLogo = !heroImgError && hasOriginalRestaurantLogo(restaurant.slug);
  const isHorizonLogo = restaurant.slug === 'horizon-bean-cafe';

  return (
    <div className="min-h-screen bg-cordova-cream dark:bg-[#121614] pb-24 relative overflow-hidden">
      {/* Ambient Lighting Background Accents */}
      <div className="absolute top-[20%] left-[-10%] w-[550px] h-[550px] rounded-full bg-emerald-500/12 dark:bg-emerald-500/18 blur-[130px] pointer-events-none -z-0" />
      <div className="absolute top-[55%] right-[-10%] w-[550px] h-[550px] rounded-full bg-amber-500/12 dark:bg-amber-500/18 blur-[130px] pointer-events-none -z-0" />

      {/* HERO COVER SECTION WITH SPATIAL GLASS DEPTH */}
      <section className={`relative w-full h-[430px] sm:h-[500px] overflow-hidden ${isHorizonLogo ? 'bg-[#3b2923]' : isRcaLogo ? 'bg-gradient-to-br from-emerald-950 via-stone-900 to-stone-950' : 'bg-stone-950'}`}>
        {!isRcaLogo && <Image
          src={heroImageSrc}
          alt={restaurant.name}
          fill
          priority
          unoptimized
          onError={() => setHeroImgError(true)}
          className={showOriginalLogo
            ? 'object-contain object-center opacity-85 transition-transform duration-1000'
            : 'object-cover object-center opacity-85 scale-[1.02] transition-transform duration-1000'}
        />}

        {/* Ambient Dark Gradient Overlay for Maximum Text Clarity */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/35 backdrop-blur-[1.5px]" />

        {isRcaLogo && restaurant.cover_image_url && (
          <div className="absolute top-8 sm:top-10 left-1/2 -translate-x-1/2 z-10 w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-amber-50 p-2 shadow-2xl ring-4 ring-amber-400/50">
            <Image src={restaurant.cover_image_url} alt="RCA Lechon Belly & Bilao logo" fill unoptimized className="object-contain p-2" />
          </div>
        )}

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
      <section className="relative z-30 -mt-10 page-container">

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
              <RestaurantHours restaurant={restaurant} />
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
                  className="font-extrabold text-sm text-stone-900 dark:text-white hover:text-cordova-green dark:hover:text-emerald-400 transition-colors group-hover:underline text-center max-w-full break-words block mx-auto"
                  title="View on Interactive Map"
                >
                  {locationText}
                </button>
                <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400 mt-0.5 break-words text-center" title={restaurant.address || locationText}>
                  {restaurant.address || `${restaurant.barangay || 'Poblacion'}, Cordova, Cebu`}
                </p>
              </div>
            </div>
          </div>

          {/* TAB NAVIGATION HEADER */}
          <div className="border-t-2 border-cordova-green dark:border-emerald-500 border-b border-stone-200/80 dark:border-white/10 bg-white/50 dark:bg-white/[0.02]">
            <div className="grid grid-cols-2 sm:grid-cols-4 text-center">
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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <section className="space-y-4 lg:col-span-5">
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cordova-green dark:text-emerald-400">Our Story</h2>
                  <p className="text-stone-700 dark:text-stone-200 text-sm sm:text-base leading-relaxed whitespace-pre-line">{restaurant.description || 'The restaurant has not added its story yet.'}</p>
                </section>
                <div className="lg:col-span-7"><ReservationForm restaurant={restaurant} /></div>
                </div>
                {/* Gallery Section */}
                <section className="space-y-6">
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
                    Gallery
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-stone-300">Explore food, ambiance, and moments shared by the community. Select a photo to view it full size.</p>
                  {allPhotos.length === 0 ? (
                    <div className="text-center py-12 text-stone-400">
                      <ImageOff size={32} className="mx-auto mb-2 opacity-60" />
                      <p className="text-xs">No gallery photos uploaded yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                      {allPhotos.map((img, i) => (
                        <button
                          type="button"
                          key={img.id || i}
                          onClick={() => setLightboxImage(img.image_url)}
                          aria-label={`View ${restaurant.name} gallery photo ${i + 1} full size`}
                          className="relative h-48 sm:h-56 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 shadow-spatial-sm border border-stone-200/60 dark:border-stone-800/60 group focus:outline-none focus:ring-2 focus:ring-cordova-gold"
                        >
                          <Image
                            src={img.image_url}
                            alt={`${restaurant.name} gallery photo`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                  <VisitHighlights restaurant={restaurant} />
                </section>
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
              <div className="space-y-4">
                <MapViewClient restaurants={[restaurant]} height="480px" />
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
                        {reviewsTotal} total
                      </span>
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      Verified guest feedback, emoji reactions & foodie badges
                    </p>
                  </div>
                </div>

                {/* Review Cards */}
                <div className="space-y-4">
                  {reviewsLoading ? <p className="text-sm text-stone-500">Loading reviews…</p> : reviewsError && reviews.length === 0 ? <p role="alert" className="text-sm text-amber-700">Reviews are temporarily unavailable. We will retry automatically.</p> : reviews.length === 0 ? (
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
                        <ReviewActions
                          review={r}
                          onChanged={changed=>{setReviews(current=>changed ? current.map(item=>item.id===r.id?changed:item) : current.filter(item=>item.id!==r.id));if(!changed)setReviewsTotal(total=>Math.max(0,total-1));}}
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

                          <ReportReview id={r.id} authorId={r.user_id} />
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
                                const isSelected = r.my_reaction === emoji;
                                return (
                                  <button
                                    key={emoji}
                                    type="button"
                                    disabled={reactionBusy[r.id]}
                                    aria-pressed={isSelected}
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
                        </ReviewActions>
                      );
                    })
                  )}
                </div>

                {reviewsError && reviews.length > 0 && <p role="status" className="text-sm text-amber-700">Showing the last confirmed reviews. Reconnecting…</p>}
                {reviewsPages > 1 && <div className="flex items-center gap-4 text-sm"><button type="button" disabled={reviewsPage<=1 || reviewsLoading} onClick={()=>setReviewsPage(p=>p-1)}>Previous</button><span>Page {reviewsPage} of {reviewsPages}</span><button type="button" disabled={reviewsPage>=reviewsPages || reviewsLoading} onClick={()=>setReviewsPage(p=>p+1)}>Next</button></div>}
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
                    {user?.role === 'customer' ? (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                        Posting as {user.full_name || 'Verified User'}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                        {user ? 'Diner account required to post' : 'Sign in to post a review'}
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
                  <div className="flex flex-wrap items-center justify-between gap-2">
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
                      disabled={submittingReview || user?.role !== 'customer'}
                      className="bg-cordova-green hover:bg-cordova-greenHover text-white text-xs font-bold px-7 py-3 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-98 flex items-center gap-2"
                    >
                      <Sparkles size={14} />
                      {submittingReview ? 'Posting Review...' : 'Post Review with Spatial Badges'}
                    </button>
                    {!user && (
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        <Link href={`/login?redirect=${encodeURIComponent(`/restaurants/${slug}`)}`} className="text-cordova-green dark:text-emerald-400 font-bold hover:underline">Log in</Link> with a diner account to post.
                      </p>
                    )}
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recently Viewed Restaurants Shelf */}
      {recentViews.length > 0 && (
        <section className="border-t border-stone-200/80 dark:border-white/10 py-10 bg-stone-50/70 dark:bg-[#121714]">
          <div className="page-container">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Eye size={18} className="text-cordova-green dark:text-emerald-400" />
                <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">
                  Other Places You Recently Viewed
                </h3>
              </div>
              <Link
                href="/history"
                className="text-xs font-semibold text-cordova-green dark:text-emerald-400 hover:underline"
              >
                View Activity History →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recentViews.slice(0, 4).map((r) => (
                <Link
                  key={r.id}
                  href={`/restaurants/${r.slug}`}
                  className="group block p-3 rounded-2xl bg-white dark:bg-[#181f1a] border border-stone-200/70 dark:border-white/10 shadow-spatial-sm hover:shadow-spatial-md transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-32 w-full rounded-xl overflow-hidden mb-2.5 bg-stone-100 dark:bg-stone-800">
                    {r.coverImageUrl ? (
                      <Image
                        src={r.coverImageUrl}
                        alt={r.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400">🍽️</div>
                    )}
                    {r.priceRange && (
                      <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white uppercase">
                        {r.priceRange}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-stone-900 dark:text-white truncate group-hover:text-cordova-green dark:group-hover:text-emerald-400 transition-colors">
                    {r.name}
                  </h4>
                  <div className="flex items-center justify-between mt-1 text-xs text-stone-500 dark:text-stone-400">
                    <span className="truncate">{r.category || r.barangay || 'Cordova'}</span>
                    {r.avgRating ? (
                      <span className="flex items-center gap-0.5 font-bold text-amber-600 dark:text-amber-400">
                        <Star size={11} className="fill-cordova-gold text-cordova-gold" />
                        {r.avgRating.toFixed(1)}
                      </span>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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
