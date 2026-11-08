import bossBattleIcon from '../../assets/game-modes/boss-battle.svg'
import BossBattle from '../BossBattle.jsx'

/** @type {import('../gameModes.js').GameModeStrategy} */
export const bossBattle = {
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
  Component: BossBattle,
  isEligibleCard: () => true,
  calculateXp: ({ correct = 0, won = false }) => correct * 10 + (won ? 100 : 0),
}
