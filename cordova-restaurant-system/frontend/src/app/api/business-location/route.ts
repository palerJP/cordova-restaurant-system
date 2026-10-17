import { AddressLookupError, lookupAddress } from '@/lib/business-address-server';

export const runtime = 'nodejs';
const budgets = new Map<string, { until: number; count: number }>();
const reply = (status: number, body: object) => Response.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });

export async function POST(request: Request) {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return reply(401, { success: false, message: 'Sign in to look up your business address.' });
  const rawBackend = process.env.BACKEND_URL || process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL
    || (process.env.NODE_ENV !== 'production' ? 'http://localhost:4000' : '');
  if (!rawBackend) return reply(503, { success: false, message: 'Address lookup is temporarily unavailable.' });
  try {
    // Validate the session through the existing API; no JWT secrets belong in the frontend.
    const auth = await fetch(`${rawBackend.replace(/\/+$/, '').replace(/\/api$/, '')}/api/auth/me`, {
      headers: { Authorization: authorization }, cache: 'no-store', signal: AbortSignal.timeout(10000),
    });
    if (auth.status === 401 || auth.status === 403) return reply(auth.status, { success: false, message: 'Sign in again to look up your address.' });
    if (!auth.ok) throw new Error('Authentication service unavailable');
    const user = (await auth.json()).data?.user;
    if (!user?.id || !['owner', 'customer', 'admin'].includes(user.role)) return reply(403, { success: false, message: 'A business account is required.' });
    const now = Date.now();
    const current = budgets.get(user.id);
    if (current && current.until > now && current.count >= 15) return reply(429, { success: false, message: 'Please wait a minute before looking up more addresses.' });
    if (budgets.size >= 1000) {
      for (const [key, budget] of budgets) if (budget.until <= now) budgets.delete(key);
      if (budgets.size >= 1000) return reply(429, { success: false, message: 'Address lookup is busy. Please try again shortly.' });
    }
    budgets.set(user.id, current && current.until > now ? { ...current, count: current.count + 1 } : { until: now + 60000, count: 1 });
    const text = await request.text();
    if (text.length > 2048) return reply(413, { success: false, message: 'Please enter a shorter address.' });
    let body;
    try { body = JSON.parse(text); } catch { return reply(400, { success: false, message: 'Enter a valid address.' }); }
    const results = await lookupAddress(body?.address, body?.barangay ?? '');
    return reply(200, { success: true, data: { results } });
  } catch (err) {
    return reply(err instanceof AddressLookupError ? err.status : 503, { success: false,
      message: err instanceof AddressLookupError ? err.message : 'Address lookup is temporarily unavailable. Please try again shortly.' });
  }
}
