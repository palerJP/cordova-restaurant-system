'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Store,
  UserPlus,
  ShieldCheck,
  Clock,
  Ban,
  Flag,
  CheckCircle,
  Tag,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);
  const load = useCallback(() => {
    setError(false);
    api.get('/api/admin/analytics/overview').then((res) => setData(res.data)).catch(() => setError(true));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
          Overview
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Municipality of Cordova
        </p>
      </div>

      {error ? (
        <div role="alert" className="border-l-4 border-red-500 bg-red-50 dark:bg-red-950/30 p-4">
          <p className="text-sm font-semibold">Overview data could not be loaded.</p>
          <button onClick={load} className="mt-2 text-sm underline font-medium">Try again</button>
        </div>
      ) : !data ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Interactive Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Users */}
            <StatCard
              href="/admin/users?role=customer"
              label="Customers"
              value={data.users?.customers ?? 0}
              icon={Users}
              colorClass="text-sky-500 bg-sky-500/10 border-sky-500/20"
            />
            <StatCard
              href="/admin/users?role=owner"
              label="Restaurant owners"
              value={data.users?.owners ?? 0}
              icon={Store}
              colorClass="text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
            />
            <StatCard
              href="/admin/users"
              label="New users (30d)"
              value={data.users?.new_last_30d ?? 0}
              icon={UserPlus}
              colorClass="text-indigo-500 bg-indigo-500/10 border-indigo-500/20"
            />

            {/* Restaurants */}
            <StatCard
              href="/admin/businesses?status=verified"
              label="Verified restaurants"
              value={data.restaurants?.verified ?? 0}
              icon={ShieldCheck}
              colorClass="text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
            />
            <StatCard
              href="/admin/businesses?status=pending"
              label="Pending verification"
              value={data.restaurants?.pending ?? 0}
              icon={Clock}
              colorClass="text-amber-500 bg-amber-500/10 border-amber-500/20"
              highlight={Number(data.restaurants?.pending || 0) > 0}
              badgeText={Number(data.restaurants?.pending || 0) > 0 ? 'Needs Action' : undefined}
            />
            <StatCard
              href="/admin/businesses?status=suspended"
              label="Suspended"
              value={data.restaurants?.suspended ?? 0}
              icon={Ban}
              colorClass="text-rose-500 bg-rose-500/10 border-rose-500/20"
            />

            {/* Reviews */}
            <StatCard
              href="/admin/reviews?status=flagged"
              label="Flagged reviews"
              value={data.reviews?.flagged ?? 0}
              icon={Flag}
              colorClass="text-rose-500 bg-rose-500/10 border-rose-500/20"
              highlight={Number(data.reviews?.flagged || 0) > 0}
              badgeText={Number(data.reviews?.flagged || 0) > 0 ? 'Review Now' : undefined}
            />
            <StatCard
              href="/admin/reviews?status=visible"
              label="Visible reviews"
              value={data.reviews?.visible ?? 0}
              icon={CheckCircle}
              colorClass="text-teal-500 bg-teal-500/10 border-teal-500/20"
            />

            {/* Promotions */}
            <StatCard
              href="/admin/promotions?status=active"
              label="Active promotions"
              value={data.promotions?.active ?? 0}
              icon={Sparkles}
              colorClass="text-amber-500 bg-amber-500/10 border-amber-500/20"
            />
            <StatCard
              href="/admin/promotions"
              label="Total promotions"
              value={data.promotions?.total ?? 0}
              icon={Tag}
              colorClass="text-purple-500 bg-purple-500/10 border-purple-500/20"
            />
          </div>

          {/* Demand & Search Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Cuisine Demand */}
            <div className="spatial-card bg-white dark:bg-[#1a211c] rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-white">
                  Top Cuisine Demand (30d)
                </h2>
                <span className="text-xs text-stone-500 font-mono">Diner Taste Preferences</span>
              </div>
              <div className="space-y-3">
                {(!data.topCuisineDemand || data.topCuisineDemand.length === 0) ? (
                  <p className="text-sm text-stone-500">No search logs recorded yet.</p>
                ) : (
                  data.topCuisineDemand.map((c: any) => (
                    <div key={c.name} className="flex items-center gap-3">
                      <span className="w-32 text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 shrink-0 truncate">
                        {c.name}
                      </span>
                      <div className="flex-1 h-2.5 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                        <div
                          className="h-full bg-cordova-green rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              100,
                              (c.search_count / (data.topCuisineDemand[0]?.search_count || 1)) * 100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-stone-500 w-10 text-right">{c.search_count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Peak Search Hours */}
            <div className="spatial-card bg-white dark:bg-[#1a211c] rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-white">
                  Peak Search Hours (30d)
                </h2>
                <span className="text-xs text-stone-500 font-mono">24h Distribution</span>
              </div>
              <div className="flex items-end gap-1.5 h-44 pt-4">
                {Array.from({ length: 24 }).map((_, hour) => {
                  const entry = data.peakSearchHours?.find((h: any) => h.hour === hour);
                  const max = Math.max(...(data.peakSearchHours?.map((h: any) => h.searches) || [1]), 1);
                  const height = entry ? Math.max((entry.searches / max) * 100, 6) : 4;
                  return (
                    <div
                      key={hour}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative"
                      title={`${hour}:00 — ${entry?.searches || 0} searches`}
                    >
                      <div
                        className="w-full bg-cordova-gold/80 group-hover:bg-cordova-gold rounded-t transition-all"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-[8px] text-stone-400 mt-1">{hour}h</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  href: string;
  label: string;
  value: number | string;
  icon: any;
  colorClass?: string;
  highlight?: boolean;
  badgeText?: string;
}

function StatCard({ href, label, value, icon: Icon, colorClass, highlight, badgeText }: StatCardProps) {
  return (
    <Link
      href={href}
      className={`group relative bg-white dark:bg-[#1a211c] rounded-2xl p-5 border transition-all duration-200 hover:shadow-spatial-sm hover:-translate-y-1 block ${
        highlight
          ? 'border-amber-500/60 dark:border-amber-500/60 ring-2 ring-amber-500/20'
          : 'border-stone-200/80 dark:border-stone-800/80 hover:border-cordova-green/50'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${colorClass || 'text-stone-500 bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700'}`}>
          <Icon size={18} />
        </div>
        <div className="flex items-center gap-1">
          {badgeText && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
              {badgeText}
            </span>
          )}
          <ArrowUpRight
            size={16}
            className="text-stone-400 group-hover:text-cordova-green dark:group-hover:text-emerald-400 transition-colors transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </div>
      </div>

      <p className="font-serif text-3xl font-bold text-stone-900 dark:text-white tracking-tight">
        {value}
      </p>
      <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 mt-1 group-hover:text-stone-800 dark:group-hover:text-stone-200 transition-colors">
        {label}
      </p>
    </Link>
  );
}
