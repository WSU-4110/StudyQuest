import memoryFlipIcon from '../../assets/game-modes/memory-flip.svg'

function hasSingleAnswer(card) {
  const type = card.type ?? 'short_answer'
  if (type === 'short_answer') return Boolean(String(card.answer ?? '').trim())
  if (type === 'multiple_choice') return (card.correctIndexes ?? []).length === 1
  // True/false answers aren't unique, so they can't form distinct pairs.
  return false
}

/** @type {import('../gameModes.js').GameModeStrategy} */
export const memoryFlip = {
  id: 'memory-flip',
  icon: memoryFlipIcon,
  name: 'Memory Flip',
  scoreLabel: 'points',
  tagline: 'Flip tiles to match each question with its answer.',
  rules: [
    'Tiles start face down. Flip two at a time.',
    'A question and its answer stay face up when matched.',
    'Up to 8 pairs per game. Fewer mismatches means more XP.',
    'Uses short-answer cards and multiple-choice cards with one correct option.',
  ],
  settings: {
    maxPairs: 8,
  },
  minCards: 3,
  // Not built yet, so GamePage shows "Coming soon".
  Component: null,
  isEligibleCard: hasSingleAnswer,
  calculateXp: ({ pairs = 0, mismatches = 0 }) => pairs * 20 - mismatches * 5,
}
