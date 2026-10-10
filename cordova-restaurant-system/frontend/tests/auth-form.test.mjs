import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getAuthApiFeedback,
  normalizeAuthEmail,
  validateAuthEmail,
  validateRegistrationPassword,
} from '../src/lib/auth-form.ts';

test('auth email is trimmed and valid addresses remain accepted', () => {
  assert.equal(normalizeAuthEmail('  owner+test@example.com  '), 'owner+test@example.com');
  assert.equal(validateAuthEmail(normalizeAuthEmail('  owner+test@example.com  ')), undefined);
  assert.equal(validateAuthEmail('a@b.c'), 'Please enter a valid email address.');
  assert.equal(validateAuthEmail('owner@example.com trailing'), 'Please enter a valid email address.');
});

test('registration checks every password rule required by the API', () => {
  assert.equal(validateRegistrationPassword('lowercase!'),
    'Password must contain an uppercase letter. Password must contain a number.');
  assert.equal(validateRegistrationPassword('Short1'), 'Password must be at least 8 characters.');
  assert.equal(validateRegistrationPassword('Password123!'), undefined);
});

test('API validation details appear beside mapped fields and unexpected fields remain visible', () => {
  const feedback = getAuthApiFeedback({
    message: 'Validation failed',
    details: [
      { field: 'password', message: 'Password must contain an uppercase letter' },
      { field: 'password', message: 'Password must contain a number' },
      { field: 'captcha', message: 'Please complete the verification challenge' },
    ],
  }, { password: 'password' });

  assert.deepEqual(feedback.fieldErrors, {
    password: 'Password must contain an uppercase letter Password must contain a number',
  });
  assert.equal(feedback.message, 'Please complete the verification challenge');
});

test('mapped validation errors avoid the generic Validation failed toast', () => {
  const feedback = getAuthApiFeedback({
    message: 'Validation failed',
    details: [{ field: 'email', message: 'Valid email is required' }],
  }, { email: 'email' });

  assert.deepEqual(feedback.fieldErrors, { email: 'Valid email is required' });
  assert.equal(feedback.message, 'Please correct the highlighted fields.');
});
