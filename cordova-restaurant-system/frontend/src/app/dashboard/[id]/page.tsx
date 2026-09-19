'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
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
import { Copy, Check, QrCode, ArrowLeft, ArrowRight, Smartphone, Sparkles, AlertCircle, Clock, Calendar, ShoppingBag, Utensils, Tag, Percent } from 'lucide-react';
import type { Restaurant, MenuItem, MenuCategory, Promotion, OperatingHour, RestaurantImage } from '@/lib/types';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TABS = ['overview', 'menu', 'hours', 'promotions', 'subscription', 'analytics'] as const;
type Tab = (typeof TABS)[number];

export default function ManageBusinessPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') as Tab;
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>(TABS.includes(initialTab) ? initialTab : 'overview');
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
            <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">⏳ Awaiting admin verification. Your listing is not yet public.</p>
          )}

          <div className="flex gap-1 border-b border-[var(--border)] mb-6 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px capitalize whitespace-nowrap ${
                  tab === t ? 'border-brand-500 text-brand-600 dark:text-brand-400 font-bold' : 'border-transparent text-[var(--text-muted)]'
                }`}
              >
                {t === 'subscription' ? 'Subscription & Boost' : t}
              </button>
            ))}
          </div>

          {tab === 'overview' && <OverviewTab restaurant={restaurant} onUpdated={load} />}
          {tab === 'menu' && <MenuTab restaurant={restaurant} />}
          {tab === 'hours' && <HoursTab restaurantId={restaurant.id} />}
          {tab === 'promotions' && <PromotionsTab restaurantId={restaurant.id} />}
          {tab === 'subscription' && <SubscriptionTab restaurant={restaurant} onUpdated={load} />}
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
function MenuTab({ restaurant }: { restaurant: Restaurant }) {
  const { toast } = useToast();
  const restaurantId = restaurant.id;
  const isVerified = restaurant.status === 'verified';
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    description: '',
    categoryId: '',
  });
  const [itemImageFile, setItemImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/api/restaurants/${restaurantId}/menu`, { auth: false });
      setCategories(res.data.categories || []);
      setItems(res.data.items || []);
    } catch (err) {
      toast('Failed to load menu', 'error');
    } finally {
      setLoading(false);
    }
  }, [restaurantId, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleImageChange = (file: File | null) => {
    setItemImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const addCategory = async () => {
    if (!newCategoryName.trim()) return;
    setSaving(true);
    try {
      const res = await api.post(`/api/restaurants/${restaurantId}/menu/categories`, {
        name: newCategoryName.trim(),
      });
      toast('Category added', 'success');
      setNewCategoryName('');
      setCategoryModalOpen(false);
      load();
      if (res.data?.category?.id) {
        setNewItem((prev) => ({ ...prev, categoryId: res.data.category.id }));
      }
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Failed to add category', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addItem = async () => {
    if (!newItem.name.trim() || !newItem.price) {
      toast('Please provide a name and price for the menu item', 'error');
      return;
    }
    setSaving(true);
    try {
      if (itemImageFile) {
        const formData = new FormData();
        formData.append('name', newItem.name.trim());
        formData.append('price', String(parseFloat(newItem.price)));
        if (newItem.description) formData.append('description', newItem.description.trim());
        if (newItem.categoryId) formData.append('categoryId', newItem.categoryId);
        formData.append('image', itemImageFile);

        await api.post(`/api/restaurants/${restaurantId}/menu/items`, formData, { isFormData: true });
      } else {
        await api.post(`/api/restaurants/${restaurantId}/menu/items`, {
          name: newItem.name.trim(),
          price: parseFloat(newItem.price),
          description: newItem.description.trim() || undefined,
          categoryId: newItem.categoryId || undefined,
        });
      }
      toast('Menu item added successfully!', 'success');
      setModalOpen(false);
      setNewItem({ name: '', price: '', description: '', categoryId: '' });
      setItemImageFile(null);
      setImagePreview(null);
      load();
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Failed to add item', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      await api.delete(`/api/restaurants/${restaurantId}/menu/items/${itemId}`);
      toast('Item removed', 'info');
      load();
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Failed to remove item', 'error');
    }
  };

  if (loading) return <Skeleton className="h-40 w-full" />;

  return (
    <div className="space-y-6">
      {!isVerified && (
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-800 dark:text-amber-300">
          <div className="text-2xl shrink-0">📝</div>
          <div>
            <p className="font-semibold text-sm text-stone-900 dark:text-white">
              Menu Setup (Draft Mode)
            </p>
            <p className="mt-0.5 text-stone-600 dark:text-stone-300 leading-relaxed">
              Your establishment is currently <strong>{restaurant.status}</strong>. You can prepare and organize all your dishes, prices, descriptions, and food photos now. Your completed menu will be published automatically the moment municipal admin verification is approved!
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap bg-stone-50 dark:bg-stone-800/40 p-4 rounded-xl border border-stone-200 dark:border-stone-800">
        <div>
          <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white">Establishment Menu</h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Add dishes, manage prices, and showcase mouthwatering food photos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setCategoryModalOpen(true)} className="text-xs">
            + Add Category
          </Button>
          <Button onClick={() => setModalOpen(true)} className="bg-cordova-green hover:bg-cordova-greenHover text-white text-xs">
            + Add Menu Item
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-sm flex gap-4 items-start justify-between">
            <div className="flex gap-3 items-start">
              {item.image_url ? (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0 border border-stone-200 dark:border-stone-700">
                  <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl shrink-0 border border-amber-500/20">
                  🍽️
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-white">{item.name}</h4>
                  {(item as any).category_name && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      {(item as any).category_name}
                    </span>
                  )}
                </div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">₱{Number(item.price).toFixed(0)}</p>
                {item.description && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">{item.description}</p>
                )}
              </div>
            </div>

            <button
              onClick={() => deleteItem(item.id)}
              className="text-xs text-red-500 hover:text-red-700 hover:underline shrink-0 p-1 font-medium"
            >
              Delete
            </button>
          </div>
        ))}

        {items.length === 0 && (
          <div className="col-span-full py-12 text-center text-stone-500 bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-2xl">
            <p className="text-4xl mb-2">🍽️</p>
            <p className="font-serif font-medium text-stone-800 dark:text-stone-200">No menu items added yet</p>
            <p className="text-xs text-stone-400 mt-1 mb-4">Start creating your menu to attract local diners!</p>
            <Button onClick={() => setModalOpen(true)} className="bg-cordova-green hover:bg-cordova-greenHover text-white text-xs">
              + Add First Menu Item
            </Button>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Menu Item">
        <div className="space-y-4">
          <Input
            label="Item name"
            placeholder="e.g. Grilled Seafood Platter"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price (₱)"
              type="number"
              placeholder="e.g. 250"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Category (Optional)
              </label>
              <select
                value={newItem.categoryId}
                onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}
                className="input text-xs w-full py-2.5"
              >
                <option value="">-- Select Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Textarea
            label="Description"
            placeholder="Describe ingredients, flavor profile, or portion size..."
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
          />

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Food Photo (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
              className="w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer"
            />
            {imagePreview && (
              <div className="relative w-20 h-20 mt-2 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700">
                <Image src={imagePreview} alt="Preview" fill className="object-cover" />
              </div>
            )}
          </div>

          <Button onClick={addItem} loading={saving} className="w-full bg-cordova-green hover:bg-cordova-greenHover text-white">
            Add Menu Item
          </Button>
        </div>
      </Modal>

      {/* Add Category Modal */}
      <Modal open={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} title="Create Menu Category">
        <div className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Appetizers, Seafood Specials, Beverages"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            required
          />
          <Button onClick={addCategory} loading={saving} className="w-full bg-cordova-green hover:bg-cordova-greenHover text-white">
            Create Category
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
      if (Array.isArray(res.data) && res.data.length === 7) {
        setDays(res.data);
      }
    }).catch(() => {});
  }, [restaurantId]);

  const update = (idx: number, patch: Partial<OperatingHour>) => {
    setDays((prev) => prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)));
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/api/restaurants/${restaurantId}/hours`, {
        days: days.map((d, idx) => ({
          day_of_week: d.day_of_week !== undefined ? d.day_of_week : idx,
          open_time: d.open_time || '09:00',
          close_time: d.close_time || '21:00',
          is_closed: Boolean(d.is_closed),
        })),
      });
      toast('Operating hours updated successfully!', 'success');
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-5 max-w-xl space-y-4">
      <div className="space-y-3">
        {days.map((d, idx) => (
          <div key={idx} className="flex items-center gap-3 flex-wrap">
            <span className="w-24 text-sm font-medium text-stone-900 dark:text-white">{DAY_NAMES[idx]}</span>
            <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(d.is_closed)}
                onChange={(e) => update(idx, { is_closed: e.target.checked })}
                className="rounded border-stone-300 text-cordova-green focus:ring-cordova-green"
              />
              Closed
            </label>
            {!d.is_closed && (
              <>
                <input
                  type="time"
                  value={(d.open_time || '09:00').slice(0, 5)}
                  onChange={(e) => update(idx, { open_time: e.target.value })}
                  className="input !py-1.5 !px-2 w-28 text-xs"
                />
                <span className="text-[var(--text-muted)]">–</span>
                <input
                  type="time"
                  value={(d.close_time || '21:00').slice(0, 5)}
                  onChange={(e) => update(idx, { close_time: e.target.value })}
                  className="input !py-1.5 !px-2 w-28 text-xs"
                />
              </>
            )}
          </div>
        ))}
      </div>
      <Button onClick={save} loading={saving} className="bg-cordova-green hover:bg-cordova-greenHover text-white">
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
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'maya'>('gcash');
  const [referenceNo, setReferenceNo] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [renewTarget, setRenewTarget] = useState<Promotion | null>(null);
  const [renewEndDate, setRenewEndDate] = useState('');
  const [renewMethod, setRenewMethod] = useState<'gcash' | 'maya'>('gcash');
  const [renewRefNo, setRenewRefNo] = useState('');

  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: today,
    endDate: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast(`${label} copied to clipboard!`, 'info');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getDaysDuration = (start: string, end: string) => {
    if (!start || !end) return null;
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;
    const diffTime = e.getTime() - s.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : null;
  };

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

  const handleProceedToPayment = () => {
    if (!form.title.trim()) {
      toast('Please enter a promotion title', 'error');
      return;
    }
    if (!form.description.trim()) {
      toast('Please describe what you are promoting', 'error');
      return;
    }
    if (!form.startDate || !form.endDate) {
      toast('Please select both start date and end date', 'error');
      return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      toast('End date must be on or after start date', 'error');
      return;
    }
    setStep('payment');
  };

  const create = async () => {
    if (!referenceNo.trim()) {
      toast('Please enter your GCash / Maya transaction reference number', 'error');
      return;
    }
    setSaving(true);
    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('description', form.description);
        formData.append('startDate', form.startDate);
        formData.append('endDate', form.endDate);
        formData.append('publish', 'true');
        formData.append('paymentMethod', paymentMethod);
        formData.append('referenceNo', referenceNo.trim());
        formData.append('image', imageFile);

        await api.post(`/api/restaurants/${restaurantId}/promotions`, formData, { isFormData: true });
      } else {
        await api.post(`/api/restaurants/${restaurantId}/promotions`, {
          ...form,
          paymentMethod,
          referenceNo: referenceNo.trim(),
          publish: true,
        });
      }

      toast('Promotion submitted! Awaiting administrator payment verification.', 'success');
      setModalOpen(false);
      setStep('details');
      setReferenceNo('');
      setForm({
        title: '',
        description: '',
        startDate: today,
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
    if (new Date(renewEndDate) < new Date(today)) {
      toast('New expiry date must be today or in the future', 'error');
      return;
    }
    if (!renewRefNo.trim()) {
      toast('Please enter your GCash / Maya reference number for the ₱199 renewal', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.patch(`/api/restaurants/${restaurantId}/promotions/${renewTarget.id}`, {
        endDate: renewEndDate,
        status: 'pending_verification',
        paymentMethod: renewMethod,
        paymentReference: renewRefNo.trim(),
        paymentStatus: 'pending_verification',
      });
      toast('Renewal submitted! Awaiting administrator payment verification.', 'success');
      setRenewTarget(null);
      setRenewEndDate('');
      setRenewRefNo('');
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

  const durationDays = getDaysDuration(form.startDate, form.endDate);
  const renewDurationDays = renewTarget ? getDaysDuration(today, renewEndDate) : null;

  return (
    <div className="space-y-6">
      {/* ₱199 Promotion Feature Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-amber-950 text-white p-5 sm:p-6 rounded-2xl border border-cordova-gold/30 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 w-40 h-40 bg-cordova-gold/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="bg-cordova-gold text-stone-900 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                ₱199 ONLY
              </span>
              <span className="text-xs text-amber-200/80 font-semibold flex items-center gap-1">
                <Sparkles size={13} /> Flat Promotion Rate
              </span>
            </div>
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-white">
              Promote Your Store to Cordova Diners
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Promote your store on CordovaEATs for only <strong>₱199.00</strong> flat fee. Set what you want to promote, your start date, and your end date — once the promotion period ends, it <strong>automatically ends</strong> and is safely removed from public feeds.
            </p>
          </div>
          <Button
            onClick={() => {
              setStep('details');
              setModalOpen(true);
            }}
            className="bg-cordova-green hover:bg-cordova-greenHover text-white font-bold px-5 py-3 rounded-xl shrink-0 shadow-lg shadow-emerald-950/40 border border-emerald-400/30"
          >
            + Create Promotion (₱199)
          </Button>
        </div>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {promotions.map((p) => {
          const isPending = p.status === 'pending_verification' || p.payment_status === 'pending_verification';
          const isRejected = p.status === 'rejected' || p.payment_status === 'rejected';
          const isExpired = !isPending && !isRejected && (p.status === 'expired' || p.end_date < today);
          const isActive = p.status === 'active' && !isExpired && !isPending && !isRejected;

          return (
            <div
              key={p.id}
              className={`bg-white dark:bg-[#1a211c] border rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4 transition-all ${
                isPending
                  ? 'border-amber-400/70 dark:border-amber-500/50 ring-2 ring-amber-400/20'
                  : isRejected
                  ? 'border-rose-300 dark:border-rose-900/60'
                  : isActive
                  ? 'border-emerald-500/40 dark:border-emerald-500/30'
                  : 'border-stone-200 dark:border-stone-800 opacity-90'
              }`}
            >
              <div className="space-y-3">
                {p.image_url && (
                  <div className="relative h-36 w-full rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-800">
                    <Image src={p.image_url} alt={p.title} fill className="object-cover" />
                  </div>
                )}

                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-serif font-bold text-base text-stone-900 dark:text-white truncate">
                    {p.title}
                  </h4>
                  <Badge
                    color={
                      isPending
                        ? 'warning'
                        : isActive
                        ? 'success'
                        : isRejected
                        ? 'danger'
                        : 'neutral'
                    }
                  >
                    {isPending
                      ? 'Pending Review'
                      : isActive
                      ? 'Active'
                      : isRejected
                      ? 'Payment Rejected'
                      : 'Expired'}
                  </Badge>
                </div>

                {/* Pending Verification Notice */}
                {isPending && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Clock size={13} className="animate-pulse text-amber-600" />
                      <span>Payment Verification Under Review</span>
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300">
                      The administrator is reviewing your ₱199 payment (Ref: <span className="font-mono font-bold">{p.payment_reference || 'N/A'}</span> via {p.payment_method?.toUpperCase() || 'GCash'}). Once verified, your promotion will immediately go live to diners!
                    </p>
                  </div>
                )}

                {/* Rejected Notice */}
                {isRejected && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-900 dark:text-rose-200 space-y-1">
                    <p className="font-bold">Payment Verification Rejected</p>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300">
                      The administrator was unable to verify reference #{p.payment_reference}. Please re-submit with your correct receipt reference number.
                    </p>
                  </div>
                )}

                {p.discount_label && (
                  <span className="inline-block bg-cordova-gold/15 text-cordova-gold text-xs font-extrabold px-2.5 py-1 rounded-md border border-cordova-gold/30">
                    {p.discount_label}
                  </span>
                )}

                {p.description && (
                  <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-3 leading-relaxed">
                    {p.description}
                  </p>
                )}

                <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 space-y-1 text-xs text-stone-500">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-stone-400" />
                      <span>
                        {p.start_date} → {p.end_date}
                      </span>
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      ₱199 Fee
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px]">
                    <Clock size={12} className={isActive ? 'text-emerald-500' : isPending ? 'text-amber-500' : 'text-stone-400'} />
                    {isPending ? (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        Submitted • Awaiting admin verification
                      </span>
                    ) : isActive ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        Live now • Ends automatically on {p.end_date}
                      </span>
                    ) : isRejected ? (
                      <span className="text-rose-500 font-medium">
                        Rejected by admin
                      </span>
                    ) : (
                      <span className="text-red-500 font-medium">
                        Ended on {p.end_date} (Removed from public view)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                {(isExpired || isRejected) && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setRenewTarget(p);
                      setRenewEndDate(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
                    }}
                    className="text-xs py-1.5 px-3 font-semibold text-cordova-green hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                  >
                    🔄 {isRejected ? 'Re-submit Payment (₱199)' : 'Extend / Renew (₱199)'}
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
          <div className="col-span-full py-12 text-center text-stone-500 bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-2xl">
            <p className="text-3xl mb-2">🎁</p>
            <p className="font-serif font-bold text-base text-stone-800 dark:text-stone-200">
              No promotions published yet
            </p>
            <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
              Promote your special offer, dish, sale, or discount for only ₱199!
            </p>
            <Button
              onClick={() => {
                setStep('details');
                setModalOpen(true);
              }}
              className="mt-4 bg-cordova-green hover:bg-cordova-greenHover text-white text-xs font-bold"
            >
              + Launch First Promotion (₱199)
            </Button>
          </div>
        )}
      </div>

      {/* Create Promotion Modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setStep('details');
        }}
        title={step === 'details' ? 'Create Restaurant Promotion (₱199)' : 'Promotion Payment (₱199)'}
      >
        {step === 'details' ? (
          <div className="space-y-4">
            {/* Title */}
            <Input
              label="Promotion Title *"
              placeholder="e.g. Weekend Special, Buy 1 Take 1, 20% Off..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />

            {/* Description */}
            <div>
              <Textarea
                label="Description *"
                placeholder="Describe what you are promoting for diners to see (e.g. details of your special offer, newly launched recipe, discount, or storewide promo)..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Let diners know what they will enjoy when they visit or order from your store.
              </p>
            </div>

            {/* Date Pickers (Timing) */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Start Date *"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
              />
              <Input
                label="End Date (Expiry Date) *"
                type="date"
                value={form.endDate}
                min={form.startDate || today}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                required
              />
            </div>

            {/* Live Schedule & Auto-Expiry Notice */}
            {durationDays !== null ? (
              <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-500/30 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                  <Calendar size={14} />
                  <span>
                    Promotion Duration: <strong>{durationDays} days</strong> ({form.startDate} to {form.endDate})
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Clock size={12} className="shrink-0" />
                  <span>
                    <strong>Auto-Expiry:</strong> This promotion will automatically end and disappear from public view once {form.endDate} passes.
                  </span>
                </p>
              </div>
            ) : form.endDate && new Date(form.endDate) < new Date(form.startDate) ? (
              <p className="text-xs text-rose-500 font-semibold flex items-center gap-1">
                <AlertCircle size={13} /> End date must be on or after start date.
              </p>
            ) : null}

            {/* Optional Banner Image */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Banner / Food Photo (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer"
              />
            </div>

            {/* Fixed Rate Pricing Notice */}
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-500/30 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-amber-900 dark:text-amber-200">
                  Promotion Flat Fee: <span className="font-mono text-sm text-cordova-gold font-extrabold">₱199.00</span>
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300">
                  One-time flat fee for your entire selected promotional period.
                </p>
              </div>
              <span className="text-xl">💳</span>
            </div>

            <Button
              onClick={handleProceedToPayment}
              className="w-full bg-cordova-green hover:bg-cordova-greenHover text-white font-bold py-3 text-sm shadow-md"
            >
              Proceed to Payment (₱199.00) <ArrowRight size={15} className="ml-1.5" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Top Summary Box (matching Subscription style) */}
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">{form.title}</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300">
                  {durationDays ? `${durationDays} Days Duration (${form.startDate} to ${form.endDate})` : 'Scheduled Promotion'}
                </p>
              </div>
              <span className="font-bold text-sm text-amber-900 dark:text-amber-100">₱199</span>
            </div>

            {/* Payment Method Selector (matching Subscription style) */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                Choose Payment Method:
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* GCash Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('gcash')}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    paymentMethod === 'gcash'
                      ? 'border-[#007DFE] bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-[#007DFE]/40 shadow-sm'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="w-7 h-7 rounded-lg bg-[#007DFE] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                      G
                    </div>
                    <div>
                      <p className="font-bold text-xs text-stone-900 dark:text-white">GCash</p>
                      <p className="text-[10px] text-stone-500">Scan QR / InstaPay</p>
                    </div>
                  </div>
                  {paymentMethod === 'gcash' && <Check size={16} className="text-[#007DFE]" />}
                </button>

                {/* Maya Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('maya')}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    paymentMethod === 'maya'
                      ? 'border-[#00D665] bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-[#00D665]/40 shadow-sm'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="w-7 h-7 rounded-lg bg-[#00D665] flex items-center justify-center text-stone-900 font-bold text-xs shadow-sm">
                      m
                    </div>
                    <div>
                      <p className="font-bold text-xs text-stone-900 dark:text-white">Maya</p>
                      <p className="text-[10px] text-stone-500">Scan QR / Handle</p>
                    </div>
                  </div>
                  {paymentMethod === 'maya' && <Check size={16} className="text-[#00D665]" />}
                </button>
              </div>
            </div>

            {/* QR Code and Account Card (matching Subscription style) */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center gap-4">
              {/* QR Image */}
              <div className="shrink-0 text-center">
                <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-md border border-stone-200 dark:border-stone-700 bg-white p-2">
                  <Image
                    src={paymentMethod === 'gcash' ? '/images/payments/gcash-qr-card.png' : '/images/payments/maya-qr-card.png'}
                    alt={paymentMethod === 'gcash' ? 'GCash QR' : 'Maya QR'}
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <p className="text-[10px] text-stone-400 mt-1.5 flex items-center justify-center gap-1 font-medium">
                  <QrCode size={11} /> Scan with {paymentMethod === 'gcash' ? 'GCash' : 'Maya'} app
                </p>
              </div>

              {/* Payment Details */}
              <div className="flex-1 w-full space-y-2.5 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Payment Channel
                  </span>
                  <p className="font-bold text-stone-800 dark:text-stone-100 flex items-center gap-1.5">
                    <span className={`inline-block w-2 h-2 rounded-full ${paymentMethod === 'gcash' ? 'bg-[#007DFE]' : 'bg-[#00D665]'}`} />
                    {paymentMethod === 'gcash' ? 'GCash (InstaPay Supported)' : 'Maya (InstaPay Supported)'}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Account Name
                  </span>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                    <span className="font-mono font-bold text-stone-800 dark:text-stone-100">
                      {paymentMethod === 'gcash' ? 'JOHN HERNAN L.' : 'JOHN HERNAN LICAMI'}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          paymentMethod === 'gcash' ? 'JOHN HERNAN L.' : 'JOHN HERNAN LICAMI',
                          'Account Name'
                        )
                      }
                      className="text-stone-500 hover:text-cordova-green transition-colors"
                      title="Copy Account Name"
                    >
                      {copiedField === 'Account Name' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {paymentMethod === 'maya' && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Maya Handle
                    </span>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                      <span className="font-mono font-bold text-stone-800 dark:text-stone-100">
                        @licamijohnhernan
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('@licamijohnhernan', 'Maya Handle')}
                        className="text-stone-500 hover:text-cordova-green transition-colors"
                        title="Copy Maya Handle"
                      >
                        {copiedField === 'Maya Handle' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Mobile Number
                  </span>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                    <span className="font-mono font-bold text-stone-800 dark:text-stone-100">
                      +63 992 512 5811
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('+639925125811', 'Mobile Number')}
                      className="text-stone-500 hover:text-cordova-green transition-colors"
                      title="Copy Mobile Number"
                    >
                      {copiedField === 'Mobile Number' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Reference Number Field (matching Subscription style) */}
            <div>
              <Input
                label="Transaction / Reference Number *"
                placeholder="e.g. 1029384756 (from your GCash / Maya receipt)"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                required
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Required for payment verification by the platform administrator.
              </p>
            </div>

            {/* Buttons (matching Subscription style) */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setStep('details')}
                className="w-1/3"
                disabled={saving}
              >
                <ArrowLeft size={14} className="mr-1" /> Back
              </Button>
              <Button
                type="button"
                onClick={create}
                loading={saving}
                className="w-2/3 bg-cordova-green hover:bg-cordova-greenHover text-white font-bold"
              >
                <Check size={14} className="mr-1" /> Confirm & Publish (₱199)
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Extend / Renew Modal (₱199 Renewal matching Subscription style) */}
      <Modal
        open={!!renewTarget}
        onClose={() => {
          setRenewTarget(null);
          setRenewRefNo('');
        }}
        title={`Renew Promotion: ${renewTarget?.title || ''}`}
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">{renewTarget?.title}</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                {renewDurationDays ? `${renewDurationDays} Days Extension (until ${renewEndDate})` : 'Extend Promotion Period'}
              </p>
            </div>
            <span className="font-bold text-sm text-amber-900 dark:text-amber-100">₱199</span>
          </div>

          <Input
            label="New Expiry Date *"
            type="date"
            value={renewEndDate}
            min={today}
            onChange={(e) => setRenewEndDate(e.target.value)}
            required
          />

          {/* Payment Method Selector for Renewal */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
              Choose Payment Method:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRenewMethod('gcash')}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  renewMethod === 'gcash'
                    ? 'border-[#007DFE] bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-[#007DFE]/40 shadow-sm'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-7 h-7 rounded-lg bg-[#007DFE] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    G
                  </div>
                  <div>
                    <p className="font-bold text-xs text-stone-900 dark:text-white">GCash</p>
                    <p className="text-[10px] text-stone-500">Scan QR / InstaPay</p>
                  </div>
                </div>
                {renewMethod === 'gcash' && <Check size={16} className="text-[#007DFE]" />}
              </button>

              <button
                type="button"
                onClick={() => setRenewMethod('maya')}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  renewMethod === 'maya'
                    ? 'border-[#00D665] bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-[#00D665]/40 shadow-sm'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-7 h-7 rounded-lg bg-[#00D665] flex items-center justify-center text-stone-900 font-bold text-xs shadow-sm">
                    m
                  </div>
                  <div>
                    <p className="font-bold text-xs text-stone-900 dark:text-white">Maya</p>
                    <p className="text-[10px] text-stone-500">Scan QR / Handle</p>
                  </div>
                </div>
                {renewMethod === 'maya' && <Check size={16} className="text-[#00D665]" />}
              </button>
            </div>
          </div>

          {/* QR and Account Info */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center gap-4">
            <div className="shrink-0 text-center">
              <div className="relative w-36 h-36 rounded-xl overflow-hidden shadow-md border border-stone-200 dark:border-stone-700 bg-white p-2">
                <Image
                  src={renewMethod === 'gcash' ? '/images/payments/gcash-qr-card.png' : '/images/payments/maya-qr-card.png'}
                  alt="QR Code"
                  fill
                  className="object-contain p-1"
                />
              </div>
              <p className="text-[10px] text-stone-400 mt-1 font-medium">
                Scan with {renewMethod === 'gcash' ? 'GCash' : 'Maya'} app
              </p>
            </div>
            <div className="flex-1 w-full space-y-2 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Account Name</span>
                <p className="font-mono font-bold text-stone-800 dark:text-stone-100">
                  {renewMethod === 'gcash' ? 'JOHN HERNAN L.' : 'JOHN HERNAN LICAMI'}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Mobile Number</span>
                <p className="font-mono font-bold text-stone-800 dark:text-stone-100">+63 992 512 5811</p>
              </div>
              {renewMethod === 'maya' && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Maya Handle</span>
                  <p className="font-mono font-bold text-stone-800 dark:text-stone-100">@licamijohnhernan</p>
                </div>
              )}
            </div>
          </div>

          <Input
            label="Transaction / Reference Number *"
            placeholder="e.g. 1029384756 (from your GCash / Maya receipt)"
            value={renewRefNo}
            onChange={(e) => setRenewRefNo(e.target.value)}
            required
          />

          <Button
            onClick={renewPromotion}
            loading={saving}
            className="w-full bg-cordova-green hover:bg-cordova-greenHover text-white font-bold py-2.5"
          >
            Confirm Renewal (₱199)
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

// ---------------- Subscription & Ranking Boost Tab ----------------
function SubscriptionTab({ restaurant, onUpdated }: { restaurant: Restaurant; onUpdated: () => void }) {
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);
  const [payTier, setPayTier] = useState<any | null>(null);
  const [payMethod, setPayMethod] = useState<'gcash' | 'maya'>('gcash');
  const [referenceNo, setReferenceNo] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [subData, setSubData] = useState<any>(null);

  const fetchSubscriptionData = useCallback(async () => {
    try {
      const res = await api.get(`/api/restaurants/${restaurant.id}/subscription`);
      setSubData(res.data);
    } catch {
      // Non-critical
    }
  }, [restaurant.id]);

  useEffect(() => {
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  const currentTier = (restaurant.subscription_tier || 'none').toLowerCase();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast(`${label} copied to clipboard!`, 'info');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const TIERS = [
    {
      id: 'none',
      name: 'Free / Standard',
      price: '₱0 / month',
      boost: '1.0x (No Boost)',
      badge: 'neutral',
      features: [
        'Standard search indexing',
        'Direct menu & info display',
        'Customer reviews & ratings',
      ],
    },
    {
      id: 'basic',
      name: 'Basic Boost',
      price: '₱499 / month',
      boost: '1.1x Ranking Boost',
      badge: 'brand',
      features: [
        '1.1x relevance multiplier',
        'Higher priority in local searches',
        'Included in dish & cuisine filters',
      ],
    },
    {
      id: 'premium',
      name: 'Premium Boost',
      price: '₱999 / month',
      boost: '1.3x Ranking Boost',
      badge: 'success',
      features: [
        '1.3x relevance multiplier',
        'Substantial boost over non-subscribers',
        'Higher chance of top 5 placements',
      ],
    },
    {
      id: 'featured',
      name: 'Featured Partner',
      price: '₱1,999 / month',
      boost: '1.5x Maximum Boost + Sponsored Slots',
      badge: 'warning',
      features: [
        '1.5x maximum relevance multiplier',
        'Reserved Top 2 Sponsored positions',
        'Distinctive "Sponsored" gold badge',
      ],
    },
  ] as const;

  const handleSelectTier = (tier: any) => {
    if (tier.id === 'none') {
      handleUpdateTier('none');
    } else {
      setPayTier(tier);
      setReferenceNo('');
    }
  };

  const handleUpdateTier = async (tier: string) => {
    if (tier !== 'none' && !referenceNo.trim()) {
      toast('Please enter your GCash / Maya transaction or reference number', 'error');
      return;
    }
    setUpdating(true);
    try {
      const res = await api.patch(`/api/restaurants/${restaurant.id}/subscription`, {
        subscription_tier: tier,
        durationDays: 30,
        payment_method: payMethod,
        payment_reference: referenceNo.trim(),
      });
      if (res.data?.pending) {
        toast('Payment submitted! Awaiting administrator verification.', 'success');
      } else {
        toast(`Subscription updated to ${tier.toUpperCase()}`, 'success');
      }
      setPayTier(null);
      setReferenceNo('');
      fetchSubscriptionData();
      onUpdated();
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Failed to update subscription', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const daysRemaining = restaurant.subscription_expires_at
    ? Math.max(0, Math.ceil((new Date(restaurant.subscription_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="space-y-8">
      {/* Pending Verification Banner */}
      {subData?.pending_transaction && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-xs text-amber-900 dark:text-amber-100 shadow-sm">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
            <Clock size={20} className="animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-stone-900 dark:text-white">
                Payment Verification Pending
              </span>
              <span className="bg-amber-500 text-stone-900 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                {subData.pending_transaction.tier} Tier ({subData.pending_transaction.price})
              </span>
            </div>
            <p className="text-stone-600 dark:text-stone-300">
              We received your payment reference <span className="font-mono font-bold text-stone-900 dark:text-white">#{subData.pending_transaction.payment_reference}</span> via <span className="font-bold uppercase">{subData.pending_transaction.payment_method}</span>. The platform administrator is verifying your transaction. Once confirmed, your 30-day ranking boost will be activated automatically!
            </p>
          </div>
        </div>
      )}

      {/* Current Status Banner */}
      <div className="bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Active Tier
          </span>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-2xl font-bold font-serif capitalize text-stone-900 dark:text-white">
              {currentTier} Tier
            </h2>
            <Badge color={currentTier === 'featured' ? 'warning' : currentTier === 'premium' ? 'success' : currentTier === 'basic' ? 'brand' : 'neutral'}>
              {currentTier === 'featured' ? '1.5x Boost' : currentTier === 'premium' ? '1.3x Boost' : currentTier === 'basic' ? '1.1x Boost' : '1.0x Base'}
            </Badge>
          </div>
          {restaurant.subscription_expires_at ? (
            <div className="mt-2 space-y-0.5">
              <p className="text-xs font-semibold text-cordova-green dark:text-emerald-400 flex items-center gap-1.5">
                <Calendar size={13} />
                <span>Active until: {new Date(restaurant.subscription_expires_at).toLocaleDateString()}</span>
              </p>
              <p className="text-[11px] text-stone-400">
                {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining in current billing period
              </p>
            </div>
          ) : (
            <p className="text-xs text-stone-500 mt-1">Free tier active indefinitely.</p>
          )}
        </div>

        <div className="text-xs text-stone-500 max-w-xs bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50">
          💡 <span className="font-semibold text-stone-800 dark:text-stone-200">How Boost Works:</span> When users search for keywords, cuisines, or dishes, your relevance score is multiplied by your tier rate.
        </div>
      </div>

      {/* Plan Selection Cards */}
      <div>
        <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-white mb-4">
          Choose a Subscription & Ranking Tier
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TIERS.map((tier) => {
            const isCurrent = currentTier === tier.id;
            return (
              <div
                key={tier.id}
                className={`bg-white dark:bg-[#1a211c] rounded-xl border p-5 flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'border-cordova-green ring-2 ring-cordova-green/30 shadow-md'
                    : 'border-stone-200 dark:border-stone-800 shadow-sm hover:border-cordova-gold'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-white">
                      {tier.name}
                    </h4>
                    {isCurrent && (
                      <span className="text-[10px] uppercase tracking-wider font-bold bg-cordova-green text-white px-2 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-xl font-bold text-stone-900 dark:text-white">{tier.price}</p>
                    <p className="text-xs font-semibold text-cordova-green dark:text-emerald-400 mt-0.5">
                      {tier.boost}
                    </p>
                  </div>

                  <ul className="space-y-2 pt-3 border-t border-stone-100 dark:border-stone-800">
                    {tier.features.map((f, idx) => (
                      <li key={idx} className="text-xs text-stone-600 dark:text-stone-300 flex items-start gap-1.5">
                        <span className="text-cordova-green font-bold shrink-0">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-4 border-t border-stone-100 dark:border-stone-800">
                  <Button
                    onClick={() => handleSelectTier(tier)}
                    loading={updating}
                    variant={isCurrent ? 'secondary' : tier.id === 'featured' ? 'primary' : 'secondary'}
                    disabled={isCurrent || updating}
                    className={`w-full text-xs font-bold uppercase tracking-wider ${
                      tier.id === 'featured' && !isCurrent
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                        : ''
                    }`}
                  >
                    {isCurrent ? 'Current Plan' : tier.id === 'none' ? 'Downgrade to Free' : 'Upgrade Plan'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subscription Tier Payment Modal */}
      <Modal
        open={!!payTier}
        onClose={() => setPayTier(null)}
        title={`Activate ${payTier?.name}`}
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">{payTier?.name}</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300">{payTier?.boost}</p>
            </div>
            <span className="font-bold text-sm text-amber-900 dark:text-amber-100">{payTier?.price}</span>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
              Choose Payment Method:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* GCash Option */}
              <button
                type="button"
                onClick={() => setPayMethod('gcash')}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  payMethod === 'gcash'
                    ? 'border-[#007DFE] bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-[#007DFE]/40 shadow-sm'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-7 h-7 rounded-lg bg-[#007DFE] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    G
                  </div>
                  <div>
                    <p className="font-bold text-xs text-stone-900 dark:text-white">GCash</p>
                    <p className="text-[10px] text-stone-500">Scan QR / InstaPay</p>
                  </div>
                </div>
                {payMethod === 'gcash' && <Check size={16} className="text-[#007DFE]" />}
              </button>

              {/* Maya Option */}
              <button
                type="button"
                onClick={() => setPayMethod('maya')}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  payMethod === 'maya'
                    ? 'border-[#00D665] bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-[#00D665]/40 shadow-sm'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-7 h-7 rounded-lg bg-[#00D665] flex items-center justify-center text-stone-900 font-bold text-xs shadow-sm">
                    m
                  </div>
                  <div>
                    <p className="font-bold text-xs text-stone-900 dark:text-white">Maya</p>
                    <p className="text-[10px] text-stone-500">Scan QR / Handle</p>
                  </div>
                </div>
                {payMethod === 'maya' && <Check size={16} className="text-[#00D665]" />}
              </button>
            </div>
          </div>

          {/* QR Code and Account Card */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center gap-4">
            {/* QR Image */}
            <div className="shrink-0 text-center">
              <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-md border border-stone-200 dark:border-stone-700 bg-white p-2">
                <Image
                  src={payMethod === 'gcash' ? '/images/payments/gcash-qr-card.png' : '/images/payments/maya-qr-card.png'}
                  alt={payMethod === 'gcash' ? 'GCash QR' : 'Maya QR'}
                  fill
                  className="object-contain p-1"
                />
              </div>
              <p className="text-[10px] text-stone-400 mt-1.5 flex items-center justify-center gap-1 font-medium">
                <QrCode size={11} /> Scan with {payMethod === 'gcash' ? 'GCash' : 'Maya'} app
              </p>
            </div>

            {/* Payment Details */}
            <div className="flex-1 w-full space-y-2.5 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Payment Channel
                </span>
                <p className="font-bold text-stone-800 dark:text-stone-100 flex items-center gap-1.5">
                  <span className={`inline-block w-2 h-2 rounded-full ${payMethod === 'gcash' ? 'bg-[#007DFE]' : 'bg-[#00D665]'}`} />
                  {payMethod === 'gcash' ? 'GCash (InstaPay Supported)' : 'Maya (InstaPay Supported)'}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Account Name
                </span>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  <span className="font-mono font-bold text-stone-800 dark:text-stone-100">
                    {payMethod === 'gcash' ? 'JOHN HERNAN L.' : 'JOHN HERNAN LICAMI'}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        payMethod === 'gcash' ? 'JOHN HERNAN L.' : 'JOHN HERNAN LICAMI',
                        'Account Name'
                      )
                    }
                    className="text-stone-500 hover:text-cordova-green transition-colors"
                    title="Copy Account Name"
                  >
                    {copiedField === 'Account Name' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {payMethod === 'maya' && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Maya Handle
                  </span>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                    <span className="font-mono font-bold text-stone-800 dark:text-stone-100">
                      @licamijohnhernan
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('@licamijohnhernan', 'Maya Handle')}
                      className="text-stone-500 hover:text-cordova-green transition-colors"
                      title="Copy Maya Handle"
                    >
                      {copiedField === 'Maya Handle' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Mobile Number
                </span>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  <span className="font-mono font-bold text-stone-800 dark:text-stone-100">
                    +63 992 512 5811
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('+639925125811', 'Mobile Number')}
                    className="text-stone-500 hover:text-cordova-green transition-colors"
                    title="Copy Mobile Number"
                  >
                    {copiedField === 'Mobile Number' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Reference Number Field */}
          <div>
            <Input
              label="Transaction / Reference Number *"
              placeholder="e.g. 1029384756 (from your GCash / Maya receipt)"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              required
            />
            <p className="text-[11px] text-stone-400 mt-1">
              Required for payment verification by the platform administrator.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setPayTier(null)}
              className="w-1/3"
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => handleUpdateTier(payTier?.id)}
              loading={updating}
              className="w-2/3 bg-cordova-green hover:bg-cordova-greenHover text-white font-bold"
            >
              <Check size={14} className="mr-1" /> Confirm & Activate
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
