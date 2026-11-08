// streak includes the answer being scored, so the 3rd correct in a row is doubled.
export function getSpeedRoundPoints(settings, { streak, msTaken }) {
  const { pointsPerCorrect, maxSpeedBonus, speedBonusWindowMs } = settings
  const speedFraction = Math.max(0, 1 - msTaken / speedBonusWindowMs)
  const base = pointsPerCorrect + Math.round(maxSpeedBonus * speedFraction)
  return streak >= settings.streakForMultiplier
    ? base * settings.streakMultiplier
    : base
}

export function getBossMaxHp(settings, questionCount) {
  return Math.min(questionCount * settings.bossHpPerCard, settings.maxBossHp)
}

export function getBossDamage(settings, { streak }) {
  return streak >= settings.streakForBonus
    ? settings.damagePerHit + settings.streakDamageBonus
    : settings.damagePerHit
}
