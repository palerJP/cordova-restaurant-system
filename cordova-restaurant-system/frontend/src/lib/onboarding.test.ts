import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { destinationAfterEmailVerification, preferencesOnboardingDestination } from './onboarding';

test('verified customer and owner accounts start with preferences', () => {
  assert.equal(destinationAfterEmailVerification('customer'), '/preferences?firstTime=true');
  assert.equal(destinationAfterEmailVerification('owner'), '/preferences?firstTime=true');
  assert.equal(destinationAfterEmailVerification('admin'), '/admin');
});

test('onboarding preserves a requested local destination until preferences are saved', () => {
  const claim = '/dashboard/claims/new?restaurant=77777777-7777-7777-a777-777777777771';
  assert.equal(
    destinationAfterEmailVerification('customer', claim),
    `/preferences?firstTime=true&returnTo=${encodeURIComponent(claim)}`,
  );
  assert.equal(preferencesOnboardingDestination('/'), '/preferences?firstTime=true');
});
