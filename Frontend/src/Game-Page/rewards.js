// Must match the caps in public.award_rewards (Backend/schema.sql).
export const MAX_XP_PER_GAME = 500
export const MAX_CURRENCY_PER_GAME = 100

function clamp(value, max) {
  return Math.min(Math.max(Math.floor(value), 0), max)
}

export function calculateRewards(modeId, result) {
  const { score = 0, correct = 0, won = false, pairs = 0, mismatches = 0 } =
    result ?? {}

  let xp = 0
  let currency = 0

  if (modeId === 'speed-round') {
    xp = score / 10
    currency = correct * 2
  } else if (modeId === 'survival') {
    xp = correct * 15
    currency = correct * 2
  } else if (modeId === 'boss-battle') {
    xp = correct * 10 + (won ? 100 : 0)
    currency = correct * 2 + (won ? 20 : 0)
  } else if (modeId === 'memory-flip') {
    xp = pairs * 20 - mismatches * 5
    currency = pairs * 3
  }

  return {
    xp: clamp(xp, MAX_XP_PER_GAME),
    currency: clamp(currency, MAX_CURRENCY_PER_GAME),
  }
}
