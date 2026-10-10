'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Mail, RefreshCw, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { ApiClientError } from '@/lib/api';

const REQUIRE_EMAIL_VERIFICATION = process.env.NODE_ENV === 'production'
  || process.env.NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION === 'true';

export default function VerifyEmailRequiredPage() {
  const router = useRouter();
  const { user, resendVerificationEmail, devVerifyEmail, logout } = useAuth();
  const { showToast } = useToast();

  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const [devVerifying, setDevVerifying] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role === 'admin') {
      router.push('/admin');
    } else if (user.email_verified || !REQUIRE_EMAIL_VERIFICATION) {
      // If already verified or verification is disabled on localhost, allow browsing
      if (user.email_verified) {
        router.push('/');
      }
    }
  }, [user, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleDevVerify = async () => {
    if (devVerifying) return;
    setDevVerifying(true);
    try {
      await devVerifyEmail(user?.email);
      showToast('Account verified (Dev Mode)! Welcome to CordovaEats.', 'success');
      router.push('/');
    } catch (err) {
      if (err instanceof ApiClientError) {
        showToast(err.message, 'error');
      } else {
        showToast('Dev verification failed.', 'error');
      }
    } finally {
      setDevVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || sending) return;
    setSending(true);
    try {
      await resendVerificationEmail();
      showToast('Verification email sent! Please check your inbox.', 'success');
      setCooldown(60);
    } catch (err) {
      if (err instanceof ApiClientError) {
        showToast(err.message, 'error');
      } else {
        showToast('Failed to resend verification email', 'error');
      }
    } finally {
      setSending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-cordova-cream dark:bg-[#121614] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-2xl p-8 sm:p-10 max-w-md w-full shadow-2xl text-center">
        {/* Brand Emblem */}
        <div className="relative h-16 w-16 mx-auto mb-4">
          <Image src="/cordova_eats_logo.png" alt="CordovaEats" fill className="object-contain" priority />
        </div>

        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-amber-50 dark:bg-amber-950/40 text-cordova-gold mb-5 ring-8 ring-amber-50/50 dark:ring-amber-950/20">
          <Mail size={28} />
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-2">
          Verify Your Email Address
        </h1>

        <p className="text-sm text-stone-600 dark:text-stone-300 mb-4 leading-relaxed">
          We sent a verification link to:
        </p>
        <div className="inline-block bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white font-mono text-sm font-semibold px-4 py-2 rounded-lg mb-6 border border-stone-200 dark:border-stone-700">
          {user.email}
        </div>

        <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-xl p-4 text-left text-xs text-amber-900 dark:text-amber-200 mb-6 space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-cordova-gold shrink-0 mt-0.5" />
            <span>Click the verification link inside your email to unlock all features.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-cordova-gold shrink-0 mt-0.5" />
            <span>Check your <strong>Spam</strong> or <strong>Junk</strong> folder if you don&apos;t see it in your inbox.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {process.env.NODE_ENV !== 'production' && !REQUIRE_EMAIL_VERIFICATION && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl mb-3 space-y-2">
              <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                🛠️ Localhost Dev Mode Active (Email verification is optional)
              </p>
              <button
                type="button"
                onClick={handleDevVerify}
                disabled={devVerifying}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-3 rounded-lg shadow transition-colors flex items-center justify-center gap-1.5 uppercase tracking-wider disabled:opacity-60"
              >
                <RefreshCw size={14} className={devVerifying ? 'animate-spin' : ''} />
                {devVerifying ? 'Verifying...' : '⚡ Quick Verify & Continue'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-medium block mx-auto pt-1"
              >
                Skip verification &amp; go to home →
              </button>
            </div>
          )}

          <button
            onClick={handleResend}
            disabled={cooldown > 0 || sending}
            className="w-full bg-cordova-gold hover:bg-cordova-goldHover disabled:bg-stone-300 dark:disabled:bg-stone-800 text-white disabled:text-stone-500 font-bold text-sm py-3.5 px-4 rounded-xl shadow transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <RefreshCw size={16} className={sending ? 'animate-spin' : ''} />
            {cooldown > 0 ? `Resend Email (${cooldown}s)` : sending ? 'Sending...' : 'Resend Verification Email'}
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-xs py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <LogOut size={15} />
            Sign Out / Switch Account
          </button>
        </div>
      </div>
    </div>
  );
}
