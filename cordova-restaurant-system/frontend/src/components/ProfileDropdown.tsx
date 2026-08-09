'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Heart, PlusCircle, LayoutDashboard, Shield, History, Sliders } from 'lucide-react';
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

  const menuItems: { href: string; label: string; icon: any }[] = [];

  if (user.role === 'admin') {
    menuItems.push(
      { href: '/admin', label: 'Admin Panel', icon: Shield },
      { href: '/for-restaurants', label: 'Add Business', icon: PlusCircle },
      { href: '/favorites', label: 'My Favorites', icon: Heart },
      { href: '/history', label: 'Search History', icon: History }
    );
  } else if (user.role === 'owner') {
    menuItems.push(
      { href: '/dashboard', label: 'My Business', icon: LayoutDashboard },
      { href: '/dashboard/new', label: 'Add Business', icon: PlusCircle },
      { href: '/favorites', label: 'My Favorites', icon: Heart },
      { href: '/history', label: 'Search History', icon: History }
    );
  } else {
    menuItems.push(
      { href: '/for-restaurants', label: 'Add Business', icon: PlusCircle },
      { href: '/favorites', label: 'My Favorites', icon: Heart },
      { href: '/history', label: 'Search History', icon: History }
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full pl-1 pr-2.5 py-1 hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors"
      >
        {user.avatar_url ? (
          <div className="relative h-9 w-9 rounded-full overflow-hidden border border-stone-200 dark:border-stone-700">
            <Image src={user.avatar_url} alt={user.full_name} fill className="object-cover" />
          </div>
        ) : (
          <span className="flex items-center justify-center h-9 w-9 rounded-full bg-cordova-green text-white text-sm font-semibold">
            {initial}
          </span>
        )}
        <ChevronDown size={14} className={`text-stone-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            role="menu"
            className="absolute right-0 mt-2 w-60 rounded-xl bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 shadow-xl py-2 z-50 overflow-hidden"
          >
            {/* User Info Header */}
            <div className="px-4 py-2.5 border-b border-stone-100 dark:border-stone-800/80 mb-1">
              <p className="text-sm font-semibold text-stone-900 dark:text-white truncate">{user.full_name}</p>
              <p className="text-xs text-stone-500 capitalize">{user.role} Account</p>
            </div>

            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/70 hover:text-cordova-green transition-colors"
                >
                  <Icon size={16} className="text-stone-400 dark:text-stone-500 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="pt-1 mt-1 border-t border-stone-100 dark:border-stone-800/80">
              <button
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors font-medium"
              >
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
