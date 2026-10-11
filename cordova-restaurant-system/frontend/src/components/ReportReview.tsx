'use client';
import { useState } from 'react';
import { api, ApiClientError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import Link from 'next/link';
export function ReportReview({id,authorId}:{id:string;authorId:string}) {
 const {user}=useAuth(); const {toast}=useToast();
 const [open,setOpen]=useState(false),[category,setCategory]=useState('spam'),[details,setDetails]=useState(''),[busy,setBusy]=useState(false),[sent,setSent]=useState(false);
 if(!/^[0-9a-f-]{36}$/i.test(id) || user?.id === authorId) return null;
 return <div className="text-xs">
 <button type="button" disabled={sent} onClick={()=>setOpen(!open)} className="underline text-stone-500">{sent?'Report submitted':'Report review'}</button>
 {open && !sent && <div className="mt-3 space-y-3 border rounded-xl p-4 dark:border-stone-700">
 <p>Report content that violates our community guidelines. Negative opinions alone are allowed. Your identity stays private from the restaurant and reviewer.</p>
 {!user ? <Link href="/login" className="underline">Sign in to report</Link> : <>
 <label className="block">Reason<select value={category} onChange={e=>setCategory(e.target.value)} className="block w-full mt-1 p-2 bg-white dark:bg-stone-900 border rounded-lg">{['spam','harassment','hate_speech','personal_information','irrelevant','other'].map(c=><option key={c} value={c}>{c.replaceAll('_',' ')}</option>)}</select></label>
 <label className="block">Explain the concern<textarea value={details} onChange={e=>setDetails(e.target.value)} minLength={10} maxLength={1000} rows={3} className="block w-full mt-1 p-2 bg-white dark:bg-stone-900 border rounded-lg" /></label>
 <button type="button" disabled={busy || details.trim().length<10} className="px-3 py-2 rounded-lg bg-cordova-green text-white disabled:opacity-50" onClick={async()=>{setBusy(true);try{await api.post('/api/reviews/'+id+'/report',{category,details:details.trim()});setSent(true);setOpen(false);toast('Report sent for admin review','success');}catch(e){if(e instanceof ApiClientError && e.status===409){setSent(true);setOpen(false);}toast(e instanceof Error?e.message:'Unable to send report','error');}finally{setBusy(false);}}}>{busy?'Submitting…':'Submit report'}</button>
 </>}
 <button type="button" className="ml-3 underline" onClick={()=>setOpen(false)}>Cancel</button>
 </div>}
 </div>;
}
