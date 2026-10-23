'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { api, ApiClientError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Restaurant } from '@/lib/types';
import { philippineDate, reservationTime, slotLabel, type Reservation, type ReservationSettings, type ReservationSlot } from '@/lib/reservations';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function ReservationForm({restaurant}:{restaurant:Restaurant}) {
  const {user}=useAuth();
  const manages=user?.role==='admin'||user?.id===restaurant.owner_id;
  const [date,setDate]=useState(()=>philippineDate());
  const [party,setParty]=useState('1');
  const [slots,setSlots]=useState<ReservationSlot[]>([]);
  const [settings,setSettings]=useState<ReservationSettings|null>(null);
  const [startsAt,setStartsAt]=useState('');
  const [name,setName]=useState(user?.full_name||'');
  const [phone,setPhone]=useState(user?.phone||'');
  const [notes,setNotes]=useState('');
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const [version,setVersion]=useState(0);
  const [saved,setSaved]=useState<Reservation|null>(null);
  const requestKey=useRef('');
  const changed=()=>{requestKey.current='';setSaved(null);};

  useEffect(()=>{setName((v)=>v||user?.full_name||'');setPhone((v)=>v||user?.phone||'');},[user?.id,user?.full_name,user?.phone]);
  useEffect(()=>{
    if(manages)return;
    let stopped=false;
    const controller=new AbortController();
    setStartsAt('');setSlots([]);setLoading(true);setError('');
    const size=Number(party);
    if(!Number.isInteger(size)||size<1){setLoading(false);setMessage('Enter a valid party size.');return;}
    api.get(`/api/restaurants/${restaurant.id}/reservations/options?date=${encodeURIComponent(date)}&partySize=${size}`,{auth:false,cache:'no-store',signal:controller.signal})
      .then((res)=>{if(!stopped){setSettings(res.data.settings);setSlots(res.data.slots);setMessage(res.data.message||'');}})
      .catch((err)=>{if(!stopped)setError(err instanceof ApiClientError?err.message:'Reservation times could not be loaded. Please try again.');})
      .finally(()=>{if(!stopped)setLoading(false);});
    return()=>{stopped=true;controller.abort();};
  },[restaurant.id,date,party,version,manages]);

  const submit=async(event:FormEvent)=>{
    event.preventDefault();setError('');
    if(!startsAt){setError('Choose an available time.');return;}
    if(!requestKey.current)requestKey.current=crypto.randomUUID();
    setSaving(true);
    try{
      const res=await api.post(`/api/restaurants/${restaurant.id}/reservations`,{requestKey:requestKey.current,startsAt,partySize:Number(party),contactName:name.trim(),contactPhone:phone.trim(),notes:notes.trim()});
      setSaved(res.data.reservation);
    }catch(err){setError(err instanceof ApiClientError?err.message:'We could not confirm whether your request was saved. Retry with the same details or check My reservations.');}
    finally{setSaving(false);}
  };

  if(manages)return <section id="reservations" className="card p-6 space-y-3"><h2 className="font-serif text-2xl font-bold">Reservations</h2><Link className="btn-primary" href={`/dashboard/${restaurant.id}?tab=reservations`}>Manage reservations and booking settings</Link></section>;
  return <section id="reservations" className="card p-5 sm:p-7 space-y-4 max-w-2xl">
    <h2 className="font-serif text-2xl font-bold">Request a reservation</h2>
    <p className="text-sm text-stone-600 dark:text-stone-300">Plan ahead, even while the restaurant is closed. Choose a future visit during its booking hours. All times use Philippine time; the restaurant must accept your request to confirm it.</p>
    {error&&<p role="alert" className="rounded-xl border border-red-300 p-3 text-sm">{error} <button type="button" onClick={()=>setVersion((n)=>n+1)} className="underline">Reload times</button></p>}
    {saved?<div role="status" className="space-y-3 rounded-xl border border-green-500 p-4">
      <h3 className="font-semibold">Request saved — awaiting restaurant confirmation</h3>
      <p>{reservationTime(saved.starts_at)} · {saved.party_size} guests</p>
      <p className="text-xs break-all">Reference: {saved.id}</p>
      <Link className="btn-primary" href="/reservations">View My reservations</Link>
      <p className="text-sm">Check My reservations for the restaurant’s response. Special requests are subject to restaurant approval.</p>
    </div>:<>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input id="reservation-date" label="Date" type="date" min={philippineDate()} max={philippineDate(Date.now()+(settings?.advanceDays||90)*86400000)} value={date} disabled={saving} onChange={(e)=>{changed();setDate(e.target.value);}} required/>
        <Input id="reservation-party" label="Number of guests" type="number" min={1} max={settings?.maxPartySize||20} value={party} disabled={saving} onChange={(e)=>{changed();setParty(e.target.value);}} required/>
      </div>
      {settings&&<p className="text-xs text-stone-500">Up to {settings.maxPartySize} {settings.maxPartySize===1?'guest':'guests'} per request · Book up to {settings.advanceDays} days ahead</p>}
      {loading?<p role="status">Checking available times…</p>:settings&&!settings.enabled?<div className="rounded-xl bg-stone-50 dark:bg-white/5 p-4 space-y-2"><p className="text-sm font-semibold">Online bookings are unavailable</p><p className="text-sm text-stone-500">This is separate from whether the restaurant is open right now. Contact the restaurant to arrange a future visit.</p>{restaurant.phone&&<a className="inline-block text-sm font-semibold text-cordova-green underline" href={`tel:${restaurant.phone}`}>Call the restaurant</a>}</div>:<>
        {message&&<p role="status" className="text-sm">{message}</p>}
        {settings?.enabled&&!slots.length&&date===philippineDate()&&!error&&<div className="rounded-xl border border-stone-200 dark:border-stone-700 p-4 space-y-3"><p className="text-sm">No bookable times remain today. You can still send a request now for a later date.</p><Button type="button" variant="secondary" onClick={()=>{changed();setDate(philippineDate(Date.now()+86400000));}}>Check tomorrow’s times</Button></div>}
        {settings?.enabled&&<p className="text-xs text-stone-500">Bookings last {settings.durationMinutes} minutes. Minimum notice: {settings.minNoticeMinutes} minutes. Pending requests do not hold seats; availability is checked again when submitted and confirmed.</p>}
        {!user?<Link className="btn-primary" href={`/login?redirect=${encodeURIComponent(`/restaurants/${restaurant.slug}?tab=reservations`)}`}>Sign in to request a reservation</Link>:!user.email_verified?<Link className="btn-primary" href="/verify-email-required">Verify your email to reserve</Link>:settings?.enabled&&<form onSubmit={submit} className="space-y-4">
          <div><label className="label" htmlFor="reservation-time">Available time</label><select id="reservation-time" className="input" value={startsAt} disabled={saving||!slots.length} onChange={(e)=>{changed();setStartsAt(e.target.value);}} required>
            <option value="">Choose an available time</option>{slots.map((slot)=><option key={slot.startsAt} value={slot.startsAt}>{slotLabel(slot.startsAt)} – {slotLabel(slot.endsAt)}</option>)}
          </select></div>
          <Input id="reservation-name" label="Contact name" autoComplete="name" minLength={2} maxLength={100} value={name} disabled={saving} required onChange={(e)=>{changed();setName(e.target.value);}}/>
          <Input id="reservation-phone" label="Contact phone" type="tel" autoComplete="tel" maxLength={30} value={phone} disabled={saving} required onChange={(e)=>{changed();setPhone(e.target.value);}}/>
          <Textarea id="reservation-notes" label="Special requests (optional)" maxLength={500} value={notes} disabled={saving} onChange={(e)=>{changed();setNotes(e.target.value);}}/>
          <Button type="submit" loading={saving} disabled={!startsAt||loading||!slots.length}>Send reservation request</Button>
          <Link className="ml-3 text-sm underline" href="/reservations">My reservations</Link>
        </form>}
      </>}
    </>}
  </section>;
}
