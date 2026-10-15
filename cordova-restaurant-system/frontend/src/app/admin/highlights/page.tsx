'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { api, ApiClientError } from '@/lib/api';
import { useToast } from '@/lib/toast-context';
import { Modal } from '@/components/ui/Modal';
import type { VisitHighlight } from '@/lib/types';

const statuses = ['pending', 'approved', 'rejected', 'removed', 'all'] as const;

function AdminPhoto({ url, onPreview }: { url: string; onPreview: (source: string) => void }) {
  const [source, setSource] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    let localUrl: string | null = null;
    api.get<Blob>(url, { responseType: 'blob' }).then((blob) => {
      if (!active) return;
      localUrl = URL.createObjectURL(blob);
      setSource(localUrl);
    }).catch(() => {});
    return () => { active = false; if (localUrl) URL.revokeObjectURL(localUrl); };
  }, [url]);
  return source ? <button type="button" onClick={() => onPreview(source)} className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg"><Image src={source} alt="Customer visit" fill unoptimized className="object-cover" /></button> : <div className="h-28 w-28 shrink-0 animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800" />;
}

export default function AdminHighlightsPage() {
  const { toast } = useToast();
  const [status, setStatus] = useState<typeof statuses[number]>('approved');
  const [items, setItems] = useState<VisitHighlight[]>([]);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<{ data: VisitHighlight[]; meta: { totalPages: number } }>(`/api/admin/highlights?status=${status}&page=${page}&limit=12`);
      setItems(response.data); setPages(response.meta.totalPages);
    } catch (error) {
      setItems([]);
      toast(error instanceof ApiClientError ? error.message : 'Could not load gallery photos.', 'error');
    } finally { setLoading(false); }
  }, [page, status, toast]);
  useEffect(() => { void load(); }, [load]);

  const moderate = async (item: VisitHighlight, decision: 'approved' | 'rejected' | 'removed') => {
    const reason = (reasons[item.id] || '').trim();
    if (decision !== 'approved' && reason.length < 5) { toast('Enter a reason of at least 5 characters.', 'error'); return; }
    setBusy(true);
    try {
      await api.patch(`/api/admin/highlights/${item.id}/moderate`, { status: decision, reason });
      toast(`Photo ${decision}.`, 'success');
      await load();
    } catch (error) { toast(error instanceof ApiClientError ? error.message : 'Could not update gallery photo.', 'error'); }
    finally { setBusy(false); }
  };

  return <div className="space-y-6"><div><h1 className="font-serif text-3xl font-bold">Community Gallery Moderation</h1><p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Manage community photos that appear immediately on restaurant pages.</p></div><div className="flex flex-wrap gap-2">{statuses.map((choice) => <button key={choice} type="button" onClick={() => { setStatus(choice); setPage(1); }} className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize ${status === choice ? 'bg-cordova-green text-white' : 'bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-700'}`}>{choice}</button>)}</div>{loading ? <p className="text-sm">Loading photos…</p> : items.length === 0 ? <p className="rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 p-8 text-center text-sm text-stone-500">No {status} photos found.</p> : <div className="space-y-4">{items.map((item) => <article key={item.id} className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#1a211c] p-5 space-y-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-semibold">{item.restaurant_name}</h2><p className="text-xs text-stone-500">By {item.customer_name} · {new Date(item.created_at).toLocaleDateString()}</p></div><span className="rounded-full bg-amber-100 dark:bg-amber-900/40 px-3 py-1 text-xs font-semibold capitalize text-amber-900 dark:text-amber-300">{item.status}</span></div><div className="flex gap-2 overflow-x-auto">{item.images.map((image) => <AdminPhoto key={image.id} url={image.url} onPreview={setPreview} />)}</div><p className="text-sm whitespace-pre-wrap break-words">{item.caption}</p>{item.moderation_reason && <p className="text-xs text-amber-700 dark:text-amber-300">Previous decision: {item.moderation_reason}</p>}<label className="block text-xs font-semibold">Reason for rejection or removal<input type="text" maxLength={500} value={reasons[item.id] || ''} onChange={(event) => setReasons((current) => ({ ...current, [item.id]: event.target.value }))} className="mt-1 block w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent p-2 text-sm" /></label><div className="flex flex-wrap gap-2"><button type="button" disabled={busy || item.status === 'approved'} onClick={() => void moderate(item, 'approved')} className="rounded-lg bg-cordova-green px-4 py-2 text-xs font-bold text-white disabled:opacity-50">Approve</button><button type="button" disabled={busy || item.status === 'rejected'} onClick={() => void moderate(item, 'rejected')} className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">Reject</button><button type="button" disabled={busy || item.status === 'removed'} onClick={() => void moderate(item, 'removed')} className="rounded-lg bg-red-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">Remove</button></div></article>)}</div>}<div className="flex items-center gap-3 text-sm"><button type="button" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {page} of {pages}</span><button type="button" disabled={page >= pages || loading} onClick={() => setPage((value) => value + 1)}>Next</button></div><Modal open={Boolean(preview)} onClose={() => setPreview(null)} title="Visit photo">{preview && <div className="relative h-[70vh]"><Image src={preview} alt="Enlarged customer visit" fill unoptimized className="object-contain" /></div>}</Modal></div>;
}
