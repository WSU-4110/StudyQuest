import { useEffect, useReducer, useRef } from 'react'
import answerIcon from '../assets/game-modes/card-icon-answer.svg'
import falseIcon from '../assets/game-modes/card-icon-false.svg'
import questionIcon from '../assets/game-modes/card-icon-question.svg'
import trueIcon from '../assets/game-modes/card-icon-true.svg'
import sparkleSprite from '../assets/game-modes/dizzy-star.svg'
import {
  addSoftHyphens,
  dealPairs,
  getMatchPoints,
  isMatch,
  recordMiss,
} from './memoryFlipEngine.js'

// Match Up (mode id "memory-flip"): every card is face up. Pick a question,
// then its answer (or the other way round).
const MISS_MS = 700
const CLEARED_MS = 1600
const SPARKLES = [
  { dx: '-55%', dy: '-90%' },
  { dx: '55%', dy: '-90%' },
  { dx: '-55%', dy: '90%' },
  { dx: '55%', dy: '90%' },
]
// Matched pairs share a numbered badge in one of these colors.
const PAIR_COLORS = [
  '#3a5bd9',
  '#d64545',
  '#1f9d55',
  '#c98a00',
  '#8a4fd8',
  '#e0661b',
  '#0f8b8d',
  '#c2378c',
]
const KIND_LABELS = { question: 'Question', answer: 'Answer' }
const KIND_ICONS = { question: questionIcon, answer: answerIcon }

function getIcon(tile) {
  if (tile.bin) return tile.value ? trueIcon : falseIcon
  return KIND_ICONS[tile.kind]
}

function isStatement(tile) {
  return tile.kind === 'question' && tile.question.type === 'true_false'
}

function init({ questions, settings }) {
  const { questionTiles, answerTiles, bins } = dealPairs(questions, settings)
  return {
    settings,
    questionTiles,
    answerTiles,
    bins,
    totalPairs: questionTiles.length,
    selected: null,
    wrong: null,
    matched: [],
    phase: 'playing',
    last: null,
    stats: {
      score: 0,
      pairs: 0,
      mismatches: 0,
      streak: 0,
      bestStreak: 0,
      missed: [],
    },
  }
}

function findTile(state, id) {
  return (
    state.questionTiles.find((tile) => tile.id === id) ??
    state.answerTiles.find((tile) => tile.id === id) ??
    state.bins.find((tile) => tile.id === id)
  )
}

// The True and False cards stay in play until every statement is sorted.
function statementsLeft(state) {
  return state.questionTiles.some(
    (tile) => isStatement(tile) && !state.matched.includes(tile.pairId),
  )
}

function reducer(state, action) {
  switch (action.type) {
    case 'pick': {
      const tile = findTile(state, action.id)
      if (!tile || state.phase === 'cleared') return state
      if (state.matched.includes(tile.pairId)) return state
      if (tile.bin && !statementsLeft(state)) return state
      // Picking during a miss flash clears it right away.
      const base =
        state.phase === 'miss' ? { ...state, phase: 'playing', wrong: null } : state
      const selected = base.selected ? findTile(base, base.selected) : null

      if (!selected) return { ...base, selected: tile.id }
      if (selected.id === tile.id) return { ...base, selected: null }
      if (selected.kind === tile.kind) return { ...base, selected: tile.id }

      const [question, answer] =
        selected.kind === 'question' ? [selected, tile] : [tile, selected]
      const ids = [question.id, answer.id]
      const n = (state.last?.n ?? 0) + 1

      if (isMatch(question, answer)) {
        const streak = base.stats.streak + 1
        const points = getMatchPoints(base.settings, streak)
        const matched = [...base.matched, question.pairId]
        return {
          ...base,
          selected: null,
          matched,
          phase: matched.length === base.totalPairs ? 'cleared' : 'playing',
          last: { kind: 'match', ids, points, streak, n },
          stats: {
            ...base.stats,
            score: base.stats.score + points,
            pairs: base.stats.pairs + 1,
            streak,
            bestStreak: Math.max(base.stats.bestStreak, streak),
          },
        }
      }

      return {
        ...base,
        selected: null,
        phase: 'miss',
        wrong: ids,
        last: { kind: 'miss', ids, n },
        stats: {
          ...base.stats,
          mismatches: base.stats.mismatches + 1,
          streak: 0,
          missed: recordMiss(base.stats.missed, question, answer),
        },
      }
    }
    case 'clear-miss':
      return state.phase === 'miss'
        ? { ...state, phase: 'playing', wrong: null }
        : state
    default:
      return state
  }
}

function toResult(stats, outcome) {
  return {
    score: stats.score,
    correct: stats.pairs,
    answered: stats.pairs + stats.mismatches,
    bestStreak: stats.bestStreak,
    missed: stats.missed,
    pairs: stats.pairs,
    mismatches: stats.mismatches,
    outcome,
  }
}

function getCardStatus(state, tile) {
  if (state.matched.includes(tile.pairId)) return 'matched'
  if (tile.bin && !statementsLeft(state)) return 'done'
  if (state.wrong?.includes(tile.id)) return 'wrong'
  if (state.selected === tile.id) return 'selected'
  return ''
}

function MatchCard({ tile, index, status, pairNumbers, celebration, onPick }) {
  let label = tile.bin ? `${tile.text} card` : `${KIND_LABELS[tile.kind]}: ${tile.text}`
  if (pairNumbers.length > 0) {
    label += tile.bin
      ? `. Holds pairs ${pairNumbers.join(', ')}`
      : `. Matched, pair ${pairNumbers[0]}`
  }
  let className = `match-card ${status}`
  if (tile.bin) className += ` bin bin-${tile.value}`

  return (
    <div className="match-slot" style={{ '--i': index }}>
      <button
        type="button"
        className={className}
        onClick={() => onPick(tile.id)}
        disabled={status === 'matched' || status === 'done'}
        aria-pressed={status === 'selected'}
        aria-label={label}
      >
        <img
          className="match-icon pixel-icon"
          src={getIcon(tile)}
          alt=""
          width={18}
          height={18}
        />
        <span className="match-text" aria-hidden="true">
          {addSoftHyphens(tile.text)}
        </span>
        {pairNumbers.length > 0 ? (
          <span className="match-numbers" aria-hidden="true">
            {pairNumbers.map((number) => (
              <span
                key={number}
                className="match-number"
                style={{
                  '--pair-color': PAIR_COLORS[(number - 1) % PAIR_COLORS.length],
                }}
              >
                {number}
              </span>
            ))}
          </span>
        ) : null}
        {celebration ? (
          <span key={celebration.n} className="match-celebration" aria-hidden="true">
            {SPARKLES.map(({ dx, dy }) => (
              <img
                key={`${dx}${dy}`}
                className="match-sparkle pixel-icon"
                src={sparkleSprite}
                alt=""
                style={{ '--dx': dx, '--dy': dy }}
              />
            ))}
            {celebration.points ? (
              <span className="match-popup">+{celebration.points}</span>
            ) : null}
          </span>
        ) : null}
      </button>
    </div>
  )
}

function getStatusText(state) {
  const { phase, last, stats, selected } = state
  if (phase === 'cleared') return `All matched! ${stats.score} points.`
  if (phase === 'miss') return 'Not a pair. Try again!'
  if (selected) {
    const tile = findTile(state, selected)
    if (tile.bin) return `Now pick a statement that is ${tile.text.toLowerCase()}.`
    if (isStatement(tile)) return 'True or false? Pick the True or False card.'
    return tile.kind === 'question'
      ? 'Now pick the answer that goes with it.'
      : 'Now pick the question it answers.'
  }
  if (last?.kind === 'match') {
    return last.streak > 1
      ? `Match! +${last.points} (${last.streak} in a row)`
      : `Match! +${last.points}`
  }
  return 'Pick a question, then its answer. You can start from either side.'
}

function MemoryFlip({ questions, settings, onFinish }) {
  const [state, dispatch] = useReducer(reducer, { questions, settings }, init)
  const finishedRef = useRef(false)
  const { phase, stats, last } = state

  useEffect(() => {
    if (phase !== 'miss') return undefined
    const timeout = setTimeout(() => dispatch({ type: 'clear-miss' }), MISS_MS)
    return () => clearTimeout(timeout)
  }, [phase, last])

  useEffect(() => {
    if (phase !== 'cleared' || finishedRef.current) return undefined
    const timeout = setTimeout(() => {
      finishedRef.current = true
      onFinish(toResult(stats, 'cleared'))
    }, CLEARED_MS)
    return () => clearTimeout(timeout)
  }, [phase, stats, onFinish])

  function handleQuit() {
    finishedRef.current = true
    onFinish(toResult(stats))
  }

  // A bin shows the number of every statement sorted onto it.
  function getPairNumbers(tile) {
    if (!tile.bin) {
      const at = state.matched.indexOf(tile.pairId)
      return at === -1 ? [] : [at + 1]
    }
    return state.matched.flatMap((pairId, at) => {
      const statement = state.questionTiles.find((t) => t.pairId === pairId)
      return isStatement(statement) && statement.question.answer === tile.value
        ? [at + 1]
        : []
    })
  }

  function renderCard(tile, index) {
    const celebrating = last?.kind === 'match' && last.ids.includes(tile.id)
    return (
      <MatchCard
        key={tile.id}
        tile={tile}
        index={index}
        status={getCardStatus(state, tile)}
        pairNumbers={getPairNumbers(tile)}
        celebration={
          celebrating
            ? { n: last.n, points: tile.kind === 'answer' ? last.points : null }
            : null
        }
        onPick={(id) => dispatch({ type: 'pick', id })}
      />
    )
  }

  // Full text of the cards in play, since long text is cut off on the cards.
  let shownIds = []
  if (state.selected) shownIds = [state.selected]
  else if (last && phase !== 'cleared') shownIds = last.ids
  const shownTiles = shownIds.map((id) => findTile(state, id))

  return (
    <section className="game-play match">
      <div className="game-hud">
        <div className="hud-stat">
          <span className="hud-label">Pairs</span>
          <span className="hud-value">
            {stats.pairs} / {state.totalPairs}
          </span>
        </div>
        <div className="hud-stat">
          <span className="hud-label">Misses</span>
          <span className="hud-value">{stats.mismatches}</span>
        </div>
        <div className="hud-stat">
          <span className="hud-label">Streak</span>
          <span className="hud-value">
            {stats.streak}
            {stats.streak > 1 ? (
              <span className="multiplier-badge">Combo</span>
            ) : null}
          </span>
        </div>
      </div>

      <div className={phase === 'cleared' ? 'match-board cleared' : 'match-board'}>
        <div className="match-column">
          <p className="match-heading">
            <img className="pixel-icon" src={questionIcon} alt="" />
            Questions
          </p>
          {state.questionTiles.map((tile, i) => renderCard(tile, i * 2))}
        </div>
        <div className="match-column">
          <p className="match-heading">
            <img className="pixel-icon" src={answerIcon} alt="" />
            Answers
          </p>
          {state.bins.length > 0 ? (
            <div className="match-bins">
              {state.bins.map((tile, i) => renderCard(tile, i * 2 + 1))}
            </div>
          ) : null}
          {state.answerTiles.map((tile, i) =>
            renderCard(tile, (i + state.bins.length) * 2 + 1),
          )}
        </div>
      </div>

      <div className="match-textbox" aria-live="polite">
        <p className="match-status">{getStatusText(state)}</p>
        {shownTiles.map((tile) => (
          <p key={tile.id} className="match-line">
            <img
              className="pixel-icon"
              src={getIcon(tile)}
              alt=""
              width={18}
              height={18}
            />
            <span>
              <strong>{KIND_LABELS[tile.kind]}:</strong> {tile.text}
            </span>
          </p>
        ))}
      </div>

      {phase !== 'cleared' ? (
        <button type="button" className="quit-btn" onClick={handleQuit}>
          End game
        </button>
      ) : null}
    </section>
  )
}

export default MemoryFlip
