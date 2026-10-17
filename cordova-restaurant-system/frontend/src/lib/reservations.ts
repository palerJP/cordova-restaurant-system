export interface ReservationSettings {
  enabled: boolean; configuredEnabled: boolean; capacity: number; maxPartySize: number;
  durationMinutes: number; minNoticeMinutes: number; advanceDays: number; hasHours?: boolean;
}
export interface ReservationSlot { startsAt: string; endsAt: string; availableSeats: number }
export interface Reservation {
  id: string; restaurant_id: string; restaurant_name?: string; restaurant_slug?: string; restaurant_address?: string;
  starts_at: string; ends_at: string; party_size: number; contact_name: string; contact_phone: string;
  notes: string; owner_note: string; status: ReservationStatus; created_at: string; updated_at: string;
}
export type ReservationStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed' | 'no_show';
export const RESERVATION_LABELS: Record<ReservationStatus,string> = {
  pending:'Awaiting restaurant confirmation',confirmed:'Confirmed',rejected:'Declined',cancelled:'Cancelled',completed:'Completed',no_show:'No-show',
};
export const philippineDate = (time=Date.now()) => new Date(time+8*3600000).toISOString().slice(0,10);
export const reservationTime = (value:string) => new Date(value).toLocaleString('en-PH',{timeZone:'Asia/Manila',dateStyle:'medium',timeStyle:'short'});
export const slotLabel = (value:string) => new Date(value).toLocaleTimeString('en-PH',{timeZone:'Asia/Manila',hour:'numeric',minute:'2-digit'});
