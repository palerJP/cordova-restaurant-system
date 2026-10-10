// Client-side and synced activity history for searches and recently viewed restaurants

export interface SearchHistoryItem {
  id: string;
  query: string;
  cuisine?: string;
  priceRange?: string;
  timestamp: string;
  source?: 'search' | 'recommendation';
}

export interface RecentlyViewedRestaurant {
  id: string;
  name: string;
  slug: string;
  coverImageUrl?: string;
  avgRating?: number;
  reviewCount?: number;
  priceRange?: string;
  category?: string;
  address?: string;
  barangay?: string;
  viewedAt: string;
}

const SEARCH_HISTORY_KEY = 'cordova_recent_searches_v1';
const RECENTLY_VIEWED_KEY = 'cordova_recently_viewed_v1';
const MAX_SEARCH_HISTORY = 15;
const MAX_RECENTLY_VIEWED = 20;
let activityAccountId: string | null = null;

export function setActivityAccount(userId: string | null): void {
  activityAccountId = userId;
  if (isBrowser()) {
    try {
      // Legacy shared history has no reliable owner and must not be reassigned.
      localStorage.removeItem(SEARCH_HISTORY_KEY);
      localStorage.removeItem(RECENTLY_VIEWED_KEY);
    } catch {
      // Storage may be disabled in the browser.
    }
  }
  notifyUpdate();
}

function accountKey(key: string): string {
  return `${key}:user:${encodeURIComponent(activityAccountId || '')}`;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function notifyUpdate() {
  if (isBrowser()) {
    try {
      window.dispatchEvent(new CustomEvent('cordova_activity_updated'));
    } catch {
      // Ignore in non-supporting environments
    }
  }
}

// ============================================================================
// SEARCH HISTORY
// ============================================================================

export function getSearchHistory(): SearchHistoryItem[] {
  if (!isBrowser() || !activityAccountId) return [];
  try {
    const raw = localStorage.getItem(accountKey(SEARCH_HISTORY_KEY));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSearchHistory(entry: {
  query: string;
  cuisine?: string;
  priceRange?: string;
  source?: 'search' | 'recommendation';
}): void {
  if (!isBrowser() || !activityAccountId) return;
  const trimmedQuery = entry.query.trim();
  const trimmedCuisine = entry.cuisine?.trim();

  // Don't save empty searches
  if (!trimmedQuery && !trimmedCuisine) return;

  const displayQuery = trimmedQuery || trimmedCuisine || '';

  try {
    const existing = getSearchHistory();
    // Filter out duplicate or near-identical recent queries
    const filtered = existing.filter(
      (item) =>
        item.query.toLowerCase() !== displayQuery.toLowerCase() ||
        (item.cuisine || '') !== (trimmedCuisine || '')
    );

    const newItem: SearchHistoryItem = {
      id: `sh-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      query: displayQuery,
      cuisine: trimmedCuisine || undefined,
      priceRange: entry.priceRange || undefined,
      timestamp: new Date().toISOString(),
      source: entry.source || 'search',
    };

    const updated = [newItem, ...filtered].slice(0, MAX_SEARCH_HISTORY);
    localStorage.setItem(accountKey(SEARCH_HISTORY_KEY), JSON.stringify(updated));
    notifyUpdate();
  } catch (err) {
    console.warn('Failed to save search history:', err);
  }
}

export function deleteSearchHistoryItem(id: string): void {
  if (!isBrowser() || !activityAccountId) return;
  try {
    const existing = getSearchHistory();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(accountKey(SEARCH_HISTORY_KEY), JSON.stringify(updated));
    notifyUpdate();
  } catch (err) {
    console.warn('Failed to delete search history item:', err);
  }
}

export function clearSearchHistory(): void {
  if (!isBrowser() || !activityAccountId) return;
  try {
    localStorage.removeItem(accountKey(SEARCH_HISTORY_KEY));
    notifyUpdate();
  } catch (err) {
    console.warn('Failed to clear search history:', err);
  }
}

// ============================================================================
// RECENTLY VIEWED RESTAURANTS
// ============================================================================

export function getRecentlyViewed(): RecentlyViewedRestaurant[] {
  if (!isBrowser() || !activityAccountId) return [];
  try {
    const raw = localStorage.getItem(accountKey(RECENTLY_VIEWED_KEY));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordRestaurantView(restaurant: {
  id: string;
  name: string;
  slug: string;
  coverImageUrl?: string;
  avgRating?: number;
  reviewCount?: number;
  priceRange?: string;
  category?: string;
  address?: string;
  barangay?: string;
}): void {
  if (!isBrowser() || !activityAccountId || !restaurant || (!restaurant.id && !restaurant.slug)) return;

  try {
    const existing = getRecentlyViewed();
    // Remove if already in list to bump to first position
    const filtered = existing.filter(
      (r) => r.id !== restaurant.id && r.slug !== restaurant.slug
    );

    const newItem: RecentlyViewedRestaurant = {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      coverImageUrl: restaurant.coverImageUrl,
      avgRating: restaurant.avgRating,
      reviewCount: restaurant.reviewCount,
      priceRange: restaurant.priceRange,
      category: restaurant.category,
      address: restaurant.address,
      barangay: restaurant.barangay,
      viewedAt: new Date().toISOString(),
    };

    const updated = [newItem, ...filtered].slice(0, MAX_RECENTLY_VIEWED);
    localStorage.setItem(accountKey(RECENTLY_VIEWED_KEY), JSON.stringify(updated));
    notifyUpdate();
  } catch (err) {
    console.warn('Failed to save recently viewed restaurant:', err);
  }
}

export function deleteRecentlyViewedItem(idOrSlug: string): void {
  if (!isBrowser() || !activityAccountId) return;
  try {
    const existing = getRecentlyViewed();
    const updated = existing.filter((item) => item.id !== idOrSlug && item.slug !== idOrSlug);
    localStorage.setItem(accountKey(RECENTLY_VIEWED_KEY), JSON.stringify(updated));
    notifyUpdate();
  } catch (err) {
    console.warn('Failed to delete recently viewed item:', err);
  }
}

export function clearRecentlyViewed(): void {
  if (!isBrowser() || !activityAccountId) return;
  try {
    localStorage.removeItem(accountKey(RECENTLY_VIEWED_KEY));
    notifyUpdate();
  } catch (err) {
    console.warn('Failed to clear recently viewed restaurants:', err);
  }
}

// ============================================================================
// SUBSCRIBER
// ============================================================================

export function onActivityChange(callback: () => void): () => void {
  if (!isBrowser()) return () => {};

  const handleUpdate = () => callback();
  window.addEventListener('cordova_activity_updated', handleUpdate);
  window.addEventListener('storage', handleUpdate);

  return () => {
    window.removeEventListener('cordova_activity_updated', handleUpdate);
    window.removeEventListener('storage', handleUpdate);
  };
}

// ============================================================================
// FORMAT HELPERS
// ============================================================================

export function formatRelativeTime(dateInput: string | Date | undefined): string {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 45) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 172800) return 'Yesterday';

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined,
  });
}
