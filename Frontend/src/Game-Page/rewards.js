// XP cap must match public.award_activity_rewards (Backend/schema.sql).
export const MAX_XP_PER_GAME = 500
export const XP_PER_LEVEL = 500

function clamp(value, max) {
  return Math.min(Math.max(Math.floor(value), 0), max)
}

export function calculateRewards(modeId, result) {
  const { score = 0, correct = 0, won = false, pairs = 0, mismatches = 0 } =
    result ?? {}

  let xp = 0

  if (modeId === 'speed-round') {
    xp = score / 10
  } else if (modeId === 'survival') {
    xp = correct * 15
  } else if (modeId === 'boss-battle') {
    xp = correct * 10 + (won ? 100 : 0)
  } else if (modeId === 'memory-flip') {
    xp = pairs * 20 - mismatches * 5
  }

  return { xp: clamp(xp, MAX_XP_PER_GAME) }
}
