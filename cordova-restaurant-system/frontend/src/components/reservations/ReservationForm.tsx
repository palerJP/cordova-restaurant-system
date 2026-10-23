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
  const [showDetails,setShowDetails]=useState(false);
  const [saved,setSaved]=useState<Reservation|null>(null);
  const requestKey=useRef('');
  const changed=()=>{requestKey.current='';setSaved(null);};

  useEffect(()=>{setName((v)=>v||user?.full_name||'');setPhone((v)=>v||user?.phone||'');},[user?.id,user?.full_name,user?.phone]);
  useEffect(()=>{
    if(manages)return;
    let stopped=false;
    const controller=new AbortController();
    setStartsAt('');setSlots([]);setLoading(true);setError('');setShowDetails(false);
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
  return <section id="reservations" className="card p-5 sm:p-6 space-y-4 max-w-2xl scroll-mt-24">
    <h2 className="font-serif text-2xl font-bold">Make a reservation</h2>
    {error&&<p role="alert" className="text-sm text-red-700 dark:text-red-300">{error} <button type="button" onClick={()=>setVersion((n)=>n+1)} className="underline">Retry</button></p>}
    {saved?<div role="status" className="space-y-2">
      <p className="font-semibold">Request sent · Awaiting confirmation</p>
      <p className="text-sm">{reservationTime(saved.starts_at)} · {saved.party_size} guests</p>
      <Link className="text-sm font-semibold text-cordova-green underline" href="/reservations">View my reservation</Link>
    </div>:<>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Input id="reservation-date" label="Date" type="date" min={philippineDate()} max={philippineDate(Date.now()+(settings?.advanceDays||90)*86400000)} value={date} disabled={saving} onChange={(e)=>{changed();setDate(e.target.value);}} required/>
        <Input id="reservation-party" label="Guests" type="number" min={1} max={settings?.maxPartySize||20} value={party} disabled={saving} onChange={(e)=>{changed();setParty(e.target.value);}} required/>
        <div className="col-span-2 sm:col-span-1"><label className="label" htmlFor="reservation-time">Time</label><select id="reservation-time" className="input" value={startsAt} disabled={saving||loading||!slots.length} onChange={(e)=>{changed();setStartsAt(e.target.value);setShowDetails(false);}} required>
          <option value="">{loading?'Loading…':slots.length?'Choose time':'No times available'}</option>{slots.map((slot)=><option key={slot.startsAt} value={slot.startsAt}>{slotLabel(slot.startsAt)}</option>)}
        </select></div>
      </div>
      {!loading&&settings&&!settings.enabled?<p className="text-sm text-stone-500">Online reservations unavailable.{restaurant.phone&&<> <a className="underline" href={`tel:${restaurant.phone}`}>Call restaurant</a></>}</p>:<>
        {!loading&&!slots.length&&!error&&<p role="status" className="text-sm text-stone-500">{date===philippineDate()?<>No times left today. <button type="button" className="font-semibold text-cordova-green underline" onClick={()=>{changed();setDate(philippineDate(Date.now()+86400000));}}>Try tomorrow</button></>:message||'Choose another date.'}</p>}
        {!showDetails&&(!user?<Link className="btn-primary block text-center" href={`/login?redirect=${encodeURIComponent(`/restaurants/${restaurant.slug}?tab=reservations`)}`}>Sign in to reserve</Link>:!user.email_verified?<Link className="btn-primary block text-center" href="/verify-email-required">Verify email to reserve</Link>:<Button type="button" className="w-full" disabled={!startsAt||loading||!settings?.enabled} onClick={()=>setShowDetails(true)}>Reserve</Button>)}
        {showDetails&&<form onSubmit={submit} className="space-y-3 border-t border-stone-200 dark:border-white/10 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input id="reservation-name" label="Contact name" autoComplete="name" minLength={2} maxLength={100} value={name} disabled={saving} required onChange={(e)=>{changed();setName(e.target.value);}}/>
            <Input id="reservation-phone" label="Phone" type="tel" autoComplete="tel" maxLength={30} value={phone} disabled={saving} required onChange={(e)=>{changed();setPhone(e.target.value);}}/>
          </div>
          <details><summary className="cursor-pointer text-sm text-stone-500">Add a special request</summary><div className="pt-2"><Textarea id="reservation-notes" label="Special request (optional)" maxLength={500} value={notes} disabled={saving} onChange={(e)=>{changed();setNotes(e.target.value);}}/></div></details>
          <p className="text-xs text-stone-500">Your booking is confirmed only after the restaurant accepts.</p>
          <div className="flex items-center gap-4"><Button type="submit" loading={saving} disabled={!startsAt||loading||!slots.length}>Send request</Button><button type="button" className="text-sm underline" disabled={saving} onClick={()=>setShowDetails(false)}>Back</button></div>
        </form>}
      </>}
      {settings&&<details className="text-xs text-stone-500"><summary className="cursor-pointer">Booking details</summary><p className="pt-2 leading-relaxed">Philippine time · {settings.durationMinutes} minutes per visit · Up to {settings.maxPartySize} guests · {settings.minNoticeMinutes} minutes’ notice · Up to {settings.advanceDays} days ahead. Pending requests do not hold seats.</p><Link className="mt-2 inline-block underline" href="/reservations">My reservations</Link></details>}
    </>}
  </section>;
}
