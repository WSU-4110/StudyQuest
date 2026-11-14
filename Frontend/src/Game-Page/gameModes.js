import { bossBattle } from './modes/bossBattle.js'
import { memoryFlip } from './modes/memoryFlip.js'
import { speedRound } from './modes/speedRound.js'
import { survival } from './modes/survival.js'

/**
 * Strategy pattern: each game mode is a strategy object with the same shape,
 * so GamePage, rewards and the study set page can run any mode without
 * checking which one it is. To add a mode, create a strategy in ./modes and
 * list it in GAME_MODES. Nothing else needs to change.
 *
 * @typedef {object} GameModeStrategy
 * @property {string} id URL slug, e.g. 'speed-round'.
 * @property {string} icon
 * @property {string} name
 * @property {string} scoreLabel What the round's score counts.
 * @property {string} tagline
 * @property {{icon: string, text: string}[]} quickRules Short lines with icons
 *   on the start screen.
 * @property {object} settings Tuning values passed to Component.
 * @property {number} minCards Eligible cards needed to play.
 * @property {import('react').ComponentType<{questions: object[], settings: object, onFinish: (result: object) => void, recordKey: string}> | null} Component
 *   Plays one round and calls onFinish with the result. null if the mode isn't built yet.
 * @property {(card: object) => boolean} isEligibleCard Whether this mode can use a card.
 * @property {(result: object) => number} calculateXp Raw XP for a finished round.
 *   calculateRewards rounds and caps it.
 * @property {{min: number, countPairs: (questions: object[]) => number}} [pairPicker]
 *   Optional. When set, the start screen asks how many pairs to play and
 *   passes the choice to Component as settings.maxPairs.
 */

/** @type {GameModeStrategy[]} */
export const GAME_MODES = [speedRound, survival, bossBattle, memoryFlip]

export function getGameMode(modeId) {
  return GAME_MODES.find((mode) => mode.id === modeId) ?? null
}

export function getEligibleCards(mode, cards) {
  return (cards ?? []).filter((card) => mode.isEligibleCard(card))
}
