'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Lock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { ApiClientError } from '@/lib/api';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { resetPassword } = useAuth();
  const { showToast } = useToast();

  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      showToast('Invalid or missing reset token', 'error');
      return;
    }

    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters long', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setCompleted(true);
      showToast('Password reset successfully!', 'success');
    } catch (err) {
      if (err instanceof ApiClientError) {
        showToast(err.message, 'error');
      } else {
        showToast('Password reset failed. The link may be expired or used.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-cordova-cream dark:bg-[#121614] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-xl">
          <AlertTriangle size={36} className="text-rose-500 mx-auto" />
          <h1 className="font-serif text-xl font-bold text-stone-900 dark:text-white">Invalid Reset Link</h1>
          <p className="text-xs text-stone-500">No password reset token was specified in the URL.</p>
          <Link href="/forgot-password" className="inline-block bg-cordova-gold text-white font-bold text-xs py-2.5 px-4 rounded-lg uppercase">
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cordova-cream dark:bg-[#121614] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-2xl p-8 sm:p-10 max-w-md w-full shadow-2xl">
        {/* Brand Emblem */}
        <div className="relative h-14 w-14 mx-auto mb-3">
          <Image src="/cordova_eats_logo.png" alt="CordovaEats" fill className="object-contain" priority />
        </div>

        {!completed ? (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-cordova-gold mb-3">
                <Lock size={24} />
              </div>
              <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                Set New Password
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Enter your new password below to update your account credentials.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-cordova-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-cordova-gold"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cordova-gold hover:bg-cordova-goldHover text-white font-bold text-xs py-3.5 px-4 rounded-xl shadow transition-colors uppercase tracking-wider disabled:opacity-50"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4 py-4">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-emerald-50 text-emerald-600 mx-auto">
              <CheckCircle2 size={32} />
            </div>

            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
              Password Reset Complete!
            </h2>

            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Your password has been updated successfully. You can now log in with your new password.
            </p>

            <button
              onClick={() => router.push('/login')}
              className="w-full bg-cordova-green hover:bg-cordova-greenHover text-white font-bold text-xs py-3.5 px-4 rounded-xl shadow transition-colors flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              Sign In Now <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
