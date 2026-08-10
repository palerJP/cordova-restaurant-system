'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { ApiClientError } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const { register, loginWithGoogle, loginWithFacebook } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'owner'>('customer');
  const [acceptsMarketing, setAcceptsMarketing] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'facebook' | null>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) e.fullName = 'Full name is required';
    if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email address';
    if (!password || password.length < 8) e.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        email,
        password,
        fullName: fullName.trim(),
        role,
        acceptsMarketing,
      });

      showToast('Registration successful! Please verify your email.', 'success');
      router.push('/verify-email-required');
    } catch (err) {
      if (err instanceof ApiClientError) showToast(err.message, 'error');
      else showToast('Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setOauthLoading('google');
    try {
      const mockCredential = `google_oauth_token_${Date.now()}`;
      await loginWithGoogle(mockCredential);
      showToast('Account created & verified via Google!', 'success');
      router.push('/preferences?firstTime=true');
    } catch (err) {
      if (err instanceof ApiClientError) showToast(err.message, 'error');
      else showToast('Google sign-up failed', 'error');
    } finally {
      setOauthLoading(null);
    }
  };

  const handleFacebookSignIn = async () => {
    setOauthLoading('facebook');
    try {
      const mockFbToken = `fb_oauth_token_${Date.now()}`;
      await loginWithFacebook(mockFbToken);
      showToast('Account created & verified via Facebook!', 'success');
      router.push('/preferences?firstTime=true');
    } catch (err) {
      if (err instanceof ApiClientError) showToast(err.message, 'error');
      else showToast('Facebook sign-up failed', 'error');
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <div className="max-w-md mx-auto card p-8 sm:p-10 shadow-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1a211c] rounded-2xl">
      {/* Emblem */}
      <div className="relative h-14 w-14 mx-auto mb-3">
        <Image src="/cordova_eats_logo.png" alt="CordovaEats" fill className="object-contain" priority />
      </div>

      <div className="text-center mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">Create an Account</h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Join CordovaEats to discover authentic local dining</p>
      </div>

      {/* OAuth Buttons */}
      <div className="space-y-3 mb-6">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={!!oauthLoading}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-semibold text-xs py-3 px-4 rounded-xl border border-stone-300 dark:border-stone-700 shadow-sm transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.3 7.31 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.42l4.02-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          {oauthLoading === 'google' ? 'Connecting to Google...' : 'Sign up with Google'}
        </button>

        <button
          type="button"
          onClick={handleFacebookSignIn}
          disabled={!!oauthLoading}
          className="w-full flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold text-xs py-3 px-4 rounded-xl shadow-sm transition-colors"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          {oauthLoading === 'facebook' ? 'Connecting to Facebook...' : 'Sign up with Facebook'}
        </button>
      </div>

      <div className="relative flex items-center justify-center mb-6">
        <div className="border-t border-stone-200 dark:border-stone-800 w-full" />
        <span className="bg-white dark:bg-[#1a211c] px-3 text-[11px] font-bold text-stone-400 uppercase tracking-widest absolute">OR</span>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {/* Role selector tab */}
        <div>
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
            I am joining as:
          </label>
          <div className="grid grid-cols-2 gap-2 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                role === 'customer'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              🍽️ Diner / Customer
            </button>
            <button
              type="button"
              onClick={() => setRole('owner')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                role === 'owner'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              🏬 Business Owner
            </button>
          </div>
        </div>

        <Input
          label="Full Name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
          placeholder="Juan Dela Cruz"
          required
        />

        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          placeholder="name@example.com"
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          placeholder="At least 8 characters"
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          placeholder="Re-enter password"
          required
        />

        <div className="flex items-start gap-2.5 pt-1">
          <input
            type="checkbox"
            id="acceptsMarketing"
            checked={acceptsMarketing}
            onChange={(e) => setAcceptsMarketing(e.target.checked)}
            className="mt-0.5 rounded border-stone-300 text-cordova-gold focus:ring-cordova-gold"
          />
          <label htmlFor="acceptsMarketing" className="text-xs text-stone-600 dark:text-stone-400 leading-snug cursor-pointer">
            Receive exclusive discounts, dining promotions & local event updates via email.
          </label>
        </div>

        <Button type="submit" className="w-full bg-cordova-gold hover:bg-cordova-goldHover text-white py-3.5 rounded-xl uppercase font-bold text-xs tracking-wider shadow" loading={loading}>
          Create Account
        </Button>
      </form>

      <p className="text-xs text-stone-500 mt-6 text-center">
        Already have an account?{' '}
        <Link href="/login" className="text-cordova-green font-bold hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
