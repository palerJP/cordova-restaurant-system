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

  const isAdmin = user?.role === 'admin';
  const isAdminPage = pathname?.startsWith('/admin');

  const navLinks = [
    { href: '/', label: 'Home' },
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
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 dark:bg-[#141815]/85 backdrop-blur-2xl border-b border-white/60 dark:border-white/10 shadow-spatial-md ring-1 ring-black/[0.03] dark:ring-white/[0.05]'
          : 'bg-white/60 dark:bg-[#141815]/60 backdrop-blur-xl border-b border-stone-200/40 dark:border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-24 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3.5 group py-1">
          <div className="relative h-14 w-14 sm:h-18 sm:w-18 shrink-0 transition-transform duration-300 group-hover:scale-105 filter drop-shadow-md">
            <Image
              src="/cordova_eats_logo.png"
              alt="CordovaEats Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-[#1b241f] dark:text-white tracking-tight group-hover:text-cordova-green dark:group-hover:text-emerald-400 transition-colors drop-shadow-sm">
            CordovaEats
          </span>
        </Link>

        {/* Center / Right Links */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-1.5 p-1 rounded-full bg-stone-100/70 dark:bg-[#1a221d]/70 backdrop-blur-md border border-stone-200/50 dark:border-white/5 shadow-inner mr-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-white dark:bg-[#253028] text-cordova-green dark:text-emerald-400 shadow-spatial-sm border border-black/[0.04] dark:border-white/10'
                      : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 pl-2 border-l border-stone-200/60 dark:border-white/10">
            <ThemeToggle />

            {user ? (
              <ProfileDropdown />
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-xs font-bold text-stone-800 dark:text-stone-100 hover:text-cordova-green dark:hover:text-emerald-400 transition-colors px-4 py-2 rounded-full border border-stone-300/80 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 backdrop-blur-md"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-cordova-gold via-amber-500 to-amber-600 hover:from-cordova-goldHover hover:to-amber-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-full shadow-spatial-sm hover:shadow-spatial-gold-glow transition-all duration-200 tracking-wide uppercase active:scale-95 border border-white/20"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            className="p-2 rounded-xl text-stone-700 dark:text-stone-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-stone-200/50"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-stone-200/60 dark:border-white/10 bg-white/95 dark:bg-[#141815]/95 backdrop-blur-2xl px-6 py-5 space-y-3 shadow-spatial-lg animate-fadeIn">
          <div className="space-y-1">
            {[...navLinks, ...roleLinks].map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-stone-100 dark:bg-[#1f2821] text-cordova-green dark:text-emerald-400 font-semibold'
                      : 'text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-white/5'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-stone-200/60 dark:border-white/10">
            {user ? (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
              >
                Log out
              </button>
            ) : (
              <div className="flex flex-col gap-2.5 pt-1">
                <Link
                  href="/login"
                  className="w-full text-center py-2.5 text-sm font-semibold text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-white/10 rounded-xl hover:bg-stone-50 dark:hover:bg-white/5 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="w-full text-center py-2.5 text-sm font-bold text-white bg-gradient-to-r from-cordova-gold to-amber-600 hover:from-cordova-goldHover hover:to-amber-700 rounded-xl shadow-spatial-sm transition-all uppercase tracking-wide"
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
