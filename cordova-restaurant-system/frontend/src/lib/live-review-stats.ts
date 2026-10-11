'use client';
import { useSyncExternalStore } from 'react';
import { api } from './api';
type Stats = {id:string;slug:string;review_count:number;avg_rating:number;revision:string|null};
let snapshot: Record<string,Stats> = {};
const empty: Record<string,Stats> = {};
const listeners = new Set<()=>void>();
let timer: ReturnType<typeof setInterval> | undefined;
let pending: Promise<void> | undefined;
export function refreshReviewStats(): Promise<void> {
 if(pending) return pending;
 pending = (async()=>{
  try {
   const res=await api.get('/api/restaurants/review-stats',{auth:false,cache:'no-store'});
   if(!Array.isArray(res.data)) throw new Error('Invalid review statistics');
   const next: Record<string,Stats> = {};
   for(const row of res.data) {const value={...row,review_count:Number(row.review_count),avg_rating:Number(row.avg_rating)};next[row.slug]=value;next[row.id]=value;}
   snapshot=next;listeners.forEach(fn=>fn());
  } catch { /* Keep the last confirmed statistics during a temporary outage. */ }
  finally {pending=undefined;}
 })();
 return pending;
}
function refreshVisible() {if(document.visibilityState !== 'hidden') void refreshReviewStats();}
function subscribe(listener:()=>void) {
 listeners.add(listener);
 if(listeners.size===1) {
  refreshVisible();timer=setInterval(refreshVisible,5000);
  window.addEventListener('focus',refreshVisible);
  window.addEventListener('online',refreshVisible);
  document.addEventListener('visibilitychange',refreshVisible);
 }
 return ()=>{
  listeners.delete(listener);
  if(!listeners.size) {
   clearInterval(timer);timer=undefined;
   window.removeEventListener('focus',refreshVisible);
   window.removeEventListener('online',refreshVisible);
   document.removeEventListener('visibilitychange',refreshVisible);
  }
 };
}
export function useLiveReviewStats(key:string) {
 const values=useSyncExternalStore(subscribe,()=>snapshot,()=>empty);
 return values[key];
}
