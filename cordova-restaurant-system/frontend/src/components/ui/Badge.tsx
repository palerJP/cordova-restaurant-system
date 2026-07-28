import clsx from 'clsx';
import { Star } from 'lucide-react';

export function Badge({
  children,
  color = 'neutral',
}: {
  children: React.ReactNode;
  color?: 'neutral' | 'success' | 'warning' | 'danger' | 'brand';
}) {
  const colorClass = {
    neutral: 'bg-black/5 dark:bg-white/10 text-[var(--text-muted)]',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500',
    warning: 'bg-gold-500/20 text-gold-500',
    danger: 'bg-red-500/10 text-red-500',
    brand: 'bg-brand-500/10 text-brand-600 dark:text-brand-400',
  }[color];

  return <span className={clsx('badge', colorClass)}>{children}</span>;
}

export function StarRating({ value, size = 'sm' }: { value: number; size?: 'sm' | 'md' }) {
  const full = Math.round(value);
  const iconSize = size === 'sm' ? 14 : 18;
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={iconSize}
          className={i < full ? 'fill-gold-500 text-gold-500' : 'fill-black/10 text-black/10 dark:fill-white/10 dark:text-white/10'}
        />
      ))}
      <span className="ml-1 text-[var(--text-muted)] text-xs">({value.toFixed(1)})</span>
    </span>
  );
}
