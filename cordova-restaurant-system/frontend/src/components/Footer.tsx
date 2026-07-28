import Link from 'next/link';

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'About Cordova Eats',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'How It Works', href: '/about#how-it-works' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { label: 'Browse Restaurants', href: '/' },
      { label: 'AI Recommendations', href: '/recommendations' },
      { label: 'Current Promotions', href: '/promotions' },
    ],
  },
  {
    title: 'For Restaurant Owners',
    links: [
      { label: 'List Your Restaurant', href: '/for-restaurants' },
      { label: 'Advertise With Us', href: '/for-restaurants#advertise' },
      { label: 'Owner Dashboard', href: '/dashboard' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Use', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-16 bg-[var(--bg-elevated)]">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-4 mb-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg w-fit">
              <span aria-hidden>🍴📍</span> Cordova Eats
            </Link>
            <p className="text-sm text-[var(--text-muted)] mt-2 max-w-sm">
              A local recommendation platform connecting diners with accredited restaurants
              in the Municipality of Cordova, Cebu.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold mb-3">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-[var(--text-muted)] hover:text-brand-500 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--border)] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[var(--text-muted)]">
          <p>© {new Date().getFullYear()} Cordova Eats — Municipality of Cordova, Cebu. All rights reserved.</p>
          <p>A local government digital initiative supporting Cordova&apos;s food businesses.</p>
        </div>
      </div>
    </footer>
  );
}
