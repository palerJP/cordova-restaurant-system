'use client';

import { useEffect, useState } from 'react';
import { api, ApiClientError } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export type { BusinessLocation } from '@/lib/business-address-server';
import type { BusinessLocation } from '@/lib/business-address-server';

interface Props {
  address: string;
  barangay: string;
  onAddressChange: (value: string) => void;
  onBarangayChange: (value: string) => void;
  value: BusinessLocation | null;
  onChange: (location: BusinessLocation | null) => void;
  error?: string;
}

export function BusinessAddressLookup({ address, barangay, onAddressChange, onBarangayChange, value, onChange, error }: Props) {
  const [results, setResults] = useState<BusinessLocation[]>([]);
  const [selected, setSelected] = useState<BusinessLocation | null>(null);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    setSelected(null);
    setResults([]);
    setStatus('');
    setBusy(false);
    if (value || address.trim().length < 5) return;
    let cancelled = false;
    const controller = new AbortController();
    setBusy(true);
    const timer = setTimeout(async () => {
      try {
        // This route belongs to Next.js rather than the separate backend project.
        const res = await api.post('/api/business-location', { address, barangay }, { signal: controller.signal, sameOrigin: true });
        if (cancelled) return;
        const matches: BusinessLocation[] = res.data.results;
        setResults(matches);
        setSelected(matches[0] || null);
        setStatus(matches.length ? 'Check the matching location on the map before confirming.' : 'No street or business match found. Add a street name or nearby landmark in Cordova.');
      } catch (err) {
        if (!cancelled) setStatus(err instanceof ApiClientError ? err.message : 'Could not look up this address. Please try again.');
      } finally {
        if (!cancelled) setBusy(false);
      }
    }, 1500);
    return () => { cancelled = true; controller.abort(); clearTimeout(timer); };
  }, [address, barangay, retry, value]);

  const edit = (next: string, field: 'address' | 'barangay') => {
    onChange(null);
    setSelected(null);
    setResults([]);
    if (field === 'address') onAddressChange(next); else onBarangayChange(next);
  };
  const pin = value || selected;

  return (
    <div className="space-y-3">
      <Input id="business-street-address" label="Street Address" value={address} onChange={(e) => edit(e.target.value, 'address')} placeholder="Street, building, or nearby landmark in Cordova, Cebu" required error={error} />
      <Input id="business-barangay" label="Barangay" value={barangay} onChange={(e) => edit(e.target.value, 'barangay')} placeholder="e.g. Day-as, Gabi, Poblacion" />
      <p className="text-xs text-stone-500 dark:text-stone-400">Enter your address and we’ll find its location. Check the pin before saving your business.</p>
      <p role="status" className="text-sm">{value ? 'Location confirmed. Changing the address will require a new lookup.' : busy ? 'Finding your address…' : status}</p>
      {!busy && !value && address.trim().length >= 5 && (
        <Button type="button" variant="secondary" onClick={() => setRetry((n) => n + 1)}>Find address again</Button>
      )}
      {!value && results.length > 1 && (
        <fieldset className="space-y-2">
          <legend className="label">Choose your business location</legend>
          {results.map((result) => (
            <label key={result.id} className="flex items-start gap-2 text-sm">
              <input type="radio" name="business-location" checked={selected?.id === result.id} onChange={() => setSelected(result)} className="mt-1 accent-green-800" />
              {result.label}
            </label>
          ))}
        </fieldset>
      )}
      {pin && (
        <div className="space-y-3 rounded-xl border border-stone-200 dark:border-stone-700 p-3">
          <p className="text-sm font-medium">{pin.label}</p>
          {pin.approximate && <p className="text-sm text-amber-800 dark:text-amber-200">This is a street-level match. Add your building or a nearby landmark for a more precise location.</p>}
          <iframe title="Business location on Google Maps" className="h-64 w-full rounded-lg border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://maps.google.com/maps?q=${encodeURIComponent(`${pin.latitude},${pin.longitude}`)}&z=17&output=embed`} />
          <a className="text-sm underline" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${pin.latitude},${pin.longitude}`)}`} target="_blank" rel="noopener noreferrer">Open in Google Maps</a>
          {!value && <div><Button type="button" onClick={() => onChange(pin)}>Confirm this location</Button></div>}
          <p className="text-xs text-stone-500">Address lookup: Photon · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">© OpenStreetMap contributors</a>. Map: Google Maps.</p>
        </div>
      )}
    </div>
  );
}
