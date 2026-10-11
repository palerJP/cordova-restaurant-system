'use client';
import { FormEvent, Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { RequireRole } from '@/components/RequireRole';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { claimInputClass, claimButtonClass, rememberClaimDestination, clearClaimDestination } from '@/lib/claims';

function ClaimApplication() {
  const params = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.get('restaurant');
  const [restaurant, setRestaurant] = useState<{ name: string; ownership_claimed: boolean } | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!id) { setError('Choose an establishment from its public listing first.'); return; }
    rememberClaimDestination(id);
    let active = true;
    api.get(`/api/restaurants/${id}/claim-status`).then(res => { if (active) setRestaurant(res.data); }).catch(err => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [id]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    const body = new FormData(event.currentTarget);
    try {
      body.set('isDispute', String(restaurant?.ownership_claimed === true));
      await api.post(`/api/restaurants/${id}/claims`, body, { isFormData: true });
      clearClaimDestination();
      router.push('/dashboard/claims');
    } catch (err) { setError(err instanceof Error ? err.message : 'Application could not be submitted'); }
    finally { setBusy(false); }
  }
  return <div className="max-w-2xl mx-auto px-4 py-8 text-stone-900 dark:text-white">
    <Link href="/dashboard/claims" className="text-sm underline">My ownership applications</Link>
    <h1 className="font-serif text-3xl font-bold mt-4">{restaurant?.ownership_claimed ? 'Ownership dispute' : 'Claim this business'}</h1>
    <p className="mt-2 font-semibold">{restaurant?.name}</p>
    <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">Submit proof that you own or are authorized to manage this establishment. Your application goes directly to Business Verification. You cannot edit the listing until approval.</p>
    {restaurant?.ownership_claimed && <p className="mt-3 rounded-lg bg-amber-100 p-3 text-sm text-amber-900">This business already has an owner. Explain the incorrect ownership and provide evidence. An admin must investigate before transferring access.</p>}
    {error && <p role="alert" className="mt-4 text-red-600">{error}</p>}
    {user && !user.email_verified ? <p className="mt-5">Verify your email before applying. <Link className="underline" href="/verify-email-required">Verify email</Link></p> : restaurant && <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="block">Full name<input className={claimInputClass} name="applicantName" defaultValue={user?.full_name} required minLength={2} maxLength={150} autoComplete="name" /></label>
      <label className="block">Relationship to the business<select className={claimInputClass} name="relationship" required><option value="">Select a relationship</option><option>Business owner</option><option>Authorized manager</option><option>Authorized representative</option></select></label>
      <label className="block">Contact number<input className={claimInputClass} name="phone" defaultValue={user?.phone || ''} required minLength={5} maxLength={30} type="tel" autoComplete="tel" /></label>
      <label className="block">Ownership explanation<textarea className={claimInputClass} name="explanation" required minLength={20} maxLength={5000} rows={5} placeholder="Explain your connection to the establishment and what your evidence proves." /></label>
      <label className="block">Business permit or ownership evidence<input className={`${claimInputClass} mt-1`} type="file" name="evidence" accept="application/pdf,image/jpeg,image/png,image/webp" required /><span className="text-sm text-stone-500">PDF, JPEG, PNG, or WebP, up to 5 MB. Visible only to you and authorized admins.</span></label>
      <label className="flex gap-2"><input type="checkbox" name="confirmOwnership" value="true" required /><span className="text-sm">I confirm this information is truthful and I am authorized to manage this business.</span></label>
      <button className={claimButtonClass} disabled={busy}>{busy ? 'Submitting…' : 'Submit for admin review'}</button>
    </form>}
    <p className="mt-6 text-sm">After submitting, you can message admins from your application’s details. No personal contact with an admin is required.</p>
  </div>;
}
export default function NewClaimPage() {
  return <RequireRole roles={['customer', 'owner']}><Suspense fallback={<p className="p-8">Loading application…</p>}><ClaimApplication /></Suspense></RequireRole>;
}
