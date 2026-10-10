'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Clock,
  Ban,
  XCircle,
  ExternalLink,
  Search,
  FileText,
  Building,
  Phone,
  Mail,
  MapPin,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { api, ApiClientError } from '@/lib/api';
import PermitDownload from '@/components/PermitDownload';
import { useToast } from '@/lib/toast-context';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Restaurant, BusinessStatus } from '@/lib/types';

function BusinessVerificationContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialStatus = (searchParams.get('status') as BusinessStatus) || 'pending';
  const [status, setStatus] = useState<BusinessStatus>(initialStatus);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectTarget, setRejectTarget] = useState<Restaurant | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Restaurant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync state if URL search param changes
  useEffect(() => {
    const urlStatus = searchParams.get('status') as BusinessStatus;
    setStatus(urlStatus || 'pending');
  }, [searchParams]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/restaurants?status=${status}&limit=100`);
      setRestaurants(res.data || []);
    } catch (err) {
      setRestaurants([]);
      toast(err instanceof ApiClientError ? err.message : 'Failed to load businesses', 'error');
    } finally {
      setLoading(false);
    }
  }, [status, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleTabChange = (newStatus: BusinessStatus) => {
    setStatus(newStatus);
    router.replace(`/admin/businesses?status=${newStatus}`, { scroll: false });
  };

  const verify = async (id: string) => {
    try {
      await api.patch(`/api/admin/restaurants/${id}/verify`, { status: 'verified' });
      toast('Business successfully verified and activated', 'success');
      load();
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Failed to verify business', 'error');
    }
  };

  const suspend = async (id: string) => {
    try {
      await api.patch(`/api/admin/restaurants/${id}/suspend`);
      toast('Business has been suspended', 'info');
      load();
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Failed to suspend business', 'error');
    }
  };

  const reject = async () => {
    if (!rejectTarget || !rejectionReason.trim()) return;
    try {
      await api.patch(`/api/admin/restaurants/${rejectTarget.id}/verify`, { status: 'rejected', rejectionReason });
      toast('Business application rejected', 'info');
      setRejectTarget(null);
      setRejectionReason('');
      load();
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Failed to reject business', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/admin/restaurants/${deleteTarget.id}`);
      toast(`Establishment "${deleteTarget.name}" has been permanently removed`, 'success');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Failed to delete establishment', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredRestaurants = restaurants.filter((r) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      r.name?.toLowerCase().includes(q) ||
      r.address?.toLowerCase().includes(q) ||
      r.barangay?.toLowerCase().includes(q) ||
      r.phone?.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'verified':
        return <Badge color="success">Verified</Badge>;
      case 'pending':
        return <Badge color="warning">Pending Verification</Badge>;
      case 'suspended':
        return <Badge color="danger">Suspended</Badge>;
      case 'rejected':
        return <Badge color="neutral">Rejected</Badge>;
      default:
        return <Badge>{s}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
            Business Permit & Registration Verification
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Review business registration submissions, verify permits, and govern active municipal establishments.
          </p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-[#1a211c] p-3 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'pending', label: 'Pending', icon: Clock },
            { id: 'verified', label: 'Verified', icon: ShieldCheck },
            { id: 'suspended', label: 'Suspended', icon: Ban },
            { id: 'rejected', label: 'Rejected', icon: XCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = status === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as BusinessStatus)}
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

        {/* Search Bar */}
        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Filter by name, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 focus:outline-none focus:ring-2 focus:ring-cordova-green/50 text-stone-900 dark:text-white"
          />
        </div>
      </div>

      {/* Content State */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : filteredRestaurants.length === 0 ? (
        <div className="spatial-card bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-3xl p-12 text-center text-stone-500">
          <Building className="mx-auto text-stone-300 dark:text-stone-700 mb-3" size={40} />
          <p className="font-serif font-bold text-base text-stone-800 dark:text-stone-200">
            No businesses found with status &ldquo;{status}&rdquo;
          </p>
          <p className="text-xs text-stone-400 mt-1">
            Try choosing a different status filter above or clearing your search term.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRestaurants.map((r) => (
            <div
              key={r.id}
              className="spatial-card bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all hover:shadow-spatial-sm"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="font-serif font-bold text-lg text-stone-900 dark:text-white">
                    {r.name}
                  </h2>
                  {getStatusBadge(r.status)}
                  {r.category && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                      {r.category}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-stone-400" />
                    <span>{r.address}{r.barangay ? `, Brgy. ${r.barangay}` : ''}</span>
                  </div>
                  {r.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone size={13} className="text-stone-400" />
                      <span>{r.phone}</span>
                    </div>
                  )}
                  {r.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail size={13} className="text-stone-400" />
                      <span>{r.email}</span>
                    </div>
                  )}
                </div>

                {/* Permit document */}
                {r.business_permit_url ? (
                  <div className="pt-1">
                    <PermitDownload url={r.business_permit_url} />
                  </div>
                ) : (
                  <p className="text-[11px] text-stone-400 italic">No business permit document attached.</p>
                )}

                {r.rejection_reason && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
                    <span className="font-bold">Rejection note:</span> {r.rejection_reason}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-stone-100 dark:border-stone-800">
                {r.slug && (
                  <Link href={`/restaurants/${r.slug}`} target="_blank">
                    <Button variant="secondary" size="sm" className="text-xs">
                      <ExternalLink size={13} className="mr-1" /> Public Page
                    </Button>
                  </Link>
                )}

                {status === 'pending' && (
                  <>
                    <Button
                      onClick={() => verify(r.id)}
                      size="sm"
                      className="bg-cordova-green hover:bg-cordova-greenHover text-white text-xs font-bold"
                    >
                      Approve & Verify
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setRejectTarget(r)}
                      className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      Reject
                    </Button>
                  </>
                )}

                {status === 'verified' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => suspend(r.id)}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <Ban size={13} className="mr-1" /> Suspend
                  </Button>
                )}

                {status === 'suspended' && (
                  <>
                    <Button
                      onClick={() => verify(r.id)}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                    >
                      Reactivate & Verify
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setDeleteTarget(r)}
                      className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900/40"
                    >
                      <Trash2 size={13} className="mr-1" /> Remove Establishment
                    </Button>
                  </>
                )}

                {status === 'rejected' && (
                  <>
                    <Button
                      onClick={() => verify(r.id)}
                      size="sm"
                      className="bg-cordova-green hover:bg-cordova-greenHover text-white text-xs font-bold"
                    >
                      Re-evaluate & Approve
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setDeleteTarget(r)}
                      className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900/40"
                    >
                      <Trash2 size={13} className="mr-1" /> Remove Establishment
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      <Modal open={!!rejectTarget} onClose={() => setRejectTarget(null)} title={`Reject ${rejectTarget?.name}`}>
        <div className="space-y-4">
          <p className="text-xs text-stone-500">
            Please provide a specific reason for rejection. This feedback will help the business owner resolve any permit or compliance issues.
          </p>
          <Textarea
            label="Rejection reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. Expired Mayor's Permit, Unclear business address, mismatch in establishment details..."
            rows={4}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={reject}
              disabled={!rejectionReason.trim()}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Establishment Confirmation Modal */}
      <Modal open={!!deleteTarget} onClose={() => !isDeleting && setDeleteTarget(null)} title="Remove Establishment">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-200">
            <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={18} />
            <div className="text-xs space-y-1">
              <p className="font-bold">Permanent Removal Confirmation</p>
              <p>
                Are you sure you want to permanently remove <strong className="font-semibold text-rose-900 dark:text-rose-100">{deleteTarget?.name}</strong> from establishments?
              </p>
              <p className="text-rose-600 dark:text-rose-400">
                This will immediately delete the establishment and all associated menus, reviews, photos, and promotions. This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
            >
              <Trash2 size={13} className="mr-1" /> {isDeleting ? 'Removing...' : 'Confirm Permanent Removal'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function BusinessVerificationPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <BusinessVerificationContent />
    </Suspense>
  );
}
