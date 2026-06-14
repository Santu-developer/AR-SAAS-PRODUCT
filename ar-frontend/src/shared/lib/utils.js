import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind conflict resolution.
 * Uses clsx for conditional classes and twMerge to resolve Tailwind conflicts.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** Format a number as a currency string (USD). */
export function formatCurrency(value) {
  if (typeof value !== 'number') return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

/** Format an ISO date string to a readable date (e.g., "Jan 2, 2024"). */
export function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}
