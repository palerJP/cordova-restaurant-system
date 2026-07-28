export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
      <p className="text-[var(--text-muted)] mb-8">
        Have a question, a partnership inquiry, or feedback about Cordova Eats? Reach out —
        we&apos;d like to hear from you.
      </p>

      <div className="card p-6 space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-muted)] mb-1">General inquiries</h2>
          <a href="mailto:info@cordova-restaurants.gov.ph" className="text-brand-500 hover:underline">
            info@cordova-restaurants.gov.ph
          </a>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-muted)] mb-1">Restaurant advertising &amp; promoted placements</h2>
          <a href="mailto:partnerships@cordova-restaurants.gov.ph" className="text-brand-500 hover:underline">
            partnerships@cordova-restaurants.gov.ph
          </a>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-muted)] mb-1">Municipality of Cordova</h2>
          <p className="text-[var(--text-muted)]">Cordova, Cebu, Philippines</p>
        </div>
      </div>

      <p className="text-xs text-[var(--text-muted)] mt-6">
        Note: this is a capstone project prototype — the addresses above are placeholders and
        not monitored inboxes.
      </p>
    </div>
  );
}
