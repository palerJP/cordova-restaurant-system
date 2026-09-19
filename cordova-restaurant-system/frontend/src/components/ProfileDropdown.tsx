'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import {
  ChevronDown,
  Heart,
  PlusCircle,
  LayoutDashboard,
  Shield,
  History,
  UserCircle,
  AlertCircle,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function ProfileDropdown() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseY = useMotionValue(Infinity);

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

  const menuItems: { href: string; label: string; icon: any }[] = [
    { href: '/profile', label: 'My Profile', icon: UserCircle },
  ];

  if (user.role === 'admin') {
    menuItems.push(
      { href: '/admin', label: 'Admin Panel', icon: Shield }
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
      { href: '/favorites', label: 'My Favorites', icon: Heart },
      { href: '/history', label: 'Search History', icon: History },
      { href: '/dashboard/new', label: 'Add Business', icon: PlusCircle }
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
          <span className="flex items-center justify-center h-9 w-9 rounded-full bg-cordova-green text-white text-sm font-semibold shadow-sm">
            {initial}
          </span>
        )}
        <ChevronDown size={14} className={`text-stone-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            role="menu"
            onMouseMove={(e) => mouseY.set(e.clientY)}
            onMouseLeave={() => mouseY.set(Infinity)}
            className="absolute right-0 mt-2 w-64 rounded-2xl bg-white/95 dark:bg-[#1a211c]/95 backdrop-blur-2xl border border-stone-200/80 dark:border-stone-800/80 shadow-2xl py-2.5 z-50 overflow-visible"
          >
            {/* User Info Header */}
            <div className="px-4 py-2.5 border-b border-stone-100 dark:border-stone-800/80 mb-2">
              <p className="text-sm font-bold text-stone-900 dark:text-white truncate">{user.full_name}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{user.email}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs font-semibold text-stone-400 dark:text-stone-400 capitalize">{user.role}</span>
                {!user.email_verified && (
                  <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded-full">
                    <AlertCircle size={9} />
                    Unverified
                  </span>
                )}
              </div>
            </div>

            {/* Dock Animated Menu Items */}
            <div className="space-y-0.5">
              {menuItems.map((item) => (
                <DockMenuItem
                  key={item.href}
                  item={item}
                  mouseY={mouseY}
                  onClick={() => setOpen(false)}
                />
              ))}
            </div>

            {/* Dock Animated Log out Button */}
            <div className="pt-2 mt-1.5 border-t border-stone-100 dark:border-stone-800/80">
              <DockMenuItem
                item={{ label: 'Log out', icon: LogOut }}
                mouseY={mouseY}
                isDestructive
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DockMenuItem({
  item,
  mouseY,
  onClick,
  isDestructive = false,
}: {
  item: { href?: string; label: string; icon: any };
  mouseY: MotionValue<number>;
  onClick: () => void;
  isDestructive?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const Icon = item.icon;

  const distance = 70;
  const mouseDistance = useTransform(mouseY, (val) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return Infinity;
    return val - (rect.y + rect.height / 2);
  });

  const springConfig = { mass: 0.1, stiffness: 180, damping: 14 };

  // Icon container size: 34px -> 48px
  const targetIconSize = useTransform(mouseDistance, [-distance, 0, distance], [34, 48, 34]);
  const iconSize = useSpring(targetIconSize, springConfig);

  // Icon scale: 1 -> 1.3
  const targetIconScale = useTransform(mouseDistance, [-distance, 0, distance], [1, 1.3, 1]);
  const iconScale = useSpring(targetIconScale, springConfig);

  // X nudge to the right: 0 -> 8px
  const targetX = useTransform(mouseDistance, [-distance, 0, distance], [0, 8, 0]);
  const x = useSpring(targetX, springConfig);

  // Row scale: 1 -> 1.02
  const targetRowScale = useTransform(mouseDistance, [-distance, 0, distance], [1, 1.02, 1]);
  const rowScale = useSpring(targetRowScale, springConfig);

  const innerContent = (
    <div className="flex items-center gap-3 w-full">
      <motion.div
        style={{ width: iconSize, height: iconSize }}
        className={`flex items-center justify-center rounded-xl shrink-0 transition-colors shadow-xs ${
          isDestructive
            ? 'bg-red-500/10 text-red-500 dark:text-red-400 group-hover:bg-red-500/20 group-hover:text-red-600'
            : 'bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-stone-300 group-hover:bg-cordova-green/15 dark:group-hover:bg-emerald-400/20 group-hover:text-cordova-green dark:group-hover:text-emerald-400 border border-stone-200/60 dark:border-white/10'
        }`}
      >
        <motion.div style={{ scale: iconScale }} className="flex items-center justify-center">
          <Icon size={18} />
        </motion.div>
      </motion.div>

      <span
        className={`text-sm tracking-tight truncate transition-all ${
          isDestructive
            ? 'text-red-600 dark:text-red-400 font-semibold'
            : 'text-stone-700 dark:text-stone-200 group-hover:text-stone-950 dark:group-hover:text-white group-hover:font-semibold'
        }`}
      >
        {item.label}
      </span>
    </div>
  );

  return (
    <motion.div
      ref={ref}
      style={{ x, scale: rowScale }}
      className="relative px-2 py-0.5"
    >
      {item.href ? (
        <Link
          href={item.href}
          role="menuitem"
          onClick={onClick}
          className="flex items-center p-1.5 rounded-xl transition-colors group hover:bg-stone-100/80 dark:hover:bg-white/5 focus:outline-none"
        >
          {innerContent}
        </Link>
      ) : (
        <button
          role="menuitem"
          onClick={onClick}
          className="w-full flex items-center p-1.5 rounded-xl transition-colors group hover:bg-red-50/80 dark:hover:bg-red-950/20 focus:outline-none text-left"
        >
          {innerContent}
        </button>
      )}
    </motion.div>
  );
}
