import Link from 'next/link';
import { FileText, Shield, Store, UserCheck, ArrowRight } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="card p-6 sm:p-10 mb-8 border-stone-200/80 dark:border-white/10 bg-gradient-to-br from-white via-white to-amber-50/30 dark:from-[#18201b] dark:via-[#18201b] dark:to-amber-950/20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-3">
          <FileText className="h-3.5 w-3.5" />
          Municipal Terms of Service
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white tracking-tight mb-3">
          Terms of Use
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-300 max-w-2xl leading-relaxed">
          These Terms of Use govern access to and use of the Cordova Eats municipal restaurant discovery,
          recommendation, and business management system in the Municipality of Cordova, Cebu.
        </p>
        <div className="text-xs text-stone-400 dark:text-stone-500 mt-4">
          Last Updated: <span className="font-medium text-stone-600 dark:text-stone-300">September 2026</span>
        </div>
      </div>

      <div className="space-y-6 text-stone-800 dark:text-stone-200 text-sm leading-relaxed">
        <section className="card p-6 sm:p-8 space-y-3">
          <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-cordova-green dark:text-emerald-400" />
            1. User & Diner Accounts
          </h2>
          <p>
            Users are responsible for maintaining the confidentiality of their credentials and for all activities that
            occur under their account. You agree to provide accurate registration details and adhere to respectful
            community guidelines when leaving reviews or dining feedback.
          </p>
        </section>

        <section className="card p-6 sm:p-8 space-y-3">
          <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <Store className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            2. Restaurant Owner Responsibilities & Verification
          </h2>
          <p>
            Establishments listed on Cordova Eats must hold valid municipal business permits issued by the Municipality of
            Cordova. Restaurant owners warrant that menu pricing, operating hours, food descriptions, and promotional
            claims are truthful, accurate, and kept up to date.
          </p>
        </section>

        <section className="card p-6 sm:p-8 space-y-3">
          <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            3. Privacy & Cookie Policies
          </h2>
          <p>
            Your usage of Cordova Eats is also governed by our{' '}
            <Link href="/privacy" className="text-cordova-green dark:text-emerald-400 font-semibold underline">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link href="/cookies" className="text-cordova-green dark:text-emerald-400 font-semibold underline">
              Cookie Policy
            </Link>
            , which detail how your data and device storage are handled under Republic Act No. 10173.
          </p>
        </section>

        <section className="card p-6 sm:p-8 space-y-3 bg-stone-50/80 dark:bg-white/[0.02]">
          <h2 className="text-lg font-bold text-stone-900 dark:text-white">4. Contact & Legal Administration</h2>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            For legal inquiries or business registration appeals:
          </p>
          <div className="p-4 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-[#141815] text-xs space-y-1">
            <p className="font-semibold text-stone-900 dark:text-white">Municipality of Cordova — Legal & Tourism Office</p>
            <p className="text-stone-600 dark:text-stone-400">Cordova Municipal Hall, Cordova, Cebu 6017</p>
            <p className="text-stone-600 dark:text-stone-400">
              Email:{' '}
              <a href="mailto:legal@cordova.gov.ph" className="text-cordova-green dark:text-emerald-400 underline font-medium">
                legal@cordova.gov.ph
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
