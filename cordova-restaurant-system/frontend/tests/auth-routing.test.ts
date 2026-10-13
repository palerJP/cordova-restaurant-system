import test from 'node:test';
import assert from 'node:assert/strict';
import { postAuthDestination, needsOnboarding } from '../src/lib/auth-routing';
import type { User } from '../src/lib/types';
const oldUser = { id: 'old', role: 'customer', email_verified: true, onboarding_required: false } as User;
test('unverified new account must verify before preference onboarding', () => {
  assert.equal(postAuthDestination({...oldUser, email_verified:false, onboarding_required:true}), '/verify-email-required');
});
test('verified new accounts visit preferences before their dashboard', () => {
  for (const role of ['customer','owner'] as const) assert.equal(postAuthDestination({...oldUser,role,onboarding_required:true}), '/preferences?firstTime=true');
});
test('returning users and completed new users skip preference onboarding', () => {
  assert.equal(postAuthDestination(oldUser), '/');
  assert.equal(postAuthDestination({...oldUser,role:'owner'}), '/dashboard');
  assert.equal(needsOnboarding({...oldUser,onboarding_required:undefined}), false);
});
test('admin accounts retain their dashboard destination', () => {
  assert.equal(postAuthDestination({...oldUser,role:'admin',onboarding_required:true}), '/admin');
});
