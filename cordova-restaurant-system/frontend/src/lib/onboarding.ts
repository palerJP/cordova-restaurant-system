import type { User } from './types';

export function preferencesOnboardingDestination(returnTo: string | null = null): string {
  return `/preferences?firstTime=true${returnTo && returnTo !== '/'
    ? `&returnTo=${encodeURIComponent(returnTo)}` : ''}`;
}

export function destinationAfterEmailVerification(role: User['role'], returnTo: string | null = null): string {
  return role === 'admin' ? '/admin' : preferencesOnboardingDestination(returnTo);
}
