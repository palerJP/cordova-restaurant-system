export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <div className="card p-6 space-y-4 text-sm text-[var(--text-muted)]">
        <p>
          <strong className="text-[var(--text)]">This is a capstone project prototype.</strong>{' '}
          The text below is placeholder content illustrating where a real Privacy Policy
          would go, and does not describe actual data handling practices.
        </p>
        <p>
          In a production deployment, this page would describe: what account and preference
          data is collected, how location data is used for recommendations, how long search
          history is retained, how reviews and ratings are stored, and how users can request
          their data be deleted.
        </p>
        <p>
          A real version of this document should be drafted in compliance with the
          Philippine Data Privacy Act (RA 10173) before public launch.
        </p>
      </div>
    </div>
  );
}
