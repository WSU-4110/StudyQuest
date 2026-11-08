import { useEffect, useState } from 'react'

export function useCountdown(durationMs) {
  const [endsAt] = useState(() => Date.now() + durationMs)
  const [msLeft, setMsLeft] = useState(durationMs)

  useEffect(() => {
    const interval = setInterval(() => {
      const left = Math.max(0, endsAt - Date.now())
      setMsLeft(left)
      if (left === 0) clearInterval(interval)
    }, 100)
    return () => clearInterval(interval)
  }, [endsAt])

  return msLeft
}
