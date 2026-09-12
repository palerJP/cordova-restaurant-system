'use client';

import React from 'react';
import Link from 'next/link';
import { Cookie, Check, Shield } from 'lucide-react';
import { useCookieConsent } from '@/lib/cookie-consent-context';

export function CookieBanner() {
  const { hasDecided, acceptAll, acceptEssentialOnly } = useCookieConsent();

  // If user has already decided, don't show the banner
  if (hasDecided) {
    return null;
  }

  return (
    <aside
      aria-label="Cookie Consent Banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-xl z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-white/95 dark:bg-[#18201b]/95 backdrop-blur-2xl border border-stone-200/90 dark:border-white/10 rounded-2xl shadow-2xl p-5 sm:p-6 text-stone-900 dark:text-stone-100">
        <div className="flex items-start gap-3.5">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Cookie className="h-5 w-5" />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-stone-900 dark:text-white">
                We value your privacy & dining experience
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              Cordova Eats uses strictly necessary cookies to keep you securely signed in, along with functional and analytical storage to remember your preferences (like dark mode and local dining tastes). We respect the{' '}
              <strong className="text-stone-800 dark:text-stone-100">Philippine Data Privacy Act (RA 10173)</strong>.
            </p>

            <div className="text-xs text-stone-500 dark:text-stone-400 pt-0.5">
              Read our full{' '}
              <Link
                href="/cookies"
                className="text-cordova-green dark:text-emerald-400 font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                Cookie Policy
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                className="text-cordova-green dark:text-emerald-400 font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                Privacy Policy
              </Link>
              .
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-stone-200/70 dark:border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={acceptEssentialOnly}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-transparent hover:bg-stone-100 dark:hover:bg-white/5 rounded-xl border border-stone-300 dark:border-stone-700 transition-colors"
          >
            <Shield className="h-3.5 w-3.5" />
            Essential Only
          </button>

          <button
            type="button"
            onClick={acceptAll}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-cordova-green dark:bg-emerald-600 hover:bg-cordova-green/90 dark:hover:bg-emerald-500 rounded-xl shadow-sm transition-all active:scale-[0.98]"
          >
            <Check className="h-3.5 w-3.5" />
            Accept All
          </button>
        </div>
      </div>
    </aside>
  );
}
