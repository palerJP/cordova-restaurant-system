'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import Link from 'next/link';
import type { Restaurant } from '@/lib/types';

// Cordova, Cebu approximate center
const CORDOVA_CENTER: [number, number] = [10.2531, 123.9494];

function getMarkerIcon() {
  if (typeof window === 'undefined') return undefined;
  return new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
}

function RecenterOnData({ restaurants }: { restaurants: Restaurant[] }) {
  const map = useMap();
  useEffect(() => {
    if (!restaurants || restaurants.length === 0) return;
    const validCoords = restaurants.filter(r => r.latitude && r.longitude);
    if (validCoords.length === 0) return;
    const bounds = L.latLngBounds(validCoords.map((r) => [r.latitude, r.longitude]));
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
  }, [restaurants, map]);
  return null;
}

export function MapView({
  restaurants,
  height = '420px',
  userLocation,
}: {
  restaurants: Restaurant[];
  height?: string;
  userLocation?: { lat: number; lng: number };
}) {
  const markerIcon = useMemo(() => getMarkerIcon(), []);

  return (
    <div style={{ height }} className="rounded-2xl overflow-hidden border border-[var(--border)] shadow-spatial-sm">
      <MapContainer center={CORDOVA_CENTER} zoom={14} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {restaurants.filter(r => r.latitude && r.longitude).map((r) => (
          <Marker key={r.id} position={[r.latitude, r.longitude]} icon={markerIcon}>
            <Popup>
              <div className="text-sm p-1">
                <p className="font-serif font-bold text-stone-900">{r.name}</p>
                <p className="text-xs text-stone-600 mt-0.5">{r.address}</p>
                <Link href={`/restaurants/${r.slug}`} className="text-cordova-green text-xs font-bold mt-1 inline-block hover:underline">
                  View details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={
              typeof window !== 'undefined'
                ? new L.DivIcon({
                    html: '<div style="background:#1B5232;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #1B5232"></div>',
                    className: '',
                    iconSize: [16, 16],
                  })
                : undefined
            }
          >
            <Popup>You are here</Popup>
          </Marker>
        )}
        <RecenterOnData restaurants={restaurants} />
      </MapContainer>
    </div>
  );
}

export default MapView;
