import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function ForRestaurantsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">For Restaurant Owners</h1>
      <p className="text-[var(--text-muted)] mb-8">
        Cordova Eats helps local restaurants get discovered by the customers already looking
        for them — with no design or marketing budget required.
      </p>

      <div className="card p-6 mb-6">
        <h2 className="text-xl font-semibold mb-3">Free Verified Listing</h2>
        <p className="text-[var(--text-muted)] mb-4">
          Every accredited restaurant in Cordova gets a free listing: your menu, hours,
          location on the map, and customer reviews — plus a spot in our AI recommendation
          results whenever a diner&apos;s preferences match what you offer.
        </p>
        <ul className="text-sm text-[var(--text-muted)] space-y-1.5 mb-5 list-disc list-inside">
          <li>Full menu &amp; pricing management</li>
          <li>Operating hours &amp; contact info</li>
          <li>Customer ratings &amp; reviews</li>
          <li>Basic analytics: views, and how often you appear in recommendations</li>
        </ul>
        <Link href="/register">
          <Button>Register your business</Button>
        </Link>
      </div>

      <div id="advertise" className="card p-6 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-3">Promoted Placement &amp; Advertising</h2>
        <p className="text-[var(--text-muted)] mb-4">
          Want extra visibility — a featured spot on the homepage, a highlighted promotion,
          or priority placement for a limited-time offer? We offer paid promotional
          placements for verified restaurants, separate from your free base listing.
        </p>
        <p className="text-[var(--text-muted)] mb-5">
          Current rates depend on placement type and duration. Get in touch and we&apos;ll
          send you the current pricing sheet.
        </p>
        <Link href="/contact">
          <Button variant="secondary">Contact us about advertising</Button>
        </Link>
      </div>
    </div>
  );
}
