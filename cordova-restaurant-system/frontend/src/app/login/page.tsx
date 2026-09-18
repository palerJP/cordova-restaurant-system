'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { ApiClientError } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const rawClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_ID =
  rawClientId && !rawClientId.includes('YOUR_CLIENT_ID') && !rawClientId.includes('your_')
    ? rawClientId
    : null;

const REQUIRE_EMAIL_VERIFICATION = process.env.NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION === 'true';

export default function LoginPage() {
  const { user, login, loginWithGoogle, loginWithFacebook } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'facebook' | null>(null);
  const redirectedRef = useRef(false);

  const handleSuccessfulAuth = (authUserData?: any) => {
    if (redirectedRef.current) return;
    redirectedRef.current = true;

    const targetUser = authUserData || user;
    if (REQUIRE_EMAIL_VERIFICATION && targetUser && !targetUser.email_verified) {
      showToast('Please verify your email address to unlock all features.', 'warning');
      router.replace('/verify-email-required');
      return;
    }
    // Honour ?redirect= param from protected-route redirects (e.g. /dashboard/new) if role is authorized
    if (redirectTo && redirectTo !== '/' && redirectTo.startsWith('/')) {
      const isRestrictedAdmin = redirectTo.startsWith('/admin') && targetUser?.role !== 'admin';
      const isRestrictedDashboard = redirectTo.startsWith('/dashboard') && targetUser?.role !== 'owner' && targetUser?.role !== 'admin';

      if (!isRestrictedAdmin && !isRestrictedDashboard) {
        router.replace(redirectTo);
        return;
      }
    }
    if (targetUser?.role === 'admin') {
      router.replace('/admin');
      return;
    }
    if (targetUser?.role === 'owner') {
      router.replace('/dashboard');
    } else {
      router.replace('/');
    }
  };

  // If user is already authenticated, immediately navigate away from login
  useEffect(() => {
    if (user && !loading && !oauthLoading && !redirectedRef.current) {
      handleSuccessfulAuth(user);
    }
  }, [user, loading, oauthLoading]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = 'Please enter your email address.';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Please enter a valid email address.';
    if (!password) e.password = 'Password is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      showToast('Welcome back to CordovaEats!', 'success');
      handleSuccessfulAuth(loggedUser);
    } catch (err) {
      if (err instanceof ApiClientError) {
        showToast(err.message, 'error');
      } else if (err instanceof TypeError && (err.message.includes('fetch') || err.message.includes('network') || err.message.includes('Failed'))) {
        showToast('Cannot reach the server. Please make sure the backend is running.', 'error');
      } else {
        showToast('Login failed. Please check your credentials and try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };


  const handleGoogleSignIn = async () => {
    setOauthLoading('google');

    // 1. If Google Client ID is configured, use official Google Identity Services popup
    if (GOOGLE_CLIENT_ID) {
      const client = (window as any).google?.accounts?.oauth2?.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            showToast('Google authentication was cancelled or failed.', 'error');
            setOauthLoading(null);
            return;
          }
          try {
            const loggedUser = await loginWithGoogle(tokenResponse.access_token);
            showToast('Signed in with Google successfully!', 'success');
            handleSuccessfulAuth(loggedUser);
          } catch (err) {
            if (err instanceof ApiClientError) showToast(err.message, 'error');
            else showToast('Google authentication failed. Please try again.', 'error');
          } finally {
            setOauthLoading(null);
          }
        },
        error_callback: () => {
          showToast('Google authentication was cancelled.', 'error');
          setOauthLoading(null);
        },
      });

      if (client) {
        client.requestAccessToken();
        return;
      }
    }

    // 2. Local Dev fallback if Google Client ID is not yet configured in .env.local
    try {
      showToast('Dev Mode: Signing in with simulated Google account…', 'info');
      const devToken = `google_oauth_token_${Date.now()}`;
      const loggedUser = await loginWithGoogle(devToken);
      showToast('Signed in with Google (Dev Mode)!', 'success');
      handleSuccessfulAuth(loggedUser);
    } catch (err) {
      if (err instanceof ApiClientError) showToast(err.message, 'error');
      else showToast('Google authentication failed.', 'error');
    } finally {
      setOauthLoading(null);
    }
  };

  const handleFacebookSignIn = async () => {
    setOauthLoading('facebook');
    try {
      const mockFbToken = `fb_oauth_token_${Date.now()}`;
      const loggedUser = await loginWithFacebook(mockFbToken);
      showToast('Signed in with Facebook successfully!', 'success');
      handleSuccessfulAuth(loggedUser);
    } catch (err) {
      if (err instanceof ApiClientError) showToast(err.message, 'error');
      else showToast('Facebook authentication failed.', 'error');
    } finally {
      setOauthLoading(null);
    }
  };

  if (user && !loading && !oauthLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
        <div className="spatial-card w-full max-w-md bg-white/90 dark:bg-[#1a211c]/90 backdrop-blur-xl rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-stone-200/80 dark:border-stone-800/80 p-8 sm:p-10 text-center">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto mb-4" />
          <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-white">
            Welcome Back, {user.full_name || 'Foodie'}!
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">
            Redirecting to your Cordova dining hub...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="spatial-card w-full max-w-md bg-white/90 dark:bg-[#1a211c]/90 backdrop-blur-xl rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-stone-200/80 dark:border-stone-800/80 p-8 sm:p-10">
        {/* Brand Emblem */}
        <div className="text-center mb-7">
          <div className="relative h-16 w-16 mx-auto mb-4">
            <Image src="/cordova_eats_logo.png" alt="CordovaEats" fill className="object-contain" priority />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
            Log in to CordovaEats
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5">
            Discover Cordova&apos;s best dining experiences
          </p>
        </div>

        {/* Google Sign-In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={!!oauthLoading}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-semibold text-sm py-3 px-4 rounded-xl border border-stone-300 dark:border-stone-700 shadow-sm transition-colors mb-3 disabled:opacity-60"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.3 7.31 24 12 24z" />
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.42l4.02-3.15z" />
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
          </svg>
          {oauthLoading === 'google' ? 'Connecting to Google…' : 'Continue with Google'}
        </button>

        {/* Facebook Sign-In */}
        <button
          type="button"
          onClick={handleFacebookSignIn}
          disabled={!!oauthLoading}
          className="w-full flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-sm transition-colors mb-6 disabled:opacity-60"
        >
          <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          {oauthLoading === 'facebook' ? 'Connecting to Facebook…' : 'Continue with Facebook'}
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-stone-200 dark:border-stone-700 w-full" />
          <span className="absolute bg-white dark:bg-[#1a211c] px-3 text-[11px] font-bold text-stone-400 uppercase tracking-widest">
            or sign in with email
          </span>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input
            label="Email address"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
            placeholder="you@example.com"
            required
          />

          <div>
            <label className="label text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
              Password
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Your password"
                className={`input pr-10 ${errors.password ? 'ring-2 ring-red-400' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
          </div>

          {/* Remember Me + Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-stone-300 text-cordova-green focus:ring-cordova-green w-4 h-4"
              />
              <span className="text-xs text-stone-600 dark:text-stone-400 font-medium">Remember me</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-cordova-gold hover:text-cordova-goldHover hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-cordova-gold hover:bg-cordova-goldHover text-white py-3.5 rounded-xl uppercase font-bold text-xs tracking-wider shadow transition-colors"
            loading={loading}
          >
            Log in
          </Button>
        </form>

        <p className="text-sm text-stone-500 dark:text-stone-400 mt-6 text-center">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-cordova-green font-bold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
