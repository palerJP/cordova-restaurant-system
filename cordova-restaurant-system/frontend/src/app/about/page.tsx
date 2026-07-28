export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">About Cordova Eats</h1>
      <p className="text-[var(--text-muted)] mb-8">
        Cordova Eats is a digital initiative of the Municipality of Cordova, Cebu, built to
        connect residents and visitors with accredited local restaurants through an
        AI-powered, preference-based recommendation platform.
      </p>

      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold mb-3">Our Mission</h2>
        <p className="text-[var(--text-muted)]">
          Local restaurants — especially small and family-run businesses — often struggle
          with digital visibility. Cordova Eats gives every accredited restaurant in the
          municipality a free, verified listing, and helps diners discover the right place
          for their budget, cuisine, and dietary needs, without wading through irrelevant
          results from apps built for larger cities.
        </p>
      </div>

      <div id="how-it-works" className="scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="card p-5">
            <p className="text-2xl mb-2" aria-hidden>
              🔍
            </p>
            <h3 className="font-semibold mb-1">1. Tell us your preferences</h3>
            <p className="text-sm text-[var(--text-muted)]">
              Budget, cuisine, dietary needs, and how far you&apos;re willing to travel.
            </p>
          </div>
          <div className="card p-5">
            <p className="text-2xl mb-2" aria-hidden>
              🤖
            </p>
            <h3 className="font-semibold mb-1">2. Our engine scores every restaurant</h3>
            <p className="text-sm text-[var(--text-muted)]">
              A transparent, rule-based scoring system ranks accredited restaurants against
              your constraints — never a black box.
            </p>
          </div>
          <div className="card p-5">
            <p className="text-2xl mb-2" aria-hidden>
              🍽️
            </p>
            <h3 className="font-semibold mb-1">3. You get a ranked shortlist</h3>
            <p className="text-sm text-[var(--text-muted)]">
              Complete with menus, hours, reviews, and a live map — everything you need to
              decide.
            </p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-3">Verified, Not Just Listed</h2>
        <p className="text-[var(--text-muted)]">
          Every restaurant on Cordova Eats submits a business permit for admin review before
          appearing publicly. That verification step is what keeps the platform trustworthy
          for diners and fair for legitimate local businesses.
        </p>
      </div>
    </div>
  );
}
