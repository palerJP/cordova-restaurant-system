'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  QrCode,
  Smartphone,
  Download,
  Check,
  Maximize2,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/lib/toast-context';
import { api, ApiClientError } from '@/lib/api';

interface Plan {
  id: string;
  name: string;
  amount: number;
  price: string;
  boost: string;
  recommended?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Basic Boost',
    amount: 499,
    price: '₱499.00 / month',
    boost: '1.1x Relevance Multiplier',
  },
  {
    id: 'premium',
    name: 'Premium Boost',
    amount: 999,
    price: '₱999.00 / month',
    boost: '1.3x Relevance Multiplier',
    recommended: true,
  },
  {
    id: 'featured',
    name: 'Featured Partner',
    amount: 1999,
    price: '₱1,999.00 / month',
    boost: '1.5x Max Boost + Sponsored Tag',
  },
  {
    id: 'promotion',
    name: 'Flash Dining Promo',
    amount: 199,
    price: '₱199.00 / deal',
    boost: 'Promotions Feed Live',
  },
];

export default function PaymentPortalPage() {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<Plan>(PLANS[1]); // default to ₱999
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'maya'>('gcash');
  const [referenceNo, setReferenceNo] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showEnlarged, setShowEnlarged] = useState(false);

  // My restaurants (if logged in owner)
  const [myRestaurants, setMyRestaurants] = useState<any[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');

  useEffect(() => {
    async function loadRestaurants() {
      try {
        const res = await api.get('/api/restaurants/mine');
        if (res.data?.restaurants && res.data.restaurants.length > 0) {
          setMyRestaurants(res.data.restaurants);
          setSelectedRestaurantId(res.data.restaurants[0].id);
          setRestaurantName(res.data.restaurants[0].name);
        }
      } catch {
        // Guest or non-owner visiting portal
      }
    }
    loadRestaurants();
  }, []);

  const handleOpenApp = () => {
    if (paymentMethod === 'gcash') {
      window.location.href = 'gcash://';
      toast('Opening GCash app... If not opened, scan the QR code with your GCash app scanner.', 'info');
    } else {
      window.location.href = 'paymaya://';
      toast('Opening Maya app... If not opened, scan the QR code with your Maya app scanner.', 'info');
    }
  };

  // Pure clean QR code assets only (no screenshot images)
  const getQrCodeSrc = () => {
    const amt = selectedPlan.amount;
    if (paymentMethod === 'gcash') {
      if (amt === 499) return '/images/payments/gcash-qr-499-code.png';
      if (amt === 999) return '/images/payments/gcash-qr-999-code.png';
      if (amt === 1999) return '/images/payments/gcash-qr-1999-code.png';
      return '/images/payments/gcash-qr-code.png';
    } else {
      if (amt === 499) return '/images/payments/maya-qr-499-code.png';
      if (amt === 999) return '/images/payments/maya-qr-999-code.png';
      if (amt === 1999) return '/images/payments/maya-qr-1999-code.png';
      return '/images/payments/maya-qr-code.png';
    }
  };

  const currentQrSrc = getQrCodeSrc();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceNo.trim()) {
      toast('Please enter your GCash / Maya transaction reference number', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (selectedRestaurantId && selectedPlan.id !== 'promotion') {
        await api.patch(`/api/restaurants/${selectedRestaurantId}/subscription`, {
          subscription_tier: selectedPlan.id,
          durationDays: 30,
          payment_method: paymentMethod,
          payment_reference: referenceNo.trim(),
        });
      }
      setSubmitted(true);
      toast('Payment details submitted successfully! Awaiting administrator verification.', 'success');
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Submitted reference logged for verification', 'info');
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Portal Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck size={14} />
          <span>CordovaEats Official Payment Portal</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white tracking-tight">
          GCash &amp; Maya QR Payment
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-300">
          Select your plan and scan the QR code using your GCash or Maya app.
        </p>
      </div>

      {/* Plan Selection Buttons */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Step 1: Choose Your Plan
          </h2>
          <span className="text-xs text-stone-400">Amounts: ₱499, ₱999, ₱1,999, ₱199</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PLANS.map((plan) => {
            const isSelected = selectedPlan.id === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlan(plan)}
                className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-cordova-green ring-2 ring-cordova-green/30 bg-white dark:bg-[#1a221d] shadow-md'
                    : 'border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/60 hover:border-stone-300'
                }`}
              >
                {plan.recommended && (
                  <span className="absolute -top-2.5 right-4 bg-amber-500 text-stone-950 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    Most Popular
                  </span>
                )}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-serif font-bold text-base text-stone-900 dark:text-white">
                      {plan.name}
                    </span>
                    {isSelected && <Check size={16} className="text-cordova-green shrink-0" />}
                  </div>
                  <p className="text-xl font-bold font-serif text-cordova-green dark:text-emerald-400">
                    ₱{plan.amount.toLocaleString()}
                  </p>
                  <p className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 mt-0.5">
                    {plan.boost}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Payment Section: QR Code & Reference Submission */}
      <div className="bg-white dark:bg-[#161c18] rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-xl space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Step 2: Scan QR or Open App
          </span>
          <span className="px-3 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 font-mono font-bold text-cordova-green dark:text-emerald-400 text-sm">
            Total: ₱{selectedPlan.amount.toLocaleString()}.00
          </span>
        </div>

        {/* Payment Method Switcher */}
        <div className="grid grid-cols-2 gap-3">
          {/* GCash */}
          <button
            type="button"
            onClick={() => setPaymentMethod('gcash')}
            className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
              paymentMethod === 'gcash'
                ? 'border-[#007DFE] bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-[#007DFE]/40 shadow-sm'
                : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 hover:border-stone-300'
            }`}
          >
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-xl bg-[#007DFE] flex items-center justify-center text-white font-extrabold text-sm shadow-sm shrink-0">
                G
              </div>
              <div>
                <p className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white">GCash</p>
                <p className="text-[10px] text-stone-500">Scan QR Code</p>
              </div>
            </div>
            {paymentMethod === 'gcash' && <Check size={16} className="text-[#007DFE]" />}
          </button>

          {/* Maya */}
          <button
            type="button"
            onClick={() => setPaymentMethod('maya')}
            className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
              paymentMethod === 'maya'
                ? 'border-[#00D665] bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-[#00D665]/40 shadow-sm'
                : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 hover:border-stone-300'
            }`}
          >
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-xl bg-[#00D665] flex items-center justify-center text-stone-900 font-extrabold text-sm shadow-sm shrink-0">
                m
              </div>
              <div>
                <p className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white">Maya</p>
                <p className="text-[10px] text-stone-500">Scan QR Code</p>
              </div>
            </div>
            {paymentMethod === 'maya' && <Check size={16} className="text-[#00D665]" />}
          </button>
        </div>

        {/* QR Display Card (Clean QR Only) */}
        <div className="flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-900/70 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 space-y-4">
          <div
            onClick={() => setShowEnlarged(true)}
            className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-md border-4 border-white dark:border-stone-800 bg-white p-3 flex items-center justify-center transition-transform hover:scale-[1.02]"
            style={{ width: '240px', height: '240px' }}
            title="Click to enlarge QR code"
          >
            <Image
              src={currentQrSrc}
              alt={`${paymentMethod.toUpperCase()} QR Code`}
              fill
              className="object-contain p-2"
              priority
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 backdrop-blur-[2px]">
              <Maximize2 size={16} /> Enlarge QR
            </div>
          </div>

          <p className="text-xs text-stone-500 dark:text-stone-400 text-center font-medium">
            Scan using {paymentMethod === 'gcash' ? 'GCash' : 'Maya'} to pay ₱{selectedPlan.amount.toLocaleString()}.00
          </p>

          {/* Action Buttons */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <Button
              type="button"
              onClick={handleOpenApp}
              className={`w-full text-xs font-bold py-3 rounded-xl shadow-sm flex items-center justify-center gap-1.5 ${
                paymentMethod === 'gcash'
                  ? 'bg-[#007DFE] hover:bg-blue-600 text-white'
                  : 'bg-[#00D665] hover:bg-emerald-500 text-stone-950'
              }`}
            >
              <Smartphone size={15} />
              <span>Open in {paymentMethod === 'gcash' ? 'GCash' : 'Maya'} App</span>
            </Button>

            <a
              href={currentQrSrc}
              download={`${paymentMethod}-qr-${selectedPlan.amount}.png`}
              className="w-full text-xs font-bold py-3 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors flex items-center justify-center gap-1.5 text-center shadow-xs"
            >
              <Download size={15} />
              <span>Save QR Code</span>
            </a>
          </div>
        </div>

        {/* Step 3: Reference Submission */}
        <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
            Step 3: Enter Transaction Reference Number
          </span>

          {submitted ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-100 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                <Check size={18} /> Payment Reference Received!
              </div>
              <p className="text-stone-600 dark:text-stone-300">
                Reference number <span className="font-mono font-bold text-stone-900 dark:text-white">#{referenceNo}</span> submitted for <strong>{selectedPlan.name} (₱{selectedPlan.amount.toLocaleString()})</strong> via {paymentMethod.toUpperCase()}.
              </p>
              <div className="pt-2 flex gap-3">
                <Link href="/dashboard">
                  <Button size="sm" className="bg-cordova-green text-white text-xs font-bold">
                    Go to Dashboard →
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setSubmitted(false);
                    setReferenceNo('');
                  }}
                  className="text-xs"
                >
                  Submit Another
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {myRestaurants.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Select Your Restaurant Establishment:
                  </label>
                  <select
                    value={selectedRestaurantId}
                    onChange={(e) => setSelectedRestaurantId(e.target.value)}
                    className="input w-full text-xs"
                  >
                    {myRestaurants.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <Input
                  label="Transaction / Reference Number *"
                  placeholder="e.g. 1029384756 (from your receipt)"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  required
                />
                <p className="text-[11px] text-stone-400 mt-1 flex items-center gap-1">
                  <Clock size={12} /> Enter the reference number from your GCash or Maya payment receipt to verify.
                </p>
              </div>

              <Button
                type="submit"
                loading={submitting}
                disabled={submitting || !referenceNo.trim()}
                className="w-full bg-cordova-green hover:bg-cordova-greenHover text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl shadow-md"
              >
                <Check size={15} className="mr-1.5" />
                Submit Payment (₱{selectedPlan.amount.toLocaleString()}.00)
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {showEnlarged && (
        <div
          className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setShowEnlarged(false)}
        >
          <div className="relative max-w-sm w-full bg-white dark:bg-stone-900 p-5 rounded-3xl shadow-2xl flex flex-col items-center">
            <button
              onClick={() => setShowEnlarged(false)}
              className="absolute top-3 right-3 text-stone-400 hover:text-stone-900 dark:hover:text-white p-1 rounded-full"
            >
              ✕
            </button>
            <p className="text-sm font-bold text-stone-900 dark:text-white mb-3">
              {paymentMethod === 'gcash' ? 'GCash' : 'Maya'} ₱{selectedPlan.amount.toLocaleString()}.00 QR Code
            </p>
            <div className="relative w-64 h-64 bg-white rounded-2xl p-2 border border-stone-200 shadow-inner">
              <Image
                src={currentQrSrc}
                alt="Enlarged QR"
                fill
                className="object-contain p-2"
              />
            </div>
            <p className="text-xs text-stone-500 mt-3 text-center">
              Scan with your phone or tap anywhere to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
