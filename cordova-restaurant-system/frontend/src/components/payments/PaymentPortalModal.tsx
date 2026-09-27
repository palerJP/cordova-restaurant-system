'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Check,
  QrCode,
  Download,
  Smartphone,
  ShieldCheck,
  Clock,
  Sparkles,
  Maximize2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/lib/toast-context';
import { api, ApiClientError } from '@/lib/api';

export interface PaymentTier {
  id: string;
  name: string;
  price: string;
  amount: number;
  boost?: string;
  features?: readonly string[] | string[];
}

interface PaymentPortalModalProps {
  open: boolean;
  onClose: () => void;
  tier: PaymentTier | null;
  restaurantId: string;
  restaurantName?: string;
  onSuccess: () => void;
}

export function PaymentPortalModal({
  open,
  onClose,
  tier,
  restaurantId,
  restaurantName,
  onSuccess,
}: PaymentPortalModalProps) {
  const { toast } = useToast();
  const [payMethod, setPayMethod] = useState<'gcash' | 'maya'>('gcash');
  const [referenceNo, setReferenceNo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showEnlarged, setShowEnlarged] = useState(false);

  if (!open || !tier) return null;

  const handleOpenApp = () => {
    if (payMethod === 'gcash') {
      window.location.href = 'gcash://';
      toast('Redirecting to GCash app... If not opened, scan the QR code with your GCash scanner.', 'info');
    } else {
      window.location.href = 'paymaya://';
      toast('Redirecting to Maya app... If not opened, scan the QR code with your Maya scanner.', 'info');
    }
  };

  // Pure clean QR code assets only (no screenshot images)
  const getQrCodeSrc = () => {
    const amt = tier.amount;
    if (payMethod === 'gcash') {
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
      const res = await api.patch(`/api/restaurants/${restaurantId}/subscription`, {
        subscription_tier: tier.id,
        durationDays: 30,
        payment_method: payMethod,
        payment_reference: referenceNo.trim(),
      });

      if (res.data?.pending) {
        toast('Payment submitted! Platform administrator is verifying your transaction.', 'success');
      } else {
        toast(`Subscription updated to ${tier.name}`, 'success');
      }

      onSuccess();
      onClose();
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Failed to submit payment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div
        className="relative w-full max-w-xl bg-white dark:bg-[#161c18] rounded-3xl shadow-2xl border border-stone-200/80 dark:border-stone-800/80 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="CordovaEats Payment Portal"
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white p-5 sm:p-6 border-b border-stone-800 flex items-start justify-between relative overflow-hidden shrink-0">
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck size={12} /> Secure Payment
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <QrCode size={11} /> QR Ph &bull; InstaPay
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
              Pay ₱{tier.amount.toLocaleString()}.00 for {tier.name}
            </h2>
            {restaurantName && (
              <p className="text-xs text-stone-300">
                Establishment: <span className="font-semibold text-white">{restaurantName}</span>
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="rounded-full w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors relative z-10 shrink-0"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Method Switcher */}
          <div className="grid grid-cols-2 gap-3">
            {/* GCash */}
            <button
              type="button"
              onClick={() => setPayMethod('gcash')}
              className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                payMethod === 'gcash'
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
              {payMethod === 'gcash' && (
                <div className="w-5 h-5 rounded-full bg-[#007DFE] text-white flex items-center justify-center shrink-0">
                  <Check size={12} strokeWidth={3} />
                </div>
              )}
            </button>

            {/* Maya */}
            <button
              type="button"
              onClick={() => setPayMethod('maya')}
              className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                payMethod === 'maya'
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
              {payMethod === 'maya' && (
                <div className="w-5 h-5 rounded-full bg-[#00D665] text-stone-950 flex items-center justify-center shrink-0">
                  <Check size={12} strokeWidth={3} />
                </div>
              )}
            </button>
          </div>

          {/* Central Clean QR Code Frame */}
          <div className="flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-900/70 rounded-3xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 space-y-4">
            {/* Header Badge of QR Card */}
            <div className="flex items-center justify-between w-full px-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${payMethod === 'gcash' ? 'text-[#007DFE]' : 'text-[#00D665]'}`}>
                {payMethod === 'gcash' ? 'GCash QR' : 'Maya QR'}
              </span>
              <span className="font-mono font-bold text-sm text-stone-900 dark:text-white px-2.5 py-0.5 bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
                ₱{tier.amount.toLocaleString()}.00
              </span>
            </div>

            {/* Clean QR Image */}
            <div
              onClick={() => setShowEnlarged(true)}
              className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-md border-4 border-white dark:border-stone-800 bg-white p-3 flex items-center justify-center transition-transform hover:scale-[1.02]"
              style={{ width: '230px', height: '230px' }}
              title="Click to enlarge QR code"
            >
              <Image
                src={currentQrSrc}
                alt={`${payMethod.toUpperCase()} QR Code`}
                fill
                className="object-contain p-2"
                priority
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 backdrop-blur-[2px]">
                <Maximize2 size={16} /> Enlarge QR
              </div>
            </div>

            <p className="text-[11px] text-stone-500 dark:text-stone-400 text-center font-medium">
              Scan with your {payMethod === 'gcash' ? 'GCash' : 'Maya'} app to pay the exact ₱{tier.amount.toLocaleString()}.00 fee
            </p>

            {/* Mobile Actions: Open in App / Save QR */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <Button
                type="button"
                onClick={handleOpenApp}
                className={`w-full text-xs font-bold py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-1.5 ${
                  payMethod === 'gcash'
                    ? 'bg-[#007DFE] hover:bg-blue-600 text-white'
                    : 'bg-[#00D665] hover:bg-emerald-500 text-stone-950'
                }`}
              >
                <Smartphone size={14} />
                <span>Open in {payMethod === 'gcash' ? 'GCash' : 'Maya'} App</span>
              </Button>

              <a
                href={currentQrSrc}
                download={`${payMethod}-qr-${tier.amount}.png`}
                className="w-full text-xs font-bold py-2.5 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/80 transition-colors flex items-center justify-center gap-1.5 text-center shadow-xs"
              >
                <Download size={14} />
                <span>Save QR Code</span>
              </a>
            </div>
          </div>

          {/* Reference Submission Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Input
                label="Transaction / Reference Number *"
                placeholder="e.g. 1029384756 (from your receipt)"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                required
              />
              <p className="text-[11px] text-stone-400 mt-1 flex items-center gap-1">
                <Clock size={12} /> Enter the reference number from your GCash or Maya confirmation to verify.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={submitting}
                className="w-1/3 text-xs uppercase tracking-wider font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={submitting}
                disabled={submitting || !referenceNo.trim()}
                className="w-2/3 bg-cordova-green hover:bg-cordova-greenHover text-white text-xs font-bold uppercase tracking-wider py-3 shadow-sm"
              >
                <Check size={14} className="mr-1.5" />
                Submit Payment (₱{tier.amount.toLocaleString()})
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Enlarged QR Modal */}
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
              {payMethod === 'gcash' ? 'GCash' : 'Maya'} ₱{tier.amount.toLocaleString()}.00 QR Code
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
