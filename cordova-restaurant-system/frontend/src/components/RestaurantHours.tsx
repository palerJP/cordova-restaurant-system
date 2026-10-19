'use client';
import { Clock } from 'lucide-react';
import type { Restaurant } from '@/lib/types';
import { getRestaurantCustomization } from '@/data/restaurants';
import { describeHours } from '@/lib/operating-hours';
import { useRestaurantHours } from '@/lib/live-operating-hours';

export function RestaurantHours({ restaurant, badge = false }: { restaurant: Restaurant; badge?: boolean }) {
  const { rows, failed, now } = useRestaurantHours(restaurant.id);
  const value = rows ? describeHours(rows, now) : { status: 'unknown', label: failed ? 'Hours unavailable' : 'Checking hours…', text: failed ? 'Unable to load current hours. Please contact the business.' : 'Loading opening and closing times…' };
  if (badge) return <span className={`rounded-full border px-2 py-1 text-[11px] font-bold ${value.status === 'open' ? 'border-emerald-200 bg-emerald-900 text-white' : value.status === 'closed' ? 'border-red-200 bg-red-900 text-white' : 'border-stone-300 bg-stone-900 text-white'}`}>{value.label}</span>;
  const listed = rows?.length === 0 ? getRestaurantCustomization(restaurant)?.hours : undefined;
  return <div className="text-xs text-stone-700 dark:text-stone-200 space-y-1">
    <p className="flex items-start gap-2 font-semibold"><Clock size={15} className="mt-0.5 shrink-0" aria-hidden="true" /><span>{value.text}</span></p>
    {listed && <details className="pl-6"><summary className="cursor-pointer underline underline-offset-2">View listed opening &amp; closing times</summary><p className="mt-1 break-words">{listed}</p><p className="mt-1 text-stone-600 dark:text-stone-300">Directory listing only; confirm current hours with the business.</p></details>}
    <p className="pl-6 text-[11px] text-stone-600 dark:text-stone-300">Philippine time (PHT){rows && rows.length > 0 ? ' · Regular schedule; holidays may differ.' : ''}</p>
  </div>;
}
