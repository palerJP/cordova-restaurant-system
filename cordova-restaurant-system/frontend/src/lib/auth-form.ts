/** Keep the auth forms aligned with the API's email and password requirements. */
export function normalizeAuthEmail(email: string): string {
  return email.trim();
}

export function validateAuthEmail(email: string): string | undefined {
  if (!email) return 'Please enter your email address.';
  if (!/^[^\s@]+@(?:[^\s@.]+\.)+[^\s@.]{2,}$/.test(email)) return 'Please enter a valid email address.';
  return undefined;
}

export function validateRegistrationPassword(password: string): string | undefined {
  const errors: string[] = [];
  if (password.length < 8) errors.push('Password must be at least 8 characters.');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain an uppercase letter.');
  if (!/[0-9]/.test(password)) errors.push('Password must contain a number.');
  return errors.length ? errors.join(' ') : undefined;
}

interface AuthApiError {
  message: string;
  details?: Array<{ field: string; message: string }>;
}

/** Present validation details returned by the API beside the corresponding field. */
export function getAuthApiFeedback(error: AuthApiError, fieldMap: Record<string, string>): {
  message: string;
  fieldErrors: Record<string, string>;
} {
  const fieldErrors: Record<string, string> = {};
  let unmappedMessage: string | undefined;
  for (const detail of error.details || []) {
    if (!detail.field || !detail.message) continue;
    const field = fieldMap[detail.field];
    if (!field) {
      unmappedMessage ||= detail.message;
      continue;
    }
    fieldErrors[field] = fieldErrors[field]
      ? `${fieldErrors[field]} ${detail.message}`
      : detail.message;
  }
  return {
    message: error.message === 'Validation failed'
      ? unmappedMessage || (Object.keys(fieldErrors).length ? 'Please correct the highlighted fields.' : error.details?.[0]?.message || error.message)
      : error.message,
    fieldErrors,
  };
}
