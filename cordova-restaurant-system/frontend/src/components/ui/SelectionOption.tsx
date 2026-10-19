'use client';

import { ReactNode } from 'react';
import { Check } from 'lucide-react';

interface SelectionOptionProps {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}

export function SelectionOption({ selected, onClick, children }: SelectionOptionProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`inline-flex min-h-12 max-w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-base font-semibold leading-snug focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-blue-300 dark:focus-visible:ring-offset-stone-900 ${
        selected
          ? 'border-green-900 bg-green-900 text-white hover:bg-green-800 dark:border-emerald-300 dark:bg-emerald-300 dark:text-green-950 dark:hover:bg-emerald-200'
          : 'border-stone-400 bg-white text-stone-900 hover:border-stone-700 hover:bg-stone-100 dark:border-stone-500 dark:bg-stone-900 dark:text-white dark:hover:bg-stone-800'
      }`}
    >
      <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 border-current">
        {selected && <Check size={18} strokeWidth={3} />}
      </span>
      <span>{children}</span>
      {selected && <span aria-hidden="true" className="text-sm font-bold">Selected</span>}
    </button>
  );
}
