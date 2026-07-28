'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import Link from 'next/link';
import type { Restaurant } from '@/lib/types';

// Leaflet's default marker icons reference image files that don't resolve
// correctly under most bundlers — replace with CDN-hosted icons.
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Cordova, Cebu approximate center
const CORDOVA_CENTER: [number, number] = [10.2531, 123.9494];

function RecenterOnData({ restaurants }: { restaurants: Restaurant[] }) {
  const map = useMap();
  useEffect(() => {
    if (restaurants.length === 0) return;
    const bounds = L.latLngBounds(restaurants.map((r) => [r.latitude, r.longitude]));
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
  return (
    <div style={{ height }} className="rounded-2xl overflow-hidden border border-[var(--border)]">
      <MapContainer center={CORDOVA_CENTER} zoom={14} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {restaurants.map((r) => (
          <Marker key={r.id} position={[r.latitude, r.longitude]} icon={markerIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{r.name}</p>
                <p className="text-xs text-gray-500">{r.address}</p>
                <Link href={`/restaurants/${r.slug}`} className="text-brand-500 text-xs font-medium">
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
              new L.DivIcon({
                html: '<div style="background:#c2571e;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #c2571e"></div>',
                className: '',
                iconSize: [14, 14],
              })
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
