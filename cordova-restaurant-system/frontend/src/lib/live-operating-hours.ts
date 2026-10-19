'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { api } from './api';
import type { OperatingHour } from './types';

const cache = new Map<string, { rows: OperatingHour[]; at: number }>();
const pending = new Map<string, Promise<OperatingHour[]>>();
async function load(id: string) {
  const saved = cache.get(id);
  if (saved && Date.now() - saved.at < 60000) return saved.rows;
  if (pending.has(id)) return pending.get(id)!;
  const request = api.get(`/api/restaurants/${encodeURIComponent(id)}/hours`, { auth: false, cache: 'no-store' }).then(res => {
    if (!Array.isArray(res.data)) throw new Error('Invalid hours');
    cache.set(id, { rows: res.data, at: Date.now() });
    return res.data as OperatingHour[];
  }).finally(() => pending.delete(id));
  pending.set(id, request);
  return request;
}
let minute = 0;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) timer = setInterval(() => {
    const next = Math.floor(Date.now() / 60000);
    if (next !== minute) { minute = next; listeners.forEach(fn => fn()); }
  }, 1000);
  return () => { listeners.delete(listener); if (!listeners.size) { clearInterval(timer); timer = undefined; } };
}
export function useRestaurantHours(id: string) {
  const [rows, setRows] = useState<OperatingHour[] | undefined>();
  const [failed, setFailed] = useState(false);
  const tick = useSyncExternalStore(subscribe, () => minute, () => 0);
  useEffect(() => {
    let active = true;
    setRows(undefined); setFailed(false);
    const refresh = () => {
      if (document.visibilityState === 'hidden') return;
      void load(id).then(value => { if (active) { setRows(value); setFailed(false); } }).catch(() => {
        if (active) { setRows(undefined); setFailed(true); }
      });
    };
    refresh();
    const interval = setInterval(refresh, 60000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => { active = false; clearInterval(interval); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh); };
  }, [id]);
  return { rows, failed, now: tick ? new Date(tick * 60000) : new Date() };
}
