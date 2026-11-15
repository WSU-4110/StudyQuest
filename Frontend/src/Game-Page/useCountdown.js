import { useEffect, useRef, useState } from 'react'

const TICK_MS = 100

// A countdown that can gain time, lose time and freeze. The clock never holds
// more than maxMs, and once it hits zero it stays there.
export function useCountdown(durationMs, { maxMs = durationMs } = {}) {
  const [startedAt] = useState(() => Date.now())
  const clockRef = useRef({ endsAt: startedAt + durationMs, frozenUntil: 0 })
  const [view, setView] = useState({ msLeft: durationMs, frozenMs: 0 })

  function read(now = Date.now()) {
    const clock = clockRef.current
    const frozenMs = Math.max(0, clock.frozenUntil - now)
    return { msLeft: Math.max(0, clock.endsAt - now - frozenMs), frozenMs }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const next = read()
      setView(next)
      if (next.msLeft === 0) clearInterval(interval)
    }, TICK_MS)
    return () => clearInterval(interval)
  }, [])

  // Adds (or with a negative amount, removes) time. Returns the change that
  // actually applied after the cap and the zero floor.
  function addTime(ms) {
    const now = Date.now()
    const { msLeft, frozenMs } = read(now)
    if (msLeft === 0) return 0
    const nextLeft = Math.max(0, Math.min(maxMs, msLeft + ms))
    clockRef.current.endsAt = now + frozenMs + nextLeft
    setView({ msLeft: nextLeft, frozenMs })
    return nextLeft - msLeft
  }

  // Stops the clock for ms. Freezing again while frozen adds to the freeze.
  function freeze(ms) {
    const now = Date.now()
    const clock = clockRef.current
    if (read(now).msLeft === 0) return
    clock.frozenUntil = Math.max(clock.frozenUntil, now) + ms
    clock.endsAt += ms
    setView(read(now))
  }

  return {
    msLeft: view.msLeft,
    frozenMs: view.frozenMs,
    addTime,
    freeze,
  }
}
