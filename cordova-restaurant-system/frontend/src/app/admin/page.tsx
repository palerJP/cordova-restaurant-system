'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get('/api/admin/analytics/overview').then((res) => setData(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-6">
        Admin Dashboard Overview
      </h1>

      {!data ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Customers" value={data.users.customers} />
            <StatCard label="Restaurant owners" value={data.users.owners} />
            <StatCard label="New users (30d)" value={data.users.new_last_30d} />
            <StatCard label="Verified restaurants" value={data.restaurants.verified} />
            <StatCard label="Pending verification" value={data.restaurants.pending} highlight />
            <StatCard label="Suspended" value={data.restaurants.suspended} />
            <StatCard label="Flagged reviews" value={data.reviews.flagged} highlight />
            <StatCard label="Visible reviews" value={data.reviews.visible} />
          </div>

          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-white mb-3">Top Cuisine Demand (30d)</h2>
            <div className="bg-white dark:bg-[#1a211c] rounded-lg border border-stone-200 dark:border-stone-800 p-5 space-y-3 shadow-sm">
              {data.topCuisineDemand.length === 0 ? (
                <p className="text-sm text-stone-500">No search data yet.</p>
              ) : (
                data.topCuisineDemand.map((c: any) => (
                  <div key={c.name} className="flex items-center gap-3">
                    <span className="w-32 text-sm font-medium text-stone-700 dark:text-stone-300 shrink-0">{c.name}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                      <div
                        className="h-full bg-cordova-green"
                        style={{ width: `${Math.min(100, (c.search_count / (data.topCuisineDemand[0]?.search_count || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-stone-500 w-10 text-right">{c.search_count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-white mb-3">Peak Search Hours (30d)</h2>
            <div className="bg-white dark:bg-[#1a211c] rounded-lg border border-stone-200 dark:border-stone-800 p-5 flex items-end gap-1.5 h-40 shadow-sm">
              {Array.from({ length: 24 }).map((_, hour) => {
                const entry = data.peakSearchHours.find((h: any) => h.hour === hour);
                const max = Math.max(...data.peakSearchHours.map((h: any) => h.searches), 1);
                const height = entry ? (entry.searches / max) * 100 : 4;
                return (
                  <div key={hour} className="flex-1 flex flex-col items-center justify-end h-full" title={`${hour}:00 — ${entry?.searches || 0} searches`}>
                    <div className="w-full bg-cordova-gold hover:bg-cordova-goldHover rounded-t transition-all" style={{ height: `${height}%` }} />
                    <span className="text-[9px] text-stone-400 mt-1">{hour}h</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`bg-white dark:bg-[#1a211c] rounded-lg p-5 border shadow-sm ${highlight ? 'border-l-4 border-l-cordova-gold border-stone-200 dark:border-stone-800' : 'border-stone-200 dark:border-stone-800'}`}>
      <p className="font-serif text-3xl font-bold text-stone-900 dark:text-white">{value}</p>
      <p className="text-xs font-medium text-stone-500 mt-1">{label}</p>
    </div>
  );
}
