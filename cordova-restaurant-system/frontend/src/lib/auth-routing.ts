import type { User } from './types';

export function needsOnboarding(user: User): boolean {
  return user.role !== 'admin' && user.onboarding_required === true;
}

export function dashboardDestination(user: User): string {
  return user.role === 'admin' ? '/admin' : user.role === 'owner' ? '/dashboard' : '/';
}

export function postAuthDestination(user: User): string {
  if (user.role !== 'admin' && !user.email_verified) return '/verify-email-required';
  if (needsOnboarding(user)) return '/preferences?firstTime=true';
  return dashboardDestination(user);
}
