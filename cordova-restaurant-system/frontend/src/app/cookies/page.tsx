'use client';

import React from 'react';
import Link from 'next/link';
import {
  Cookie,
  ShieldCheck,
  Sliders,
  BarChart3,
  Globe,
  Lock,
  ArrowRight,
  HelpCircle,
  FileText,
} from 'lucide-react';

export default function CookiePolicyPage() {
  const cookieInventory = [
    {
      name: 'refreshToken',
      provider: 'Cordova Eats Backend',
      type: 'HTTP-only Cookie (Secure)',
      category: 'Strictly Necessary',
      duration: '7 Days',
      purpose:
        'Maintains secure, encrypted user authentication sessions without exposing tokens to client scripts.',
    },
    {
      name: 'cordova_cookie_consent_v1',
      provider: 'Cordova Eats Frontend',
      type: 'Local Storage',
      category: 'Strictly Necessary',
      duration: '1 Year',
      purpose: 'Remembers your consent choices and timestamp.',
    },
    {
      name: 'theme',
      provider: 'Cordova Eats Frontend',
      type: 'Local Storage',
      category: 'Functional',
      duration: 'Persistent',
      purpose: 'Stores your preferred display theme (Light or Dark mode) to avoid visual flicker.',
    },
    {
      name: 'spatial_ui_prefs',
      provider: 'Cordova Eats Frontend',
      type: 'Local Storage / Session',
      category: 'Functional',
      duration: 'Session / 30 Days',
      purpose: 'Caches user layout preferences such as map toggle views and filter drawers.',
    },
    {
      name: 'g_state / GSI OAuth',
      provider: 'Google LLC',
      type: 'Third-Party Cookie',
      category: 'Functional / Authentication',
      duration: 'Session / Variable',
      purpose: 'Facilitates fast, secure Google One-Tap sign-in and social authentication.',
    },
    {
      name: 'osm_tile_cache',
      provider: 'OpenStreetMap / Leaflet',
      type: 'Browser Cache',
      category: 'Functional',
      duration: 'Session',
      purpose: 'Caches map tile imagery for interactive restaurant locator navigation in Cordova.',
    },
    {
      name: 'ce_analytics_id (Optional)',
      provider: 'Cordova Eats Telemetry',
      type: 'Local Storage (Anonymized)',
      category: 'Analytics',
      duration: '90 Days',
      purpose:
        'Anonymously analyzes search trends and recommendation click-through rates to improve municipal discovery algorithms.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Header Banner */}
      <div className="card p-6 sm:p-10 mb-8 border-stone-200/80 dark:border-white/10 bg-gradient-to-br from-white via-white to-amber-50/40 dark:from-[#18201b] dark:via-[#18201b] dark:to-emerald-950/20">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            <Cookie className="h-3.5 w-3.5" />
            Compliance & Legal Transparency
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white tracking-tight">
            Cookie Policy
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-300 max-w-2xl leading-relaxed">
            This policy explains how the <strong>Cordova Eats</strong> platform uses cookies, local storage, and
            similar technologies in compliance with the{' '}
            <strong className="text-stone-900 dark:text-white">
              Philippine Data Privacy Act of 2012 (Republic Act No. 10173)
            </strong>
            .
          </p>
          <div className="text-xs text-stone-400 dark:text-stone-500 pt-1">
            Last Updated: <span className="font-medium text-stone-600 dark:text-stone-300">September 2026</span> • Version 1.0
          </div>
        </div>
      </div>

      <div className="space-y-8 text-stone-800 dark:text-stone-200 text-sm leading-relaxed">
        {/* Section 1: Overview */}
        <section className="card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 text-lg font-bold text-stone-900 dark:text-white">
            <div className="h-8 w-8 rounded-lg bg-cordova-green/10 text-cordova-green dark:text-emerald-400 flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
            <h2>1. What Are Cookies and Storage Technologies?</h2>
          </div>
          <p>
            Cookies are small text files placed on your computer, tablet, or mobile phone by websites that you visit.
            They are widely used in modern web applications to make platforms function efficiently, provide secure
            authentication, and deliver personalized user experiences.
          </p>
          <p>
            In addition to HTTP cookies, <strong>Cordova Eats</strong> also utilizes modern browser web storage
            mechanisms, such as <strong>HTML5 Local Storage</strong> and <strong>Session Storage</strong>, which operate
            similarly to cookies by retaining user preferences locally within your browser without sending excess data
            over every network request.
          </p>
        </section>

        {/* Section 2: Cookie Categories */}
        <section className="card p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 text-lg font-bold text-stone-900 dark:text-white">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sliders className="h-4 w-4" />
            </div>
            <h2>2. Categories of Cookies We Use</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category 1 */}
            <div className="p-5 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50/50 dark:bg-white/[0.02] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-stone-900 dark:text-white">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Strictly Necessary
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                  Required
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Essential for basic system operation, user session persistence via secure HTTP-only refresh tokens,
                Cross-Origin Resource Sharing (CORS) security, and protecting the municipal administration and restaurant
                owner dashboards.
              </p>
            </div>

            {/* Category 2 */}
            <div className="p-5 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50/50 dark:bg-white/[0.02] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-stone-900 dark:text-white">
                  <Sliders className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  Functional & Preferences
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-200 dark:bg-white/10 text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded-full">
                  Optional
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Remembers user interface customizations such as your preferred Dark/Light theme, interactive map
                coordinates, dietary preference quick filters, and spatial UI layout toggles.
              </p>
            </div>

            {/* Category 3 */}
            <div className="p-5 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50/50 dark:bg-white/[0.02] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-stone-900 dark:text-white">
                  <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Analytics & Telemetry
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-200 dark:bg-white/10 text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded-full">
                  Optional
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Gathers aggregated, non-identifying telemetry on popular dining searches, cuisine demand in Cordova, and
                page load performance to assist municipal tourism and dining development initiatives.
              </p>
            </div>

            {/* Category 4 */}
            <div className="p-5 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50/50 dark:bg-white/[0.02] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-stone-900 dark:text-white">
                  <Globe className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  Third-Party Integrations
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-200 dark:bg-white/10 text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded-full">
                  Service-Bound
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Enables external interactive features such as OpenStreetMap tile rendering for restaurant coordinates
                and Google Identity Services OAuth for convenient user sign-in.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Cookie Inventory Table */}
        <section className="card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 text-lg font-bold text-stone-900 dark:text-white">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Lock className="h-4 w-4" />
            </div>
            <h2>3. Detailed Cookie & Storage Inventory</h2>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Below is the comprehensive register of cookies and client storage items active across the Cordova Eats
            portal:
          </p>

          <div className="overflow-x-auto border border-stone-200 dark:border-white/10 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 dark:bg-white/5 text-stone-700 dark:text-stone-200 border-b border-stone-200 dark:border-white/10">
                <tr>
                  <th className="p-3 font-semibold">Key / Cookie Name</th>
                  <th className="p-3 font-semibold">Type</th>
                  <th className="p-3 font-semibold">Category</th>
                  <th className="p-3 font-semibold">Duration</th>
                  <th className="p-3 font-semibold">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-white/5 text-stone-600 dark:text-stone-300">
                {cookieInventory.map((item) => (
                  <tr key={item.name} className="hover:bg-stone-50/50 dark:hover:bg-white/[0.02]">
                    <td className="p-3 font-mono font-medium text-stone-900 dark:text-stone-100 whitespace-nowrap">
                      {item.name}
                    </td>
                    <td className="p-3 whitespace-nowrap">{item.type}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          item.category === 'Strictly Necessary'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : item.category === 'Functional'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap font-medium text-stone-700 dark:text-stone-300">
                      {item.duration}
                    </td>
                    <td className="p-3 min-w-[200px] leading-relaxed">{item.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: How to Manage Cookies */}
        <section className="card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 text-lg font-bold text-stone-900 dark:text-white">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <HelpCircle className="h-4 w-4" />
            </div>
            <h2>4. How to Manage and Disable Cookies in Your Browser</h2>
          </div>

          <div className="space-y-3">
            <p>
              Most web browsers automatically accept cookies by default, but you can configure your browser to reject
              cookies or alert you when a cookie is being sent. You can also delete existing cookies through your browser
              settings at any time. Note that disabling strictly necessary cookies may prevent you from logging in or
              accessing the restaurant owner portal.
            </p>

            <ul className="list-disc list-inside space-y-1.5 text-xs text-stone-600 dark:text-stone-400 pl-2">
              <li>
                <strong>Google Chrome:</strong> Settings &rarr; Privacy and Security &rarr; Third-party cookies &rarr; Manage cookie permissions
              </li>
              <li>
                <strong>Mozilla Firefox:</strong> Settings &rarr; Privacy &amp; Security &rarr; Enhanced Tracking Protection &rarr; Cookies and Site Data
              </li>
              <li>
                <strong>Apple Safari:</strong> Settings / Preferences &rarr; Privacy &rarr; Manage Website Data / Block all cookies
              </li>
              <li>
                <strong>Microsoft Edge:</strong> Settings &rarr; Cookies and site permissions &rarr; Manage and delete cookies and site data
              </li>
            </ul>
          </div>
        </section>

        {/* Section 5: Philippine DPA RA 10173 */}
        <section className="card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 text-lg font-bold text-stone-900 dark:text-white">
            <div className="h-8 w-8 rounded-lg bg-stone-500/10 text-stone-700 dark:text-stone-300 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h2>5. Compliance with Philippine Data Privacy Act of 2012</h2>
          </div>
          <p>
            The Municipality of Cordova and the Cordova Eats platform strictly adhere to the transparency, legitimate
            purpose, and proportionality principles set forth under Republic Act No. 10173 and National Privacy
            Commission (NPC) advisories.
          </p>
          <p>
            Under RA 10173, diners and registered business owners possess the right to be informed of data collection, the
            right to object to automated processing, and the right to rectify or request erasure of stored preferences.
            For further information regarding your personal data rights, please consult our{' '}
            <Link
              href="/privacy"
              className="text-cordova-green dark:text-emerald-400 font-semibold underline underline-offset-2"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        {/* Section 6: Contact & Inquiries */}
        <section className="card p-6 sm:p-8 space-y-4 bg-stone-50 dark:bg-white/[0.02]">
          <h2 className="text-lg font-bold text-stone-900 dark:text-white">6. Inquiries & Data Protection Contact</h2>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            If you have questions or concerns regarding this Cookie Policy or data storage practices on Cordova Eats,
            please reach out to our team:
          </p>

          <div className="p-4 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-[#141815] text-xs space-y-1.5">
            <p className="font-semibold text-stone-900 dark:text-white">Data Protection & IT Initiative Office</p>
            <p className="text-stone-600 dark:text-stone-400">Municipality of Cordova, Cebu 6017, Philippines</p>
            <p className="text-stone-600 dark:text-stone-400">
              Email:{' '}
              <a
                href="mailto:privacy@cordova.gov.ph"
                className="text-cordova-green dark:text-emerald-400 hover:underline font-medium"
              >
                privacy@cordova.gov.ph
              </a>{' '}
              / Support:{' '}
              <a
                href="mailto:support@cordovaeats.ph"
                className="text-cordova-green dark:text-emerald-400 hover:underline font-medium"
              >
                support@cordovaeats.ph
              </a>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/privacy"
              className="inline-flex items-center gap-1 text-xs font-semibold text-cordova-green dark:text-emerald-400 hover:underline"
            >
              View Privacy Policy <ArrowRight className="h-3 w-3" />
            </Link>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <Link
              href="/terms"
              className="inline-flex items-center gap-1 text-xs font-semibold text-cordova-green dark:text-emerald-400 hover:underline"
            >
              View Terms of Use <ArrowRight className="h-3 w-3" />
            </Link>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1 text-xs font-semibold text-cordova-green dark:text-emerald-400 hover:underline"
            >
              Contact Support <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
