'use client';
import {useLiveReviewStats} from '@/lib/live-review-stats';
export function LiveReviewSummary({slug,count=0,rating=0}:{slug:string;count?:number;rating?:number|string}) {
 const stats=useLiveReviewStats(slug);
 const total=stats?.review_count ?? count;
 const average=Number(stats?.avg_rating ?? rating);
 return <span>⭐ {total>0 ? average.toFixed(1) : '—'} ({total} {total===1?'review':'reviews'})</span>;
}
