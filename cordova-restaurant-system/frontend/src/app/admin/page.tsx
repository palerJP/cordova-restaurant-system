'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { RequireRole } from '@/components/RequireRole';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get('/api/admin/analytics/overview').then((res) => setData(res.data)).catch(() => {});
  }, []);

  return (
    <RequireRole roles={['admin']}>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <nav className="flex flex-wrap gap-2 mb-8">
        <AdminNavLink href="/admin" label="Overview" />
        <AdminNavLink href="/admin/businesses" label="Business Verification" />
        <AdminNavLink href="/admin/reviews" label="Review Moderation" />
        <AdminNavLink href="/admin/users" label="Users" />
        <AdminNavLink href="/admin/ai-model" label="AI Model Tuning" />
      </nav>

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
            <h2 className="text-lg font-semibold mb-3">Top Cuisine Demand (30d)</h2>
            <div className="card p-4 space-y-2">
              {data.topCuisineDemand.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">No search data yet.</p>
              ) : (
                data.topCuisineDemand.map((c: any) => (
                  <div key={c.name} className="flex items-center gap-3">
                    <span className="w-32 text-sm shrink-0">{c.name}</span>
                    <div className="flex-1 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-brand-500"
                        style={{ width: `${Math.min(100, (c.search_count / (data.topCuisineDemand[0]?.search_count || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-[var(--text-muted)] w-10 text-right">{c.search_count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Peak Search Hours (30d)</h2>
            <div className="card p-4 flex items-end gap-1 h-32">
              {Array.from({ length: 24 }).map((_, hour) => {
                const entry = data.peakSearchHours.find((h: any) => h.hour === hour);
                const max = Math.max(...data.peakSearchHours.map((h: any) => h.searches), 1);
                const height = entry ? (entry.searches / max) * 100 : 2;
                return (
                  <div key={hour} className="flex-1 flex flex-col items-center justify-end h-full" title={`${hour}:00 — ${entry?.searches || 0} searches`}>
                    <div className="w-full bg-brand-400 rounded-t" style={{ height: `${height}%` }} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </RequireRole>
  );
}

function AdminNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-black/5 dark:bg-white/10 hover:bg-brand-500/10 hover:text-brand-600">
      {label}
    </Link>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`card p-4 ${highlight ? 'border-l-4 border-l-brand-500' : ''}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-[var(--text-muted)] mt-1">{label}</p>
    </div>
  );
}
