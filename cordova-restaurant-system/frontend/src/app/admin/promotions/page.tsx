'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Tag,
  Search,
  Sparkles,
  Calendar,
  Trash2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Store,
  Percent,
  Copy,
  Check,
  Zap,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { api, ApiClientError } from '@/lib/api';
import { useToast } from '@/lib/toast-context';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { useDebounce } from '@/hooks/useDebounce';
import type { Promotion, SubscriptionTransaction } from '@/lib/types';

function AdminPromotionsContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialStatus = searchParams.get('status') || 'active';
  const [status, setStatus] = useState(initialStatus);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);
  const [deleteSubTarget, setDeleteSubTarget] = useState<SubscriptionTransaction | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  useEffect(() => {
    const urlStatus = searchParams.get('status') || 'active';
    if (urlStatus !== status) {
      setStatus(urlStatus);
    }
  }, [searchParams]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(text);
    toast(`Reference #${text} copied!`, 'info');
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (status === 'subscriptions') {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set('search', debouncedSearch);
        params.set('limit', '50');
        const res = await api.get(`/api/admin/subscription-transactions?${params.toString()}`);
        setSubscriptions(res.data || []);
      } else {
        const params = new URLSearchParams();
        if (status) params.set('status', status);
        if (debouncedSearch) params.set('search', debouncedSearch);
        params.set('limit', '50');
        const res = await api.get(`/api/admin/promotions?${params.toString()}`);
        setPromotions(res.data || []);
      }
    } catch (err) {
      if (status === 'subscriptions') {
        setSubscriptions([]);
      } else {
        setPromotions([]);
      }
      toast(err instanceof ApiClientError ? err.message : 'Failed to load records', 'error');
    } finally {
      setLoading(false);
    }
  }, [status, debouncedSearch, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleTabChange = (newStatus: string) => {
    setStatus(newStatus);
    router.replace(`/admin/promotions?status=${newStatus}`, { scroll: false });
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/api/admin/promotions/${id}/status`, { status: newStatus });
      toast(`Promotion marked as ${newStatus}`, 'success');
      load();
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Failed to update promotion', 'error');
    }
  };

  const updateSubscriptionStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/api/admin/subscription-transactions/${id}/status`, {
        status: newStatus,
        durationDays: 30,
      });
      toast(
        newStatus === 'verified'
          ? 'Payment verified! Subscription and 30-day ranking boost activated.'
          : newStatus === 'expired'
          ? 'Subscription marked as expired and terminated.'
          : `Subscription marked as ${newStatus}`,
        'success'
      );
      load();
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Failed to update subscription transaction', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/admin/promotions/${deleteTarget.id}`);
      toast('Promotion deleted permanently', 'info');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Failed to delete promotion', 'error');
    }
  };

  const confirmDeleteSubscription = async () => {
    if (!deleteSubTarget) return;
    try {
      await api.delete(`/api/admin/subscription-transactions/${deleteSubTarget.id}`);
      toast('Subscription record deleted and ranking boost terminated', 'info');
      setDeleteSubTarget(null);
      load();
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Failed to delete subscription', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
          Promotion & Billing Moderation
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Verify GCash / Maya transaction receipts, active dining promotions, and ranking boost subscription upgrades submitted by restaurant owners.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#1a211c] p-3 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'active', label: 'Active Deals', icon: Sparkles },
            { id: 'subscriptions', label: 'Subscription Boosts', icon: Zap },
            { id: 'all', label: 'All Promotions', icon: Tag },
            { id: 'expired', label: 'Expired / Past', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = status === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-cordova-green text-white shadow-sm'
                    : 'bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <Input
            placeholder={status === 'subscriptions' ? 'Search restaurant, tier, reference...' : 'Search deals, restaurant, reference...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-1.5 text-xs w-full"
          />
        </div>
      </div>

      {/* Subscription Boosts List */}
      {status === 'subscriptions' ? (
        loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="spatial-card bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-3xl p-12 text-center text-stone-500">
            <Zap className="mx-auto text-amber-500 mb-3" size={40} />
            <p className="font-serif font-bold text-base text-stone-800 dark:text-stone-200">
              No subscription boost transactions found
            </p>
            <p className="text-xs text-stone-400 mt-1">
              When restaurant owners upgrade their ranking tier via GCash or Maya, transactions will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {subscriptions.map((tx) => {
              const isGcash = (tx.payment_method || '').toLowerCase() === 'gcash';
              const isPending = tx.status === 'pending_verification' || tx.status === 'pending';
              const isVerified = tx.status === 'verified';
              const isRejected = tx.status === 'rejected';
              const daysLeft = tx.expires_at
                ? Math.max(0, Math.ceil((new Date(tx.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                : null;

              return (
                <div
                  key={tx.id}
                  className={`spatial-card bg-white dark:bg-[#1a211c] border rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4 transition-all hover:shadow-spatial-sm ${
                    isPending
                      ? 'border-amber-400/60 dark:border-amber-500/40 ring-2 ring-amber-400/20'
                      : 'border-stone-200 dark:border-stone-800'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-cordova-green dark:text-emerald-400 font-bold truncate">
                          <Store size={14} className="shrink-0" />
                          <span>{tx.restaurant_name || 'Partner Restaurant'}</span>
                        </div>
                        <h2 className="font-serif font-bold text-lg text-stone-900 dark:text-white capitalize mt-0.5">
                          {tx.tier} Ranking Boost
                        </h2>
                      </div>
                      <Badge color={tx.tier === 'featured' ? 'warning' : tx.tier === 'premium' ? 'success' : 'brand'}>
                        {tx.price}
                      </Badge>
                    </div>

                    {/* Payment Receipt / Reference Verification Box */}
                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold text-white ${
                              isGcash ? 'bg-[#007DFE]' : 'bg-[#00D665] text-stone-900'
                            }`}
                          >
                            {isGcash ? 'GCash' : 'Maya'}
                          </span>
                          <span className="text-stone-400 text-[11px]">Payment Channel</span>
                        </div>

                        {isPending ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30 animate-pulse">
                            <Clock size={12} /> Pending Verification
                          </span>
                        ) : isVerified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <ShieldCheck size={12} /> Verified & Active
                          </span>
                        ) : isRejected ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                            Rejected
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-stone-400">{tx.status}</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 dark:border-stone-800">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-stone-800 dark:text-stone-200">
                          <CreditCard size={13} className="text-stone-400" />
                          <span>Ref: {tx.payment_reference || 'N/A'}</span>
                        </div>
                        {tx.payment_reference && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(tx.payment_reference)}
                            className="text-stone-400 hover:text-cordova-green transition-colors p-1"
                            title="Copy Reference Number"
                          >
                            {copiedRef === tx.payment_reference ? (
                              <Check size={14} className="text-emerald-500" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] text-stone-400 flex items-center gap-1">
                        <Clock size={12} /> Submitted: {new Date(tx.created_at).toLocaleString()}
                      </p>
                      {tx.expires_at && isVerified && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                          <Calendar size={12} /> Expiration: {new Date(tx.expires_at).toLocaleDateString()} ({daysLeft} days remaining)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800/80">
                    {tx.restaurant_slug ? (
                      <Link href={`/restaurants/${tx.restaurant_slug}`} target="_blank">
                        <Button variant="secondary" size="sm" className="text-xs">
                          <ExternalLink size={12} className="mr-1" /> View Venue
                        </Button>
                      </Link>
                    ) : (
                      <span />
                    )}

                    <div className="flex items-center gap-2">
                      {isPending ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateSubscriptionStatus(tx.id, 'verified')}
                            className="bg-cordova-green hover:bg-cordova-greenHover text-white text-xs font-bold shadow-sm"
                          >
                            <CheckCircle2 size={13} className="mr-1" /> Confirm & Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => updateSubscriptionStatus(tx.id, 'rejected')}
                            className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          >
                            Reject
                          </Button>
                        </>
                      ) : isVerified ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => updateSubscriptionStatus(tx.id, 'expired')}
                          className="text-xs text-amber-600 dark:text-amber-400"
                        >
                          Mark Expired
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => updateSubscriptionStatus(tx.id, 'verified')}
                          className="bg-cordova-green hover:bg-cordova-greenHover text-white text-xs font-bold"
                        >
                          <CheckCircle2 size={12} className="mr-1" /> Reactivate
                        </Button>
                      )}

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setDeleteSubTarget(tx)}
                        className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        title="Delete Subscription Record"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Promotions List */
        loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        ) : promotions.length === 0 ? (
          <div className="spatial-card bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-3xl p-12 text-center text-stone-500">
            <Percent className="mx-auto text-amber-500 mb-3" size={40} />
            <p className="font-serif font-bold text-base text-stone-800 dark:text-stone-200">
              No promotions found under &ldquo;{status}&rdquo;
            </p>
            <p className="text-xs text-stone-400 mt-1">
              Try choosing a different status filter or clearing your search term.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {promotions.map((p) => {
              const isExpired = new Date(p.end_date) < new Date();
              const isActive = p.status === 'active' && !isExpired;
              const isGcash = (p.payment_method || '').toLowerCase() === 'gcash';

              return (
                <div
                  key={p.id}
                  className="spatial-card bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4 transition-all hover:shadow-spatial-sm"
                >
                  <div className="space-y-3">
                    <div className="flex gap-4">
                      {/* Promo Image */}
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 shrink-0">
                        {p.image_url ? (
                          <Image
                            src={p.image_url}
                            alt={p.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 p-2 text-center">
                            <Tag size={20} className="mb-1 text-amber-500" />
                            <span className="text-[10px] font-bold">Special Promo</span>
                          </div>
                        )}
                        {p.discount_label && (
                          <div className="absolute top-1.5 left-1.5 bg-cordova-gold text-stone-900 text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-sm">
                            {p.discount_label}
                          </div>
                        )}
                      </div>

                      {/* Promo Details */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="font-serif font-bold text-base text-stone-900 dark:text-white truncate">
                            {p.title}
                          </h2>
                          <Badge color={isActive ? 'success' : isExpired ? 'neutral' : 'warning'}>
                            {isActive ? 'Active' : isExpired ? 'Expired' : p.status}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-cordova-green dark:text-emerald-400 font-semibold truncate">
                          <Store size={13} className="shrink-0" />
                          <span>{p.restaurant_name || 'Partner Restaurant'}</span>
                        </div>

                        {p.description && (
                          <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2">
                            {p.description}
                          </p>
                        )}

                        <div className="flex items-center gap-1.5 text-[11px] text-stone-400 pt-1">
                          <Calendar size={12} />
                          <span>
                            {new Date(p.start_date).toLocaleDateString()} – {new Date(p.end_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Receipt / Reference Verification Box */}
                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold text-white ${
                              isGcash ? 'bg-[#007DFE]' : 'bg-[#00D665] text-stone-900'
                            }`}
                          >
                            {p.payment_method ? (isGcash ? 'GCash' : 'Maya') : 'GCash'}
                          </span>
                          <span className="text-stone-400 text-[11px]">Payment Channel</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <ShieldCheck size={12} /> {p.payment_status || 'Verified'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 dark:border-stone-800">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-stone-800 dark:text-stone-200">
                          <CreditCard size={13} className="text-stone-400" />
                          <span>Ref: {p.payment_reference || 'N/A (Standard)'}</span>
                        </div>
                        {p.payment_reference && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(p.payment_reference!)}
                            className="text-stone-400 hover:text-cordova-green transition-colors p-1"
                            title="Copy Reference Number"
                          >
                            {copiedRef === p.payment_reference ? (
                              <Check size={14} className="text-emerald-500" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800/80">
                    {p.restaurant_slug ? (
                      <Link href={`/restaurants/${p.restaurant_slug}`} target="_blank">
                        <Button variant="secondary" size="sm" className="text-xs">
                          <ExternalLink size={12} className="mr-1" /> Venue Profile
                        </Button>
                      </Link>
                    ) : (
                      <span />
                    )}

                    <div className="flex items-center gap-2">
                      {p.status === 'active' ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => updateStatus(p.id, 'expired')}
                          className="text-xs text-amber-600 dark:text-amber-400"
                        >
                          Mark Expired
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => updateStatus(p.id, 'active')}
                          className="bg-cordova-green hover:bg-cordova-greenHover text-white text-xs font-bold"
                        >
                          <CheckCircle2 size={12} className="mr-1" /> Reactivate
                        </Button>
                      )}

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setDeleteTarget(p)}
                        className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        title="Delete Promotion"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Delete Promotion Confirmation Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Promotion">
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
            Are you sure you want to permanently delete the promotion &ldquo;
            <span className="font-bold text-stone-900 dark:text-white">{deleteTarget?.title}</span>&rdquo;? This cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Terminate & Delete Subscription Confirmation Modal */}
      <Modal open={!!deleteSubTarget} onClose={() => setDeleteSubTarget(null)} title="Terminate & Delete Subscription">
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
            Are you sure you want to permanently delete the subscription record for &ldquo;
            <span className="font-bold text-stone-900 dark:text-white">{deleteSubTarget?.restaurant_name}</span>&rdquo; ({deleteSubTarget?.tier?.toUpperCase()} Boost)? This will terminate the ranking boost and revert the establishment to the free plan.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setDeleteSubTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteSubscription}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
            >
              Confirm Terminate & Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function AdminPromotionsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <AdminPromotionsContent />
    </Suspense>
  );
}
