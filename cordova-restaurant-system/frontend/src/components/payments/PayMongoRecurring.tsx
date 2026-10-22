'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, ApiClientError } from '@/lib/api';
import { useToast } from '@/lib/toast-context';

type Plan = { id: string; name: string; tier: string; interval: string; amount_centavos: number; currency: string };
type Subscription = { id: string; status: string; planId: string; nextBillingAt: string | null };
type Checkout = { id: string; paymentIntentId: string; clientKey: string; publicKey: string;
  billingName: string; billingEmail: string; billingPhone: string };

export function PayMongoRecurring({ restaurantId, onUpdated }: { restaurantId: string; onUpdated: () => void }) {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const returnedId = searchParams.get('subscription');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [available, setAvailable] = useState(false);
  const [current, setCurrent] = useState<Subscription | null>(null);
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const [planResponse, subscriptionResponse] = await Promise.all([
      api.get('/api/payments/subscription-plans'),
      api.get(`/api/payments/subscriptions/restaurant/${restaurantId}`),
    ]);
    setPlans(planResponse.data.plans);
    setAvailable(planResponse.data.available);
    setCurrent(subscriptionResponse.data);
  }, [restaurantId]);

  useEffect(() => { refresh().catch(() => toast('Could not load recurring plans', 'error')); }, [refresh, toast]);
  useEffect(() => {
    if (!returnedId) return;
    api.get(`/api/payments/subscriptions/${returnedId}`)
      .then((res) => {
        setCurrent(res.data);
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete('subscription');
        window.history.replaceState(null, '', cleanUrl.toString());
        onUpdated();
        toast(res.data.status === 'active' ? 'Subscription activated' : `Payment status: ${res.data.status}`, 'info');
      }).catch(() => toast('Could not verify the returned subscription', 'error'));
  }, [returnedId, onUpdated, toast]);

  async function begin(planId: string) {
    setBusy(true);
    try {
      const started = await api.post('/api/payments/subscriptions', { restaurantId, planId, phone: phone.trim() });
      const checkout = started.data as Checkout;
      const authorization = `Basic ${btoa(`${checkout.publicKey}:`)}`;
      const methodResponse = await fetch('https://api.paymongo.com/v1/payment_methods', {
        method: 'POST', headers: { Authorization: authorization, 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { attributes: { type: 'paymaya', billing: {
          name: checkout.billingName, email: checkout.billingEmail, phone: checkout.billingPhone,
        } } } }),
      });
      if (!methodResponse.ok) throw new Error('Maya test payment method could not be created');
      const method = await methodResponse.json();
      const attachedResponse = await fetch(`https://api.paymongo.com/v1/payment_intents/${checkout.paymentIntentId}/attach`, {
        method: 'POST', headers: { Authorization: authorization, 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { attributes: { payment_method: method.data.id, client_key: checkout.clientKey,
          return_url: `${window.location.origin}/dashboard/${restaurantId}?tab=subscription&subscription=${checkout.id}`,
        } } }),
      });
      if (!attachedResponse.ok) throw new Error('Could not open Maya test checkout');
      const attached = await attachedResponse.json();
      const redirect = attached?.data?.attributes?.next_action?.redirect?.url;
      if (typeof redirect === 'string' && redirect.startsWith('https://')) {
        window.location.assign(redirect);
        return;
      }
      if (attached?.data?.attributes?.status === 'succeeded') {
        await refresh();
        onUpdated();
        toast('Payment submitted; checking the subscription', 'info');
        return;
      }
      throw new Error('PayMongo did not return a checkout link');
    } catch (error) {
      toast(error instanceof ApiClientError ? error.message : error instanceof Error ? error.message : 'Could not start subscription', 'error');
    } finally { setBusy(false); }
  }

  async function cancel() {
    if (!current) return;
    setBusy(true);
    try {
      await api.post(`/api/payments/subscriptions/${current.id}/cancel`);
      await refresh();
      onUpdated();
      toast('Recurring subscription cancelled', 'success');
    } catch (error) {
      toast(error instanceof ApiClientError ? error.message : 'Could not cancel subscription', 'error');
    } finally { setBusy(false); }
  }

  const open = current && ['creating', 'incomplete', 'active', 'past_due', 'unpaid'].includes(current.status);
  const canRetry = current && ['creating', 'incomplete'].includes(current.status);
  return <section className="rounded-xl border border-emerald-300 bg-emerald-50/50 p-5 space-y-4">
    <div><h3 className="font-serif text-xl font-bold">PayMongo recurring subscription (test mode)</h3>
      <p className="text-sm text-stone-600">Pay monthly through Maya test checkout. Renewal and access follow PayMongo&apos;s verified subscription status.</p></div>
    {!available && <p className="text-sm text-amber-800">Test checkout is disabled because the backend is missing PayMongo test keys. Add the test secret and public keys, then restart the backend. PayMongo must also enable Subscriptions and Maya on your account before a test payment can complete.</p>}
    {current && <div className="text-sm rounded-lg bg-white p-3 border">
      <strong>{current.planId}</strong> · {current.status.replaceAll('_', ' ')}
      {current.nextBillingAt && <span> · Next billing: {new Date(current.nextBillingAt).toLocaleDateString()}</span>}
      {open && <button type="button" disabled={busy} onClick={cancel} className="ml-3 underline text-red-700">Cancel subscription</button>}
    </div>}
    <label className="block text-sm">Maya test phone number
      <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="09XXXXXXXXX"
        className="block mt-1 w-full max-w-xs rounded-lg border px-3 py-2" inputMode="tel" />
    </label>
    {available && !/^\+?\d{10,15}$/.test(phone.trim()) && <p className="text-xs text-stone-600">Enter a 10 to 15 digit phone number to enable a plan.</p>}
    <div className="grid gap-3 md:grid-cols-3">{plans.map((plan) => <div key={plan.id} className="rounded-lg border bg-white p-4">
      <strong>{plan.name}</strong><p className="text-sm">₱{(plan.amount_centavos / 100).toLocaleString()} / month</p>
      <button type="button" onClick={() => begin(plan.id)} disabled={!available || (!!open && !(canRetry && current.planId === plan.id)) || busy || !/^\+?\d{10,15}$/.test(phone.trim())}
        className="mt-3 rounded-lg bg-emerald-700 px-3 py-2 text-sm text-white disabled:opacity-50">{canRetry && current.planId === plan.id ? 'Retry test payment' : 'Start test subscription'}</button>
    </div>)}</div>
  </section>;
}
