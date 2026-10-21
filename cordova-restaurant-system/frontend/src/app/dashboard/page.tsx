'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { RequireRole } from '@/components/RequireRole';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { RestaurantGridSkeleton } from '@/components/ui/Skeleton';
import { Utensils, CheckCircle2, Trash2 } from 'lucide-react';
import type { Restaurant, BusinessStatus } from '@/lib/types';
import { LiveReviewSummary } from '@/components/LiveReviewSummary';

const STATUS_COLOR: Record<BusinessStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  verified: 'success',
  pending: 'warning',
  rejected: 'danger',
  suspended: 'danger',
};

export default function DashboardPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRejected, setShowRejected] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Restaurant | null>(null);
  const [confirmationName, setConfirmationName] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [notice, setNotice] = useState('');
  const rejectedCount = restaurants.filter((r) => r.status === 'rejected').length;
  const visibleRestaurants = restaurants.filter((r) => showRejected ? r.status === 'rejected' : r.status !== 'rejected');
  const deleteEstablishment = async () => {
    if (!deleteTarget || deleting || confirmationName.trim() !== deleteTarget.name.trim()) return;
    setDeleting(true); setDeleteError('');
    try {
      await api.delete(`/api/restaurants/${deleteTarget.id}`, { body: JSON.stringify({ confirmationName }) });
      setRestaurants((current) => current.filter((r) => r.id !== deleteTarget.id));
      setNotice(`${deleteTarget.name} was deleted.`); setDeleteTarget(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Could not delete this establishment. Please try again.');
    } finally { setDeleting(false); }
  };

  useEffect(() => {
    api
      .get('/api/restaurants/mine')
      .then((res) => setRestaurants(res.data))
      .catch(() => setRestaurants([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <RequireRole roles={['owner', 'admin', 'customer']}>
      <div className="page-container py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4 pb-4 border-b border-stone-200/80 dark:border-stone-800/80">
          <div>
            <h1 className="font-serif text-3xl font-bold text-stone-900 dark:text-white">
              Restaurant Owner Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
              Manage your establishment profile, menu items, operating hours, and promotions.
            </p>
          </div>
          <Link href="/dashboard/new">
            <Button className="bg-cta-500 hover:bg-cta-600 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-spatial-sm hover:shadow-card-hover transition-all active:scale-95 border border-white/20">
              + Register New Establishment
            </Button>
          </Link>
        </div>

        <div className="mb-6 rounded-xl border border-stone-200 p-4 dark:border-stone-700">
          <p className="font-semibold text-stone-900 dark:text-white">Already listed on CordovaEats?</p>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">Find your establishment on <Link href="/search" className="underline">Browse restaurants</Link> and claim it instead of creating a duplicate.</p>
          <Link href="/dashboard/claims" className="mt-2 inline-block text-sm font-semibold text-cordova-green underline">My business claims and notifications</Link>
        </div>
        {notice && <p role="status" className="mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950 p-3 text-sm text-emerald-800 dark:text-emerald-200">{notice}</p>}
        {!loading && restaurants.length > 0 && <div className="flex flex-wrap gap-2 mb-5" role="group" aria-label="Filter establishments">
          <button aria-pressed={!showRejected} onClick={() => setShowRejected(false)} className={`rounded-full px-4 py-2 text-sm font-semibold ${!showRejected ? 'bg-cordova-green text-white' : 'bg-stone-100 dark:bg-stone-800'}`}>My establishments ({restaurants.length - rejectedCount})</button>
          <button aria-pressed={showRejected} onClick={() => setShowRejected(true)} className={`rounded-full px-4 py-2 text-sm font-semibold ${showRejected ? 'bg-cordova-green text-white' : 'bg-stone-100 dark:bg-stone-800'}`}>Rejected ({rejectedCount})</button>
        </div>}
        {loading ? (
          <RestaurantGridSkeleton count={3} />
        ) : restaurants.length === 0 ? (
          <div className="spatial-card p-12 text-center rounded-3xl bg-white/80 dark:bg-[#1a211c]/90 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800/80 shadow-spatial-md max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-3xl mx-auto mb-4 border border-amber-500/20">
              🏪
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-white mb-2">
              No Registered Establishments Yet
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mb-6 max-w-xs mx-auto">
              Join CordovaEats to showcase your authentic cuisine, manage your digital menu, and reach local diners.
            </p>
            <Link href="/dashboard/new">
              <Button className="bg-cordova-green hover:bg-cordova-greenHover text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow transition-all hover:scale-105 active:scale-95">
                Register Your Restaurant Now
              </Button>
            </Link>
          </div>
        ) : (
          <div className="restaurant-grid">
            {visibleRestaurants.length === 0 && <p className="text-sm text-stone-500 p-4">{showRejected ? 'No rejected establishments.' : 'No active or pending establishments. Check Rejected to review earlier submissions.'}</p>}
            {visibleRestaurants.map((r) => {
              const isVerified = r.status === 'verified';
              const isPending = r.status === 'pending';

              return (
                <div
                  key={r.id}
                  className="spatial-card p-6 rounded-2xl bg-white/80 dark:bg-[#1a211c]/90 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800/80 shadow-spatial-sm hover:shadow-spatial-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <Link
                        href={`/dashboard/${r.id}`}
                        className="font-serif font-bold text-base text-stone-900 dark:text-white hover:text-cordova-green dark:group-hover:text-emerald-400 transition-colors"
                      >
                        {r.name}
                      </Link>
                      <div className="flex items-center gap-2"><Badge color={STATUS_COLOR[r.status]}>{r.status}</Badge><button type="button" aria-label={`Delete ${r.name}`} title="Delete establishment" onClick={() => {setDeleteTarget(r);setConfirmationName('');setDeleteError('');}} className="rounded-lg p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600"><Trash2 size={16} /></button></div>
                    </div>

                    <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2">{r.address}</p>

                    {r.status === 'rejected' && r.rejection_reason && (
                      <details className="text-xs mt-3 rounded-xl border border-red-200 dark:border-red-900 p-3"><summary className="cursor-pointer font-medium text-red-700 dark:text-red-300">Why was this rejected?</summary><p className="mt-2 text-stone-600 dark:text-stone-300 whitespace-pre-wrap break-words">{r.rejection_reason}</p></details>
                    )}

                    {isPending && (
                      <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
                        <p className="font-semibold flex items-center gap-1.5">
                          <span>⏳</span> Under municipal admin verification
                        </p>
                        <p className="text-[11px] text-amber-600/90 dark:text-amber-400/90 mt-1 leading-relaxed">
                          You can prepare your menu items & photos now. They will go live publicly once verified.
                        </p>
                      </div>
                    )}

                    {isVerified && (
                      <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
                        <CheckCircle2 size={15} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-medium text-[11px]">Verified & live on CordovaEats</span>
                      </div>
                    )}

                    {isVerified && (
                      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/60 text-xs text-stone-500 dark:text-stone-400 font-medium">
                        <span>Open Analytics for live activity totals</span>
                        <LiveReviewSummary slug={r.slug || r.id} count={r.review_count} rating={r.avg_rating} />
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/60">
                    <div className="grid grid-cols-2 gap-2">
                      {r.status !== 'rejected' && <Link
                        href={`/dashboard/${r.id}?tab=menu`}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-cordova-green hover:bg-cordova-greenHover text-white font-bold text-xs shadow-sm transition-all text-center hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Utensils size={13} />
                        + Add Menu
                      </Link>}
                      <Link
                        href={`/dashboard/${r.id}`}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-xs transition-all text-center"
                      >
                        {isVerified ? 'Manage' : 'Details'}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add Another Business Card */}
            <Link
              href="/dashboard/new"
              className="spatial-card p-6 rounded-2xl bg-white/40 dark:bg-white/[0.02] border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-cordova-green dark:hover:border-emerald-400 hover:bg-stone-50/80 dark:hover:bg-white/5 transition-all duration-300 flex flex-col items-center justify-center text-center group min-h-[220px] shadow-sm hover:shadow-md cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform border border-emerald-500/20">
                +
              </div>
              <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-white group-hover:text-cordova-green dark:group-hover:text-emerald-400 transition-colors">
                + Register Another Business
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-[200px]">
                Click to register and showcase another establishment on CordovaEats.
              </p>
            </Link>
          </div>
        )}
      </div>
      <Modal open={Boolean(deleteTarget)} onClose={() => {if (!deleting) setDeleteTarget(null);}} title="Delete establishment?">
        <p className="text-sm text-stone-600 dark:text-stone-300">This permanently deletes <strong>{deleteTarget?.name}</strong>, including its menu, reviews, photos, promotions, and reservation history stored with the listing. This cannot be undone.</p>
        <p className="mt-3 text-sm text-stone-500">Resolve upcoming reservations first. Protected ownership records may require administrator assistance.</p>
        <label htmlFor="delete-establishment-name" className="block text-sm font-medium mt-5">Type “{deleteTarget?.name}” to confirm</label>
        <input id="delete-establishment-name" className="input mt-2 w-full" autoComplete="off" value={confirmationName} disabled={deleting} onChange={(event) => setConfirmationName(event.target.value)} />
        {deleteError && <p role="alert" className="text-sm text-red-600 mt-3">{deleteError}</p>}
        <div className="flex flex-wrap justify-end gap-2 mt-6"><Button variant="secondary" disabled={deleting} onClick={() => setDeleteTarget(null)}>Keep establishment</Button><Button variant="secondary" className="text-red-700 border-red-300 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950" loading={deleting} disabled={confirmationName.trim() !== deleteTarget?.name.trim()} onClick={deleteEstablishment}>Delete permanently</Button></div>
      </Modal>
    </RequireRole>
  );
}
