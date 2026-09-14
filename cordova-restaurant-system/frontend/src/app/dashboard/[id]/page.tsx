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
import { Copy, Check, QrCode, ArrowLeft, ArrowRight, Smartphone, Sparkles, AlertCircle, Clock, Calendar } from 'lucide-react';
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

  const [form, setForm] = useState({
    title: '',
    description: '',
    discountLabel: '',
    startDate: new Date().toISOString().slice(0, 10),
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
    if (!form.title.trim() || !form.startDate || !form.endDate) {
      toast('Please provide a title, start date, and end date', 'error');
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
      toast('Please enter your GCash / Maya transaction or reference number', 'error');
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

      toast('Promotion created and submitted for verification successfully!', 'success');
      setModalOpen(false);
      setStep('details');
      setReferenceNo('');
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
        <Button
          onClick={() => {
            setStep('details');
            setModalOpen(true);
          }}
          className="bg-cordova-green hover:bg-cordova-greenHover text-white"
        >
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
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setStep('details');
        }}
        title={step === 'details' ? 'Create Restaurant Promotion' : 'Promotion Payment & QR Verification'}
      >
        {step === 'details' ? (
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

            <Button
              onClick={handleProceedToPayment}
              className="w-full bg-cordova-green hover:bg-cordova-greenHover text-white font-bold"
            >
              Proceed to Payment & QR Code <ArrowRight size={14} className="ml-1.5" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Payment Method Selector */}
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

            {/* QR Code and Account Card */}
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

            {/* Navigation & Submit Buttons */}
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
                <Check size={14} className="mr-1" /> Confirm & Publish
              </Button>
            </div>
          </div>
        )}
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
