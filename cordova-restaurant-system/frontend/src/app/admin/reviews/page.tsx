'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Flag,
  CheckCircle,
  Trash2,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { api, ApiClientError } from '@/lib/api';
import { useToast } from '@/lib/toast-context';
import { StarRating, Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

function ReviewModerationContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialStatus = searchParams.get('status') || 'flagged';
  const [status, setStatus] = useState(initialStatus);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlStatus = searchParams.get('status') || 'flagged';
    setStatus(urlStatus);
  }, [searchParams]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/reviews?status=${status}&limit=50`);
      setReviews(res.data || []);
    } catch (err) {
      setReviews([]);
      toast(err instanceof ApiClientError ? err.message : 'Failed to load reviews', 'error');
    } finally {
      setLoading(false);
    }
  }, [status, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleTabChange = (newStatus: string) => {
    setStatus(newStatus);
    router.replace(`/admin/reviews?status=${newStatus}`, { scroll: false });
  };

  const moderate = async (id: string, newStatus: 'visible' | 'removed' | 'flagged') => {
    try {
      await api.patch(`/api/admin/reviews/${id}/moderate`, { status: newStatus });
      toast(
        newStatus === 'visible'
          ? 'Review restored and published'
          : newStatus === 'removed'
          ? 'Review removed'
          : 'Review marked as flagged',
        'success'
      );
      load();
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Failed to moderate review', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
          Content & Review Moderation
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Review community diner feedback, inspect flagged reports, and safeguard rating integrity.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white dark:bg-[#1a211c] p-3 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
        {[
          { id: 'flagged', label: 'Flagged Reviews', icon: Flag },
          { id: 'visible', label: 'Visible Reviews', icon: CheckCircle },
          { id: 'removed', label: 'Removed / Hidden', icon: Trash2 },
          { id: 'all', label: 'All Reviews', icon: MessageSquare },
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

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="spatial-card bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-3xl p-12 text-center text-stone-500">
          <Sparkles className="mx-auto text-amber-500 mb-3" size={36} />
          <p className="font-serif font-bold text-base text-stone-800 dark:text-stone-200">
            No reviews found with status &ldquo;{status}&rdquo;
          </p>
          <p className="text-xs text-stone-400 mt-1">
            All reviews in this category have been processed or none have been submitted yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="spatial-card bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4 transition-all hover:shadow-spatial-sm"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-stone-900 dark:text-white text-sm">
                        {r.reviewer_name || 'Anonymous Diner'}
                      </span>
                      <span className="text-stone-400 text-xs">reviewed</span>
                      <span className="font-serif font-bold text-cordova-green dark:text-emerald-400 text-sm">
                        {r.restaurant_name}
                      </span>
                      <Badge
                        color={
                          r.status === 'visible'
                            ? 'success'
                            : r.status === 'flagged'
                            ? 'danger'
                            : 'neutral'
                        }
                      >
                        {r.status}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <StarRating value={r.rating} />
                      <span className="text-xs text-stone-400">
                        • {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Moderation Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {r.slug && (
                      <Link href={`/restaurants/${r.slug}`} target="_blank">
                        <Button variant="secondary" size="sm" className="text-xs">
                          <ExternalLink size={12} className="mr-1" /> View Venue
                        </Button>
                      </Link>
                    )}

                    {r.status !== 'visible' && (
                      <Button
                        size="sm"
                        onClick={() => moderate(r.id, 'visible')}
                        className="bg-cordova-green hover:bg-cordova-greenHover text-white text-xs font-bold"
                      >
                        <CheckCircle2 size={13} className="mr-1" /> Restore (Visible)
                      </Button>
                    )}

                    {r.status !== 'flagged' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => moderate(r.id, 'flagged')}
                        className="text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                      >
                        <Flag size={13} className="mr-1" /> Flag
                      </Button>
                    )}

                    {r.status !== 'removed' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => moderate(r.id, 'removed')}
                        className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      >
                        <Trash2 size={13} className="mr-1" /> Remove
                      </Button>
                    )}
                  </div>
                </div>

                {r.comment && (
                  <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-900/60 p-3.5 rounded-xl border border-stone-100 dark:border-stone-800/80">
                    &ldquo;{r.comment}&rdquo;
                  </p>
                )}

                {/* Review Photo Attachments */}
                {r.photos && Array.isArray(r.photos) && r.photos.length > 0 && (
                  <div className="flex items-center gap-2 pt-1 overflow-x-auto">
                    {r.photos.map((photo: string, idx: number) => (
                      <a
                        key={idx}
                        href={photo}
                        target="_blank"
                        rel="noreferrer"
                        className="relative w-16 h-16 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 shrink-0 group"
                      >
                        <Image
                          src={photo}
                          alt="Review attachment"
                          fill
                          className="object-cover group-hover:scale-110 transition-transform"
                        />
                      </a>
                    ))}
                  </div>
                )}

                {r.flagged_reason && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    <Flag size={14} className="shrink-0" />
                    <span><span className="font-bold">Flagged Reason:</span> {r.flagged_reason}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReviewModerationPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <ReviewModerationContent />
    </Suspense>
  );
}
