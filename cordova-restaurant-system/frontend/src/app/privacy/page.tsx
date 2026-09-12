import Link from 'next/link';
import { ShieldCheck, Lock, Cookie, Eye, UserCheck, ArrowRight } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="card p-6 sm:p-10 mb-8 border-stone-200/80 dark:border-white/10 bg-gradient-to-br from-white via-white to-emerald-50/30 dark:from-[#18201b] dark:via-[#18201b] dark:to-emerald-950/20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 mb-3">
          <ShieldCheck className="h-3.5 w-3.5" />
          Data Privacy Act of 2012 (RA 10173) Compliance
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white tracking-tight mb-3">
          Privacy Policy
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-300 max-w-2xl leading-relaxed">
          Cordova Eats is dedicated to protecting personal information and ensuring full transparency regarding how data
          is collected, processed, and safeguarded across the Municipality of Cordova, Cebu.
        </p>
        <div className="text-xs text-stone-400 dark:text-stone-500 mt-4">
          Last Updated: <span className="font-medium text-stone-600 dark:text-stone-300">September 2026</span>
        </div>
      </div>

      <div className="space-y-6 text-stone-800 dark:text-stone-200 text-sm leading-relaxed">
        {/* Section 1 */}
        <section className="card p-6 sm:p-8 space-y-3">
          <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <Lock className="h-4 w-4 text-cordova-green dark:text-emerald-400" />
            1. Information We Collect
          </h2>
          <p>
            When utilizing Cordova Eats as a diner or registered restaurant owner, we may collect the following
            categories of information:
          </p>
          <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-300 pl-2">
            <li>
              <strong>Account Information:</strong> Name, verified email address, phone number, and hashed passwords.
            </li>
            <li>
              <strong>Dining & Taste Preferences:</strong> Selected favorite cuisines, dietary constraints, price tiers,
              and preferred ambiance tags.
            </li>
            <li>
              <strong>Location & Proximity:</strong> Optional device coordinates to calculate distance to verified
              Cordova dining establishments.
            </li>
            <li>
              <strong>Business Permit & Verification Records:</strong> Owner registration data, municipal business
              permits, and restaurant contact metadata.
            </li>
          </ul>
        </section>

        {/* Section 2: Cookies & Tracking Technologies */}
        <section className="card p-6 sm:p-8 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Cookie className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                2. Cookies & Local Browser Storage
              </h2>
              <p className="text-stone-600 dark:text-stone-300">
                We use strictly necessary cookies (such as encrypted HTTP-only refresh tokens) to secure your session, as
                well as local storage for client settings (like Dark Mode preferences).
              </p>
            </div>
            <Link
              href="/cookies"
              className="shrink-0 hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-cordova-green dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-xl border border-emerald-200 dark:border-emerald-800 transition-colors"
            >
              Cookie Policy <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            For our comprehensive cookie register, retention durations, and interactive preference manager, please visit
            our dedicated{' '}
            <Link href="/cookies" className="text-cordova-green dark:text-emerald-400 font-semibold underline">
              Cookie Policy
            </Link>
            .
          </p>
        </section>

        {/* Section 3: Data Subject Rights under RA 10173 */}
        <section className="card p-6 sm:p-8 space-y-3">
          <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            3. Your Rights Under Philippine Data Privacy Act (RA 10173)
          </h2>
          <p>
            As a data subject in the Republic of the Philippines, you are entitled to statutory rights including:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50/50 dark:bg-white/[0.02]">
              <strong className="text-xs font-semibold text-stone-900 dark:text-white block mb-1">
                Right to be Informed & Access
              </strong>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                Request copies of your account records, review submissions, and stored preferences.
              </span>
            </div>
            <div className="p-3.5 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50/50 dark:bg-white/[0.02]">
              <strong className="text-xs font-semibold text-stone-900 dark:text-white block mb-1">
                Right to Rectification & Erasure
              </strong>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                Correct inaccurate profile records or request permanent deletion of your account.
              </span>
            </div>
          </div>
        </section>

        {/* Section 4: Contact */}
        <section className="card p-6 sm:p-8 space-y-3 bg-stone-50/80 dark:bg-white/[0.02]">
          <h2 className="text-lg font-bold text-stone-900 dark:text-white">4. Contact Data Protection Officer</h2>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            For questions, data access requests, or to exercise your rights under RA 10173, contact our Data Protection
            Officer:
          </p>
          <div className="p-4 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-[#141815] text-xs space-y-1">
            <p className="font-semibold text-stone-900 dark:text-white">Cordova Eats — Data Privacy Officer</p>
            <p className="text-stone-600 dark:text-stone-400">Municipality of Cordova, Cebu 6017</p>
            <p className="text-stone-600 dark:text-stone-400">
              Email:{' '}
              <a href="mailto:privacy@cordova.gov.ph" className="text-cordova-green dark:text-emerald-400 underline font-medium">
                privacy@cordova.gov.ph
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
