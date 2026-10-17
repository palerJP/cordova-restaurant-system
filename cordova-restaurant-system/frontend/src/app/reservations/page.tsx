'use client';

import {RequireRole} from '@/components/RequireRole';
import {ReservationList} from '@/components/reservations/ReservationList';

export default function MyReservationsPage() {
  return <RequireRole roles={['customer','owner','admin']}><main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
    <div><h1 className="font-serif text-3xl font-bold">My reservations</h1><p className="text-sm text-stone-500 mt-2">Track the restaurant’s response and manage your reservation requests. A pending request is not a confirmed booking.</p></div>
    <ReservationList/>
  </main></RequireRole>;
}
