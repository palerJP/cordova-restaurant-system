'use client';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function PublicSiteChrome({ position }: { position: 'header' | 'footer' }) {
  const pathname = usePathname();
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return null;
  return position === 'header' ? <Navbar /> : <Footer />;
}
