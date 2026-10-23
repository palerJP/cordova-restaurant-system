'use client';

import {useEffect,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import {Bell} from 'lucide-react';
import {api} from '@/lib/api';
import {useAuth} from '@/lib/auth-context';
import {reservationTime} from '@/lib/reservations';

type Notice={reservation_id:string;restaurant_id:string;restaurant_name:string;contact_name:string;party_size:number;starts_at:string};
export function ReservationNotifications(){
  const {user}=useAuth();
  const router=useRouter();
  const [items,setItems]=useState<Notice[]>([]);
  const [count,setCount]=useState(0);
  const [open,setOpen]=useState(false);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState<string|null>(null);
  const panel=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(user?.role!=='owner')return;
    let stopped=false,inFlight=false;
    const load=async()=>{
      if(document.hidden||inFlight)return;
      inFlight=true;
      try{const res=await api.get('/api/reservations/notifications',{cache:'no-store'});if(!stopped){setItems(res.data.notifications);setCount(res.data.unreadCount);setError('');}}
      catch{if(!stopped)setError('Notifications could not be refreshed.');}
      finally{inFlight=false;}
    };
    void load();
    const timer=setInterval(load,15000);
    document.addEventListener('visibilitychange',load);
    return()=>{stopped=true;clearInterval(timer);document.removeEventListener('visibilitychange',load);};
  },[user?.id,user?.role]);
  useEffect(()=>{
    if(!open)return;
    const close=(event:MouseEvent)=>{if(!panel.current?.contains(event.target as Node))setOpen(false);};
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')setOpen(false);};
    document.addEventListener('mousedown',close);document.addEventListener('keydown',escape);
    return()=>{document.removeEventListener('mousedown',close);document.removeEventListener('keydown',escape);};
  },[open]);
  if(user?.role!=='owner')return null;
  const view=async(item:Notice)=>{
    setBusy(item.reservation_id);
    try{await api.patch(`/api/reservations/notifications/${item.reservation_id}/read`,{});setItems(old=>old.filter(x=>x.reservation_id!==item.reservation_id));setCount(n=>Math.max(0,n-1));setOpen(false);router.push(`/dashboard/${item.restaurant_id}?tab=reservations`);}
    catch{setError('Could not open notification. Please try again.');}
    finally{setBusy(null);}
  };
  return <div ref={panel} className="relative">
    <button type="button" aria-label={`Reservation notifications${count?`, ${count} unread`:''}`} aria-expanded={open} aria-controls="reservation-notifications" onClick={()=>setOpen(!open)} className="relative rounded-full p-2 hover:bg-stone-100 dark:hover:bg-white/10">
      <Bell size={19}/>{count>0&&<span aria-hidden="true" className="absolute -right-1 -top-1 min-w-4 rounded-full bg-cordova-green px-1 text-[10px] font-bold text-white">{count>99?'99+':count}</span>}
    </button>
    <span className="sr-only" role="status">{count?`${count} unread reservation notifications`:''}</span>
    {open&&<section id="reservation-notifications" aria-label="Reservation notifications" className="absolute right-0 z-50 mt-3 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-stone-200 bg-white p-4 text-stone-900 shadow-xl dark:border-stone-700 dark:bg-[#1a211c] dark:text-white">
      <h2 className="font-semibold">Reservation notifications</h2>
      {error&&<p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-300">{error}</p>}
      {!items.length&&!error&&<p className="mt-3 text-sm text-stone-500">No new reservation requests.</p>}
      <ul className="mt-2 max-h-80 overflow-y-auto divide-y divide-stone-100 dark:divide-white/10">{items.map(item=><li key={item.reservation_id}><button type="button" disabled={busy!==null} onClick={()=>void view(item)} className="w-full py-3 text-left text-sm hover:text-cordova-green dark:hover:text-emerald-400"><span className="block font-semibold">New reservation · {item.restaurant_name}</span><span className="block mt-1">{item.contact_name} · {item.party_size} guests</span><span className="block text-xs text-stone-500 mt-1">{reservationTime(item.starts_at)}</span></button></li>)}</ul>
    </section>}
  </div>;
}
