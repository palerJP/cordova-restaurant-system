'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { ThemeToggle } from './ThemeToggle';
import { ProfileDropdown } from './ProfileDropdown';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/promotions', label: 'Promotions' },
  ];

  const roleLinks: { href: string; label: string }[] =
    user?.role === 'admin'
      ? [{ href: '/admin', label: 'Admin Panel' }]
      : user?.role === 'owner'
      ? [{ href: '/dashboard', label: 'My Business' }]
      : user
      ? [
          { href: '/favorites', label: 'Favorites' },
          { href: '/history', label: 'History' },
        ]
      : [];

  return (
    <header
      className={`sticky top-0 z-50 bg-white/95 dark:bg-[#141815]/95 backdrop-blur-md transition-all duration-200 border-b ${
        scrolled ? 'border-gray-200 dark:border-gray-800 shadow-sm' : 'border-gray-100 dark:border-gray-800/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3.5 group py-1">
          <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 transition-transform duration-300 group-hover:scale-105 filter drop-shadow-sm">
            <Image
              src="/cordova_eats_logo.png"
              alt="CordovaEats Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-[#1b241f] dark:text-white tracking-tight group-hover:text-cordova-green transition-colors">
            CordovaEats
          </span>
        </Link>

        {/* Center / Right Links */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-5 mr-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-cordova-green dark:text-emerald-400 font-semibold'
                    : 'text-stone-600 dark:text-stone-300 hover:text-cordova-green'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <ThemeToggle />

          {user ? (
            <ProfileDropdown />
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-xs font-semibold text-stone-700 dark:text-stone-200 hover:text-cordova-green transition-colors px-2 py-1"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-cordova-gold hover:bg-cordova-goldHover text-white text-xs font-semibold px-5 py-2.5 rounded shadow-sm transition-colors duration-200 tracking-wide uppercase"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            className="p-2 rounded-lg text-stone-700 dark:text-stone-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141815] px-6 py-4 space-y-3">
          {[...navLinks, ...roleLinks].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 text-sm font-medium text-stone-700 dark:text-stone-200 hover:text-cordova-green"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
            {user ? (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="w-full text-left py-2 text-sm font-medium text-red-600"
              >
                Log out
              </button>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  href="/login"
                  className="w-full text-center py-2 text-sm font-medium text-stone-700 dark:text-stone-200 border border-stone-200 rounded"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="w-full text-center py-2 text-sm font-semibold text-white bg-cordova-gold hover:bg-cordova-goldHover rounded"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
