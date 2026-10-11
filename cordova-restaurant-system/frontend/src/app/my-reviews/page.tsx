'use client';
import {useEffect,useState,useCallback,useRef} from 'react';
import Link from 'next/link';
import {api} from '@/lib/api';
import {useAuth} from '@/lib/auth-context';
import {ReviewActions} from '@/components/ReviewActions';
import type {Review} from '@/lib/types';
type OwnReview=Review & {restaurant_name:string;restaurant_slug:string;flagged_reason?:string};
export default function MyReviews(){
 const {user,loading:authLoading}=useAuth();
 const [reviews,setReviews]=useState<OwnReview[]>([]),[page,setPage]=useState(1),[pages,setPages]=useState(1),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const requests=useRef(0);
 const load=useCallback(async()=>{const requestId=++requests.current;if(!user){setReviews([]);setLoading(false);return;}setLoading(true);try{const result=await api.get('/api/reviews/mine?limit=12&page='+page,{cache:'no-store'});if(requestId!==requests.current)return;if(page>result.meta.totalPages){setPage(result.meta.totalPages);return;}setReviews(result.data);setPages(result.meta.totalPages);setError('');}catch(e){if(requestId===requests.current)setError(e instanceof Error?e.message:'Unable to load reviews');}finally{if(requestId===requests.current)setLoading(false);}},[user,page]);
 useEffect(()=>{setReviews([]);void load();return()=>{requests.current+=1;};},[load]);
 if(authLoading)return <p className="p-8">Loading…</p>;
 if(!user)return <div className="p-8 text-center"><Link href="/login" className="underline">Sign in to manage your reviews</Link></div>;
 return <main className="max-w-3xl mx-auto px-4 py-8 space-y-5"><h1 className="font-serif text-3xl font-bold">My Reviews</h1><p className="text-sm text-stone-500">Hold your review on your phone, or use its menu to edit or delete it.</p>
 {error && <div role="alert">{error} <button onClick={()=>void load()} className="underline">Try again</button></div>}
 {loading?<p>Loading reviews…</p>:reviews.length===0 && !error?<p>You have not posted any reviews yet.</p>:reviews.map(review=><ReviewActions key={review.id} review={review} onChanged={()=>void load()} className="rounded-2xl border dark:border-stone-700 bg-white dark:bg-stone-900 p-5 space-y-3"><Link className="font-semibold underline" href={'/restaurants/'+review.restaurant_slug}>{review.restaurant_name}</Link><p className="text-sm">{review.rating} stars · {review.status} · {new Date(review.created_at).toLocaleDateString()}</p><p className="whitespace-pre-wrap break-words">{review.comment}</p>{review.flagged_reason && <p className="text-sm text-stone-500">Admin decision: {review.flagged_reason}</p>}</ReviewActions>)}
 {pages>1 && <div className="flex items-center gap-4"><button disabled={page===1 || loading} onClick={()=>setPage(p=>p-1)}>Previous</button><span>Page {page} of {pages}</span><button disabled={page>=pages || loading} onClick={()=>setPage(p=>p+1)}>Next</button></div>}
 </main>;
}
