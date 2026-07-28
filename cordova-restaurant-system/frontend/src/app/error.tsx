'use client';

import { Button } from '@/components/ui/Button';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="text-center py-20">
      <p className="text-5xl mb-4" aria-hidden>
        😕
      </p>
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-[var(--text-muted)] mb-6">{error.message || 'An unexpected error occurred.'}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
