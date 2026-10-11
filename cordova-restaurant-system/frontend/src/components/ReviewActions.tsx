'use client';
import {useState,useRef,useEffect,type ReactNode,type PointerEvent} from 'react';
import {createReviewLongPress} from '@/lib/review-long-press';
import {MoreHorizontal} from 'lucide-react';
import {useAuth} from '@/lib/auth-context';
import {useToast} from '@/lib/toast-context';
import {api} from '@/lib/api';
import {refreshReviewStats} from '@/lib/live-review-stats';
import type {Review} from '@/lib/types';
export function ReviewActions({review,children,className,onChanged}:{review:Review;children:ReactNode;className?:string;onChanged?:(review:Review|null)=>void}) {
 const {user}=useAuth(),{toast}=useToast();
 const own=Boolean(user && (review.is_mine || user.id===review.user_id)) && /^[0-9a-f-]{36}$/i.test(review.id);
 const [mode,setMode]=useState<'menu'|'edit'|'delete'|null>(null),[busy,setBusy]=useState(false);
 const [rating,setRating]=useState(review.rating),[comment,setComment]=useState(review.comment || ''),[photos,setPhotos]=useState(review.photos || []);
 const dialog=useRef<HTMLDialogElement>(null);
 const gesture=useRef(createReviewLongPress(()=>setMode('menu')));
 const cancelPress=gesture.current.cancel;
 useEffect(()=>()=>gesture.current.cancel(),[]);
 useEffect(()=>{if(mode && dialog.current && !dialog.current.open)dialog.current.showModal();if(!mode && dialog.current?.open)dialog.current.close();},[mode]);
 useEffect(()=>{if(!own){gesture.current.cancel();setMode(null);}},[own]);
 function down(event:PointerEvent<HTMLDivElement>){
  if(!own || event.pointerType==='mouse' || !event.isPrimary || (event.target as Element).closest('button,a,input,textarea,select,dialog')) return;
  gesture.current.start(event.clientX,event.clientY,event.pointerType);
 }
 function edit(){setRating(Number(review.rating));setComment(review.comment || '');setPhotos(review.photos || []);setMode('edit');}
 async function save(remove=false){
  if(busy)return;setBusy(true);
  try{
   let changed:Review|null=null;
   if(remove)await api.delete('/api/reviews/'+review.id);
   else {const response=await api.patch('/api/reviews/'+review.id,{rating,comment:comment.trim(),photos});changed={...review,...response.data.review};}
   onChanged?.(changed);setMode(null);
   window.dispatchEvent(new Event('cordova_review_updated'));void refreshReviewStats();
   toast(remove?'Review deleted':'Review updated','success');
  }catch(error){toast(error instanceof Error?error.message:'Unable to change review','error');}
  finally{setBusy(false);}
 }
 return <div className={own ? (className || "") + " select-none touch-pan-y" : className} onPointerDown={down} onPointerMove={e=>gesture.current.move(e.clientX,e.clientY)} onPointerUp={cancelPress} onPointerCancel={cancelPress} onPointerLeave={cancelPress} onContextMenu={e=>{if(own && !(e.target as Element).closest('button,a,input,textarea,select,dialog')){e.preventDefault();cancelPress();setMode('menu');}}} style={own?{WebkitTouchCallout:'none'}:undefined}>
 {own && <div className="flex items-center justify-between gap-2"><span className="text-xs text-stone-500">Your review · hold to manage</span><button type="button" aria-label="Manage your review" aria-haspopup="dialog" onClick={()=>setMode('menu')} className="p-3 min-h-11 min-w-11 rounded-xl border border-stone-300 text-stone-900 dark:text-white dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2"><MoreHorizontal size={20}/></button></div>}
 {children}
 <dialog ref={dialog} onCancel={e=>{if(busy)e.preventDefault();else setMode(null);}} onClose={()=>setMode(null)} onClick={e=>{if(e.target===e.currentTarget && !busy)setMode(null);}} aria-labelledby={'review-actions-'+review.id} className="w-[calc(100%-2rem)] max-w-lg rounded-2xl p-0 bg-white text-stone-900 dark:bg-stone-900 dark:text-white backdrop:bg-black/50 max-h-[85dvh] overflow-y-auto select-text">
 <div className="p-5 space-y-4">
 <h2 id={'review-actions-'+review.id} className="text-lg font-semibold">{mode==='edit'?'Edit your review':mode==='delete'?'Delete your review?':'Manage your review'}</h2>
 {mode==='menu' && <><button type="button" onClick={edit} className="block w-full text-left p-3 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800">Edit review</button><button type="button" onClick={()=>setMode('delete')} className="block w-full text-left p-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-stone-800">Delete review</button></>}
 {mode==='edit' && <form onSubmit={e=>{e.preventDefault();void save();}} className="space-y-4">
 {review.status!=='visible' && <p className="text-sm text-amber-700">This review is {review.status}. Editing it will not publish it; admin review is required.</p>}
 <label className="block text-sm">Rating<select value={rating} onChange={e=>setRating(Number(e.target.value))} className="block mt-1 w-full border rounded-lg p-3 bg-white dark:bg-stone-800">{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} {n===1?'star':'stars'}</option>)}</select></label>
 <label className="block text-sm">Your review<textarea required minLength={1} maxLength={1000} rows={5} value={comment} onChange={e=>setComment(e.target.value)} className="block mt-1 w-full border rounded-lg p-3 bg-white dark:bg-stone-800"/></label>
 {photos.length>0 && <div className="space-y-2 text-sm"><p>Attached photos</p>{photos.map((photo,i)=><div key={photo} className="flex items-center gap-3"><a href={photo} target="_blank" rel="noreferrer" className="underline">Photo {i+1}</a><button type="button" disabled={busy} onClick={()=>setPhotos(current=>current.filter(p=>p!==photo))} className="p-2 text-red-600">Remove</button></div>)}</div>}
 <button type="submit" disabled={busy || !comment.trim()} className="w-full p-3 bg-cordova-green text-white rounded-lg disabled:opacity-50">{busy?'Saving…':'Save changes'}</button>
 </form>}
 {mode==='delete' && <><p className="text-sm">Your review and attached photos will disappear from the listing. This cannot be undone.</p><button type="button" disabled={busy} onClick={()=>void save(true)} className="w-full p-3 bg-red-600 text-white rounded-lg disabled:opacity-50">{busy?'Deleting…':'Delete review'}</button></>}
 <button type="button" disabled={busy} onClick={()=>setMode(null)} className="w-full p-3 border rounded-lg">Cancel</button>
 </div></dialog>
 </div>;
}
