'use client';

import { Select } from './ui/Select';
import { Badge } from './ui/Badge';
import type { Cuisine } from '@/lib/types';

export interface Filters {
  q: string;
  cuisines: string[];
  priceRange: string;
  dietary: string[];
  services: string[];
  sortBy: string;
  maxDistanceKm: number | null;
}

const DIETARY_OPTIONS = ['vegetarian', 'vegan', 'halal', 'gluten_free'];
const SERVICE_OPTIONS = [
  { value: 'dine_in', label: 'Dine-in' },
  { value: 'takeout', label: 'Takeout' },
  { value: 'delivery', label: 'Delivery' },
];

export function FilterPanel({
  filters,
  onChange,
  cuisines,
  hasLocation = false,
}: {
  filters: Filters;
  onChange: (filters: Filters) => void;
  cuisines: Cuisine[];
  hasLocation?: boolean;
}) {
  const toggleArrayValue = (key: 'cuisines' | 'dietary' | 'services', value: string) => {
    const current = filters[key];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onChange({ ...filters, [key]: next });
  };

  return (
    <div className="card p-4 space-y-5">
      <div>
        <label className="label" htmlFor="search-input">
          Search restaurants
        </label>
        <input
          id="search-input"
          type="search"
          placeholder="Name or keyword..."
          className="input"
          value={filters.q}
          onChange={(e) => onChange({ ...filters, q: e.target.value })}
        />
      </div>

      <div>
        <Select
          label="Budget"
          value={filters.priceRange}
          onChange={(e) => onChange({ ...filters, priceRange: e.target.value })}
        >
          <option value="">Any budget</option>
          <option value="budget">₱ Budget-friendly</option>
          <option value="moderate">₱₱ Moderate</option>
          <option value="expensive">₱₱₱ Expensive</option>
          <option value="premium">₱₱₱₱ Premium</option>
        </Select>
      </div>

      <div>
        <Select label="Sort by" value={filters.sortBy} onChange={(e) => onChange({ ...filters, sortBy: e.target.value })}>
          <option value="relevance">Relevance</option>
          <option value="rating">Highest rated</option>
          <option value="distance">Nearest</option>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </Select>
      </div>

      {hasLocation && (
        <div>
          <label className="label" htmlFor="radius-slider">
            Search radius: {filters.maxDistanceKm ?? 10} km
          </label>
          <input
            id="radius-slider"
            type="range"
            min={0.5}
            max={15}
            step={0.5}
            value={filters.maxDistanceKm ?? 10}
            onChange={(e) => onChange({ ...filters, maxDistanceKm: parseFloat(e.target.value) })}
            className="w-full accent-brand-500"
          />
        </div>
      )}

      <div>
        <p className="label mb-2">Cuisine</p>
        <div className="flex flex-wrap gap-2">
          {cuisines.map((c) => (
            <button
              key={c.slug}
              onClick={() => toggleArrayValue('cuisines', c.slug)}
              aria-pressed={filters.cuisines.includes(c.slug)}
              className={`transition-colors ${filters.cuisines.includes(c.slug) ? '' : 'opacity-70 hover:opacity-100'}`}
            >
              <Badge color={filters.cuisines.includes(c.slug) ? 'brand' : 'neutral'}>{c.name}</Badge>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="label mb-2">Dietary needs</p>
        <div className="flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map((d) => (
            <button key={d} onClick={() => toggleArrayValue('dietary', d)} aria-pressed={filters.dietary.includes(d)}>
              <Badge color={filters.dietary.includes(d) ? 'brand' : 'neutral'}>{d.replace('_', ' ')}</Badge>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="label mb-2">Service type</p>
        <div className="flex flex-wrap gap-2">
          {SERVICE_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => toggleArrayValue('services', s.value)}
              aria-pressed={filters.services.includes(s.value)}
            >
              <Badge color={filters.services.includes(s.value) ? 'brand' : 'neutral'}>{s.label}</Badge>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onChange({ q: '', cuisines: [], priceRange: '', dietary: [], services: [], sortBy: 'relevance', maxDistanceKm: null })}
        className="text-sm text-brand-500 hover:underline"
      >
        Clear all filters
      </button>
    </div>
  );
}
