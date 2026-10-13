'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Camera, ImageOff, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import type { Restaurant, RestaurantImage } from '@/lib/types';

export function EstablishmentGallery({ restaurant, photos, onChange }: {
  restaurant: Restaurant; photos: RestaurantImage[]; onChange: (photos: RestaurantImage[]) => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [posting, setPosting] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [selected, setSelected] = useState<RestaurantImage | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!file) { setPreview(''); return; }
    const url = URL.createObjectURL(file); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  useEffect(() => { if (selected) dialog.current?.showModal(); }, [selected]);

  async function refresh() {
    const result = await api.get<{ data: RestaurantImage[] }>(`/api/restaurants/${restaurant.id}/images`, { auth: false });
    onChange(result.data || []);
  }
  async function post(event: React.FormEvent) {
    event.preventDefault();
    if (!file || posting) return;
    setPosting(true);
    try {
      const body = new FormData(); body.append('image', file); body.append('caption', caption.trim());
      const result = await api.post<{ data: { image: RestaurantImage } }>(`/api/restaurants/${restaurant.id}/community-photos`, body, { isFormData: true });
      if (result.data?.image) onChange([result.data.image, ...photos]);
      setFile(null); setCaption(''); if (input.current) input.current.value = '';
      toast('Your photo is now visible in the gallery', 'success');
      await refresh().catch(() => {});
    } catch (error) { toast(error instanceof Error ? error.message : 'Could not post photo. Please try again.', 'error'); }
    finally { setPosting(false); }
  }
  async function remove(photo: RestaurantImage) {
    setRemoving(photo.id);
    try {
      await api.delete(`/api/restaurants/${restaurant.id}/community-photos/${photo.id}`);
      onChange(photos.filter(p => p.id !== photo.id)); setConfirmId(null);
      toast('Photo removed', 'success');
    } catch (error) { toast(error instanceof Error ? error.message : 'Could not remove photo', 'error'); }
    finally { setRemoving(null); }
  }
  const displayed: RestaurantImage[] = [
    ...(restaurant.cover_image_url ? [{ id: 'cover', restaurant_id: restaurant.id, image_url: restaurant.cover_image_url, is_cover: true, sort_order: 0, caption: 'Establishment cover photo' }] : []),
    ...photos,
  ];
  const active = restaurant.is_active && restaurant.status === 'verified' && !restaurant.id.startsWith('static-');
  return (
    <section className="space-y-6" aria-label={`${restaurant.name} photo gallery`}>
      <div>
        <h3 className="font-serif text-2xl sm:text-3xl font-bold">Gallery</h3>
        <p className="mt-2 text-sm text-stone-500">Explore food, ambiance and moments shared by the community. Select a photo to view it full size.</p>
      </div>
      {active && (user ? (
        <form onSubmit={post} className="rounded-2xl border border-stone-200 dark:border-stone-700 p-5 space-y-4">
          <h4 className="font-semibold flex items-center gap-2"><Camera size={18} /> Share your visit</h4>
          <p className="text-xs text-stone-500">Your photo, caption and display name will be public. Post photos you took of this establishment.</p>
          <label className="block text-sm font-medium">Photo
            <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" disabled={posting} className="block mt-2 w-full text-sm" onChange={e => {
              const chosen = e.target.files?.[0];
              if (!chosen) { setFile(null); return; }
              if (!['image/jpeg','image/png','image/webp'].includes(chosen.type) || chosen.size > 3 * 1024 * 1024) {
                toast('Choose a JPEG, PNG or WebP photo up to 3 MB', 'error'); e.target.value = ''; setFile(null); return;
              }
              setFile(chosen);
            }} />
          </label>
          <p className="text-xs text-stone-500">JPEG, PNG or WebP · Up to 3 MB</p>
          {preview && <div className="relative h-52 max-w-sm"><Image src={preview} alt="Your selected photo preview" fill unoptimized className="object-contain rounded-xl" /></div>}
          <label className="block text-sm font-medium">Caption (optional)
            <textarea value={caption} onChange={e => setCaption(e.target.value)} maxLength={280} disabled={posting} rows={2} placeholder="What did you enjoy about your visit?" className="block mt-2 w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent p-3 font-normal" />
          </label>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-stone-500">{caption.length}/280</span>
            <button type="submit" disabled={!file || posting} className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-stone-950 disabled:opacity-50">{posting ? 'Posting photo…' : 'Post photo'}</button>
          </div>
        </form>
      ) : <Link href={`/login?redirect=${encodeURIComponent(`/restaurants/${restaurant.slug}`)}`} className="inline-flex items-center gap-2 rounded-xl border border-stone-300 dark:border-stone-700 px-4 py-3 text-sm font-semibold"><Camera size={18} /> Sign in to share a photo</Link>)}
      {displayed.length === 0 ? <div className="text-center py-12 text-stone-500"><ImageOff className="mx-auto mb-2" /><p>No photos yet. Be the first to share your visit.</p></div> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {displayed.map(photo => (
            <figure key={photo.id} className="rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800">
              <button type="button" onClick={() => setSelected(photo)} className="relative block h-48 sm:h-56 w-full" aria-label={`View ${photo.caption || restaurant.name + ' photo'} full size`}>
                <Image src={photo.image_url} alt={photo.caption || `${restaurant.name} gallery photo`} fill className="object-cover" />
              </button>
              <figcaption className="p-3 space-y-2 text-xs">
                {photo.caption && <p className="break-words">{photo.caption}</p>}
                <p className="text-stone-500">{photo.uploaded_by ? `Shared by ${photo.uploader_name || 'Community member'}` : 'Establishment photo'}</p>
                {photo.id !== 'cover' && user && (photo.uploaded_by === user.id || restaurant.owner_id === user.id || user.role === 'admin') && (
                  confirmId === photo.id ? <div className="flex flex-wrap gap-3"><button type="button" disabled={!!removing} onClick={() => remove(photo)} className="text-red-600 font-semibold">{removing === photo.id ? 'Removing…' : 'Confirm removal'}</button><button type="button" disabled={!!removing} onClick={() => setConfirmId(null)}>Cancel</button></div>
                  : <button type="button" onClick={() => setConfirmId(photo.id)} className="text-red-600 font-semibold">Remove photo</button>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
      <dialog ref={dialog} onClose={() => setSelected(null)} className="w-[min(95vw,1000px)] rounded-2xl bg-white dark:bg-stone-950 p-4 text-stone-900 dark:text-white backdrop:bg-black/75" aria-label="Gallery photo viewer">
        {selected && <>
          <div className="flex justify-end mb-3"><button type="button" autoFocus onClick={() => dialog.current?.close()} aria-label="Close photo viewer" className="p-2"><X /></button></div>
          <div className="relative h-[65vh]"><Image src={selected.image_url} alt={selected.caption || `${restaurant.name} photo`} fill className="object-contain" sizes="95vw" /></div>
          {selected.caption && <p className="mt-3 break-words">{selected.caption}</p>}
          <p className="text-sm text-stone-500 mt-2">{selected.uploaded_by ? `Shared by ${selected.uploader_name || 'Community member'}` : 'Establishment photo'}</p>
        </>}
      </dialog>
    </section>
  );
}
