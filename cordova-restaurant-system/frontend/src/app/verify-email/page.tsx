'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { ApiClientError } from '@/lib/api';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyEmail } = useAuth();

  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setErrorMessage('No verification token was provided in the URL.');
      return;
    }

    let isMounted = true;

    async function executeVerification() {
      try {
        await verifyEmail(token as string);
        if (isMounted) {
          setSuccess(true);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setSuccess(false);
          setLoading(false);
          if (err instanceof ApiClientError) {
            setErrorMessage(err.message);
          } else {
            setErrorMessage('Email verification failed. The link may be invalid or expired.');
          }
        }
      }
    }

    executeVerification();

    return () => {
      isMounted = false;
    };
  }, [token, verifyEmail]);

  return (
    <div className="min-h-screen bg-cordova-cream dark:bg-[#121614] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-2xl p-8 sm:p-10 max-w-md w-full shadow-2xl text-center">
        {/* Brand Emblem */}
        <div className="relative h-16 w-16 mx-auto mb-4">
          <Image src="/cordova_eats_logo.png" alt="CordovaEats" fill className="object-contain" priority />
        </div>

        {loading ? (
          <div className="py-8 space-y-4">
            <RefreshCw size={36} className="animate-spin text-cordova-gold mx-auto" />
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-white">
              Verifying Your Email...
            </h2>
            <p className="text-xs text-stone-500">Please wait while we confirm your single-use verification token.</p>
          </div>
        ) : success ? (
          <div className="space-y-5 py-4">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto ring-8 ring-emerald-50/50 dark:ring-emerald-950/20">
              <CheckCircle2 size={36} />
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
              Email Verified Successfully!
            </h1>

            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              Your account is now fully verified. You can now access all personalized dining features, save favorites, and write reviews.
            </p>

            <div className="pt-3 space-y-3">
              <Link
                href="/preferences?firstTime=true"
                className="w-full bg-cordova-green hover:bg-cordova-greenHover text-white font-bold text-xs py-3.5 px-4 rounded-xl shadow transition-colors flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                Set Your Food Preferences <ArrowRight size={16} />
              </Link>
              <Link
                href="/"
                className="w-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 font-semibold text-xs py-3 px-4 rounded-xl transition-colors block"
              >
                Explore Cordova Restaurants
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5 py-4">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mx-auto ring-8 ring-rose-50/50 dark:ring-rose-950/20">
              <AlertTriangle size={36} />
            </div>

            <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
              Verification Failed
            </h1>

            <p className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 p-3 rounded-lg border border-rose-200 dark:border-rose-900/50">
              {errorMessage}
            </p>

            <div className="pt-3 space-y-3">
              <Link
                href="/login"
                className="w-full bg-cordova-gold hover:bg-cordova-goldHover text-white font-bold text-xs py-3.5 px-4 rounded-xl shadow transition-colors flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
