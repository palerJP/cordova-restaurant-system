'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { BusinessClaim, ClaimDetail, claimLabels, claimInputClass, claimButtonClass } from '@/lib/claims';
import ClaimHistory from './ClaimHistory';

export default function AdminClaims() {
  const [status, setStatus] = useState('pending');
  const [search, setSearch] = useState('');
  const [claims, setClaims] = useState<BusinessClaim[]>([]);
  const [selected, setSelected] = useState<BusinessClaim | null>(null);
  const [detail, setDetail] = useState<ClaimDetail | null>(null);
  const [note, setNote] = useState('');
  const [confirmTransfer, setConfirmTransfer] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try { const response = await api.get(`/api/admin/claims?status=${status}`); setClaims(response.data); setError(''); }
    catch (err) { setError(err instanceof Error ? err.message : 'Claims could not be loaded'); }
    finally { setLoading(false); }
  }, [status]);
  useEffect(() => { load(); }, [load]);
  async function open(claim: BusinessClaim) {
    setBusy(true); setDetail(null); setSelected(null); setError('');
    try { const response = await api.get(`/api/claims/${claim.id}`); setSelected(claim); setDetail(response.data); setNote(''); setConfirmTransfer(false); }
    catch (err) { setError(err instanceof Error ? err.message : 'Claim details could not be loaded'); }
    finally { setBusy(false); }
  }
  async function review(action: 'approved' | 'rejected' | 'info_requested') {
    if (!selected) return;
    if (action === 'approved' && !window.confirm(`Approve ownership of ${selected.restaurant_name}? Other open applications will be rejected, and existing owner access will transfer.`)) return;
    setBusy(true); setError('');
    try { await api.patch(`/api/admin/claims/${selected.id}/review`, { action, note, confirmTransfer }); setSelected(null); setDetail(null); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Review could not be saved'); }
    finally { setBusy(false); }
  }
  const filtered = claims.filter(claim => `${claim.restaurant_name} ${claim.applicant_name} ${claim.applicant_email}`.toLowerCase().includes(search.toLowerCase()));
  async function sendMessage() {
    if (!selected) return;
    setBusy(true); setError('');
    try { await api.post(`/api/admin/claims/${selected.id}/message`, { message: note }); const response = await api.get(`/api/claims/${selected.id}`); setDetail(response.data); setNote(''); }
    catch (err) { setError(err instanceof Error ? err.message : 'Message could not be sent'); }
    finally { setBusy(false); }
  }
  return <section className="rounded-xl border border-stone-200 bg-white p-5 text-stone-900 dark:border-stone-700 dark:bg-stone-900 dark:text-white">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">Ownership claims</h2><p className="text-sm text-stone-500">Verify the applicant’s authority before granting access to an existing listing.</p></div><button className="text-sm underline" onClick={load} disabled={busy}>Refresh claims</button></div>
    <div className="mt-4 flex flex-wrap gap-3"><label>Status<select className={claimInputClass} value={status} disabled={busy} onChange={event => { setStatus(event.target.value); setSelected(null); }}>{Object.entries(claimLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}<option value="all">All applications</option></select></label><label className="flex-1">Search applications<input className={claimInputClass} value={search} onChange={event => setSearch(event.target.value)} placeholder="Business, applicant, or email" /></label></div>
    {error && <p role="alert" className="mt-3 text-red-600">{error}</p>}
    {loading ? <p className="mt-4">Loading ownership claims…</p> : <div className="mt-4 space-y-3">{filtered.length === 0 && <p>No applications for this filter.</p>}{filtered.map(claim => <div key={claim.id} className="flex flex-wrap justify-between gap-3 border-t border-stone-200 pt-3 dark:border-stone-700"><div><p className="font-semibold">{claim.restaurant_name}</p><p className="text-sm">{claim.applicant_name} · {claimLabels[claim.status]}</p>{claim.is_dispute && <p className="text-sm text-amber-700 dark:text-amber-400">Dispute: establishment already has an owner</p>}{(claim.competing_claims || 0) > 1 && <p className="text-sm text-amber-700 dark:text-amber-400">{claim.competing_claims} competing applications — review all evidence</p>}</div><button disabled={busy} className={claimButtonClass} onClick={() => open(claim)}>Review application</button></div>)}<p className="text-xs text-stone-500">Showing up to 200 applications. Use status filters to narrow the queue.</p></div>}
    {selected && detail && <div className="mt-5 rounded-lg border border-stone-300 p-4 dark:border-stone-600">
      <div className="flex justify-between gap-3"><h3 className="text-lg font-semibold">{selected.restaurant_name}</h3><button disabled={busy} className="underline text-sm" onClick={() => setSelected(null)}>Close</button></div>
      <Link className="text-sm underline" href={`/restaurants/${selected.restaurant_slug}`} target="_blank">View existing listing</Link>
      <dl className="mt-3 space-y-2 text-sm"><div><dt className="font-semibold">Applicant</dt><dd>{selected.applicant_name} · {selected.applicant_email}</dd></div><div><dt className="font-semibold">Relationship / contact</dt><dd>{selected.relationship} · {selected.phone}</dd></div><div><dt className="font-semibold">Ownership explanation</dt><dd className="whitespace-pre-wrap break-words">{selected.explanation}</dd></div></dl>
      <ClaimHistory id={selected.id} detail={detail} />
      {!['pending','info_requested'].includes(detail.claim.status) && <label className="block mt-4">Message to applicant<textarea className={claimInputClass} value={note} onChange={event => setNote(event.target.value)} maxLength={2000} rows={3} /></label>}
      <button className="mt-3 text-sm underline disabled:opacity-50" disabled={busy || note.trim().length < 10} onClick={sendMessage}>Send support reply without changing status</button>
      {['pending','info_requested'].includes(detail.claim.status) && <div className="mt-5 space-y-3"><label className="block">Decision reason or information needed<textarea className={claimInputClass} value={note} onChange={event => setNote(event.target.value)} minLength={10} maxLength={2000} rows={4} /><span className="text-xs text-stone-500">Required, at least 10 characters. Visible to the applicant.</span></label>{selected.is_dispute && <label className="flex gap-2 text-sm"><input type="checkbox" checked={confirmTransfer} onChange={event => setConfirmTransfer(event.target.checked)} />I investigated the dispute and confirm transferring access from the current owner.</label>}<div className="flex flex-wrap gap-3"><button className={claimButtonClass} disabled={busy || note.trim().length < 10 || detail.claim.status !== 'pending' || (selected.is_dispute && !confirmTransfer)} onClick={() => review('approved')}>Approve ownership</button><button className="rounded-lg border border-stone-400 px-4 py-2 text-sm disabled:opacity-50" disabled={busy || note.trim().length < 10} onClick={() => review('info_requested')}>Request more information</button><button className="rounded-lg border border-red-400 px-4 py-2 text-sm text-red-600 disabled:opacity-50" disabled={busy || note.trim().length < 10} onClick={() => review('rejected')}>Reject application</button></div></div>}
    </div>}
  </section>;
}
