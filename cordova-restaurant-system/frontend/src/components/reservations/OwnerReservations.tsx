'use client';

import {useEffect,useState,type FormEvent} from 'react';
import {api,ApiClientError} from '@/lib/api';
import type {ReservationSettings} from '@/lib/reservations';
import {ReservationList} from './ReservationList';
import {Input} from '@/components/ui/Input';
import {Button} from '@/components/ui/Button';

export function OwnerReservations({restaurantId}:{restaurantId:string}) {
  const [settings,setSettings]=useState<ReservationSettings|null>(null);
  const [numbers,setNumbers]=useState({capacity:'',maxPartySize:'',minNoticeMinutes:''});
  const normalizeNumber=(field:keyof typeof numbers)=>setNumbers((old)=>({...old,[field]:/^\d+$/.test(old[field])?String(Number(old[field])):old[field]}));
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const [saving,setSaving]=useState(false);
  const [version,setVersion]=useState(0);
  useEffect(()=>{
    let stopped=false;
    api.get(`/api/restaurants/${restaurantId}/reservations/settings`,{cache:'no-store'})
      .then((res)=>{if(!stopped){const loaded:ReservationSettings=res.data.settings;setSettings(loaded);setNumbers({capacity:String(loaded.capacity),maxPartySize:String(loaded.maxPartySize),minNoticeMinutes:String(loaded.minNoticeMinutes)});setError('');}})
      .catch((err)=>{if(!stopped)setError(err instanceof ApiClientError?err.message:'Reservation settings could not be loaded.');});
    return()=>{stopped=true;};
  },[restaurantId,version]);
  const save=async(event:FormEvent)=>{
    event.preventDefault();if(!settings)return;
    const capacity=Number(numbers.capacity),maxPartySize=Number(numbers.maxPartySize),minNoticeMinutes=Number(numbers.minNoticeMinutes);
    if(Object.values(numbers).some((value)=>!/^\d+$/.test(value))||!Number.isSafeInteger(capacity)||capacity<1||capacity>200||!Number.isSafeInteger(maxPartySize)||maxPartySize<1||maxPartySize>20||!Number.isSafeInteger(minNoticeMinutes)||minNoticeMinutes<0||minNoticeMinutes>4320){setError('Enter whole numbers: 1–200 online seats, 1–20 guests per request, and 0–4320 minutes advance notice.');return;}
    if(maxPartySize>capacity){setError('Maximum guests per request cannot exceed your online booking capacity.');return;}
    setSaving(true);setError('');setMessage('');
    try{
      await api.patch(`/api/restaurants/${restaurantId}/reservations/settings`,{enabled:settings.configuredEnabled,capacity,maxPartySize,durationMinutes:settings.durationMinutes,minNoticeMinutes});
      setMessage('Reservation settings saved.');setVersion((n)=>n+1);
    }catch(err){setError(err instanceof ApiClientError?err.message:'Settings could not be saved.');}
    finally{setSaving(false);}
  };
  return <div className="space-y-8">
    <div><h2 className="font-serif text-2xl font-bold">Reservations</h2><p className="text-sm text-stone-500 mt-1">Review customer requests, confirm bookings, and manage your bookable capacity.</p></div>
    {error&&<p role="alert" className="rounded-xl border border-red-300 p-3 text-sm">{error} <button className="underline" onClick={()=>setVersion((n)=>n+1)}>Retry</button></p>}
    {message&&<p role="status" className="text-sm font-semibold">{message}</p>}
    {!settings&&!error&&<p>Loading booking settings…</p>}
    {settings&&<details className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1d2320] p-5 sm:p-6"><summary className="cursor-pointer"><span className="font-semibold">Booking settings</span><span className="block text-xs text-stone-500 mt-1">{settings.capacity} online seats · up to {settings.maxPartySize} guests per request · {settings.durationMinutes} minutes. Expand to edit.</span></summary><form onSubmit={save} className="space-y-5 mt-6">
      <label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={settings.configuredEnabled} disabled={saving} onChange={(e)=>setSettings({...settings,configuredEnabled:e.target.checked})}/>Accept online reservation requests</label>
      <p className="text-xs text-stone-500">Online booking opens when your business is verified, your owner account is active, and you have published business hours. Disabling new requests preserves existing reservations.</p>
      {!settings.hasHours&&<p className="text-sm">Set your weekly schedule in the Hours tab before enabling reservations.</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input id="reservation-capacity" label="Guests available for online bookings at once" type="number" inputMode="numeric" step={1} min={1} max={200} value={numbers.capacity} disabled={saving} required onChange={(e)=>setNumbers({...numbers,capacity:e.target.value})} onBlur={()=>normalizeNumber('capacity')}/>
        <Input id="reservation-max-party" label="Maximum guests per request" type="number" inputMode="numeric" step={1} min={1} max={numbers.capacity===''?20:Math.min(20,Number(numbers.capacity))} value={numbers.maxPartySize} disabled={saving} required onChange={(e)=>setNumbers({...numbers,maxPartySize:e.target.value})} onBlur={()=>normalizeNumber('maxPartySize')}/>
        <div><label className="label" htmlFor="reservation-duration">Booking duration</label><select id="reservation-duration" className="input" value={settings.durationMinutes} disabled={saving} onChange={(e)=>setSettings({...settings,durationMinutes:Number(e.target.value)})}><option value={60}>60 minutes</option><option value={90}>90 minutes</option><option value={120}>120 minutes</option></select></div>
        <Input id="reservation-notice" label="Minimum advance notice (minutes)" type="number" inputMode="numeric" step={1} min={0} max={4320} value={numbers.minNoticeMinutes} disabled={saving} required onChange={(e)=>setNumbers({...numbers,minNoticeMinutes:e.target.value})} onBlur={()=>normalizeNumber('minNoticeMinutes')}/>
      </div>
      {numbers.capacity!==''&&numbers.maxPartySize!==''&&Number(numbers.maxPartySize)>Number(numbers.capacity)&&<p role="alert" className="text-sm text-amber-800 dark:text-amber-300">The party limit exceeds your online seats. Reduce the maximum guests per request or increase capacity before saving.</p>}
      <p className="text-xs text-stone-500">Time slots start every 30 minutes, up to 90 days ahead. Confirmed bookings consume this capacity. Pending requests do not hold seats. Keep this capacity separate from seats you need for walk-in customers.</p>
      <Button type="submit" loading={saving}>Save reservation settings</Button>
    </form></details>}
    {settings&&<div><h3 className="font-semibold text-lg">Reservation requests</h3><p className="text-sm text-stone-500 mt-1">Review pending requests below. Only confirmed bookings reserve seats.</p></div>}
    {settings&&<ReservationList restaurantId={restaurantId}/>}
  </div>;
}
