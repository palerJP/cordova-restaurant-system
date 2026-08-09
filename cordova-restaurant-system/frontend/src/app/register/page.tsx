'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { ApiClientError } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

export default function RegisterPage() {
  const { register, login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'owner'>('customer');
  const [acceptsMarketing, setAcceptsMarketing] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (fullName.trim().length < 2) e.fullName = 'Enter your full name';
    if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email address';
    if (password.length < 8) e.password = 'At least 8 characters';
    else if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      e.password = 'Include an uppercase letter and a number';
    }
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
        fullName,
        role,
        phone: phone || undefined,
        acceptsMarketing,
      });

      toast('Account created! Verification email sent.', 'success');
      await login(email, password);
      setShowVerificationModal(true);
    } catch (err) {
      if (err instanceof ApiClientError) toast(err.message, 'error');
      else toast('Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-2xl p-8 shadow-md">
      <h1 className="font-serif text-3xl font-bold text-stone-900 dark:text-white mb-1">Create your account</h1>
      <p className="text-stone-500 mb-5 text-sm">Join CordovaEats as a diner or a restaurant owner.</p>

      {/* Email Verification Banner Notice */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-950 dark:text-amber-200 mb-5">
        <Mail size={18} className="text-cordova-gold shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Email Verification Notice:</span> A verification link will be sent to your email address to confirm your account upon registration.
        </div>
      </div>

      <div className="flex gap-2 mb-5" role="radiogroup" aria-label="Account type">
        {(['customer', 'owner'] as const).map((r) => (
          <button
            key={r}
            type="button"
            role="radio"
            aria-checked={role === r}
            onClick={() => setRole(r)}
          >
            <Badge color={role === r ? 'brand' : 'neutral'}>
              {r === 'customer' ? 'I want to eat out 🍽️' : 'I own a restaurant 🏪'}
            </Badge>
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input label="Full name" name="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} error={errors.fullName} required />
        <Input label="Email address" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} autoComplete="email" required />
        <Input label="Phone (optional)" type="tel" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+63 9XX XXX XXXX" />
        <Input
          label="Password"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="new-password"
          required
        />

        {/* Promotions Marketing Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer text-xs text-stone-700 dark:text-stone-300 pt-1">
          <input
            type="checkbox"
            checked={acceptsMarketing}
            onChange={(e) => setAcceptsMarketing(e.target.checked)}
            className="mt-0.5 rounded border-stone-300 dark:border-stone-700 text-cordova-green focus:ring-cordova-green/30"
          />
          <span>
            Send me email notifications for exclusive restaurant <strong>promotions, seasonal deals, and discounts</strong> in Cordova.
          </span>
        </label>

        <Button type="submit" className="w-full bg-cordova-green hover:bg-cordova-greenHover text-white py-3 text-sm font-semibold rounded-lg" loading={loading}>
          {role === 'owner' ? 'Create owner account' : 'Create account'}
        </Button>
      </form>

      {role === 'owner' && (
        <p className="text-xs text-stone-500 mt-3">
          After signing up, you&apos;ll be able to submit your business for admin verification from your dashboard.
        </p>
      )}

      <p className="text-sm text-stone-500 mt-6 text-center">
        Already have an account?{' '}
        <Link href="/login" className="text-cordova-green font-semibold hover:underline">
          Log in
        </Link>
      </p>

      {/* Verified Email Confirmation Modal */}
      <Modal open={showVerificationModal} onClose={() => { setShowVerificationModal(false); router.push('/preferences?firstTime=true'); }} title="">
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
            Verify Your Email Address
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-300 max-w-sm mx-auto leading-relaxed">
            We&apos;ve sent a verification email to <strong className="text-stone-900 dark:text-white">{email}</strong>. Please check your inbox and click the verification link.
          </p>
          <Button
            onClick={() => {
              setShowVerificationModal(false);
              router.push('/preferences?firstTime=true');
            }}
            className="w-full bg-cordova-green hover:bg-cordova-greenHover text-white py-2.5 text-xs font-semibold rounded-lg"
          >
            Set Your Food Preferences →
          </Button>
        </div>
      </Modal>
    </div>
  );
}
