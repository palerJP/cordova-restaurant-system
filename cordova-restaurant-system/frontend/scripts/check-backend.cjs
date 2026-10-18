async function run() {
  if (process.env.VERCEL_ENV !== 'production') return;
  const configured = process.env.BACKEND_URL || process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!configured) throw new Error('Production build blocked: backend routing is not configured');
  const base = configured.replace(/\/api\/?$/,'').replace(/\/$/,'');
  const directoryResponse = await fetch(`${base}/api/restaurants?limit=100`, { signal: AbortSignal.timeout(20000) });
  if (!directoryResponse.ok) throw new Error('Production build blocked: backend catalog is unavailable');
  const directory = await directoryResponse.json();
  const minimum = Number(process.env.MIN_PUBLIC_LISTINGS || 1);
  if (!directory.data?.length || Number(directory.meta?.totalCount || 0) < minimum) {
    throw new Error(`Production build blocked: fewer than ${minimum} public listings`);
  }
  const response = await fetch(`${base}/api/recommendations`, { method:'POST',
    headers: { 'Content-Type':'application/json' }, body:'{"limit":3}', signal:AbortSignal.timeout(20000) });
  if (!response.ok || !(await response.json()).data?.length) throw new Error('Production build blocked: recommendations unavailable');
  console.log(`Frontend release checks passed: ${directory.meta.totalCount} public listings and working recommendations.`);
}
run().catch((error)=>{console.error(error.message);process.exitCode=1;});
