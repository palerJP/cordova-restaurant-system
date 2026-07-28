import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import 'leaflet/dist/leaflet.css';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import { ToastProvider } from '@/lib/toast-context';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Cordova Local Restaurant Recommendation System',
  description:
    'Discover accredited local restaurants in the Municipality of Cordova with AI-powered, preference-based recommendations.',
  keywords: ['Cordova restaurants', 'Cebu food', 'restaurant recommendations', 'local dining Cordova'],
};

export const viewport = {
  themeColor: '#c2571e',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        {/*
          Runs synchronously before the page paints, so the correct dark/light
          class is already on <html> before React even loads — this is what
          eliminates the white-flash-then-dark flicker on page load/refresh.
          ThemeProvider's own effects (theme-context.tsx) still run afterward
          to sync React state, but by then there's nothing visible to fix.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('theme');var t=(s==='light'||s==='dark')?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.classList.toggle('dark',t==='dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <Navbar />
              <main className="max-w-6xl mx-auto px-4 py-8 min-h-[70vh]">{children}</main>
              <Footer />
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
