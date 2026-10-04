import Link from 'next/link';
import Image from 'next/image';
import { Store, TrendingUp, ShieldCheck, Sparkles, Megaphone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ForRestaurantsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
          <Store size={14} />
          <span>Cordova Merchant Network</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 dark:text-white tracking-tight mb-4">
          Grow Your Culinary Business in Cordova
        </h1>
        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
          CordovaEats connects local diners, tourists, and foodies directly to accredited food establishments across the Municipality of Cordova.
        </p>
      </div>

      {/* Grid of Key Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Free Verified Listing */}
        <div className="spatial-card p-8 rounded-3xl bg-white/80 dark:bg-[#1a211c]/90 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800/80 shadow-spatial-md flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
              <ShieldCheck size={24} />
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mb-3">
              Free Verified Listing
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed mb-6">
              Every licensed establishment in Cordova gets a complimentary accredited profile with full digital menu management, GPS mapping, diner reviews, and AI taste recommendations.
            </p>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-700 dark:text-stone-300 mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Full digital menu, pricing, and signature dish photos</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Operating hours, contact phone, and exact map pin</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Customer ratings, verified dish reviews &amp; owner replies</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Real-time impression analytics &amp; AI recommendation matches</span>
              </li>
            </ul>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-stone-100 dark:border-stone-800/60">
            <Link href="/dashboard/new">
              <Button className="bg-cordova-green hover:bg-cordova-greenHover text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow transition-all hover:scale-105 active:scale-95">
                Register Your Business
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary" className="px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider">
                Owner Dashboard →
              </Button>
            </Link>
          </div>
        </div>

        {/* Card 2: Promoted Placement & Advertising */}
        <div id="advertise" className="spatial-card p-8 rounded-3xl bg-white/80 dark:bg-[#1a211c]/90 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800/80 shadow-spatial-md flex flex-col justify-between scroll-mt-24">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5">
              <Sparkles size={24} />
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mb-3">
              Promoted Placement &amp; Advertising
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed mb-6">
              Boost your visibility to hungry diners with sponsored top placements, featured discounts, and priority highlights across the Cordova dining directory.
            </p>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-700 dark:text-stone-300 mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-amber-500 shrink-0" />
                <span>Top sponsored slot placement in search &amp; browse categories</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-amber-500 shrink-0" />
                <span>Highlighted flash promotions &amp; seasonal dining specials</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-amber-500 shrink-0" />
                <span>Homepage carousel spotlights &amp; municipal food feature banners</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-amber-500 shrink-0" />
                <span>Direct inquiry contact with municipal support team</span>
              </li>
            </ul>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-stone-100 dark:border-stone-800/60">
            <Link href="/portal/payment">
              <Button className="bg-gradient-to-r from-cordova-gold to-amber-600 hover:from-cordova-goldHover hover:to-amber-700 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-spatial-sm hover:shadow-spatial-gold-glow transition-all active:scale-95 border border-white/20">
                View Boost Plans &amp; Portal (₱499 - ₱1,999)
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="secondary" className="px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider">
                Inquire About Advertising →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
