import survivalIcon from '../../assets/game-modes/survival.svg'
import ghostIcon from '../../assets/game-modes/dungeon-ghost.svg'
import heartIcon from '../../assets/game-modes/perk-heart.svg'
import shieldIcon from '../../assets/game-modes/perk-shield.svg'
import stairsIcon from '../../assets/game-modes/rule-stairs.svg'
import Survival from '../Survival.jsx'

/** @type {import('../gameModes.js').GameModeStrategy} */
export const survival = {
  id: 'survival',
  icon: survivalIcon,
  name: 'Survival',
  scoreLabel: 'floors deep',
  tagline: 'No timer. Descend the dungeon one right answer at a time.',
  quickRules: [
    { icon: stairsIcon, text: 'Right answer: one floor deeper' },
    { icon: survivalIcon, text: 'Wrong answer: lose a heart' },
    { icon: heartIcon, text: '5 in a row heals a heart' },
    { icon: shieldIcon, text: 'Every 5 floors: pick an upgrade' },
    { icon: ghostIcon, text: 'Missed cards come back as ghosts' },
  ],
  settings: {
    lives: 3,
    maxLives: 5,
    regenStreak: 5,
    checkpointEvery: 5,
    ghostDelay: 3,
    ghostBonusFloors: 1,
  },
  minCards: 1,
  Component: Survival,
  isEligibleCard: () => true,
  calculateXp: ({ correct = 0 }) => correct * 15,
}
