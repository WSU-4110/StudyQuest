import bossBattleIcon from '../assets/game-modes/boss-battle.svg'
import memoryFlipIcon from '../assets/game-modes/memory-flip.svg'
import speedRoundIcon from '../assets/game-modes/speed-round.svg'
import survivalIcon from '../assets/game-modes/survival.svg'

function getCardType(card) {
  return card.type ?? 'short_answer'
}

function hasSingleAnswer(card) {
  const type = getCardType(card)
  if (type === 'short_answer') return Boolean(String(card.answer ?? '').trim())
  if (type === 'multiple_choice') return (card.correctIndexes ?? []).length === 1
  // True/false answers aren't unique, so they can't form distinct pairs.
  return false
}

export const GAME_MODES = [
  {
    id: 'speed-round',
    icon: speedRoundIcon,
    name: 'Speed Round',
    tagline: 'Answer as many as you can before time runs out.',
    rules: [
      '60 seconds on the clock.',
      '+100 points per correct answer, plus up to +50 for answering fast.',
      '3 correct in a row doubles your points until you miss.',
      'Cards reshuffle if you get through the whole set.',
    ],
    settings: {
      durationSeconds: 60,
      pointsPerCorrect: 100,
      maxSpeedBonus: 50,
      streakForMultiplier: 3,
      streakMultiplier: 2,
    },
    minCards: 1,
    isEligibleCard: () => true,
  },
  {
    id: 'survival',
    icon: survivalIcon,
    name: 'Survival',
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
    isEligibleCard: () => true,
  },
  {
    id: 'boss-battle',
    icon: bossBattleIcon,
    name: 'Boss Battle',
    tagline: 'Defeat the boss with correct answers.',
    rules: [
      'The boss has 100 HP for every card in the set.',
      'Correct answers deal 100 damage, +50 while on a 3-answer streak.',
      'Wrong answers cost you 1 of your 5 hearts.',
      'Win by bringing the boss to 0 HP before your hearts run out.',
    ],
    settings: {
      playerHearts: 5,
      bossHpPerCard: 100,
      damagePerHit: 100,
      streakDamageBonus: 50,
      streakForBonus: 3,
    },
    minCards: 1,
    isEligibleCard: () => true,
  },
  {
    id: 'memory-flip',
    icon: memoryFlipIcon,
    name: 'Memory Flip',
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
    isEligibleCard: hasSingleAnswer,
  },
]

export function getGameMode(modeId) {
  return GAME_MODES.find((mode) => mode.id === modeId) ?? null
}

export function getEligibleCards(mode, cards) {
  return (cards ?? []).filter((card) => mode.isEligibleCard(card))
}
