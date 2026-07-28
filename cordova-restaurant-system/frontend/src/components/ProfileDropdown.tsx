'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function ProfileDropdown() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!user) return null;

  const initial = user.full_name?.trim()?.[0]?.toUpperCase() || '?';

  // Only links to pages that actually exist in the app. "My Blog" and
  // "Visited Restaurants" are not yet built — left out rather than
  // linking to something that would 404.
  const menuItems: { href: string; label: string }[] =
    user.role === 'admin'
      ? [{ href: '/admin', label: 'Admin Panel' }]
      : user.role === 'owner'
      ? [
          { href: '/dashboard', label: 'My Business' },
          { href: '/dashboard/new', label: 'Create Business' },
        ]
      : [
          { href: '/favorites', label: 'Favorites' },
          { href: '/history', label: 'Search History' },
          { href: '/for-restaurants', label: 'Create Business' },
        ];

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full pl-1 pr-2.5 py-1 hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors"
      >
        {user.avatar_url ? (
          <div className="relative h-9 w-9 rounded-full overflow-hidden">
            <Image src={user.avatar_url} alt={user.full_name} fill className="object-cover" />
          </div>
        ) : (
          <span className="flex items-center justify-center h-9 w-9 rounded-full bg-brand-500 text-white text-sm font-semibold">
            {initial}
          </span>
        )}
        <ChevronDown size={14} className={`text-[var(--text-muted)] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            role="menu"
            className="absolute right-0 mt-2 w-56 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-card-hover py-3 z-50"
          >
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block px-5 py-2.5 text-[15px] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <button
              role="menuitem"
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="w-full text-left px-5 py-2.5 text-[15px] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors"
            >
              Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
