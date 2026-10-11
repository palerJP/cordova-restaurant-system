export type ClaimStatus = 'pending' | 'info_requested' | 'approved' | 'rejected' | 'withdrawn';
export interface BusinessClaim {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  restaurant_slug: string;
  applicant_name: string;
  applicant_email?: string;
  relationship: string;
  phone: string;
  explanation: string;
  is_dispute: boolean;
  status: ClaimStatus;
  review_note: string | null;
  competing_claims?: number;
  created_at: string;
}
export interface ClaimDetail {
  claim: BusinessClaim;
  documents: { id: string; created_at: string }[];
  events: { id: string; action: string; message: string; created_at: string }[];
}
export const claimLabels: Record<ClaimStatus, string> = {
  pending: 'Pending review', info_requested: 'More information required', approved: 'Approved', rejected: 'Rejected', withdrawn: 'Withdrawn',
};
export const claimInputClass = 'w-full rounded-lg border border-stone-300 bg-white p-3 text-stone-900 dark:border-stone-600 dark:bg-stone-900 dark:text-white';
export const claimButtonClass = 'inline-flex items-center justify-center rounded-lg bg-cordova-green px-4 py-2 text-sm font-semibold text-white disabled:opacity-50';

// Keep an establishment selection across registration and email verification.
export function rememberClaimDestination(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;
  try { sessionStorage.setItem('cordova.claim.restaurant', id); } catch { /* Storage may be disabled. */ }
}
export function pendingClaimDestination(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const id = sessionStorage.getItem('cordova.claim.restaurant');
    return id && /^[0-9a-f-]{36}$/i.test(id) ? `/dashboard/claims/new?restaurant=${id}` : null;
  } catch { return null; }
}
export function clearClaimDestination() {
  try { sessionStorage.removeItem('cordova.claim.restaurant'); } catch { /* Storage may be disabled. */ }
}
