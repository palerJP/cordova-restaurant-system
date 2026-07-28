'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { ApiClientError } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function RegisterPage() {
  const { register } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'owner'>('customer');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

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
      await register({ email, password, fullName, role, phone: phone || undefined });
      toast('Account created! Please log in.', 'success');
      router.push('/login');
    } catch (err) {
      if (err instanceof ApiClientError) toast(err.message, 'error');
      else toast('Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto card p-8">
      <h1 className="text-2xl font-bold mb-1">Create your account</h1>
      <p className="text-[var(--text-muted)] mb-6 text-sm">Join Cordova Eats as a diner or a restaurant owner.</p>

      <div className="flex gap-2 mb-5" role="radiogroup" aria-label="Account type">
        {(['customer', 'owner'] as const).map((r) => (
          <button
            key={r}
            type="button"
            role="radio"
            aria-checked={role === r}
            onClick={() => setRole(r)}
          >
            <Badge color={role === r ? 'brand' : 'neutral'}>{r === 'customer' ? 'I want to eat out 🍽️' : 'I own a restaurant 🏪'}</Badge>
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
        <Button type="submit" className="w-full" loading={loading}>
          {role === 'owner' ? 'Create owner account' : 'Create account'}
        </Button>
      </form>

      {role === 'owner' && (
        <p className="text-xs text-[var(--text-muted)] mt-3">
          After signing up, you&apos;ll be able to submit your business for admin verification from your dashboard.
        </p>
      )}

      <p className="text-sm text-[var(--text-muted)] mt-6 text-center">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-500 font-medium hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
