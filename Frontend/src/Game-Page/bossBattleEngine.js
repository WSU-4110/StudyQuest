export const BOSS_NAME = 'Slime King'

const NORMAL_ATTACKS = ['Goo Splash', 'Crown Bash']
const CHARGED_ATTACK = 'Goo Avalanche'

export function getMoveDamage(settings, move, streak) {
  if (move.kind !== 'attack') return { damage: 0, crit: false }
  const crit = streak >= settings.critStreak
  const damage = Math.round(move.damage * (crit ? settings.critMultiplier : 1))
  return { damage, crit }
}

export function createBattle(settings, bossMaxHp) {
  return {
    playerHp: settings.playerMaxHp,
    playerMaxHp: settings.playerMaxHp,
    bossHp: bossMaxHp,
    bossMaxHp,
    uses: Object.fromEntries(
      settings.moves.map((move) => [move.id, move.uses]),
    ),
    guarded: false,
    charging: false,
    enraged: false,
    attacksUntilCharge: settings.attacksBeforeCharge,
    over: false,
    won: false,
  }
}

function randomInt(random, min, max) {
  return min + Math.floor(random() * (max - min + 1))
}

function playerTurn(battle, { move, correct, damage, crit }, say) {
  say(`You used ${move.name}!`)

  if (!correct) {
    if (move.kind === 'attack') say('Wrong answer. Your attack missed!')
    if (move.kind === 'guard') {
      say('Wrong answer. You stumbled out of your stance!')
    }
    if (move.kind === 'heal') say('Wrong answer. The potion fizzled out!')
    return
  }

  if (move.kind === 'attack') {
    battle.bossHp = Math.max(0, battle.bossHp - damage)
    if (crit) say('A critical hit!')
    say(`${BOSS_NAME} took ${damage} damage.`, {
      anim: 'boss-hit',
      amount: damage,
    })
  } else if (move.kind === 'guard') {
    battle.guarded = true
    say("You raise your guard. The next attack won't land!", { anim: 'guard' })
  } else if (move.kind === 'heal') {
    const healed = Math.min(move.heal, battle.playerMaxHp - battle.playerHp)
    battle.playerHp += healed
    say(`You recovered ${healed} HP.`, { anim: 'heal', amount: healed })
  }
}

function bossTurn(battle, settings, random, say) {
  const bonus = battle.enraged ? settings.enrageBonus : 0
  let attackName
  let damage

  if (battle.charging) {
    battle.charging = false
    battle.attacksUntilCharge = settings.attacksBeforeCharge
    attackName = CHARGED_ATTACK
    damage = settings.bossChargedDamage + bonus
  } else if (battle.attacksUntilCharge <= 0) {
    battle.charging = true
    say(`${BOSS_NAME} is gathering goo for a huge attack. Guard next turn!`, {
      anim: 'charge',
    })
    return
  } else {
    battle.attacksUntilCharge -= 1
    attackName = NORMAL_ATTACKS[randomInt(random, 0, NORMAL_ATTACKS.length - 1)]
    damage =
      randomInt(random, settings.bossAttackMin, settings.bossAttackMax) + bonus
  }

  say(`${BOSS_NAME} used ${attackName}!`, { anim: 'boss-attack' })

  if (battle.guarded) {
    battle.guarded = false
    say('You blocked it completely!', { anim: 'guard' })
    return
  }

  battle.playerHp = Math.max(0, battle.playerHp - damage)
  say(`You took ${damage} damage.`, { anim: 'player-hit', amount: damage })
}

// Returns the battle after one full round plus the messages to play back.
// Each message carries an HP snapshot so the bars update as the text plays.
export function resolveRound(battle, action, settings, random = Math.random) {
  const next = { ...battle, uses: { ...battle.uses } }
  const messages = []
  const say = (text, extra = {}) =>
    messages.push({
      text,
      ...extra,
      snapshot: { playerHp: next.playerHp, bossHp: next.bossHp },
    })

  if (next.uses[action.move.id] != null) next.uses[action.move.id] -= 1

  playerTurn(next, action, say)

  if (next.bossHp <= 0) {
    next.over = true
    next.won = true
    say(`${BOSS_NAME} was defeated!`, { anim: 'boss-defeated' })
    return { next, messages }
  }

  if (!next.enraged && next.bossHp <= next.bossMaxHp / 2) {
    next.enraged = true
    say(`${BOSS_NAME} is furious! Its attacks grow stronger.`, {
      anim: 'enrage',
    })
  }

  bossTurn(next, settings, random, say)

  if (next.playerHp <= 0) {
    next.over = true
    say('You were knocked out...', { anim: 'player-defeated' })
  }

  return { next, messages }
}
