// Meters run for one right answer. streak includes the answer being scored,
// so the 3rd right in a row is doubled. The Double power-up doubles it again.
export function getSpeedRoundDistance(settings, { streak, msTaken }, doubled) {
  const { metersPerCorrect, maxSpeedBonus, speedBonusWindowMs } = settings
  const speedFraction = Math.max(0, 1 - msTaken / speedBonusWindowMs)
  let meters = metersPerCorrect + Math.round(maxSpeedBonus * speedFraction)
  if (streak >= settings.streakForMultiplier) meters *= settings.streakMultiplier
  if (doubled) meters *= 2
  return meters
}

export function getBossMaxHp(settings, questionCount) {
  const hp = questionCount * settings.bossHpPerCard
  return Math.min(Math.max(hp, settings.minBossHp), settings.maxBossHp)
}
