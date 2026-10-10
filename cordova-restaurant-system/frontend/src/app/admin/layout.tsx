'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, LayoutDashboard, Building2, MessageSquare, Users, Sliders, Tag, Menu, X, Sun, Moon, LogOut, ChevronRight } from 'lucide-react';
import { RequireRole } from '@/components/RequireRole';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import './admin.css';

const navLinks = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/businesses', label: 'Business Verification', icon: Building2 },
  { href: '/admin/reviews', label: 'Review Moderation', icon: MessageSquare },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/promotions', label: 'Promotions', icon: Tag },
  { href: '/admin/ai-model', label: 'AI Recommendations', icon: Sliders },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileNav, setMobileNav] = useState(false);
  const current = navLinks.find(link => link.href === pathname || (link.href !== '/admin' && pathname.startsWith(`${link.href}/`)));
  const navigation = (mobile = false) => navLinks.map(link => {
    const active = current?.href === link.href;
    return <Link key={link.href} href={link.href} onClick={() => setMobileNav(false)} aria-current={active ? 'page' : undefined} className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium ${active ? 'bg-emerald-700 text-white' : mobile ? 'hover:bg-gray-100 dark:hover:bg-white/10' : 'text-emerald-50 hover:bg-white/10'}`}><link.icon size={18} className="shrink-0" />{link.label}</Link>;
  });

  return (
    <RequireRole roles={['admin']}>
      <div className="admin-shell min-h-screen bg-gray-50 text-gray-900 dark:bg-[#121614] dark:text-gray-100">
        <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col bg-[#123c2d] text-white">
          <Link href="/admin" className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
            <Image src="/cordova_eats_logo.png" alt="" width={40} height={40} className="object-contain" />
            <span><span className="block text-xl font-bold">CordovaEats</span><span className="block text-xs text-emerald-100 mt-1">Administration</span></span>
          </Link>
          <nav aria-label="Admin navigation" className="flex-1 overflow-y-auto space-y-1 px-3 py-6">{navigation()}</nav>
          <div className="border-t border-white/10 p-4 space-y-4">
            <Link href="/" className="flex items-center gap-3 text-sm py-2 text-emerald-50 hover:text-white"><ArrowLeft size={18} />Back to Main Site</Link>
            <div className="flex items-center gap-3 border-t border-white/10 pt-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-700 font-semibold">{user?.full_name?.charAt(0) || 'A'}</span><span className="min-w-0"><span className="block truncate text-sm font-medium">{user?.full_name || 'Administrator'}</span><span className="block text-xs text-emerald-100">Admin</span></span></div>
          </div>
        </aside>
        <div className="lg:ml-64 min-w-0">
          <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 sm:px-8 dark:bg-[#1a211c] dark:border-gray-700">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" onClick={() => setMobileNav(open => !open)} aria-label={mobileNav ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileNav} aria-controls="admin-mobile-nav" className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/10">{mobileNav ? <X size={20} /> : <Menu size={20} />}</button>
              <Link href="/admin" className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">Administration</Link><ChevronRight size={14} className="hidden sm:block text-gray-400" /><span className="text-sm font-semibold truncate">{current?.label || 'Administration'}</span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link href="/" title="Back to Main Site" aria-label="Back to Main Site" className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/10"><ArrowLeft size={18} /></Link>
              <button onClick={toggleTheme} title={theme === 'dark' ? 'Light theme' : 'Dark theme'} aria-label={theme === 'dark' ? 'Light theme' : 'Dark theme'} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/10">{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
              <button onClick={async () => { try { await logout(); } finally { router.replace('/'); } }} title="Sign out" aria-label="Sign out" className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/10"><LogOut size={18} /></button>
            </div>
          </header>
          {mobileNav && <nav id="admin-mobile-nav" aria-label="Mobile admin navigation" className="lg:hidden sticky top-16 z-30 border-b border-gray-200 bg-white dark:bg-[#1a211c] p-3 grid gap-1 sm:grid-cols-2">{navigation(true)}</nav>}
          <div className="admin-content mx-auto max-w-[1600px] min-w-0 px-4 py-6 sm:px-8 sm:py-8">{children}</div>
        </div>
      </div>
    </RequireRole>
  );
}
