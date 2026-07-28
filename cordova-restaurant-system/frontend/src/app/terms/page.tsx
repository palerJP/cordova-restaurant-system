export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Terms of Use</h1>
      <div className="card p-6 space-y-4 text-sm text-[var(--text-muted)]">
        <p>
          <strong className="text-[var(--text)]">This is a capstone project prototype.</strong>{' '}
          The text below is placeholder content illustrating where a real Terms of Use
          policy would go, and is not a legally binding agreement.
        </p>
        <p>
          In a production deployment, this page would cover: acceptable use of the
          platform, account responsibilities for customers and restaurant owners, rules for
          submitting reviews and business listings, the business verification process, and
          limitations of liability for the Municipality of Cordova as platform operator.
        </p>
        <p>
          A real version of this document should be drafted and reviewed by the
          Municipality&apos;s legal office before public launch.
        </p>
      </div>
    </div>
  );
}
