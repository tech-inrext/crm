import { useEffect, useState } from "react";

/**
 * useDebounce - Debounces a changing value by a delay
 * @param value The input value to debounce
 * @param delay Delay in milliseconds (default 300ms)
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler); // cleanup
  }, [value, delay]);

  return debouncedValue;
}
