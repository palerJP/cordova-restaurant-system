'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { ApiClientError } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email address';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(email, password);
      toast('Welcome back!', 'success');
      if (user.role === 'admin') router.push('/admin');
      else if (user.role === 'owner') router.push('/dashboard');
      else router.push('/');
    } catch (err) {
      if (err instanceof ApiClientError) toast(err.message, 'error');
      else toast('Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto card p-8">
      <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
      <p className="text-[var(--text-muted)] mb-6 text-sm">Log in to save favorites and get personalized picks.</p>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Email address"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="current-password"
          required
        />
        <Button type="submit" className="w-full" loading={loading}>
          Log in
        </Button>
      </form>

      <p className="text-sm text-[var(--text-muted)] mt-6 text-center">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-brand-500 font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
