'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Eye,
  Search,
  Trash2,
  ExternalLink,
  MapPin,
  Star,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  X,
} from 'lucide-react';
import { api, ApiClientError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import type { PageMeta } from '@/lib/types';
import {
  getSearchHistory,
  getRecentlyViewed,
  deleteSearchHistoryItem,
  clearSearchHistory,
  deleteRecentlyViewedItem,
  clearRecentlyViewed,
  onActivityChange,
  formatRelativeTime,
  type SearchHistoryItem,
  type RecentlyViewedRestaurant,
} from '@/lib/activity-history';

interface ServerHistoryEntry {
  id: string;
  queryParams: {
    keyword?: string;
    cuisines?: string[];
    budgetRange?: string;
    dietaryRestrictions?: string[];
    requiredServices?: string[];
    maxDistanceKm?: number;
    onlyOpenNow?: boolean;
  };
  resultCount: number;
  createdAt: string;
  topResult: {
    id: string;
    name: string;
    slug: string;
    coverImageUrl?: string;
    avgRating: number;
    priceRange: string;
  } | null;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'viewed' | 'searches'>('viewed');

  // Local storage state
  const [localSearches, setLocalSearches] = useState<SearchHistoryItem[]>([]);
  const [localViews, setLocalViews] = useState<RecentlyViewedRestaurant[]>([]);

  // Server state for logged-in users
  const [serverSearches, setServerSearches] = useState<ServerHistoryEntry[]>([]);
  const [serverMeta, setServerMeta] = useState<PageMeta | null>(null);
  const [serverPage, setServerPage] = useState(1);
  const [loadingServer, setLoadingServer] = useState(false);

  // Load local activity
  const refreshLocalActivity = useCallback(() => {
    setLocalSearches(getSearchHistory());
    setLocalViews(getRecentlyViewed());
  }, []);

  // Load server searches if logged in
  const loadServerSearches = useCallback(async () => {
    if (!user) return;
    setLoadingServer(true);
    try {
      const res = await api.get(`/api/recommendations/history?page=${serverPage}&limit=10`);
      setServerSearches(res.data || []);
      setServerMeta(res.meta || null);
    } catch {
      setServerSearches([]);
    } finally {
      setLoadingServer(false);
    }
  }, [user, serverPage]);

  // Initial load & subscribe to changes
  useEffect(() => {
    refreshLocalActivity();
    return onActivityChange(() => {
      refreshLocalActivity();
    });
  }, [refreshLocalActivity]);

  useEffect(() => {
    if (user && activeTab === 'searches') {
      loadServerSearches();
    }
  }, [user, activeTab, loadServerSearches]);

  // Handlers for Views
  const handleDeleteView = async (idOrSlug: string, serverId?: string) => {
    deleteRecentlyViewedItem(idOrSlug);
    if (user && serverId) {
      try {
        await api.delete(`/api/restaurants/recently-viewed/${serverId}`);
      } catch {
        // Silently continue with local deletion
      }
    }
    toast('Removed from recently viewed', 'info');
  };

  const handleClearAllViews = async () => {
    clearRecentlyViewed();
    if (user) {
      try {
        await api.delete('/api/restaurants/recently-viewed');
      } catch {
        // Continue
      }
    }
    toast('All recently viewed restaurants cleared', 'success');
  };

  // Handlers for Searches
  const handleDeleteSearch = async (id: string, isServer: boolean = false) => {
    if (isServer && user) {
      try {
        await api.delete(`/api/recommendations/history/${id}`);
        setServerSearches((prev) => prev.filter((s) => s.id !== id));
        toast('Search record removed', 'info');
        return;
      } catch {
        // Fallback
      }
    }
    deleteSearchHistoryItem(id);
    toast('Search query removed from history', 'info');
  };

  const handleClearAllSearches = async () => {
    clearSearchHistory();
    if (user) {
      try {
        await api.delete('/api/recommendations/history');
        setServerSearches([]);
      } catch {
        // Continue
      }
    }
    toast('All search history cleared', 'success');
  };

  const handleRunSearch = (query: string, cuisine?: string) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (cuisine) params.set('cuisine', cuisine);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-cordova-cream dark:bg-[#121614] pb-24 pt-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-cordova-gold flex items-center gap-1">
                <Clock size={13} /> Activity & History
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
              Your Culinary Activity
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-1">
              Quickly re-access past search queries and restaurants you recently explored.
            </p>
          </div>

          {/* Action buttons depending on tab */}
          <div className="flex items-center gap-2.5">
            {activeTab === 'viewed' && localViews.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllViews}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-red-600 dark:hover:text-red-400 bg-white/80 dark:bg-stone-800/80 border border-stone-200/80 dark:border-white/10 rounded-xl transition-colors shadow-sm"
              >
                <Trash2 size={13} />
                <span>Clear All Views</span>
              </button>
            )}

            {activeTab === 'searches' && (localSearches.length > 0 || serverSearches.length > 0) && (
              <button
                type="button"
                onClick={handleClearAllSearches}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-red-600 dark:hover:text-red-400 bg-white/80 dark:bg-stone-800/80 border border-stone-200/80 dark:border-white/10 rounded-xl transition-colors shadow-sm"
              >
                <Trash2 size={13} />
                <span>Clear All Searches</span>
              </button>
            )}
          </div>
        </div>

        {/* Guest Banner */}
        {!user && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                You are browsing as a guest. Your recent activity is stored locally on this browser.
              </span>
            </div>
            <Link
              href="/login"
              className="font-bold underline text-cordova-green dark:text-emerald-400 hover:opacity-80 shrink-0"
            >
              Sign in to sync across devices →
            </Link>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-stone-200/60 dark:bg-stone-900/60 backdrop-blur-md border border-stone-200/80 dark:border-white/10 mb-6 max-w-md">
          <button
            type="button"
            onClick={() => setActiveTab('viewed')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'viewed'
                ? 'bg-white dark:bg-[#1e2621] text-cordova-green dark:text-emerald-400 shadow-sm border border-stone-200/60 dark:border-emerald-500/30'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Eye size={14} />
            <span>Recently Viewed</span>
            {localViews.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold">
                {localViews.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('searches')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'searches'
                ? 'bg-white dark:bg-[#1e2621] text-cordova-green dark:text-emerald-400 shadow-sm border border-stone-200/60 dark:border-emerald-500/30'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Search size={14} />
            <span>Search History</span>
            {(localSearches.length > 0 || serverSearches.length > 0) && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold">
                {user && serverSearches.length > 0 ? serverSearches.length : localSearches.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: RECENTLY VIEWED RESTAURANTS */}
        {activeTab === 'viewed' && (
          <div>
            {localViews.length === 0 ? (
              <div className="text-center py-20 px-4 rounded-3xl bg-white/60 dark:bg-[#161c18]/60 border border-stone-200/80 dark:border-white/10 shadow-sm">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-stone-100 dark:bg-stone-800/80 flex items-center justify-center text-3xl">
                  🍽️
                </div>
                <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white mb-1">
                  No recently viewed restaurants
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto mb-6">
                  When you check out restaurant menus and pages, they will appear right here for instant access.
                </p>
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-cordova-green hover:bg-cordova-greenHover shadow-sm transition-all"
                >
                  <Compass size={14} />
                  <span>Discover Restaurants</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {localViews.map((item) => (
                  <div
                    key={item.id || item.slug}
                    className="group relative flex flex-col rounded-2xl bg-white/80 dark:bg-[#181f1a]/90 border border-stone-200/80 dark:border-white/10 shadow-spatial-sm hover:shadow-spatial-md transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  >
                    {/* Cover Photo */}
                    <Link href={`/restaurants/${item.slug}`} className="relative h-36 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden block">
                      {item.coverImageUrl ? (
                        <Image
                          src={item.coverImageUrl}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl text-stone-400">🍽️</div>
                      )}
                      {item.priceRange && (
                        <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white uppercase tracking-wider">
                          {item.priceRange}
                        </span>
                      )}
                      <span className="absolute bottom-2.5 right-2.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center gap-1">
                        <Clock size={10} />
                        {formatRelativeTime(item.viewedAt)}
                      </span>
                    </Link>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link href={`/restaurants/${item.slug}`} className="font-bold text-sm text-stone-900 dark:text-white hover:text-cordova-green dark:hover:text-emerald-400 transition-colors line-clamp-1">
                            {item.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteView(item.slug || item.id, item.id)}
                            className="text-stone-400 hover:text-red-500 p-1 rounded-lg transition-colors"
                            title="Remove from history"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-xs text-stone-500 dark:text-stone-400">
                          {item.avgRating ? (
                            <span className="flex items-center gap-0.5 font-bold text-amber-600 dark:text-amber-400">
                              <Star size={12} className="fill-cordova-gold text-cordova-gold" />
                              {item.avgRating.toFixed(1)}
                            </span>
                          ) : null}
                          {item.category && <span className="truncate">{item.category}</span>}
                        </div>

                        {item.barangay && (
                          <p className="text-[11px] text-stone-400 dark:text-stone-500 truncate mt-1 flex items-center gap-1">
                            <MapPin size={11} /> {item.barangay}, Cordova
                          </p>
                        )}
                      </div>

                      <div className="pt-3 mt-3 border-t border-stone-100 dark:border-white/5 flex items-center justify-between">
                        <Link
                          href={`/restaurants/${item.slug}`}
                          className="text-xs font-semibold text-cordova-green dark:text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <span>Explore Menu</span>
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SEARCH HISTORY */}
        {activeTab === 'searches' && (
          <div>
            {/* If user is logged in and has server recommendation searches, render server history; otherwise show local queries */}
            {user && serverSearches.length > 0 ? (
              <div className="space-y-3">
                {serverSearches.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-2xl bg-white/80 dark:bg-[#181f1a]/80 border border-stone-200/80 dark:border-white/10 shadow-spatial-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      {entry.topResult?.coverImageUrl && (
                        <div className="relative h-14 w-14 rounded-xl overflow-hidden shrink-0 bg-stone-100 dark:bg-stone-800">
                          <Image
                            src={entry.topResult.coverImageUrl}
                            alt={entry.topResult.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          {entry.queryParams.keyword && (
                            <span className="font-bold text-sm text-stone-900 dark:text-white mr-1">
                              "{entry.queryParams.keyword}"
                            </span>
                          )}
                          {entry.queryParams.cuisines?.map((c) => (
                            <span key={c} className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                              {c}
                            </span>
                          ))}
                          {entry.queryParams.budgetRange && (
                            <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-md uppercase">
                              {entry.queryParams.budgetRange}
                            </span>
                          )}
                          {entry.queryParams.onlyOpenNow && (
                            <span className="text-[10px] font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded-md">
                              open now
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-2">
                          <span>{entry.resultCount} results found</span>
                          <span>•</span>
                          <span>{formatRelativeTime(entry.createdAt)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {entry.topResult && (
                        <Link
                          href={`/restaurants/${entry.topResult.slug}`}
                          className="text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-cordova-green dark:hover:text-emerald-400 mr-2 flex items-center gap-1"
                        >
                          <span>Top: {entry.topResult.name}</span>
                          <ExternalLink size={12} />
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          handleRunSearch(
                            entry.queryParams.keyword || '',
                            entry.queryParams.cuisines?.[0]
                          )
                        }
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-cordova-green hover:bg-cordova-greenHover transition-all flex items-center gap-1 shadow-sm"
                      >
                        <Search size={12} />
                        <span>Search Again</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSearch(entry.id, true)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 transition-colors"
                        title="Delete search"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}

                {serverMeta && <Pagination meta={serverMeta} onPageChange={setServerPage} />}
              </div>
            ) : localSearches.length > 0 ? (
              <div className="space-y-2.5">
                {localSearches.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 sm:p-4 rounded-2xl bg-white/80 dark:bg-[#181f1a]/80 border border-stone-200/80 dark:border-white/10 shadow-spatial-sm flex items-center justify-between gap-3 hover:border-emerald-500/40 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-cordova-gold shrink-0">
                        <Search size={14} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-stone-900 dark:text-white truncate">
                            "{item.query}"
                          </span>
                          {item.cuisine && (
                            <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                              {item.cuisine}
                            </span>
                          )}
                          {item.priceRange && (
                            <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-md uppercase">
                              {item.priceRange}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                          Searched {formatRelativeTime(item.timestamp)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRunSearch(item.query, item.cuisine)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-cordova-green hover:bg-cordova-greenHover transition-all flex items-center gap-1 shadow-sm"
                      >
                        <Search size={12} />
                        <span>Search Again</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSearch(item.id, false)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 transition-colors"
                        title="Delete search"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 px-4 rounded-3xl bg-white/60 dark:bg-[#161c18]/60 border border-stone-200/80 dark:border-white/10 shadow-sm">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-stone-100 dark:bg-stone-800/80 flex items-center justify-center text-3xl">
                  🔍
                </div>
                <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white mb-1">
                  No search history yet
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto mb-6">
                  Look up Cordova specialties like Seafood, Lechon, Pizza, or Cafes to easily re-run searches later.
                </p>
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-cordova-green hover:bg-cordova-greenHover shadow-sm transition-all"
                >
                  <Search size={14} />
                  <span>Start Searching</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
