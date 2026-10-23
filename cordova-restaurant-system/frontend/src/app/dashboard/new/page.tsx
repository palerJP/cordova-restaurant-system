'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { UploadCloud, Image as ImageIcon, X, CheckCircle2 } from 'lucide-react';
import { api, ApiClientError } from '@/lib/api';
import { useToast } from '@/lib/toast-context';
import { useAuth } from '@/lib/auth-context';
import { useCuisines } from '@/hooks/useCuisines';
import { RequireRole } from '@/components/RequireRole';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SelectionOption } from '@/components/ui/SelectionOption';
import { Button } from '@/components/ui/Button';
import { BusinessAddressLookup, type BusinessLocation } from '@/components/BusinessAddressLookup';

const SERVICE_OPTIONS = [
  { value: 'dine_in', label: 'Dine-in' },
  { value: 'takeout', label: 'Takeout' },
  { value: 'delivery', label: 'Delivery' },
];
const DIETARY_OPTIONS = ['vegetarian', 'vegan', 'halal', 'gluten_free'];

export default function NewBusinessPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { refreshUser } = useAuth();
  const cuisines = useCuisines();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [barangay, setBarangay] = useState('');
  const [location, setLocation] = useState<BusinessLocation | null>(null);
  const [phone, setPhone] = useState('');
  const [priceRange, setPriceRange] = useState('moderate');
  const [services, setServices] = useState<string[]>(['dine_in']);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [dietary, setDietary] = useState<string[]>([]);
  
  // Business Logo / Cover Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');

  const [permitFile, setPermitFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const toggle = (arr: string[], setArr: (v: string[]) => void, value: string) => {
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = 'Business name is required (at least 2 characters)';
    if (address.trim().length < 5) e.address = 'Address is required (at least 5 characters)';
    if (!location) e.location = 'Find your address and confirm its location on the map.';
    if (services.length === 0) e.services = 'Select at least one service type';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      if (description.trim()) formData.append('description', description.trim());
      formData.append('address', address.trim());
      if (barangay.trim()) formData.append('barangay', barangay.trim());
      formData.append('latitude', String(location!.latitude));
      formData.append('longitude', String(location!.longitude));
      if (phone.trim()) formData.append('phone', phone.trim());
      formData.append('priceRange', priceRange);
      formData.append('servicesOffered', JSON.stringify(services));
      formData.append('cuisineSlugs', JSON.stringify(selectedCuisines));
      formData.append('dietaryOptions', JSON.stringify(dietary));
      
      // Upload Logo / Photo
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imageUrl.trim()) {
        formData.append('coverImageUrl', imageUrl.trim());
      }

      // Business Permit (optional or attached)
      if (permitFile) formData.append('businessPermit', permitFile);

      const res = await api.post('/api/restaurants', formData, { isFormData: true });
      await refreshUser();
      toast('Business submitted for municipal admin review! It will appear publicly once approved.', 'success');
      
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiClientError && err.details?.length) {
        const fieldErrors: Record<string, string> = {};
        err.details.forEach((d) => {
          fieldErrors[d.field] = d.message;
        });
        setErrors(fieldErrors);
        toast(err.details[0].message || err.message, 'error');
      } else if (err instanceof ApiClientError) {
        toast(err.message, 'error');
      } else {
        toast('Submission failed. Please check the form and try again.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RequireRole roles={['owner', 'admin', 'customer']}>
      <div className="max-w-2xl mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-serif font-bold text-stone-900 dark:text-white mb-2">
            Register Your Restaurant
          </h1>
          <p className="text-stone-600 dark:text-stone-300 text-sm">
            Add your establishment details, photo/logo, and business permit. Your registration will be reviewed and verified by municipal administrators before appearing publicly on CordovaEats.
          </p>
        </div>

        <form onSubmit={onSubmit} className="bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6" noValidate>
          {/* Section: Basic Info */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-cordova-green dark:text-emerald-400">
              1. Basic Establishment Information
            </h2>
            <Input label="Business Name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} placeholder="e.g. Isla Grill & Seafood" required />
            <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your specialty dishes, ambiance, and dining experience..." />
          </div>

          {/* Section: Logo / Cover Photo Upload */}
          <div className="space-y-3 pt-2 border-t border-stone-100 dark:border-stone-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-cordova-green dark:text-emerald-400 flex items-center gap-2">
              <ImageIcon size={16} />
              <span>2. Business Logo or Cover Photo</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Upload a high quality logo or photo of your restaurant/dishes to showcase to customers.
            </p>

            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 max-h-56 w-full bg-stone-100 dark:bg-stone-900 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Restaurant Logo Preview"
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-600 text-white rounded-full transition-colors"
                  title="Remove Photo"
                >
                  <X size={16} />
                </button>
                <div className="absolute bottom-2 left-2 bg-emerald-600/90 text-white text-[11px] px-2.5 py-1 rounded-full font-medium flex items-center gap-1 shadow">
                  <CheckCircle2 size={12} />
                  <span>Photo Ready</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-cordova-green dark:hover:border-emerald-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-stone-50/50 dark:bg-stone-900/50 group">
                  <UploadCloud size={32} className="text-stone-400 group-hover:text-cordova-green transition-colors mb-2" />
                  <span className="text-xs font-semibold text-stone-700 dark:text-stone-200">
                    Click or drag & drop to upload Restaurant Logo / Cover Photo
                  </span>
                  <span className="text-[11px] text-stone-400 mt-1">
                    PNG, JPG, WebP up to 5MB
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400">Or paste image URL:</span>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="flex-1 px-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-cordova-green"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section: Location */}
          <div className="space-y-4 pt-2 border-t border-stone-100 dark:border-stone-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-cordova-green dark:text-emerald-400">
              3. Location & Contact Details
            </h2>
            <BusinessAddressLookup address={address} barangay={barangay}
              onAddressChange={setAddress} onBarangayChange={setBarangay}
              value={location} onChange={setLocation} error={errors.address || (!location ? errors.location : undefined)} />

            <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+63 9XX XXX XXXX" />
          </div>

          {/* Section: Dining Features & Cuisines */}
          <div className="space-y-4 pt-2 border-t border-stone-100 dark:border-stone-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-cordova-green dark:text-emerald-400">
              4. Dining Features & Cuisines
            </h2>

            <p className="text-base text-stone-700 dark:text-stone-200">Choose all that apply. A checkmark means selected. Tap again to clear.</p>

            <Select label="Price Range" value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
              <option value="budget">₱ Budget-friendly (Under ₱200)</option>
              <option value="moderate">₱₱ Moderate (₱200 - ₱500)</option>
              <option value="expensive">₱₱₱ Expensive (₱500 - ₱1000)</option>
              <option value="premium">₱₱₱₱ Premium / Fine Dining (₱1000+)</option>
            </Select>

            <fieldset>
              <legend className="text-base font-bold text-stone-800 dark:text-stone-100 mb-2">
                Services Offered
              </legend>
              <div className="flex flex-wrap gap-2">
                {SERVICE_OPTIONS.map((s) => (
                  <SelectionOption key={s.value} selected={services.includes(s.value)} onClick={() => toggle(services, setServices, s.value)}>
                    {s.label}
                  </SelectionOption>
                ))}
              </div>
              {errors.services && <p className="text-sm text-red-500 mt-1">{errors.services}</p>}
            </fieldset>

            <fieldset>
              <legend className="text-base font-bold text-stone-800 dark:text-stone-100 mb-2">
                Cuisine Categories
              </legend>
              <div className="flex flex-wrap gap-2">
                {cuisines.map((c) => (
                  <SelectionOption key={c.slug} selected={selectedCuisines.includes(c.slug)} onClick={() => toggle(selectedCuisines, setSelectedCuisines, c.slug)}>
                    {c.name}
                  </SelectionOption>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-base font-bold text-stone-800 dark:text-stone-100 mb-2">
                Dietary Options
              </legend>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map((d) => (
                  <SelectionOption key={d} selected={dietary.includes(d)} onClick={() => toggle(dietary, setDietary, d)}>
                    {d.replace('_', ' ')}
                  </SelectionOption>
                ))}
              </div>
            </fieldset>
          </div>

          {/* Section: Business Permit Document (Optional) */}
          <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block" htmlFor="permit">
              Business Permit / Mayor&apos;s Permit (Optional)
            </label>
            <input
              id="permit"
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              onChange={(e) => setPermitFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-stone-600 dark:text-stone-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-stone-100 dark:file:bg-stone-800 file:text-stone-700 dark:file:text-stone-200 hover:file:bg-stone-200"
            />
          </div>

          <Button type="submit" className="w-full py-3.5 text-sm font-bold bg-cordova-green hover:bg-cordova-greenHover text-white shadow-md rounded-xl" loading={submitting}>
            Register & Publish Business
          </Button>
        </form>
      </div>
    </RequireRole>
  );
}
