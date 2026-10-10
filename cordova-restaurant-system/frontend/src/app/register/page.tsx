'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { ApiClientError } from '@/lib/api';
import { getAuthApiFeedback, normalizeAuthEmail, validateAuthEmail, validateRegistrationPassword } from '@/lib/auth-form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const rawClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_ID =
  rawClientId && !rawClientId.includes('YOUR_CLIENT_ID') && !rawClientId.includes('your_')
    ? rawClientId
    : null;

const REQUIRE_EMAIL_VERIFICATION = process.env.NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION === 'true';

type PasswordStrength = 'weak' | 'fair' | 'strong' | 'very-strong';

function getPasswordStrength(pw: string): PasswordStrength {
  if (pw.length < 8) return 'weak';
  if (validateRegistrationPassword(pw)) return 'fair';
  let score = 0;
  if (pw.length >= 12) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score === 2 ? 'very-strong' : 'strong';
}

const strengthConfig: Record<PasswordStrength, { label: string; color: string; width: string }> = {
  weak: { label: 'Weak', color: 'bg-red-500', width: 'w-1/4' },
  fair: { label: 'Fair', color: 'bg-amber-400', width: 'w-2/4' },
  strong: { label: 'Strong', color: 'bg-emerald-400', width: 'w-3/4' },
  'very-strong': { label: 'Very Strong', color: 'bg-emerald-600', width: 'w-full' },
};

export default function RegisterPage() {
  const { user, loading: authLoading, register, login, loginWithGoogle, loginWithFacebook } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || searchParams.get('returnTo');
  const roleParam = searchParams.get('role');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState<'customer' | 'owner'>(roleParam === 'owner' ? 'owner' : 'customer');
  const [acceptsMarketing, setAcceptsMarketing] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'facebook' | null>(null);
  const [hasRegistered, setHasRegistered] = useState(false);
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (user && !authLoading && !loading && !oauthLoading && !hasRegistered && !redirectedRef.current) {
      redirectedRef.current = true;
      if (redirectTo && redirectTo !== '/' && redirectTo.startsWith('/')) {
        const isRestrictedAdmin = redirectTo.startsWith('/admin') && user.role !== 'admin';
        const isRestrictedDashboard = redirectTo.startsWith('/dashboard') && user.role !== 'owner' && user.role !== 'admin';
        if (!isRestrictedAdmin && !isRestrictedDashboard) {
          router.replace(redirectTo);
          return;
        }
      }
      if (user.role === 'owner') router.replace('/dashboard');
      else if (user.role === 'admin') router.replace('/admin');
      else router.replace('/');
    }
  }, [user, authLoading, loading, oauthLoading, redirectTo, router, hasRegistered]);

  const strength = password.length > 0 ? getPasswordStrength(password) : null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim() || firstName.trim().length < 2) e.firstName = 'Please enter your first name.';
    if (!lastName.trim() || lastName.trim().length < 1) e.lastName = 'Please enter your last name.';
    const emailError = validateAuthEmail(normalizeAuthEmail(email));
    if (emailError) e.email = emailError;
    const passwordError = validateRegistrationPassword(password);
    if (passwordError) e.password = passwordError;
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    const normalizedEmail = normalizeAuthEmail(email);
    setLoading(true);
    try {
      await register({
        email: normalizedEmail,
        password,
        fullName: `${firstName.trim()} ${lastName.trim()}`,
        role,
        acceptsMarketing,
      });

      if (REQUIRE_EMAIL_VERIFICATION) {
        showToast('Account created! Please check your email to verify your account.', 'success');
        router.push('/verify-email-required');
      } else {
        setHasRegistered(true);
        try {
          const loggedInUser = await login(normalizedEmail, password);
          showToast('Account created successfully! Welcome to CordovaEats.', 'success');

          if (redirectTo && redirectTo !== '/' && redirectTo.startsWith('/')) {
            router.push(redirectTo);
          } else if (loggedInUser.role === 'owner') {
            router.push('/dashboard/new');
          } else {
            // Customer: immediately take them to preferences so they can set up their taste profile!
            router.push('/preferences?firstTime=true');
          }
        } catch {
          showToast('Account created successfully! You can now log in.', 'success');
          router.push('/login');
        }
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        const feedback = getAuthApiFeedback(err, {
          email: 'email', password: 'password', fullName: 'firstName', role: 'role',
        });
        setErrors(feedback.fieldErrors);
        showToast(feedback.message, 'error');
      } else {
        showToast('Registration failed. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSuccess = (authUserData: any) => {
    setHasRegistered(true);
    redirectedRef.current = true;
    if (redirectTo && redirectTo !== '/' && redirectTo.startsWith('/')) {
      router.push(redirectTo);
    } else if (authUserData?.role === 'owner') {
      router.push('/dashboard/new');
    } else {
      router.push('/preferences?firstTime=true');
    }
  };

  const handleGoogleSignUp = async () => {
    setOauthLoading('google');

    if (GOOGLE_CLIENT_ID) {
      const client = (window as any).google?.accounts?.oauth2?.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            showToast('Google sign-up was cancelled or failed.', 'error');
            setOauthLoading(null);
            return;
          }
          try {
            const userRes = await loginWithGoogle(tokenResponse.access_token);
            showToast('Account created & verified via Google!', 'success');
            handleOAuthSuccess(userRes);
          } catch (err) {
            if (err instanceof ApiClientError) showToast(err.message, 'error');
            else showToast('Google sign-up failed. Please try again.', 'error');
          } finally {
            setOauthLoading(null);
          }
        },
        error_callback: () => {
          showToast('Google sign-up was cancelled.', 'error');
          setOauthLoading(null);
        },
      });

      if (client) {
        client.requestAccessToken();
        return;
      }
    }

    try {
      showToast('Dev Mode: Creating account with simulated Google profile…', 'info');
      if (process.env.NODE_ENV === 'production') throw new Error('Google sign-up is unavailable. Please use email registration.');
      const devToken = `google_oauth_token_${Date.now()}`;
      const userRes = await loginWithGoogle(devToken);
      showToast('Account created & verified via Google (Dev Mode)!', 'success');
      handleOAuthSuccess(userRes);
    } catch (err) {
      if (err instanceof ApiClientError) showToast(err.message, 'error');
      else showToast('Google sign-up failed.', 'error');
    } finally {
      setOauthLoading(null);
    }
  };

  const handleFacebookSignUp = async () => {
    setOauthLoading('facebook');
    try {
      const mockFbToken = `fb_oauth_token_${Date.now()}`;
      const userRes = await loginWithFacebook(mockFbToken);
      showToast('Account created & verified via Facebook!', 'success');
      handleOAuthSuccess(userRes);
    } catch (err) {
      if (err instanceof ApiClientError) showToast(err.message, 'error');
      else showToast('Facebook sign-up failed.', 'error');
    } finally {
      setOauthLoading(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
        <div className="w-10 h-10 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md bg-white dark:bg-[#1a211c] rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-8 sm:p-10">
        {/* Brand */}
        <div className="text-center mb-7">
          <div className="relative h-16 w-16 mx-auto mb-4">
            <Image src="/cordova_eats_logo.png" alt="CordovaEats" fill className="object-contain" priority />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
            Create your CordovaEats account
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5">
            Join Cordova&apos;s best dining community
          </p>
        </div>

        {/* Google Sign-Up */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          style={{ display: process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? 'none' : undefined }}
          disabled={!!oauthLoading}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-semibold text-sm py-3 px-4 rounded-xl border border-stone-300 dark:border-stone-700 shadow-sm transition-colors mb-3 disabled:opacity-60"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.3 7.31 24 12 24z" />
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.42l4.02-3.15z" />
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
          </svg>
          {oauthLoading === 'google' ? 'Connecting to Google…' : 'Sign up with Google'}
        </button>

        {/* Facebook Sign-Up */}
        <button
          type="button"
          onClick={handleFacebookSignUp}
          style={{ display: process.env.NODE_ENV === 'production' ? 'none' : undefined }}
          disabled={!!oauthLoading}
          className="w-full flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-sm transition-colors mb-6 disabled:opacity-60"
        >
          <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          {oauthLoading === 'facebook' ? 'Connecting to Facebook…' : 'Sign up with Facebook'}
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-stone-200 dark:border-stone-700 w-full" />
          <span className="absolute bg-white dark:bg-[#1a211c] px-3 text-[11px] font-bold text-stone-400 uppercase tracking-widest">
            or create with email
          </span>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {/* Account Type Toggle */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
              I am joining as:
            </label>
            <div className="grid grid-cols-2 gap-2 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
              {(['customer', 'owner'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2.5 text-xs font-bold rounded-lg transition-all ${
                    role === r
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow'
                      : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  {r === 'customer' ? '🍽️ Diner / Customer' : '🏬 Business Owner'}
                </button>
              ))}
            </div>
            {errors.role && <p className="mt-1 text-sm text-red-500">{errors.role}</p>}
          </div>

          {/* First + Last Name */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First name"
              name="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              error={errors.firstName}
              placeholder="Juan"
              autoComplete="given-name"
              required
            />
            <Input
              label="Last name"
              name="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              error={errors.lastName}
              placeholder="Cruz"
              autoComplete="family-name"
              required
            />
          </div>

          <Input
            label="Email address"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          {/* Password + Strength */}
          <div>
            <label className="label text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
              Password
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="At least 8 characters"
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
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
              Use at least 8 characters, an uppercase letter, and a number.
            </p>
            {strength && (
              <div className="mt-2">
                <div className="h-1.5 w-full bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${strengthConfig[strength].color} ${strengthConfig[strength].width}`}
                  />
                </div>
                <p className={`text-xs mt-1 font-semibold ${
                  strength === 'weak' ? 'text-red-500' :
                  strength === 'fair' ? 'text-amber-500' : 'text-emerald-600'
                }`}>
                  {strengthConfig[strength].label} password
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="label text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
              Confirm password
            </label>
            <div className="relative mt-1">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Re-enter password"
                className={`input pr-10 ${errors.confirmPassword ? 'ring-2 ring-red-400' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
            )}
            {confirmPassword.length > 0 && !errors.confirmPassword && (
              <div className="flex items-center gap-1.5 mt-1">
                {confirmPassword === password ? (
                  <>
                    <CheckCircle2 size={13} className="text-emerald-500" />
                    <span className="text-xs text-emerald-600 font-medium">Passwords match</span>
                  </>
                ) : (
                  <>
                    <XCircle size={13} className="text-red-400" />
                    <span className="text-xs text-red-500">Passwords do not match</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Marketing opt-in */}
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

          <Button
            type="submit"
            className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white py-3.5 rounded-xl uppercase font-bold text-xs tracking-wider shadow transition-colors"
            loading={loading}
            disabled={loading}
          >
            {role === 'owner' ? 'Create Business Owner Account' : 'Create account'}
          </Button>
        </form>

        <p className="text-sm text-stone-500 dark:text-stone-400 mt-6 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-cordova-green font-bold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
