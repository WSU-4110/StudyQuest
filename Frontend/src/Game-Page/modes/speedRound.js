import speedRoundIcon from '../../assets/game-modes/speed-round.svg'
import SpeedRound from '../SpeedRound.jsx'

/** @type {import('../gameModes.js').GameModeStrategy} */
export const speedRound = {
  id: 'speed-round',
  icon: speedRoundIcon,
  name: 'Speed Round',
  scoreLabel: 'points',
  tagline: 'Answer as many as you can before time runs out.',
  rules: [
    '60 seconds on the clock.',
    '+100 points per correct answer, plus up to +50 for answering within 5 seconds.',
    '3 correct in a row doubles your points until you miss.',
    'Cards reshuffle if you get through the whole set.',
  ],
  settings: {
    durationSeconds: 60,
    pointsPerCorrect: 100,
    maxSpeedBonus: 50,
    speedBonusWindowMs: 5000,
    streakForMultiplier: 3,
    streakMultiplier: 2,
  },
  minCards: 1,
  Component: SpeedRound,
  isEligibleCard: () => true,
  calculateXp: ({ score = 0 }) => score / 10,
}
