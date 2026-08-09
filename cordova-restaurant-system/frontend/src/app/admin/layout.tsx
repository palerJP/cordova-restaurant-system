'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, LayoutDashboard, Building2, MessageSquare, Users, Sliders } from 'lucide-react';
import { RequireRole } from '@/components/RequireRole';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/businesses', label: 'Business Verification', icon: Building2 },
    { href: '/admin/reviews', label: 'Review Moderation', icon: MessageSquare },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/ai-model', label: 'AI Model Tuning', icon: Sliders },
  ];

  const isSubPage = pathname !== '/admin';

  return (
    <RequireRole roles={['admin']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Header Bar with Back Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-cordova-green hover:text-white dark:hover:bg-cordova-green transition-colors shadow-sm"
              title="Return to Main Website"
            >
              <ArrowLeft size={14} /> Back to Main Site
            </Link>

            {isSubPage && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold bg-cordova-gold/15 text-cordova-gold hover:bg-cordova-gold hover:text-white transition-colors"
                title="Back to Admin Overview"
              >
                ← Back to Overview
              </Link>
            )}
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-mono font-bold tracking-widest text-cordova-gold uppercase">
              ADMINISTRATION PORTAL
            </span>
            <p className="text-xs text-stone-500">Municipality of Cordova Dining System</p>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <nav
          className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-stone-200 dark:border-stone-800"
          aria-label="Admin Navigation"
        >
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cordova-green text-white shadow-sm'
                    : 'bg-white dark:bg-[#1a211c] text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white border border-stone-200/80 dark:border-stone-800/80'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-cordova-gold' : 'text-stone-400'} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Page Content */}
        <main className="pt-2">{children}</main>
      </div>
    </RequireRole>
  );
}
