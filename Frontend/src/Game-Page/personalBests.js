// Personal bests (the Speed Round ghost, the deepest Survival run) live in
// this browser's localStorage, keyed by game mode, account and study set.
const PREFIX = 'studyquest:best'

function storageKey(modeId, recordKey) {
  return `${PREFIX}:${modeId}:${recordKey}`
}

export function loadBest(modeId, recordKey) {
  if (!recordKey) return null
  try {
    const raw = localStorage.getItem(storageKey(modeId, recordKey))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveBest(modeId, recordKey, best) {
  if (!recordKey) return
  try {
    localStorage.setItem(storageKey(modeId, recordKey), JSON.stringify(best))
  } catch {
    // Storage can be full or blocked (private mode). A lost record is fine.
  }
}
