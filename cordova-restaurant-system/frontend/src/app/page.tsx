'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MapPin, LayoutGrid, Map } from 'lucide-react';
import { api } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useCuisines } from '@/hooks/useCuisines';
import { RestaurantCard } from '@/components/RestaurantCard';
import { RestaurantGridSkeleton } from '@/components/ui/Skeleton';
import { FilterPanel, Filters } from '@/components/FilterPanel';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { MapViewClient } from '@/components/MapViewClient';
import type { Restaurant, PageMeta } from '@/lib/types';

const DEFAULT_FILTERS: Filters = { q: '', cuisines: [], priceRange: '', dietary: [], services: [], sortBy: 'relevance', maxDistanceKm: null };

export default function HomePage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const debouncedQuery = useDebounce(filters.q, 400);
  const [page, setPage] = useState(1);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const cuisines = useCuisines();
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'map'>('grid');
  const { coords, request: requestLocation, loading: geoLoading } = useGeolocation();

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set('q', debouncedQuery);
      if (filters.cuisines.length) params.set('cuisines', filters.cuisines.join(','));
      if (filters.priceRange) params.set('priceRange', filters.priceRange);
      if (filters.dietary.length) params.set('dietary', filters.dietary.join(','));
      if (filters.services.length) params.set('services', filters.services.join(','));
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      if (coords) {
        params.set('lat', String(coords.lat));
        params.set('lng', String(coords.lng));
        if (filters.maxDistanceKm != null) {
          params.set('maxDistanceKm', String(filters.maxDistanceKm));
        }
      }
      params.set('page', String(page));
      params.set('limit', '9');

      const res = await api.get(`/api/restaurants?${params.toString()}`, { auth: false });
      setRestaurants(res.data);
      setMeta(res.meta);
    } catch (err) {
      setRestaurants([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, filters.cuisines, filters.priceRange, filters.dietary, filters.services, filters.sortBy, filters.maxDistanceKm, coords, page]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, filters.cuisines, filters.priceRange, filters.dietary, filters.services, filters.sortBy, filters.maxDistanceKm]);

  return (
    <div>
      <section className="relative -mx-4 px-4 pt-10 pb-8 mb-8 bg-beige-50 dark:bg-transparent overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-1.5 badge bg-brand-500/10 text-brand-600 dark:text-brand-400 mb-4">
            <Sparkles size={13} /> AI-Powered Recommendations
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-ink-900 dark:text-white">
            Discover local restaurants
            <br className="hidden sm:block" /> in <span className="text-brand-500">Cordova</span>
          </h1>
          <p className="text-[var(--text-muted)] mt-3 max-w-xl text-base sm:text-lg">
            Browse accredited restaurants, or let our AI recommendation engine match you to a place based on your
            budget, cuisine and dietary needs.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Button variant="secondary" onClick={requestLocation} loading={geoLoading}>
              <MapPin size={16} /> Use my location for nearby results
            </Button>
            <div className="inline-flex rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--bg-elevated)] shadow-premium">
              <button
                className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${view === 'grid' ? 'bg-brand-500 text-white' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                onClick={() => setView('grid')}
              >
                <LayoutGrid size={14} /> Grid
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${view === 'map' ? 'bg-brand-500 text-white' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                onClick={() => setView('map')}
              >
                <Map size={14} /> Map
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <aside className="lg:sticky lg:top-20 self-start">
          <FilterPanel filters={filters} onChange={setFilters} cuisines={cuisines} hasLocation={!!coords} />
        </aside>

        <section>
          {loading ? (
            <RestaurantGridSkeleton count={9} />
          ) : restaurants.length === 0 ? (
            <div className="text-center py-16 text-[var(--text-muted)]">
              <p className="text-4xl mb-3">🔍</p>
              <p>No restaurants matched your filters. Try broadening your search.</p>
            </div>
          ) : view === 'map' ? (
            <MapViewClient
              restaurants={restaurants}
              height="600px"
              userLocation={coords ? { lat: coords.lat, lng: coords.lng } : undefined}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {restaurants.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <RestaurantCard restaurant={r} />
                  </motion.div>
                ))}
              </div>
              {meta && <Pagination meta={meta} onPageChange={setPage} />}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
