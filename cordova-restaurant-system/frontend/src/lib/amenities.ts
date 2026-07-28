export interface AmenityDef {
  value: string;
  label: string;
}

export const AMENITIES: AmenityDef[] = [
  { value: 'parking', label: 'Parking Available' },
  { value: 'wifi', label: 'Free WiFi' },
  { value: 'outdoor_seating', label: 'Outdoor Seating' },
  { value: 'air_conditioning', label: 'Air Conditioning' },
  { value: 'wheelchair_accessible', label: 'Wheelchair Accessible' },
  { value: 'cashless_payment', label: 'Cashless Payment' },
  { value: 'family_friendly', label: 'Family Friendly' },
  { value: 'pet_friendly', label: 'Pet Friendly' },
  { value: 'live_music', label: 'Live Music' },
  { value: 'private_events', label: 'Private Events' },
];

export function amenityLabel(value: string): string {
  return AMENITIES.find((a) => a.value === value)?.label ?? value.replace(/_/g, ' ');
}
