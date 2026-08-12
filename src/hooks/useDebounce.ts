import { useEffect, useState } from 'react'

/**
 * Returns `value`, but only updates once it has stayed unchanged for `delayMs`.
 * Use this to debounce search inputs (or anything else) before it drives an
 * API call, a query key, or other expensive work — so typing "driver" doesn't
 * fire 6 requests, just 1 shortly after the last keystroke.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
