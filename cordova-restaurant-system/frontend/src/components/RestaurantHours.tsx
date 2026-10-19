'use client';
import { Clock } from 'lucide-react';
import type { Restaurant } from '@/lib/types';
import { describeHours, estimatedTimeRange } from '@/lib/operating-hours';
import { useRestaurantHours } from '@/lib/live-operating-hours';

export function RestaurantHours({ restaurant, badge = false }: { restaurant: Restaurant; badge?: boolean }) {
  const { rows, failed, now } = useRestaurantHours(restaurant.id);
  const estimated = rows?.length === 0;
  const value = estimated
    ? { status: 'estimated', label: 'Estimated hours', text: estimatedTimeRange(restaurant.slug || restaurant.id) }
    : rows ? describeHours(rows, now) : { status: 'unknown', label: failed ? 'Hours unavailable' : 'Checking hours…', text: failed ? 'Please contact the business.' : 'Loading hours…' };
  const color = value.status === 'open'
    ? 'border-emerald-700/30 bg-emerald-100 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-900 dark:text-emerald-100'
    : value.status === 'closed'
    ? 'border-red-700/25 bg-red-50 text-red-800 dark:border-red-400/30 dark:bg-red-950 dark:text-red-100'
    : 'border-stone-400 bg-stone-100 text-stone-800 dark:border-stone-500 dark:bg-stone-800 dark:text-stone-100';
  const statusBadge = <span className={`inline-flex rounded-full border px-3 py-0.5 text-[11px] font-bold leading-tight ${color}`}>{value.label}</span>;
  if (badge) return statusBadge;
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', weekday: 'long' }).format(now);
  const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(weekday);
  const today = rows?.find(row => row.day_of_week === day);
  const overnight = today && today.close_time < today.open_time;
  const range = estimated || value.text.includes('opened yesterday') ? value.text : today && !today.is_closed && value.status !== 'unknown'
    ? `${today.open_time.slice(0, 5)} - ${today.close_time.slice(0, 5)}${overnight ? ' (+1 day)' : ''}`
    : value.text;
  return <div className="flex flex-col items-center gap-1 text-center" title="Philippine time (PHT). Regular hours may differ on holidays.">
    <span className="mb-1 flex h-10 w-10 items-center justify-center rounded-full border border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-600/50 dark:bg-amber-950/40 dark:text-amber-400"><Clock size={18} strokeWidth={1.5} aria-hidden="true" /></span>
    {statusBadge}
    <p className="text-xs font-bold tabular-nums text-stone-900 dark:text-white">{range}</p>
    {estimated && <p className="text-[10px] text-stone-600 dark:text-stone-300">Sample schedule · PHT · Not business-confirmed</p>}
    {!estimated && <span className="sr-only">Philippine time. Regular hours may differ on holidays.</span>}
  </div>;
}
