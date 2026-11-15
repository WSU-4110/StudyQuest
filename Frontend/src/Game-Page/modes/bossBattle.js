import bossBattleIcon from '../../assets/game-modes/boss-battle.svg'
import bossIcon from '../../assets/game-modes/boss-slime.svg'
import wrongIcon from '../../assets/game-modes/card-icon-false.svg'
import rightIcon from '../../assets/game-modes/card-icon-true.svg'
import starIcon from '../../assets/game-modes/dizzy-star.svg'
import shieldIcon from '../../assets/game-modes/perk-shield.svg'
import BossBattle from '../BossBattle.jsx'

/** @type {import('../gameModes.js').GameModeStrategy} */
export const bossBattle = {
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
  Component: BossBattle,
  isEligibleCard: () => true,
  calculateXp: ({ correct = 0, won = false }) => correct * 10 + (won ? 100 : 0),
}
