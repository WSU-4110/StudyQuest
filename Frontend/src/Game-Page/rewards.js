// XP cap must match public.award_activity_rewards (Backend/schema.sql).
export const MAX_XP_PER_GAME = 500
export const XP_PER_LEVEL = 500

function clamp(value, max) {
  return Math.min(Math.max(Math.floor(value), 0), max)
}

// Each mode's strategy supplies its own XP formula; the cap is shared.
export function calculateRewards(mode, result) {
  const xp = mode.calculateXp(result ?? {})
  return { xp: clamp(xp, MAX_XP_PER_GAME) }
}
