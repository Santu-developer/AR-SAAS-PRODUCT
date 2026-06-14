// ─── src/shared/hooks/useDebounce.js ─────────────────────────────────────
// Debounce hook — delays updating a value until after a specified delay
// Useful for search inputs, resize handlers, and filter controls.
// ──────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';

/**
 * useDebounce — returns a debounced version of the provided value.
 * The debounced value only updates after `delay` ms of inactivity.
 *
 * @param {*} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 300)
 * @returns {*} - The debounced value
 *
 * @example
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 400);
 * // use debouncedSearch in API calls
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
