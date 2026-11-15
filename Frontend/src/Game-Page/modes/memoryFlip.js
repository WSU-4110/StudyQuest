import memoryFlipIcon from '../../assets/game-modes/memory-flip.svg'
import wrongIcon from '../../assets/game-modes/card-icon-false.svg'
import questionIcon from '../../assets/game-modes/card-icon-question.svg'
import rightIcon from '../../assets/game-modes/card-icon-true.svg'
import flameIcon from '../../assets/game-modes/rule-flame.svg'
import MemoryFlip from '../MemoryFlip.jsx'
import { countPairs } from '../memoryFlipEngine.js'

// Match Up needs one answer per card. True/false statements are sorted onto
// shared True and False cards instead of getting their own answer card.
function isMatchable(card) {
  const type = card.type ?? 'short_answer'
  if (type === 'short_answer') return Boolean(String(card.answer ?? '').trim())
  if (type === 'multiple_choice') return (card.correctIndexes ?? []).length === 1
  if (type === 'true_false') return typeof card.answer === 'boolean'
  return false
}

/** @type {import('../gameModes.js').GameModeStrategy} */
export const memoryFlip = {
  // The id stays 'memory-flip' so saved links and results keep working.
  id: 'memory-flip',
  icon: memoryFlipIcon,
  name: 'Match Up',
  scoreLabel: 'points',
  tagline: 'Match each question to its answer.',
  quickRules: [
    { icon: questionIcon, text: 'Pick a question, then its answer' },
    { icon: rightIcon, text: 'Sort true/false onto True or False' },
    { icon: flameIcon, text: 'Matches in a row score more' },
    { icon: wrongIcon, text: 'Fewer misses, more XP' },
  ],
  settings: {
    maxPairs: 8,
    pointsPerMatch: 100,
    streakBonus: 50,
  },
  minCards: 3,
  Component: MemoryFlip,
  isEligibleCard: isMatchable,
  calculateXp: ({ pairs = 0, mismatches = 0 }) => pairs * 20 - mismatches * 5,
  // The start screen asks how many pairs to play.
  pairPicker: { min: 3, countPairs },
}
