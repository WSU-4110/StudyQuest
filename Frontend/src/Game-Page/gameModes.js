import bossBattleIcon from '../assets/game-modes/boss-battle.svg'
import memoryFlipIcon from '../assets/game-modes/memory-flip.svg'
import speedRoundIcon from '../assets/game-modes/speed-round.svg'
import survivalIcon from '../assets/game-modes/survival.svg'
import bossIcon from '../assets/game-modes/boss-slime.svg'
import wrongIcon from '../assets/game-modes/card-icon-false.svg'
import questionIcon from '../assets/game-modes/card-icon-question.svg'
import rightIcon from '../assets/game-modes/card-icon-true.svg'
import starIcon from '../assets/game-modes/dizzy-star.svg'
import ghostIcon from '../assets/game-modes/dungeon-ghost.svg'
import heartIcon from '../assets/game-modes/perk-heart.svg'
import shieldIcon from '../assets/game-modes/perk-shield.svg'
import powerUpIcon from '../assets/game-modes/powerup-freeze.svg'
import clockIcon from '../assets/game-modes/rule-clock.svg'
import flameIcon from '../assets/game-modes/rule-flame.svg'
import stairsIcon from '../assets/game-modes/rule-stairs.svg'

function getCardType(card) {
  return card.type ?? 'short_answer'
}

// Each mode's quickRules are the short lines with icons on its start screen.

// Match Up needs one answer per card. True/false statements are sorted onto
// shared True and False cards instead of getting their own answer card.
function isMatchable(card) {
  const type = getCardType(card)
  if (type === 'short_answer') return Boolean(String(card.answer ?? '').trim())
  if (type === 'multiple_choice') return (card.correctIndexes ?? []).length === 1
  if (type === 'true_false') return typeof card.answer === 'boolean'
  return false
}

export const GAME_MODES = [
  {
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
    isEligibleCard: () => true,
  },
  {
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
    isEligibleCard: () => true,
  },
  {
    id: 'boss-battle',
    icon: bossBattleIcon,
    name: 'Boss Battle',
    scoreLabel: 'damage dealt',
    tagline: 'A turn-based duel with the Slime King.',
    quickRules: [
      { icon: bossIcon, text: 'Bring the Slime King to 0 HP' },
      { icon: rightIcon, text: 'Answer right to land your move' },
      { icon: wrongIcon, text: 'Wrong answer: your move misses' },
      { icon: shieldIcon, text: 'Guard when it charges up' },
      { icon: starIcon, text: '3 in a row: critical hits' },
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
    // The id stays 'memory-flip' so rewards and saved links keep working.
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
    isEligibleCard: isMatchable,
  },
]

export function getGameMode(modeId) {
  return GAME_MODES.find((mode) => mode.id === modeId) ?? null
}

export function getEligibleCards(mode, cards) {
  return (cards ?? []).filter((card) => mode.isEligibleCard(card))
}
