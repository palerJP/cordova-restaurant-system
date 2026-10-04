import { api } from '@/lib/api';
import type { PriceRange, User } from '@/lib/types';

const STORAGE_KEY = 'cordovaeats:taste-preferences:v1';

export interface TastePreferences {
  preferredCuisines: string[];
  dietaryRestrictions: string[];
  preferredServices: string[];
  budgetRange: PriceRange | null;
}

interface StoredTastePreferences extends TastePreferences {
  completedAt: string;
  syncedUserId: string | null;
}

export function getTastePreferences(): StoredTastePreferences | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Partial<StoredTastePreferences>;
    if (!saved.completedAt) return null;

    return {
      preferredCuisines: Array.isArray(saved.preferredCuisines) ? saved.preferredCuisines : [],
      dietaryRestrictions: Array.isArray(saved.dietaryRestrictions) ? saved.dietaryRestrictions : [],
      preferredServices: Array.isArray(saved.preferredServices) ? saved.preferredServices : [],
      budgetRange: saved.budgetRange ?? null,
      completedAt: saved.completedAt,
      syncedUserId: saved.syncedUserId ?? null,
    };
  } catch {
    return null;
  }
}

export function hasTastePreferences(): boolean {
  const preferences = getTastePreferences();
  // A profile already linked to an account belongs to that account, not to
  // the next guest or person who uses this browser.
  return preferences !== null && preferences.syncedUserId === null;
}

export function clearTastePreferences(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
}

export function saveTastePreferences(preferences: TastePreferences, userId: string | null = null): void {
  if (typeof window === 'undefined') return;

  const stored: StoredTastePreferences = {
    ...preferences,
    completedAt: new Date().toISOString(),
    syncedUserId: userId,
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // The saved profile is still usable for this page session if storage is unavailable.
  }
}

export async function syncTastePreferencesToAccount(user: User): Promise<void> {
  if (user.role !== 'customer') return;

  const saved = getTastePreferences();
  if (!saved || saved.syncedUserId) return;

  await api.put('/api/users/me/preferences', {
    preferredCuisines: saved.preferredCuisines,
    dietaryRestrictions: saved.dietaryRestrictions,
    preferredServices: saved.preferredServices,
    budgetRange: saved.budgetRange,
  });

  saveTastePreferences(saved, user.id);
}
