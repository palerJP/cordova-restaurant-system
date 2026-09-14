'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Home, Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="spatial-card max-w-lg w-full p-8 sm:p-10 rounded-3xl bg-white/85 dark:bg-[#1a211c]/90 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800/80 shadow-spatial-lg text-center">
        {/* Logo */}
        <div className="relative h-20 w-20 mx-auto mb-6">
          <Image
            src="/cordova_eats_logo.png"
            alt="CordovaEats Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* 404 Badge */}
        <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider mb-3">
          404 — Page Not Found
        </span>

        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-2">
          Lost on the Culinary Map?
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mb-8 max-w-sm mx-auto">
          The page or dining destination you are looking for does not exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto bg-gradient-to-r from-cordova-gold to-amber-600 hover:from-cordova-goldHover hover:to-amber-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-spatial-sm hover:shadow-spatial-gold-glow transition-all active:scale-95 flex items-center justify-center gap-2 border border-white/20"
          >
            <Home size={16} />
            <span>Return to Home</span>
          </Link>
          <Link
            href="/about"
            className="w-full sm:w-auto bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl border border-stone-200 dark:border-stone-700 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span>About Us</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
