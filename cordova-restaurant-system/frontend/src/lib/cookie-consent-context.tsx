'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
}

export interface CookieConsentData {
  preferences: CookiePreferences;
  consentedAt: string;
  version: string;
}

interface CookieConsentContextType {
  consent: CookieConsentData | null;
  hasDecided: boolean;
  acceptAll: () => void;
  acceptEssentialOnly: () => void;
  resetConsent: () => void;
}

const STORAGE_KEY = 'cordova_cookie_consent_v1';
const CURRENT_VERSION = '1.0.0';

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<CookieConsentData | null>(null);
  const [hasDecided, setHasDecided] = useState<boolean>(true); // Default true to avoid flash before hydration

  // Load consent from localStorage upon mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CookieConsentData;
        if (parsed && parsed.version === CURRENT_VERSION) {
          setConsent(parsed);
          setHasDecided(true);
          return;
        }
      }
      setHasDecided(false);
    } catch {
      setHasDecided(false);
    }
  }, []);

  const persistConsent = useCallback((preferences: CookiePreferences) => {
    const data: CookieConsentData = {
      preferences: {
        essential: true,
        functional: preferences.functional,
        analytics: preferences.analytics,
      },
      consentedAt: new Date().toISOString(),
      version: CURRENT_VERSION,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save cookie preferences to localStorage:', e);
    }
    setConsent(data);
    setHasDecided(true);
  }, []);

  const acceptAll = useCallback(() => {
    persistConsent({
      essential: true,
      functional: true,
      analytics: true,
    });
  }, [persistConsent]);

  const acceptEssentialOnly = useCallback(() => {
    persistConsent({
      essential: true,
      functional: false,
      analytics: false,
    });
  }, [persistConsent]);

  const resetConsent = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    setConsent(null);
    setHasDecided(false);
  }, []);

  const value = useMemo(
    () => ({
      consent,
      hasDecided,
      acceptAll,
      acceptEssentialOnly,
      resetConsent,
    }),
    [consent, hasDecided, acceptAll, acceptEssentialOnly, resetConsent]
  );

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
}
