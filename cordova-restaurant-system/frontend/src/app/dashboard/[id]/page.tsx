'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { api, ApiClientError } from '@/lib/api';
import { useToast } from '@/lib/toast-context';
import { RequireRole } from '@/components/RequireRole';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { AMENITIES } from '@/lib/amenities';
import type { Restaurant, MenuItem, MenuCategory, Promotion, OperatingHour, RestaurantImage } from '@/lib/types';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TABS = ['overview', 'menu', 'hours', 'promotions', 'analytics'] as const;
type Tab = (typeof TABS)[number];

export default function ManageBusinessPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('overview');
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await api.get(`/api/restaurants/${id}`);
      setRestaurant(res.data.restaurant);
    } catch (err) {
      setLoadError(true);
      toast(err instanceof ApiClientError ? err.message : 'Failed to load business', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <RequireRole roles={['owner', 'admin']}>
      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : loadError || !restaurant ? (
        <div className="text-center py-20 text-[var(--text-muted)]">
          <p className="text-4xl mb-3">😕</p>
          <p>Could not load this business. It may not exist, or you may not have access to it.</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-2xl font-bold">{restaurant.name}</h1>
            <StatusBadge status={restaurant.status} />
          </div>
          {restaurant.status === 'rejected' && restaurant.rejection_reason && (
            <p className="text-sm text-red-500 mb-4">Rejection reason: {restaurant.rejection_reason}</p>
          )}
          {restaurant.status === 'pending' && (
            <p className="text-sm text-gold-500 mb-4">⏳ Awaiting admin verification. Your listing is not yet public.</p>
          )}

          <div className="flex gap-1 border-b border-[var(--border)] mb-6 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px capitalize whitespace-nowrap ${
                  tab === t ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-[var(--text-muted)]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'overview' && <OverviewTab restaurant={restaurant} onUpdated={load} />}
          {tab === 'menu' && <MenuTab restaurantId={restaurant.id} />}
          {tab === 'hours' && <HoursTab restaurantId={restaurant.id} />}
          {tab === 'promotions' && <PromotionsTab restaurantId={restaurant.id} />}
          {tab === 'analytics' && <AnalyticsTab restaurantId={restaurant.id} />}
        </div>
      )}
    </RequireRole>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color = status === 'verified' ? 'success' : status === 'pending' ? 'warning' : 'danger';
  return <Badge color={color as any}>{status}</Badge>;
}

// ---------------- Overview / profile tab ----------------
function OverviewTab({ restaurant, onUpdated }: { restaurant: Restaurant; onUpdated: () => void }) {
  const { toast } = useToast();
  const [description, setDescription] = useState(restaurant.description || '');
  const [phone, setPhone] = useState(restaurant.phone || '');
  const [amenities, setAmenities] = useState<string[]>(restaurant.amenities || []);
  const [saving, setSaving] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [gallery, setGallery] = useState<RestaurantImage[]>([]);
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const loadGallery = useCallback(async () => {
    try {
      const res = await api.get(`/api/restaurants/${restaurant.id}/images`, { auth: false });
      setGallery(res.data);
    } catch (err) {
      // non-critical — leave gallery empty on failure
    }
  }, [restaurant.id]);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  const toggleAmenity = (value: string) => {
    setAmenities((prev) => (prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value]));
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.patch(`/api/restaurants/${restaurant.id}`, { description, phone, amenities });
      if (coverFile) {
        const formData = new FormData();
        formData.append('image', coverFile);
        await api.post(`/api/restaurants/${restaurant.id}/cover-image`, formData, { isFormData: true });
      }
      toast('Profile updated', 'success');
      onUpdated();
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const uploadGalleryPhoto = async () => {
    if (!galleryFile) return;
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('image', galleryFile);
      await api.post(`/api/restaurants/${restaurant.id}/images`, formData, { isFormData: true });
      toast('Photo added', 'success');
      setGalleryFile(null);
      loadGallery();
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Upload failed', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const deletePhoto = async (imageId: string) => {
    try {
      await api.delete(`/api/restaurants/${restaurant.id}/images/${imageId}`);
      setGallery((prev) => prev.filter((g) => g.id !== imageId));
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Failed to remove photo', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="card p-5 space-y-4">
        <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <div>
          <label className="label" htmlFor="cover">
            Cover image
          </label>
          <input id="cover" type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} className="input" />
        </div>

        <div>
          <p className="label mb-2">Amenities</p>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map((a) => (
              <button key={a.value} type="button" onClick={() => toggleAmenity(a.value)}>
                <Badge color={amenities.includes(a.value) ? 'brand' : 'neutral'}>{a.label}</Badge>
              </button>
            ))}
          </div>
        </div>

        <Button onClick={save} loading={saving}>
          Save changes
        </Button>
      </div>

      <div className="card p-5 space-y-4">
        <p className="font-medium">Photo Gallery</p>
        {gallery.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {gallery.map((img) => (
              <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden group">
                <Image src={img.image_url} alt="Gallery photo" fill className="object-cover" />
                <button
                  onClick={() => deletePhoto(img.id)}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setGalleryFile(e.target.files?.[0] || null)}
            className="input flex-1"
          />
          <Button onClick={uploadGalleryPhoto} loading={uploadingPhoto} disabled={!galleryFile}>
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------- Menu tab ----------------
function MenuTab({ restaurantId }: { restaurantId: string }) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', price: '', description: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/api/restaurants/${restaurantId}/menu`, { auth: false });
      setCategories(res.data.categories);
      setItems(res.data.items);
    } catch (err) {
      toast('Failed to load menu', 'error');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    load();
  }, [load]);

  const addItem = async () => {
    if (!newItem.name || !newItem.price) return;
    setSaving(true);
    try {
      await api.post(`/api/restaurants/${restaurantId}/menu/items`, {
        name: newItem.name,
        price: parseFloat(newItem.price),
        description: newItem.description,
      });
      toast('Menu item added', 'success');
      setModalOpen(false);
      setNewItem({ name: '', price: '', description: '' });
      load();
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Failed to add item', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (itemId: string) => {
    await api.delete(`/api/restaurants/${restaurantId}/menu/items/${itemId}`);
    toast('Item removed', 'info');
    load();
  };

  if (loading) return <Skeleton className="h-40 w-full" />;

  return (
    <div>
      <Button onClick={() => setModalOpen(true)} className="mb-4">
        + Add menu item
      </Button>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.id} className="card p-4 flex justify-between items-start">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-[var(--text-muted)]">₱{Number(item.price).toFixed(0)}</p>
            </div>
            <button onClick={() => deleteItem(item.id)} className="text-red-500 text-sm hover:underline">
              Remove
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-[var(--text-muted)]">No menu items yet.</p>}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add menu item">
        <div className="space-y-3">
          <Input label="Item name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
          <Input
            label="Price (₱)"
            type="number"
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
          />
          <Textarea
            label="Description"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
          />
          <Button onClick={addItem} loading={saving} className="w-full">
            Add item
          </Button>
        </div>
      </Modal>
    </div>
  );
}

// ---------------- Hours tab ----------------
function HoursTab({ restaurantId }: { restaurantId: string }) {
  const { toast } = useToast();
  const [days, setDays] = useState<OperatingHour[]>(
    DAY_NAMES.map((_, i) => ({ day_of_week: i, open_time: '09:00', close_time: '21:00', is_closed: false }))
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/api/restaurants/${restaurantId}/hours`, { auth: false }).then((res) => {
      if (res.data.length === 7) setDays(res.data);
    }).catch(() => {});
  }, [restaurantId]);

  const update = (idx: number, patch: Partial<OperatingHour>) => {
    setDays((prev) => prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)));
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/api/restaurants/${restaurantId}/hours`, { days });
      toast('Operating hours updated', 'success');
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-5 max-w-xl space-y-3">
      {days.map((d, idx) => (
        <div key={idx} className="flex items-center gap-3 flex-wrap">
          <span className="w-24 text-sm">{DAY_NAMES[idx]}</span>
          <label className="flex items-center gap-1.5 text-xs">
            <input type="checkbox" checked={d.is_closed} onChange={(e) => update(idx, { is_closed: e.target.checked })} />
            Closed
          </label>
          {!d.is_closed && (
            <>
              <input
                type="time"
                value={d.open_time.slice(0, 5)}
                onChange={(e) => update(idx, { open_time: e.target.value })}
                className="input !py-1.5 !px-2 w-28"
              />
              <span className="text-[var(--text-muted)]">–</span>
              <input
                type="time"
                value={d.close_time.slice(0, 5)}
                onChange={(e) => update(idx, { close_time: e.target.value })}
                className="input !py-1.5 !px-2 w-28"
              />
            </>
          )}
        </div>
      ))}
      <Button onClick={save} loading={saving}>
        Save hours
      </Button>
    </div>
  );
}

// ---------------- Promotions tab ----------------
function PromotionsTab({ restaurantId }: { restaurantId: string }) {
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [renewTarget, setRenewTarget] = useState<Promotion | null>(null);
  const [renewEndDate, setRenewEndDate] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    discountLabel: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/api/restaurants/${restaurantId}/promotions`, { auth: false });
      setPromotions(res.data);
    } catch {
      toast('Failed to load promotions', 'error');
    }
  }, [restaurantId, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    if (!form.title.trim() || !form.startDate || !form.endDate) {
      toast('Please provide a title, start date, and end date', 'error');
      return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      toast('End date must be on or after start date', 'error');
      return;
    }

    setSaving(true);
    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append('title', form.title);
        if (form.description) formData.append('description', form.description);
        if (form.discountLabel) formData.append('discountLabel', form.discountLabel);
        formData.append('startDate', form.startDate);
        formData.append('endDate', form.endDate);
        formData.append('publish', 'true');
        formData.append('image', imageFile);

        await api.post(`/api/restaurants/${restaurantId}/promotions`, formData, { isFormData: true });
      } else {
        await api.post(`/api/restaurants/${restaurantId}/promotions`, { ...form, publish: true });
      }

      toast('Promotion created and published!', 'success');
      setModalOpen(false);
      setForm({
        title: '',
        description: '',
        discountLabel: '',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: '',
      });
      setImageFile(null);
      load();
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Failed to create promotion', 'error');
    } finally {
      setSaving(false);
    }
  };

  const renewPromotion = async () => {
    if (!renewTarget || !renewEndDate) return;
    setSaving(true);
    try {
      await api.patch(`/api/restaurants/${restaurantId}/promotions/${renewTarget.id}`, {
        endDate: renewEndDate,
        status: 'active',
      });
      toast('Promotion renewed and reactivated!', 'success');
      setRenewTarget(null);
      setRenewEndDate('');
      load();
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Failed to renew promotion', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (promoId: string) => {
    try {
      await api.delete(`/api/restaurants/${restaurantId}/promotions/${promoId}`);
      toast('Promotion deleted', 'info');
      load();
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Delete failed', 'error');
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50 dark:bg-stone-800/40 p-4 rounded-xl border border-stone-200 dark:border-stone-800">
        <div>
          <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white">Restaurant Promotions</h3>
          <p className="text-xs text-stone-500">
            Promotions are automatically published to diners and <strong>automatically removed from public view</strong> when their end date expires.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="bg-cordova-green hover:bg-cordova-greenHover text-white">
          + Create New Promotion
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {promotions.map((p) => {
          const isExpired = p.status === 'expired' || p.end_date < today;
          const isActive = p.status === 'active' && !isExpired;

          return (
            <div key={p.id} className="bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-sm flex flex-col justify-between gap-3">
              <div className="space-y-2">
                {p.image_url && (
                  <div className="relative h-32 w-full rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800">
                    <Image src={p.image_url} alt={p.title} fill className="object-cover" />
                  </div>
                )}
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-serif font-bold text-base text-stone-900 dark:text-white">{p.title}</h4>
                  <Badge color={isActive ? 'success' : isExpired ? 'danger' : 'neutral'}>
                    {isActive ? 'Active' : isExpired ? 'Expired' : p.status}
                  </Badge>
                </div>
                {p.discount_label && (
                  <span className="inline-block bg-cordova-gold/15 text-cordova-gold text-xs font-bold px-2.5 py-1 rounded-md">
                    {p.discount_label}
                  </span>
                )}
                {p.description && <p className="text-xs text-stone-600 dark:text-stone-300">{p.description}</p>}
                <p className="text-xs text-stone-500">
                  Duration: <span className="font-medium text-stone-700 dark:text-stone-300">{p.start_date}</span> to <span className="font-medium text-stone-700 dark:text-stone-300">{p.end_date}</span>
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                {isExpired && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setRenewTarget(p);
                      setRenewEndDate(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
                    }}
                    className="text-xs py-1 px-3"
                  >
                    🔄 Extend / Renew
                  </Button>
                )}
                <button
                  onClick={() => remove(p.id)}
                  className="text-xs text-red-600 dark:text-red-400 hover:underline font-medium px-2 py-1"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
        {promotions.length === 0 && (
          <div className="col-span-full py-12 text-center text-stone-500 bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-xl">
            <p className="text-3xl mb-2">🎁</p>
            <p className="font-serif font-medium text-stone-800 dark:text-stone-200">No promotions published yet</p>
            <p className="text-xs text-stone-400 mt-1">Create your first promotion banner to attract diners!</p>
          </div>
        )}
      </div>

      {/* Create Promotion Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Restaurant Promotion">
        <div className="space-y-4">
          <Input
            label="Promotion Title"
            placeholder="e.g. Weekend Seafood Special"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <Textarea
            label="Description / Special Perks"
            placeholder="e.g. Free appetizer for orders above ₱500..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Input
            label="Discount Label (Badge text)"
            placeholder="e.g. 20% OFF or BUY 1 GET 1"
            value={form.discountLabel}
            onChange={(e) => setForm({ ...form, discountLabel: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
            />
            <Input
              label="End Date (Expiry Date)"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Banner / Promotional Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer"
            />
          </div>
          <Button onClick={create} loading={saving} className="w-full bg-cordova-green hover:bg-cordova-greenHover text-white">
            Publish Promotion
          </Button>
        </div>
      </Modal>

      {/* Extend / Renew Modal */}
      <Modal open={!!renewTarget} onClose={() => setRenewTarget(null)} title={`Renew ${renewTarget?.title}`}>
        <div className="space-y-4">
          <p className="text-xs text-stone-500">
            Set a new expiry date to reactivate this promotion immediately on the public promotions feed.
          </p>
          <Input
            label="New Expiry Date"
            type="date"
            value={renewEndDate}
            onChange={(e) => setRenewEndDate(e.target.value)}
            required
          />
          <Button onClick={renewPromotion} loading={saving} className="w-full bg-cordova-green hover:bg-cordova-greenHover text-white">
            Reactivate Promotion
          </Button>
        </div>
      </Modal>
    </div>
  );
}

// ---------------- Analytics tab ----------------
function AnalyticsTab({ restaurantId }: { restaurantId: string }) {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get(`/api/restaurants/${restaurantId}/analytics?days=30`).then((res) => setStats(res.data)).catch(() => {});
  }, [restaurantId]);

  if (!stats) return <Skeleton className="h-40 w-full" />;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <StatCard label="Total views (30d)" value={stats.totalViews} />
      <StatCard label="Views from recommendations" value={stats.viewsFromRecommendation} />
      <StatCard label="Times recommended" value={stats.timesRecommended} />
      <StatCard label="Times top result" value={stats.timesTopResult} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-4">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-[var(--text-muted)] mt-1">{label}</p>
    </div>
  );
}
