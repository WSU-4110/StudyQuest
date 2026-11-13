import { formatCorrectAnswer } from './gameEngine.js'

export const PERKS = {
  shield: { name: 'Shield', description: 'Blocks your next wrong answer.' },
  fifty: {
    name: '50/50',
    description: 'Knocks out wrong options on a multiple-choice card.',
  },
  hint: { name: 'Hint', description: 'Shows the first letter of a short answer.' },
  heart: { name: 'Heart Container', description: '+1 max heart, and heals one.' },
}

export const ITEM_CAP = 3

export function canUseFifty(question) {
  if (question?.type !== 'multiple_choice') return false
  return question.options.length - question.correctIndexes.length >= 2
}

export function canUseHint(question) {
  return question?.type === 'short_answer'
}

// Only offer upgrades that can actually help with this set and aren't maxed.
export function getEligiblePerks(state, questions, settings) {
  const perks = []
  if (state.shields < ITEM_CAP) perks.push('shield')
  if (state.items.fifty < ITEM_CAP && questions.some(canUseFifty)) {
    perks.push('fifty')
  }
  if (state.items.hint < ITEM_CAP && questions.some(canUseHint)) {
    perks.push('hint')
  }
  if (state.maxLives < settings.maxLives) perks.push('heart')
  return perks
}

export function choosePerks(eligible, random = Math.random) {
  const pool = [...eligible]
  const picked = []
  while (picked.length < 2 && pool.length > 0) {
    picked.push(pool.splice(Math.floor(random() * pool.length), 1)[0])
  }
  return picked
}

// Removes up to two wrong options, always leaving at least one wrong option
// so the card is still a choice.
export function pickEliminated(question, random = Math.random) {
  const wrong = question.options
    .map((_, index) => index)
    .filter((index) => !question.correctIndexes.includes(index))
  const count = Math.min(2, wrong.length - 1)
  const picked = []
  while (picked.length < count) {
    picked.push(wrong.splice(Math.floor(random() * wrong.length), 1)[0])
  }
  return picked
}

export function getHint(question) {
  const answer = String(formatCorrectAnswer(question)).trim()
  return `Starts with "${answer.charAt(0).toUpperCase()}"`
}

// Missed cards wait in a queue and return as ghosts a few cards later.
export function queueGhost(queue, index, turn, settings) {
  if (queue.some((ghost) => ghost.index === index)) return queue
  return [...queue, { index, dueTurn: turn + settings.ghostDelay }]
}

export function takeDueGhost(queue, nextTurn) {
  const at = queue.findIndex((ghost) => ghost.dueTurn <= nextTurn)
  if (at === -1) return null
  return { ghost: queue[at], rest: [...queue.slice(0, at), ...queue.slice(at + 1)] }
}

export function crossedCheckpoint(before, after, every) {
  return Math.floor(after / every) > Math.floor(before / every)
}
