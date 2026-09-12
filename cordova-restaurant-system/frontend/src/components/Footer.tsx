'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface FooterLink {
  label: string;
  href: string;
  authRequired?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const COLUMNS: FooterColumn[] = [
  {
    title: 'About Cordova Eats',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'How It Works', href: '/about#how-it-works' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { label: 'Browse Restaurants', href: '/' },
      { label: 'Recommended Restaurants', href: '/recommendations', authRequired: true },
      { label: 'Current Promotions', href: '/promotions' },
    ],
  },
  {
    title: 'For Restaurant Owners',
    links: [
      { label: 'List Your Restaurant', href: '/dashboard/new' },
      { label: 'Advertise With Us', href: '/for-restaurants#advertise' },
      { label: 'Owner Dashboard', href: '/dashboard' },
    ],
  },
  {
    title: 'Legal & Privacy',
    links: [
      { label: 'Terms of Use', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  },
];

export function Footer() {
  const { user } = useAuth();
  const pathname = usePathname();

  // Do not display footer on admin portal pages or when admin views profile
  if (pathname?.startsWith('/admin') || (user?.role === 'admin' && pathname?.startsWith('/profile'))) {
    return null;
  }

  return (
    <footer className="border-t border-stone-200/80 dark:border-white/10 mt-20 bg-white/70 dark:bg-[#141815]/70 backdrop-blur-xl relative z-10">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-4 mb-2">
            <Link href="/" className="flex items-center gap-3.5 w-fit group">
              <div className="relative h-16 w-16 shrink-0 transition-transform group-hover:scale-105 filter drop-shadow-sm">
                <Image
                  src="/cordova_eats_logo.png"
                  alt="CordovaEats Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-serif text-2xl font-bold text-stone-900 dark:text-white group-hover:text-cordova-green dark:group-hover:text-emerald-400 transition-colors">
                CordovaEats
              </span>
            </Link>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-2 max-w-sm">
              A local recommendation platform connecting diners with accredited restaurants
              in the Municipality of Cordova, Cebu.
            </p>
          </div>

          {COLUMNS.map((col) => {
            const visibleLinks = col.links.filter((link) => !link.authRequired || Boolean(user));
            return (
              <div key={col.title}>
                <h3 className="text-sm font-semibold mb-3 text-stone-900 dark:text-stone-100">{col.title}</h3>
                <ul className="space-y-2">
                  {visibleLinks.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-stone-500 dark:text-stone-400 hover:text-cordova-green dark:hover:text-emerald-400 transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="border-t border-stone-200/60 dark:border-white/10 mt-10 pt-6 text-center text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-medium">
          <p>© {new Date().getFullYear()} Cordova Eats — Municipality of Cordova, Cebu. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
