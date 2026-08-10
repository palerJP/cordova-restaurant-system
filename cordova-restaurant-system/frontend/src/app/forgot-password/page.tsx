'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { KeyRound, ArrowLeft, MailCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { ApiClientError } from '@/lib/api';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
      showToast('Password reset link sent to your email!', 'success');
    } catch (err) {
      if (err instanceof ApiClientError) {
        showToast(err.message, 'error');
      } else {
        showToast('Failed to process request', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cordova-cream dark:bg-[#121614] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-2xl p-8 sm:p-10 max-w-md w-full shadow-2xl">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-cordova-green transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Back to Sign In
        </Link>

        {/* Brand Emblem */}
        <div className="relative h-14 w-14 mx-auto mb-3">
          <Image src="/cordova_eats_logo.png" alt="CordovaEats" fill className="object-contain" priority />
        </div>

        {!sent ? (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-cordova-gold mb-3">
                <KeyRound size={24} />
              </div>
              <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                Forgot Password?
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Enter your registered email address and we&apos;ll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-cordova-gold"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cordova-gold hover:bg-cordova-goldHover text-white font-bold text-xs py-3.5 px-4 rounded-xl shadow transition-colors uppercase tracking-wider disabled:opacity-50"
              >
                {loading ? 'Sending Request...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4 py-4">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 mx-auto">
              <MailCheck size={32} />
            </div>

            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-white">
              Reset Link Dispatched
            </h2>

            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              If an account exists for <strong className="text-stone-900 dark:text-white">{email}</strong>, a single-use password reset link has been sent. Please check your inbox and spam folder.
            </p>

            <button
              onClick={() => setSent(false)}
              className="mt-4 text-xs font-bold text-cordova-gold hover:underline"
            >
              Didn&apos;t receive it? Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
