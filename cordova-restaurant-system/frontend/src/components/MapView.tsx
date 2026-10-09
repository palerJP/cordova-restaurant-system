'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  InfoWindowF,
} from '@react-google-maps/api';
import Link from 'next/link';
import { MapPin, Navigation, ExternalLink, Star } from 'lucide-react';
import type { Restaurant } from '@/lib/types';
import { Skeleton } from './ui/Skeleton';

// Cordova, Cebu approximate geographical center
const CORDOVA_CENTER = {
  lat: 10.2531,
  lng: 123.9494,
};

// Default Google Map options
const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: true,
  mapTypeControl: true,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi.business',
      stylers: [{ visibility: 'on' }],
    },
    {
      featureType: 'transit',
      elementType: 'labels.icon',
      stylers: [{ visibility: 'on' }],
    },
  ],
};

export interface MapViewProps {
  restaurants: Restaurant[];
  height?: string;
  userLocation?: { lat: number; lng: number };
  className?: string;
  showDirectionsButton?: boolean;
}

type MapViewContentProps = MapViewProps & {
  isLoaded: boolean;
  loadError?: Error;
  useEmbedFallback: boolean;
};

function getPlaceQuery(restaurant?: Restaurant): string {
  if (!restaurant) return 'Cordova, Cebu, Philippines';
  const address = restaurant.address?.trim() || restaurant.barangay?.trim() || '';
  const locationSuffix = /philippines/i.test(address)
    ? ''
    : /cebu/i.test(address)
      ? 'Philippines'
      : /cordova/i.test(address)
        ? 'Cebu, Philippines'
        : 'Cordova, Cebu, Philippines';
  return [
    restaurant.name?.trim(),
    address,
    locationSuffix,
  ].filter(Boolean).join(', ');
}

function MapViewContent({
  restaurants = [],
  height = '450px',
  userLocation,
  className = '',
  showDirectionsButton = true,
  isLoaded,
  loadError,
  useEmbedFallback,
}: MapViewContentProps) {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const validRestaurants = useMemo(() => restaurants.filter(
    (r) => Number.isFinite(r.latitude) && Number.isFinite(r.longitude) &&
      r.latitude >= -90 && r.latitude <= 90 && r.longitude >= -180 && r.longitude <= 180
  ), [restaurants]);

  // Auto-center / fit bounds
  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;

      if (validRestaurants.length === 1) {
        const single = validRestaurants[0];
        map.setCenter({ lat: single.latitude, lng: single.longitude });
        map.setZoom(16);
      } else if (validRestaurants.length > 1) {
        const bounds = new window.google.maps.LatLngBounds();
        validRestaurants.forEach((r) => {
          bounds.extend({ lat: r.latitude, lng: r.longitude });
        });
        if (userLocation) {
          bounds.extend(userLocation);
        }
        map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
      } else {
        map.setCenter(CORDOVA_CENTER);
        map.setZoom(14);
      }
    },
    [validRestaurants, userLocation]
  );

  useEffect(() => {
    if (mapRef.current && validRestaurants.length > 0) {
      if (validRestaurants.length === 1) {
        mapRef.current.setCenter({ lat: validRestaurants[0].latitude, lng: validRestaurants[0].longitude });
        mapRef.current.setZoom(16);
      }
    }
  }, [validRestaurants]);

  const targetRestaurant = validRestaurants[0] || restaurants[0];
  const query = getPlaceQuery(targetRestaurant);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;

  // =========================================================================
  // FALLBACK MODE (When API Key is missing or failed to load)
  // Search for the restaurant by name and address when no JavaScript Maps key is available.
  // =========================================================================
  if (useEmbedFallback || loadError) {
    const embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=${targetRestaurant ? 16 : 14}&ie=UTF8&iwloc=&output=embed`;

    return (
      <div className={`relative flex flex-col rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-spatial-sm bg-stone-50 dark:bg-stone-900 ${className}`}>
        {/* Google Maps Embed View */}
        <div style={{ height }} className="w-full relative">
          <iframe
            title="Google Maps Location"
            src={embedSrc}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          />
        </div>

        {/* Action & Status Bar */}
        <div className="p-3.5 bg-white dark:bg-stone-900 border-t border-stone-200/80 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin size={14} className="text-emerald-600 dark:text-emerald-400" />
              {targetRestaurant ? targetRestaurant.name : 'Cordova, Cebu'}
            </span>
            {targetRestaurant?.address && (
              <span className="text-stone-400 dark:text-stone-500 hidden sm:inline">• {targetRestaurant.address}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {showDirectionsButton && (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors shadow-sm"
              >
                <Navigation size={13} />
                <span>Get Directions</span>
              </a>
            )}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 font-medium transition-colors"
            >
              <ExternalLink size={13} />
              <span>Open in Google Maps</span>
            </a>
          </div>
        </div>

      </div>
    );
  }

  // =========================================================================
  // LOADING STATE
  // =========================================================================
  if (!isLoaded) {
    return <Skeleton className="w-full rounded-2xl" style={{ height }} />;
  }

  // =========================================================================
  // FULL JAVASCRIPT SDK GOOGLE MAP
  // =========================================================================
  const mapCenter = validRestaurants.length === 1
    ? { lat: validRestaurants[0].latitude, lng: validRestaurants[0].longitude }
    : CORDOVA_CENTER;

  return (
    <div className={`relative flex flex-col rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-spatial-sm ${className}`}>
      <div style={{ height }} className="w-full relative">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={mapCenter}
          zoom={validRestaurants.length === 1 ? 16 : 14}
          options={MAP_OPTIONS}
          onLoad={onMapLoad}
          onClick={() => setSelectedRestaurant(null)}
        >
          {/* Restaurant Markers */}
          {validRestaurants.map((r) => (
            <MarkerF
              key={r.id}
              position={{ lat: r.latitude, lng: r.longitude }}
              title={r.name}
              onClick={() => setSelectedRestaurant(r)}
            />
          ))}

          {/* User Location Marker */}
          {userLocation && (
            <MarkerF
              position={userLocation}
              title="You are here"
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 7,
                fillColor: '#2563EB',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
              }}
            />
          )}

          {/* Info Window */}
          {selectedRestaurant && (
            <InfoWindowF
              position={{
                lat: selectedRestaurant.latitude,
                lng: selectedRestaurant.longitude,
              }}
              onCloseClick={() => setSelectedRestaurant(null)}
            >
              <div className="p-2 max-w-xs text-stone-900 font-sans">
                {selectedRestaurant.cover_image_url && (
                  <div className="mb-2 h-24 w-full rounded-lg overflow-hidden relative bg-stone-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedRestaurant.cover_image_url}
                      alt={selectedRestaurant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-serif font-bold text-sm text-stone-900 leading-tight">
                    {selectedRestaurant.name}
                  </h4>
                  {selectedRestaurant.avg_rating ? (
                    <span className="flex items-center gap-0.5 text-xs font-semibold text-amber-600 shrink-0">
                      <Star size={12} className="fill-amber-500 text-amber-500" />
                      {Number(selectedRestaurant.avg_rating).toFixed(1)}
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-stone-500 mt-1 line-clamp-1">
                  {selectedRestaurant.address || selectedRestaurant.barangay}
                </p>
                <div className="mt-2.5 pt-2 border-t border-stone-200 flex items-center justify-between gap-2">
                  <Link
                    href={`/restaurants/${selectedRestaurant.slug}`}
                    className="text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    View Details →
                  </Link>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(getPlaceQuery(selectedRestaurant))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700 transition"
                  >
                    <Navigation size={11} />
                    <span>Directions</span>
                  </a>
                </div>
              </div>
            </InfoWindowF>
          )}
        </GoogleMap>
      </div>

      {/* Quick Toolbar */}
      <div className="p-3 bg-white dark:bg-stone-900 border-t border-stone-200/80 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
          <MapPin size={14} className="text-emerald-600 dark:text-emerald-400" />
          <span className="font-medium">
            {targetRestaurant ? targetRestaurant.name : 'Cordova, Cebu'}
          </span>
          {targetRestaurant?.address && (
            <span className="text-stone-400 hidden sm:inline">• {targetRestaurant.address}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showDirectionsButton && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors shadow-sm"
            >
              <Navigation size={13} />
              <span>Get Directions</span>
            </a>
          )}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 font-medium transition-colors"
          >
            <ExternalLink size={13} />
            <span>Open in Google Maps</span>
          </a>
        </div>
      </div>
    </div>
  );
}

function GoogleMapLoader({ apiKey, ...props }: MapViewProps & { apiKey: string }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-maps-loader',
    googleMapsApiKey: apiKey,
  });

  return <MapViewContent {...props} isLoaded={isLoaded} loadError={loadError} useEmbedFallback={false} />;
}

export function MapView(props: MapViewProps) {
  const apiKey = (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '').trim();
  const hasValidApiKey = Boolean(apiKey && !/^your_/i.test(apiKey));

  return hasValidApiKey
    ? <GoogleMapLoader {...props} apiKey={apiKey} />
    : <MapViewContent {...props} isLoaded={false} useEmbedFallback />;
}

export default MapView;
