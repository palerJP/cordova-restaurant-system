'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { UtensilsCrossed, Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { ThemeToggle } from './ThemeToggle';
import { ProfileDropdown } from './ProfileDropdown';
import { Button } from './ui/Button';

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
    { href: '/', label: 'Browse' },
    { href: '/recommendations', label: 'For You (AI)' },
    { href: '/promotions', label: 'Promotions' },
  ];

  // Role-specific links live in the profile dropdown on desktop (see
  // ProfileDropdown.tsx) to keep the top nav minimal — still listed here
  // flat for the mobile menu, where a dropdown-within-a-dropdown is awkward.
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
      className={`sticky top-0 z-40 backdrop-blur-xl bg-[var(--bg)]/85 border-b transition-shadow duration-300 ${
        scrolled ? 'border-[var(--border)] shadow-premium' : 'border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg shrink-0 group">
          <span className="flex items-center justify-center h-9 w-9 rounded-xl bg-brand-600 text-white group-hover:scale-105 transition-transform">
            <UtensilsCrossed size={18} strokeWidth={2.4} />
          </span>
          <span>Cordova Eats</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 rounded-full border border-[var(--border)] p-1" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <ProfileDropdown />
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary">Sign up</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-[var(--border)] px-4 py-3 flex flex-col gap-1">
          {[...navLinks, ...roleLinks].map((link) => (
            <Link key={link.href} href={link.href} className="py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] mt-2">
            <ThemeToggle />
            {user ? (
              <Button variant="secondary" onClick={() => logout()}>
                Log out
              </Button>
            ) : (
              <div className="flex gap-2">
                <Link href="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
