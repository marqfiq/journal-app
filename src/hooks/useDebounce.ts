import { useEffect, useState } from 'react'

/**
 * Custom hook that debounces a value
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 1000)
 * @returns The debounced value
 */
export const useDebounce = <T>(value: T, delay: number = 1000): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

