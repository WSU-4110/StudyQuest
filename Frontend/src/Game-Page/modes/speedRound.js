import speedRoundIcon from '../../assets/game-modes/speed-round.svg'
import powerUpIcon from '../../assets/game-modes/powerup-freeze.svg'
import clockIcon from '../../assets/game-modes/rule-clock.svg'
import flameIcon from '../../assets/game-modes/rule-flame.svg'
import SpeedRound from '../SpeedRound.jsx'

/** @type {import('../gameModes.js').GameModeStrategy} */
export const speedRound = {
  id: 'speed-round',
  icon: speedRoundIcon,
  name: 'Speed Round',
  scoreLabel: 'meters',
  tagline: 'Race the clock. Right answers buy more time.',
  quickRules: [
    { icon: speedRoundIcon, text: 'Answer fast to run farther' },
    { icon: clockIcon, text: 'Right +2s, wrong −3s' },
    { icon: flameIcon, text: '3 in a row: 2× distance' },
    { icon: powerUpIcon, text: 'Every 4th card has a power-up' },
  ],
  settings: {
    durationSeconds: 60,
    maxSeconds: 60,
    timeGainSeconds: 2,
    timePenaltySeconds: 3,
    metersPerCorrect: 10,
    maxSpeedBonus: 5,
    speedBonusWindowMs: 5000,
    streakForMultiplier: 3,
    streakMultiplier: 2,
    pickupEvery: 4,
    freezeSeconds: 5,
    doubleSeconds: 10,
    maxSkips: 3,
  },
  minCards: 1,
  Component: SpeedRound,
  isEligibleCard: () => true,
  // score is meters run, about a tenth of the old point totals.
  calculateXp: ({ score = 0 }) => score,
}
