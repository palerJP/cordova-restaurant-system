'use client';

import { useEffect, useState, useCallback } from 'react';
import { api, ApiClientError } from '@/lib/api';
import { useToast } from '@/lib/toast-context';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Restaurant, BusinessStatus } from '@/lib/types';

export default function BusinessVerificationPage() {
  const { toast } = useToast();
  const [status, setStatus] = useState<BusinessStatus>('pending');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState<Restaurant | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/restaurants?status=${status}&limit=50`);
      setRestaurants(res.data);
    } catch (err) {
      setRestaurants([]);
      toast(err instanceof ApiClientError ? err.message : 'Failed to load businesses', 'error');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const verify = async (id: string) => {
    try {
      await api.patch(`/api/admin/restaurants/${id}/verify`, { status: 'verified' });
      toast('Business verified', 'success');
      load();
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Failed', 'error');
    }
  };

  const reject = async () => {
    if (!rejectTarget || !rejectionReason.trim()) return;
    try {
      await api.patch(`/api/admin/restaurants/${rejectTarget.id}/verify`, { status: 'rejected', rejectionReason });
      toast('Business rejected', 'info');
      setRejectTarget(null);
      setRejectionReason('');
      load();
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Failed', 'error');
    }
  };

  return (
    <div>
      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-6">
        Business Permit & Registration Verification
      </h1>

      <div className="flex gap-2 mb-6">
        {(['pending', 'verified', 'rejected', 'suspended'] as const).map((s) => (
          <button key={s} onClick={() => setStatus(s)}>
            <Badge color={status === s ? 'brand' : 'neutral'}>{s}</Badge>
          </button>
        ))}
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : restaurants.length === 0 ? (
        <p className="text-stone-500">No businesses with status &ldquo;{status}&rdquo;.</p>
      ) : (
        <div className="space-y-3">
          {restaurants.map((r) => (
            <div key={r.id} className="bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-lg p-5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div>
                <p className="font-serif font-bold text-base text-stone-900 dark:text-white">{r.name}</p>
                <p className="text-sm text-stone-500">{r.address}</p>
                {r.business_permit_url && (
                  <a href={r.business_permit_url} target="_blank" rel="noreferrer" className="text-xs text-cordova-green hover:underline mt-1 inline-block font-semibold">
                    View permit document →
                  </a>
                )}
              </div>
              {status === 'pending' && (
                <div className="flex gap-2">
                  <Button onClick={() => verify(r.id)}>Verify</Button>
                  <Button variant="secondary" onClick={() => setRejectTarget(r)}>
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={!!rejectTarget} onClose={() => setRejectTarget(null)} title={`Reject ${rejectTarget?.name}`}>
        <div className="space-y-3">
          <Textarea
            label="Rejection reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Explain why this business is being rejected..."
          />
          <Button onClick={reject} className="w-full" disabled={!rejectionReason.trim()}>
            Confirm rejection
          </Button>
        </div>
      </Modal>
    </div>
  );
}
