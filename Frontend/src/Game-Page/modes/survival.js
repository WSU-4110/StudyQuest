import survivalIcon from '../../assets/game-modes/survival.svg'
import Survival from '../Survival.jsx'

/** @type {import('../gameModes.js').GameModeStrategy} */
export const survival = {
  id: 'survival',
  icon: survivalIcon,
  name: 'Survival',
  scoreLabel: 'correct answers',
  tagline: 'No timer. Three lives. How far can you go?',
  rules: [
    'You start with 3 lives.',
    'Each wrong answer costs a life.',
    'Your score is how many you answer correctly before you run out.',
    'Cards reshuffle if you get through the whole set.',
  ],
  settings: {
    lives: 3,
  },
  minCards: 1,
  Component: Survival,
  isEligibleCard: () => true,
  calculateXp: ({ correct = 0 }) => correct * 15,
}
