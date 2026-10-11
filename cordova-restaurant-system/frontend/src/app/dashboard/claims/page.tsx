'use client';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { RequireRole } from '@/components/RequireRole';
import ClaimHistory from '@/components/ClaimHistory';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { BusinessClaim, ClaimDetail, claimLabels, claimInputClass, claimButtonClass } from '@/lib/claims';

interface Notification { id: string; title: string; body: string; is_read: boolean; created_at: string }
function MyClaims() {
  const { refreshUser } = useAuth();
  const [claims, setClaims] = useState<BusinessClaim[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [details, setDetails] = useState<Record<string, ClaimDetail>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      const [applications, messages] = await Promise.all([api.get('/api/claims'), api.get('/api/claims/notifications')]);
      setClaims(applications.data); setNotifications(messages.data); setError('');
      if (applications.data.some((claim: BusinessClaim) => claim.status === 'approved')) await refreshUser();
    } catch (err) { setError(err instanceof Error ? err.message : 'Applications could not be loaded'); }
    finally { setLoading(false); }
  }, [refreshUser]);
  useEffect(() => { load(); }, [load]);
  async function open(id: string) {
    if (expanded === id) { setExpanded(null); return; }
    setBusy(id);
    try { const response = await api.get(`/api/claims/${id}`); setDetails(current => ({ ...current, [id]: response.data })); setExpanded(id); }
    catch (err) { setError(err instanceof Error ? err.message : 'Details could not be loaded'); }
    finally { setBusy(null); }
  }
  async function withdraw(id: string) {
    if (!window.confirm('Withdraw this ownership application?')) return;
    setBusy(id);
    try { await api.post(`/api/claims/${id}/withdraw`); setExpanded(null); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Withdrawal failed'); }
    finally { setBusy(null); }
  }
  async function respond(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault(); const body = new FormData(event.currentTarget); const file = body.get('evidence');
    if (file instanceof File && file.size === 0) body.delete('evidence');
    setBusy(id);
    try { await api.post(`/api/claims/${id}/respond`, body, { isFormData: true }); setExpanded(null); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Response failed'); }
    finally { setBusy(null); }
  }
  async function markRead(id: string) {
    try { await api.patch(`/api/claims/notifications/${id}/read`); setNotifications(current => current.map(item => item.id === id ? { ...item, is_read: true } : item)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not mark notification as read'); }
  }
  async function requestSupport(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault(); const form = event.currentTarget;
    const message = new FormData(form).get('message'); setBusy(id);
    try { await api.post(`/api/claims/${id}/support`, { message }); const response = await api.get(`/api/claims/${id}`); setDetails(current => ({ ...current, [id]: response.data })); form.reset(); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Support request could not be sent'); }
    finally { setBusy(null); }
  }
  return <div className="max-w-4xl mx-auto px-4 py-8 text-stone-900 dark:text-white">
    <div className="flex flex-wrap justify-between items-center gap-3"><h1 className="font-serif text-3xl font-bold">My business claims</h1><button onClick={load} className="text-sm underline" disabled={!!busy}>Refresh status</button></div>
    <p className="mt-2 text-stone-600 dark:text-stone-300">Find your establishment on <Link href="/search" className="underline">Browse restaurants</Link>, then select “Claim Your Business” under “For Restaurant Owners” in its footer. Your existing listing stays intact.</p>
    <Link href="/dashboard" className="inline-block mt-3 underline">Owner dashboard</Link>
    {error && <p role="alert" className="mt-4 text-red-600">{error}</p>}
    {loading ? <p className="mt-6">Loading applications…</p> : <>
      {notifications.length > 0 && <section className="mt-6 rounded-xl border border-stone-200 p-4 dark:border-stone-700"><h2 className="text-lg font-semibold">Notifications · {notifications.filter(item => !item.is_read).length} unread</h2><ul className="mt-3 space-y-3">{notifications.map(item => <li key={item.id} className="text-sm border-b border-stone-200 pb-3 dark:border-stone-700"><p className={item.is_read ? '' : 'font-semibold'}>{item.title}</p><p className="whitespace-pre-wrap break-words">{item.body}</p><p className="text-stone-500">{new Date(item.created_at).toLocaleString()}</p>{!item.is_read && <button className="underline mt-1" onClick={() => markRead(item.id)}>Mark as read</button>}</li>)}</ul></section>}
      {claims.length === 0 && <p className="mt-8">You have no ownership applications yet.</p>}
      <div className="mt-6 space-y-4">{claims.map(claim => <article key={claim.id} className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-900">
        <div className="flex flex-wrap justify-between gap-2"><h2 className="text-lg font-semibold">{claim.restaurant_name}</h2><span className="text-sm font-semibold">{claimLabels[claim.status]}</span></div>
        <p className="text-sm text-stone-500">{claim.is_dispute ? 'Ownership dispute' : 'Ownership application'} · {new Date(claim.created_at).toLocaleDateString()}</p>
        {claim.review_note && <p className="mt-3 whitespace-pre-wrap break-words text-sm"><strong>Admin response: </strong>{claim.review_note}</p>}
        {claim.status === 'approved' && <Link className={`${claimButtonClass} mt-3`} href={`/dashboard/${claim.restaurant_id}`}>Manage establishment</Link>}
        {claim.status === 'rejected' && <p className="mt-3 text-sm">If the decision is incorrect, <Link href={`/dashboard/claims/new?restaurant=${claim.restaurant_id}`} className="underline">submit a new application with additional evidence</Link> or message admins in the application details.</p>}
        <div className="flex flex-wrap gap-4 mt-3"><button className="text-sm underline" disabled={!!busy} onClick={() => open(claim.id)}>{expanded === claim.id ? 'Close details' : 'View evidence and history'}</button>{['pending','info_requested'].includes(claim.status) && <button className="text-sm underline text-red-600" disabled={!!busy} onClick={() => withdraw(claim.id)}>Withdraw application</button>}</div>
        {expanded === claim.id && details[claim.id] && <><ClaimHistory id={claim.id} detail={details[claim.id]} /><form onSubmit={event => requestSupport(event, claim.id)} className="mt-4 space-y-2"><label className="block">Ask admins for help<textarea name="message" required minLength={10} maxLength={2000} rows={3} className={claimInputClass} /></label><button disabled={!!busy} className={claimButtonClass}>Send support request</button></form></>}
        {claim.status === 'info_requested' && <form className="mt-4 space-y-3" onSubmit={event => respond(event, claim.id)}><label className="block">Additional information<textarea className={claimInputClass} name="message" required minLength={10} maxLength={5000} rows={4} /></label><label className="block">Additional evidence (optional)<input className={claimInputClass} name="evidence" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" /></label><p className="text-xs text-stone-500">PDF or image, up to 5 MB.</p><button disabled={!!busy} className={claimButtonClass}>{busy === claim.id ? 'Submitting…' : 'Send information for review'}</button></form>}
      </article>)}</div>
    </>}
  </div>;
}
export default function ClaimsPage() { return <RequireRole roles={['customer','owner','admin']}><MyClaims /></RequireRole>; }
