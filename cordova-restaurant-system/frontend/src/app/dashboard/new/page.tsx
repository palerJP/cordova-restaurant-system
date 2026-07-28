'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiClientError } from '@/lib/api';
import { useToast } from '@/lib/toast-context';
import { useCuisines } from '@/hooks/useCuisines';
import { RequireRole } from '@/components/RequireRole';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const SERVICE_OPTIONS = [
  { value: 'dine_in', label: 'Dine-in' },
  { value: 'takeout', label: 'Takeout' },
  { value: 'delivery', label: 'Delivery' },
];
const DIETARY_OPTIONS = ['vegetarian', 'vegan', 'halal', 'gluten_free'];

export default function NewBusinessPage() {
  const router = useRouter();
  const { toast } = useToast();
  const cuisines = useCuisines();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [barangay, setBarangay] = useState('');
  const [latitude, setLatitude] = useState('10.2531');
  const [longitude, setLongitude] = useState('123.9494');
  const [phone, setPhone] = useState('');
  const [priceRange, setPriceRange] = useState('moderate');
  const [services, setServices] = useState<string[]>(['dine_in']);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [dietary, setDietary] = useState<string[]>([]);
  const [permitFile, setPermitFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const toggle = (arr: string[], setArr: (v: string[]) => void, value: string) => {
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = 'Business name is required';
    if (address.trim().length < 5) e.address = 'Address is required';
    if (!latitude || !longitude) e.location = 'Map coordinates are required';
    if (services.length === 0) e.services = 'Select at least one service type';
    if (!permitFile) e.permit = 'Business permit document is required for verification';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('address', address);
      formData.append('barangay', barangay);
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);
      formData.append('phone', phone);
      formData.append('priceRange', priceRange);
      formData.append('servicesOffered', JSON.stringify(services));
      formData.append('cuisineSlugs', JSON.stringify(selectedCuisines));
      formData.append('dietaryOptions', JSON.stringify(dietary));
      if (permitFile) formData.append('businessPermit', permitFile);

      await api.post('/api/restaurants', formData, { isFormData: true });
      toast('Business submitted for verification!', 'success');
      router.push('/dashboard');
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RequireRole roles={['owner']}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Register Your Business</h1>
        <p className="text-[var(--text-muted)] mb-6 text-sm">
          Submit your restaurant details and business permit. An admin will review and verify your listing before it
          appears publicly.
        </p>

        <form onSubmit={onSubmit} className="card p-6 space-y-4" noValidate>
          <Input label="Business name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} required />
          <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} error={errors.address} required />
          <Input label="Barangay" value={barangay} onChange={(e) => setBarangay(e.target.value)} />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Latitude" type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
            <Input label="Longitude" type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
          </div>
          {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}

          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+63 9XX XXX XXXX" />

          <Select label="Price range" value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
            <option value="budget">₱ Budget-friendly</option>
            <option value="moderate">₱₱ Moderate</option>
            <option value="expensive">₱₱₱ Expensive</option>
            <option value="premium">₱₱₱₱ Premium</option>
          </Select>

          <div>
            <p className="label mb-2">Services offered</p>
            <div className="flex flex-wrap gap-2">
              {SERVICE_OPTIONS.map((s) => (
                <button key={s.value} type="button" onClick={() => toggle(services, setServices, s.value)}>
                  <Badge color={services.includes(s.value) ? 'brand' : 'neutral'}>{s.label}</Badge>
                </button>
              ))}
            </div>
            {errors.services && <p className="text-sm text-red-500 mt-1">{errors.services}</p>}
          </div>

          <div>
            <p className="label mb-2">Cuisines</p>
            <div className="flex flex-wrap gap-2">
              {cuisines.map((c) => (
                <button key={c.slug} type="button" onClick={() => toggle(selectedCuisines, setSelectedCuisines, c.slug)}>
                  <Badge color={selectedCuisines.includes(c.slug) ? 'brand' : 'neutral'}>{c.name}</Badge>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="label mb-2">Dietary options offered</p>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((d) => (
                <button key={d} type="button" onClick={() => toggle(dietary, setDietary, d)}>
                  <Badge color={dietary.includes(d) ? 'brand' : 'neutral'}>{d.replace('_', ' ')}</Badge>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label" htmlFor="permit">
              Business permit (image or PDF)
            </label>
            <input
              id="permit"
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              onChange={(e) => setPermitFile(e.target.files?.[0] || null)}
              className="input"
            />
            {errors.permit && <p className="text-sm text-red-500 mt-1">{errors.permit}</p>}
          </div>

          <Button type="submit" className="w-full" loading={submitting}>
            Submit for verification
          </Button>
        </form>
      </div>
    </RequireRole>
  );
}
