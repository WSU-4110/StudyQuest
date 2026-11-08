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
    isEligibleCard: () => true,
  },
  {
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
    isEligibleCard: () => true,
  },
  {
    id: 'boss-battle',
    icon: bossBattleIcon,
    name: 'Boss Battle',
    scoreLabel: 'damage dealt',
    tagline: 'A turn-based duel with the Slime King.',
    rules: [
      'Each turn, pick a move, then answer a question to pull it off.',
      'Right answer: your move works. Wrong answer: it misses.',
      'The Slime King strikes back every turn. Guard against its charged attack.',
      '3 right in a row lands critical hits for 1.5× damage.',
    ],
    settings: {
      playerMaxHp: 100,
      bossHpPerCard: 100,
      minBossHp: 300,
      maxBossHp: 1000,
      critStreak: 3,
      critMultiplier: 1.5,
      bossAttackMin: 8,
      bossAttackMax: 14,
      bossChargedDamage: 30,
      enrageBonus: 4,
      attacksBeforeCharge: 2,
      moves: [
        {
          id: 'strike',
          name: 'Strike',
          kind: 'attack',
          damage: 100,
          uses: null,
          description: '100 damage',
        },
        {
          id: 'power-slam',
          name: 'Power Slam',
          kind: 'attack',
          damage: 180,
          uses: 3,
          description: '180 damage',
        },
        {
          id: 'guard',
          name: 'Guard',
          kind: 'guard',
          uses: 3,
          description: 'Block the next attack',
        },
        {
          id: 'potion',
          name: 'Potion',
          kind: 'heal',
          heal: 40,
          uses: 2,
          description: 'Heal 40 HP',
        },
      ],
    },
    minCards: 1,
    isEligibleCard: () => true,
  },
  {
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
    isEligibleCard: hasSingleAnswer,
  },
]

export function getGameMode(modeId) {
  return GAME_MODES.find((mode) => mode.id === modeId) ?? null
}

export function getEligibleCards(mode, cards) {
  return (cards ?? []).filter((card) => mode.isEligibleCard(card))
}
