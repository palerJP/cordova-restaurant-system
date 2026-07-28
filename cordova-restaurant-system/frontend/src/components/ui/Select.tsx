'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, className, children, ...rest }, ref) => {
    const selectId = id || rest.name;
    return (
      <div>
        {label && (
          <label htmlFor={selectId} className="label">
            {label}
          </label>
        )}
        <select ref={ref} id={selectId} className={`input ${className || ''}`} {...rest}>
          {children}
        </select>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
