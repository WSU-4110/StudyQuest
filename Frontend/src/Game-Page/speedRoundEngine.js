export const POWER_UPS = {
  freeze: { name: 'Freeze', effect: 'Clock frozen' },
  double: { name: 'Double', effect: '2× distance' },
  skip: { name: 'Skip', effect: 'Skip a card' },
}

const KINDS = Object.keys(POWER_UPS)

// Every pickupEvery-th card carries a power-up. The kind comes from a hash of
// the round's seed and the turn, so a card keeps the same power-up across
// re-renders without storing it.
export function getPickup(settings, seed, turn) {
  if ((turn + 1) % settings.pickupEvery !== 0) return null
  const hash = Math.imul(seed ^ Math.imul(turn + 1, 2654435761), 2246822519)
  return KINDS[(hash >>> 0) % KINDS.length]
}

