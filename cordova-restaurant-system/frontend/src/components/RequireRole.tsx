'use client';

import { ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import type { UserRole } from '@/lib/types';
import { Skeleton } from './ui/Skeleton';

export function RequireRole({ roles, children }: { roles: UserRole[]; children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasRequiredRole = user ? roles.includes(user.role) : false;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname + window.location.search)}`);
    } else if (!hasRequiredRole) {
      // Authenticated user lacks permission for this role; redirect to home to prevent bounce loop
      router.replace('/');
    }
  }, [loading, user, hasRequiredRole, router, pathname]);

  if (loading || !user || !hasRequiredRole) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return <>{children}</>;
}
