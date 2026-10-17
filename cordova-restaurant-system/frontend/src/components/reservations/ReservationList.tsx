'use client';

import {useEffect,useState} from 'react';
import Link from 'next/link';
import {api,ApiClientError} from '@/lib/api';
import {RESERVATION_LABELS,reservationTime,type Reservation,type ReservationStatus} from '@/lib/reservations';
import {Button} from '@/components/ui/Button';
import {Textarea} from '@/components/ui/Input';

export function ReservationList({restaurantId}:{restaurantId?:string}) {
  const owner=Boolean(restaurantId);
  const [scope,setScope]=useState(owner?'all':'upcoming');
  const [status,setStatus]=useState(owner?'pending':'');
  const [page,setPage]=useState(1);
  const [result,setResult]=useState<{rows:Reservation[];total:number;pageSize:number}|null>(null);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState('');
  const [version,setVersion]=useState(0);
  const [notes,setNotes]=useState<Record<string,string>>({});
  const url=`${restaurantId?`/api/restaurants/${restaurantId}/reservations`:'/api/reservations/mine'}?page=${page}&scope=${scope}${status?`&status=${status}`:''}`;
  useEffect(()=>{
    let stopped=false,inFlight=false;
    let controller:AbortController|null=null;
    const load=async()=>{
      if(inFlight||document.visibilityState==='hidden')return;
      inFlight=true;controller=new AbortController();
      try{const res=await api.get(url,{cache:'no-store',signal:controller.signal});if(!stopped){setResult(res.data);setError('');}}
      catch(err){if(!stopped)setError(err instanceof ApiClientError?err.message:'Could not refresh reservations. Please try again.');}
      finally{inFlight=false;}
    };
    setResult(null);void load();
    const timer=window.setInterval(()=>void load(),15000);
    const resume=()=>void load();window.addEventListener('focus',resume);document.addEventListener('visibilitychange',resume);
    return()=>{stopped=true;controller?.abort();window.clearInterval(timer);window.removeEventListener('focus',resume);document.removeEventListener('visibilitychange',resume);};
  },[url,version]);
  const change=async(row:Reservation,next:ReservationStatus)=>{
    setBusy(row.id);setError('');
    try{await api.patch(`/api/reservations/${row.id}/status`,{status:next,...(owner?{ownerNote:notes[row.id]??row.owner_note}:{})});setVersion((n)=>n+1);}
    catch(err){setError(err instanceof ApiClientError?err.message:'Reservation update failed. Please refresh before retrying.');}
    finally{setBusy('');}
  };
  return <div className="space-y-4">
    <div className="flex flex-wrap items-end gap-3">
      <div><label className="label" htmlFor="reservation-date-filter">Dates</label><select id="reservation-date-filter" className="input" value={scope} onChange={(e)=>{setScope(e.target.value);setPage(1);}}><option value="all">All dates</option><option value="upcoming">Upcoming</option><option value="past">Past</option></select></div>
      <div><label className="label" htmlFor="reservation-status-filter">Status</label><select id="reservation-status-filter" className="input" value={status} onChange={(e)=>{setStatus(e.target.value);setPage(1);}}><option value="">All statuses</option>{Object.entries(RESERVATION_LABELS).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></div>
      <Button variant="secondary" onClick={()=>setVersion((n)=>n+1)}>Refresh</Button>
    </div>
    <p className="text-xs text-stone-500">Updates every 15 seconds while visible. All times are Philippine time. Pending requests are not confirmed bookings.</p>
    {error&&<p role="alert" className="border border-red-300 rounded-xl p-3 text-sm">{error}{result?' The list is from the last successful update.':''}</p>}
    {!result&&!error&&<p role="status">Loading reservations…</p>}
    {result?.rows.length===0&&<p className="card p-5 text-sm">No reservations match these filters.</p>}
    {result?.rows.map((row)=>{
      const starts=new Date(row.starts_at).getTime(),ends=new Date(row.ends_at).getTime();
      return <article key={row.id} className="card p-5 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-semibold">{owner?row.contact_name:row.restaurant_name}</h3><span className="rounded-full border px-3 py-1 text-xs font-semibold">{RESERVATION_LABELS[row.status]}</span></div>
        <p className="text-sm">{reservationTime(row.starts_at)} – {reservationTime(row.ends_at)} · {row.party_size} guests</p>
        {!owner&&row.restaurant_slug&&<Link className="text-sm underline" href={`/restaurants/${row.restaurant_slug}?tab=reservations`}>View restaurant</Link>}
        {owner&&<p className="text-sm">Contact: <a className="underline" href={`tel:${row.contact_phone}`}>{row.contact_phone}</a></p>}
        {row.notes&&<p className="text-sm whitespace-pre-wrap">Special requests: {row.notes}</p>}
        {row.owner_note&&<p className="text-sm whitespace-pre-wrap">Restaurant response: {row.owner_note}</p>}
        <p className="text-xs text-stone-500 break-all">Reference: {row.id}</p>
        {owner&&['pending','confirmed'].includes(row.status)&&<>
          <Textarea id={`reservation-note-${row.id}`} label="Note to customer (optional)" maxLength={500} value={notes[row.id]??row.owner_note} onChange={(e)=>setNotes((old)=>({...old,[row.id]:e.target.value}))}/>
          <div className="flex flex-wrap gap-2">
            {row.status==='pending'&&<><Button disabled={Boolean(busy)||starts<=Date.now()} onClick={()=>change(row,'confirmed')}>Confirm</Button><Button variant="secondary" disabled={Boolean(busy)} onClick={()=>change(row,'rejected')}>Decline</Button></>}
            {row.status==='confirmed'&&<><Button disabled={Boolean(busy)||ends>Date.now()} onClick={()=>change(row,'completed')}>Mark completed</Button><Button variant="secondary" disabled={Boolean(busy)||starts>Date.now()} onClick={()=>change(row,'no_show')}>Mark no-show</Button></>}
            <Button variant="secondary" disabled={Boolean(busy)} onClick={()=>change(row,'cancelled')}>Cancel reservation</Button>
          </div>
        </>}
        {!owner&&['pending','confirmed'].includes(row.status)&&starts>Date.now()&&<Button variant="secondary" disabled={Boolean(busy)} onClick={()=>change(row,'cancelled')}>Cancel reservation</Button>}
        {!owner&&row.status==='pending'&&<p className="text-xs text-stone-500">Wait for a confirmed status before relying on this booking. Contact the restaurant if your visit is approaching.</p>}
      </article>;
    })}
    {result&&result.total>result.pageSize&&<div className="flex items-center gap-3"><Button variant="secondary" disabled={page===1} onClick={()=>setPage((n)=>n-1)}>Previous</Button><span className="text-sm">Page {page} of {Math.ceil(result.total/result.pageSize)}</span><Button variant="secondary" disabled={page*result.pageSize>=result.total} onClick={()=>setPage((n)=>n+1)}>Next</Button></div>}
  </div>;
}
