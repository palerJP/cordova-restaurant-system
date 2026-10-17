import type { Metadata } from 'next';
import { PwaControls } from '@/components/PwaControls';
import '@fontsource-variable/inter/wght.css';
import '@fontsource-variable/playfair-display/wght.css';
import '@/styles/globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import { ToastProvider } from '@/lib/toast-context';
import { CookieConsentProvider } from '@/lib/cookie-consent-context';
import { PublicSiteChrome } from '@/components/PublicSiteChrome';
import { CookieBanner } from '@/components/cookies/CookieBanner';

export const metadata: Metadata = {
  manifest: '/manifest.webmanifest',
  applicationName: 'CordovaEats',
  appleWebApp: { capable: true, title: 'CordovaEats', statusBarStyle: 'default' },
  icons: { apple: '/icons/apple-touch-icon.png' },
  title: 'CordovaEats - Cordova Local Restaurant Recommendation System',
  description:
    'Discover authentic seafood, traditional Filipino cuisine, and artisan cafes in the Municipality of Cordova.',
  keywords: ['Cordova restaurants', 'Cebu food', 'restaurant recommendations', 'local dining Cordova', 'CordovaEats'],
};

export const viewport = {
  themeColor: '#1B5232',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme initialisation — must run synchronously before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('theme');var t=(s==='light'||s==='dark')?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.classList.toggle('dark',t==='dark');}catch(e){}})();`,
          }}
        />
        {/* Google Identity Services — required for real Google OAuth flow */}
        <script src="https://accounts.google.com/gsi/client" async defer />
      </head>
      <body className="min-h-screen font-sans antialiased bg-cordova-cream dark:bg-[#121614] text-ink-900 dark:text-gray-100">
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <CookieConsentProvider>
                <PublicSiteChrome position="header" />
                <main className="min-h-[70vh]">{children}</main>
                <PublicSiteChrome position="footer" />
                <CookieBanner />
                <PwaControls />
              </CookieConsentProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
