'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { validateAnalytics } from '@/lib/analytics-contract';

export function useLiveAnalytics(url: string, kind: 'owner' | 'admin') {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const refresh = useCallback(() => setAttempt((n) => n + 1), []);
  useEffect(() => {
    let stopped = false;
    let busy = false;
    let controller: AbortController | null = null;
    const load = async () => {
      if (busy || document.visibilityState === 'hidden') return;
      busy = true;
      controller = new AbortController();
      try {
        const res = await api.get(url, { cache: 'no-store', signal: controller.signal });
        if (!validateAnalytics(res.data, kind)) throw new Error('Verified analytics snapshot unavailable');
        if (!stopped) { setData(res.data); setError(false); }
      } catch {
        if (!stopped) setError(true);
      } finally { busy = false; }
    };
    setData(null);
    setError(false);
    void load();
    const interval = window.setInterval(() => void load(), 5000);
    const resume = () => void load();
    window.addEventListener('focus', resume);
    window.addEventListener('online', resume);
    document.addEventListener('visibilitychange', resume);
    return () => {
      stopped = true; controller?.abort(); window.clearInterval(interval);
      window.removeEventListener('focus', resume); window.removeEventListener('online', resume);
      document.removeEventListener('visibilitychange', resume);
    };
  }, [url, kind, attempt]);
  return { data, error, refresh };
}
