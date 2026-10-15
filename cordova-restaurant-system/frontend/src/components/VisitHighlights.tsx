'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Camera, Pencil, Trash2, X } from 'lucide-react';
import { api, API_URL, ApiClientError, getAccessToken, refreshAccessToken } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { Modal } from '@/components/ui/Modal';
import type { Restaurant, VisitHighlight } from '@/lib/types';

// The existing upload endpoint requires a category; the Gallery does not ask visitors to choose one.
const GALLERY_CATEGORY = 'Overall Experience';
const MAX_REQUEST = 3.8 * 1024 * 1024;

function Photo({ image, status, alt, onClick }: {
  image: VisitHighlight['images'][number]; status: VisitHighlight['status']; alt: string; onClick: (src: string) => void;
}) {
  const [source, setSource] = useState<string | null>(status === 'approved' ? image.url : null);
  useEffect(() => {
    if (status === 'approved') return;
    let active = true;
    let localUrl: string | null = null;
    api.get<Blob>(image.url, { responseType: 'blob' }).then((blob) => {
      if (!active) return;
      localUrl = URL.createObjectURL(blob);
      setSource(localUrl);
    }).catch(() => {});
    return () => { active = false; if (localUrl) URL.revokeObjectURL(localUrl); };
  }, [image.url, status]);
  return source ? (
    <button type="button" onClick={() => onClick(source)} className="relative block w-full aspect-square overflow-hidden rounded-xl bg-stone-200 dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-cordova-gold" aria-label={`Enlarge ${alt}`}>
      <Image src={source} alt={alt} fill unoptimized sizes="(max-width: 640px) 90vw, 320px" className="object-cover transition-transform hover:scale-105" />
    </button>
  ) : <div className="aspect-square rounded-xl bg-stone-200 dark:bg-stone-800 animate-pulse" aria-label="Loading photo" />;
}

function HighlightCard({ item, editable, onEdit, onDelete, onPreview }: {
  item: VisitHighlight; editable?: boolean; onEdit?: (item: VisitHighlight) => void;
  onDelete?: (item: VisitHighlight) => void; onPreview: (src: string) => void;
}) {
  return <article className="rounded-2xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/[0.04] p-3 shadow-sm">
    <div className={`grid gap-1 ${item.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {item.images.map((image, index) => <Photo key={image.id} image={image} status={item.status} alt={`Photo ${index + 1} shared by ${item.customer_name}`} onClick={onPreview} />)}
    </div>
    <div className="px-1 pt-3 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-sm text-stone-900 dark:text-white">{item.customer_name}</strong><span className="text-xs text-stone-500 dark:text-stone-400">{new Date(item.created_at).toLocaleDateString()}</span></div>
      {item.status !== 'approved' && <span className="inline-block rounded-full bg-amber-100 dark:bg-amber-900/40 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300">{item.status}</span>}
      <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-200 whitespace-pre-wrap break-words">{item.caption}</p>
      {item.moderation_reason && item.status !== 'approved' && <p className="text-xs text-amber-700 dark:text-amber-300">Reason: {item.moderation_reason}</p>}
      {editable && <div className="flex gap-3 border-t border-stone-200 dark:border-white/10 pt-2"><button type="button" onClick={() => onEdit?.(item)} className="inline-flex items-center gap-1 text-xs font-semibold text-cordova-green dark:text-emerald-400"><Pencil size={13} /> Edit</button><button type="button" onClick={() => onDelete?.(item)} className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400"><Trash2 size={13} /> Delete</button></div>}
    </div>
  </article>;
}

export function VisitHighlights({ restaurant }: { restaurant: Restaurant }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [publicItems, setPublicItems] = useState<VisitHighlight[]>([]);
  const [ownItems, setOwnItems] = useState<VisitHighlight[]>([]);
  const [ownerItems, setOwnerItems] = useState<VisitHighlight[]>([]);
  const [privatePage, setPrivatePage] = useState(1);
  const [privateHasNext, setPrivateHasNext] = useState(false);
  const [privateLoading, setPrivateLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<VisitHighlight | null>(null);
  const [caption, setCaption] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const isOwner = user?.role === 'owner' && user.id === restaurant.owner_id;

  const load = useCallback(async (requestedPage = 1) => {
    setLoading(true); setError(false);
    try {
      const res = await api.get<{ data: VisitHighlight[]; meta: { hasNextPage: boolean } }>(`/api/restaurants/${restaurant.id}/highlights?page=${requestedPage}&limit=12`, { auth: false });
      setPublicItems((items) => requestedPage === 1 ? res.data : [...items, ...res.data]);
      setPage(requestedPage); setHasNext(res.meta.hasNextPage);
    } catch { setError(true); }
    finally { setLoading(false); }
  }, [restaurant.id]);

  const loadPrivate = useCallback(async (requestedPage = 1) => {
    if (user?.role !== 'customer' && !isOwner) return;
    setPrivateLoading(true);
    try {
      if (user?.role === 'customer') {
        const res = await api.get<{ data: VisitHighlight[]; meta: { hasNextPage: boolean } }>(`/api/highlights/mine?restaurantId=${restaurant.id}&page=${requestedPage}&limit=12`);
        setOwnItems((items) => requestedPage === 1 ? res.data : [...items, ...res.data]);
        setPrivateHasNext(res.meta.hasNextPage);
      } else if (isOwner) {
        const res = await api.get<{ data: VisitHighlight[]; meta: { hasNextPage: boolean } }>(`/api/restaurants/${restaurant.id}/highlights/submissions?page=${requestedPage}&limit=12`);
        setOwnerItems((items) => requestedPage === 1 ? res.data : [...items, ...res.data]);
        setPrivateHasNext(res.meta.hasNextPage);
      }
      setPrivatePage(requestedPage);
    } catch { toast('Could not load your photo submissions.', 'error'); }
    finally { setPrivateLoading(false); }
  }, [isOwner, restaurant.id, toast, user?.role]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { void loadPrivate(); }, [loadPrivate]);
  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const close = () => { if (!busy) { setModal(false); setEditing(null); setFiles([]); setProgress(0); } };
  const openCreate = () => {
    if (!user) { router.push(`/login?redirect=${encodeURIComponent(`/restaurants/${restaurant.slug}`)}`); return; }
    if (user.role !== 'customer') return;
    setEditing(null); setCaption(''); setFiles([]); setModal(true);
  };
  const openEdit = (item: VisitHighlight) => { setEditing(item); setCaption(item.caption); setFiles([]); setModal(true); };
  const selectFiles = (next: FileList | null) => {
    if (!next) return;
    const selected = Array.from(next);
    if (selected.length > 5 || selected.some((file) => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) || selected.reduce((sum, file) => sum + file.size, 0) > MAX_REQUEST) {
      toast('Choose up to 5 JPEG, PNG, or WebP photos, each under 2 MB and under 3.8 MB combined.', 'error'); return;
    }
    setFiles(selected);
  };
  const sendUpload = (body: FormData, method: 'POST' | 'PATCH', url: string) => new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, `${API_URL}${url}`);
    xhr.withCredentials = true;
    const token = getAccessToken();
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.upload.onprogress = (event) => { if (event.lengthComputable) setProgress(Math.round((event.loaded / event.total) * 100)); };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else { let message = 'Could not submit photo.'; try { message = JSON.parse(xhr.responseText).message || message; } catch {} reject(new ApiClientError(xhr.status, message)); }
    };
    xhr.onerror = () => reject(new Error('Upload failed. Check your connection and try again.'));
    xhr.send(body);
  });
  const upload = async (body: FormData, method: 'POST' | 'PATCH', url: string) => {
    try { await sendUpload(body, method, url); }
    catch (error) {
      if (!(error instanceof ApiClientError) || error.status !== 401 || !(await refreshAccessToken())) throw error;
      setProgress(0);
      await sendUpload(body, method, url);
    }
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!caption.trim() || caption.trim().length > 300 || (!editing && !files.length)) { toast('Add a photo and a caption up to 300 characters.', 'error'); return; }
    setBusy(true); setProgress(0);
    try {
      if (editing && !files.length) await api.patch(`/api/highlights/${editing.id}`, { caption: caption.trim(), category: editing.category });
      else {
        const body = new FormData(); body.append('caption', caption.trim()); body.append('category', editing?.category ?? GALLERY_CATEGORY);
        files.forEach((file) => body.append('photos', file));
        await upload(body, editing ? 'PATCH' : 'POST', editing ? `/api/highlights/${editing.id}` : `/api/restaurants/${restaurant.id}/highlights`);
      }
      toast(editing ? 'Gallery photo updated.' : 'Your photos are now in the gallery.', 'success');
      setModal(false); setEditing(null); setFiles([]);
      await Promise.all([load(), loadPrivate()]);
    } catch (err) { toast(err instanceof Error ? err.message : 'Could not save photo.', 'error'); }
    finally { setBusy(false); setProgress(0); }
  };
  const remove = async (item: VisitHighlight) => {
    if (!window.confirm('Delete this post and all its photos?')) return;
    try { await api.delete(`/api/highlights/${item.id}`); toast('Photo post deleted.', 'success'); await Promise.all([load(), loadPrivate()]); }
    catch (err) { toast(err instanceof ApiClientError ? err.message : 'Could not delete photo post.', 'error'); }
  };

  return <div className="space-y-8">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h4 className="font-serif text-xl font-bold text-cordova-green dark:text-emerald-400">Community photos</h4><p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Post photos you took at {restaurant.name}.</p></div>{(!user || user.role === 'customer') && <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-cordova-green px-5 py-3 text-sm font-bold text-white hover:bg-cordova-greenHover"><Camera size={17} /> Share your photos</button>}</div>
    {loading && publicItems.length === 0 ? <p className="text-sm text-stone-500">Loading community photos…</p> : error ? <div role="alert" className="text-sm text-amber-700 dark:text-amber-300">Community photos could not be loaded. <button type="button" onClick={() => void load()} className="underline">Retry</button></div> : publicItems.length === 0 ? <p className="rounded-2xl border border-dashed border-stone-300 dark:border-white/20 p-10 text-center text-sm text-stone-600 dark:text-stone-300">No community photos yet. Be the first to share one!</p> : <><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{publicItems.map((item) => <HighlightCard key={item.id} item={item} onPreview={setPreview} />)}</div>{hasNext && <button type="button" disabled={loading} onClick={() => void load(page + 1)} className="rounded-xl border border-stone-300 dark:border-white/20 px-4 py-2 text-sm">{loading ? 'Loading…' : 'Load more'}</button>}</>}
    {user?.role === 'customer' && ownItems.length > 0 && <section className="space-y-4"><h3 className="font-serif text-xl font-bold text-stone-900 dark:text-white">Your photos</h3><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{ownItems.map((item) => <HighlightCard key={item.id} item={item} editable={item.status !== 'removed'} onEdit={openEdit} onDelete={remove} onPreview={setPreview} />)}</div>{privateHasNext && <button type="button" disabled={privateLoading} onClick={() => void loadPrivate(privatePage + 1)} className="rounded-xl border border-stone-300 dark:border-white/20 px-4 py-2 text-sm">{privateLoading ? 'Loading…' : 'Load more photos'}</button>}</section>}
    {isOwner && ownerItems.length > 0 && <section className="space-y-4"><h3 className="font-serif text-xl font-bold text-stone-900 dark:text-white">Customer photos</h3><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{ownerItems.map((item) => <HighlightCard key={item.id} item={item} onPreview={setPreview} />)}</div>{privateHasNext && <button type="button" disabled={privateLoading} onClick={() => void loadPrivate(privatePage + 1)} className="rounded-xl border border-stone-300 dark:border-white/20 px-4 py-2 text-sm">{privateLoading ? 'Loading…' : 'Load more photos'}</button>}</section>}
    <Modal open={modal} onClose={close} title={editing ? 'Edit photo post' : 'Share your photos'}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-stone-600 dark:text-stone-300">Post photos you took at <strong>{restaurant.name}</strong>.</p>
        <p className="text-sm text-stone-600 dark:text-stone-300">Your display name, <strong>{user?.full_name}</strong>, and caption will appear publicly as soon as you post.</p>
        <div>
          <label htmlFor="community-photos" className="block text-sm font-semibold mb-2">{editing ? 'Replace photos (optional, 1–5)' : 'Photos (1–5)'}</label>
          <input id="community-photos" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event) => selectFiles(event.target.files)} className="block w-full text-sm text-stone-700 dark:text-stone-200" />
          <div className="mt-3 grid grid-cols-5 gap-2">{previews.map((url, index) => <div key={url} className="relative aspect-square"><Image src={url} alt={`Selected photo ${index + 1}`} fill unoptimized className="rounded-lg object-cover" /></div>)}</div>
        </div>
        {editing && <p className="text-xs text-stone-500">Leave photos blank to keep your existing photos. Selecting new photos replaces them immediately.</p>}
        <div><label htmlFor="gallery-caption" className="block text-sm font-semibold mb-1">Caption</label><textarea id="gallery-caption" required maxLength={300} rows={3} value={caption} onChange={(event) => setCaption(event.target.value)} className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 p-3 text-sm text-stone-900 dark:text-white" /><span className="text-xs text-stone-500">{caption.length}/300</span></div>
        {busy && files.length > 0 && <div role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} className="h-2 rounded-full bg-stone-200 dark:bg-stone-700"><div className="h-full rounded-full bg-cordova-green" style={{ width: `${progress}%` }} /></div>}
        <div className="flex justify-end gap-3"><button type="button" disabled={busy} onClick={close} className="rounded-xl border border-stone-300 dark:border-stone-700 px-4 py-2 text-sm">Cancel</button><button type="submit" disabled={busy} className="rounded-xl bg-cordova-green px-5 py-2 text-sm font-bold text-white disabled:opacity-60">{busy ? `Submitting ${progress ? `${progress}%` : '…'}` : 'Submit'}</button></div>
      </form>
    </Modal>
    <Modal open={Boolean(preview)} onClose={() => setPreview(null)} title="Visit photo">{preview && <div className="relative h-[70vh] w-full"><Image src={preview} alt="Enlarged visit photo" fill unoptimized className="object-contain" /></div>}</Modal>
  </div>;
}
