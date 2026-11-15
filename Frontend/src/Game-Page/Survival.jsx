import { useEffect, useReducer, useRef, useState } from 'react'
import ghostSprite from '../assets/game-modes/dungeon-ghost.svg'
import heroSprite from '../assets/game-modes/hero-scholar.svg'
import fiftyIcon from '../assets/game-modes/perk-fifty.svg'
import heartPerkIcon from '../assets/game-modes/perk-heart.svg'
import hintIcon from '../assets/game-modes/perk-hint.svg'
import shieldIcon from '../assets/game-modes/perk-shield.svg'
import heartIcon from '../assets/game-modes/survival.svg'
import { loadBest, saveBest } from './personalBests.js'
import QuestionCard from './QuestionCard.jsx'
import {
  canUseFifty,
  canUseHint,
  choosePerks,
  crossedCheckpoint,
  getEligiblePerks,
  getHint,
  PERKS,
  pickEliminated,
  queueGhost,
  takeDueGhost,
} from './survivalEngine.js'
import { useGameSession, WRONG_FEEDBACK_MS } from './useGameSession.js'

const MODE_ID = 'survival'
const PERK_ICONS = {
  shield: shieldIcon,
  fifty: fiftyIcon,
  hint: hintIcon,
  heart: heartPerkIcon,
}

function init(settings) {
  return {
    lives: settings.lives,
    maxLives: settings.lives,
    shields: 0,
    items: { fifty: 0, hint: 0 },
    ghostQueue: [],
    perkChoice: null,
    fifty: null,
    hintTurn: null,
    events: [],
    eventId: 0,
    message: null,
    notice: null,
    newRecord: false,
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'answered': {
      const { correct, settings, depthAfter } = action
      const events = []
      const notes = []
      let next = { ...state, eventId: state.eventId + 1 }

      if (correct) {
        next.ghostQueue = state.ghostQueue.filter(
          (ghost) => ghost.index !== action.questionIndex,
        )
        if (action.ghost) {
          events.push('banished')
          notes.push(`Ghost banished! Down to B${depthAfter}.`)
        } else {
          events.push('descend')
          notes.push(`Correct! Down to B${depthAfter}.`)
        }
        if (
          action.streak % settings.regenStreak === 0 &&
          state.lives < state.maxLives
        ) {
          next.lives = state.lives + 1
          events.push('regen')
          notes.push(`${settings.regenStreak} in a row: +1 heart!`)
        }
        if (action.perks.length > 0) {
          next.perkChoice = action.perks
          events.push('checkpoint')
        }
        if (action.best !== null && depthAfter > action.best && !state.newRecord) {
          next.newRecord = true
          events.push('record')
          notes.push('New record depth!')
        }
      } else {
        if (state.shields > 0) {
          next.shields = state.shields - 1
          events.push('blocked')
          notes.push('Your shield blocked it!')
        } else {
          next.lives = state.lives - 1
          events.push('hit')
          notes.push(
            next.lives > 0
              ? `Lost a heart. ${next.lives} left.`
              : 'Out of hearts!',
          )
        }
        next.ghostQueue = queueGhost(
          state.ghostQueue,
          action.questionIndex,
          action.turn,
          settings,
        )
        if (next.lives > 0) notes.push('That card will haunt you later.')
      }

      next.events = events
      next.message = notes.join(' ')
      next.notice = null
      return next
    }
    case 'take-ghost':
      return { ...state, ghostQueue: action.rest }
    case 'choose-perk': {
      const next = {
        ...state,
        perkChoice: null,
        notice: `Got ${PERKS[action.perk].name}!`,
      }
      if (action.perk === 'shield') next.shields = state.shields + 1
      if (action.perk === 'fifty') {
        next.items = { ...state.items, fifty: state.items.fifty + 1 }
      }
      if (action.perk === 'hint') {
        next.items = { ...state.items, hint: state.items.hint + 1 }
      }
      if (action.perk === 'heart') {
        next.maxLives = state.maxLives + 1
        next.lives = state.lives + 1
      }
      return next
    }
    case 'use-fifty':
      return {
        ...state,
        items: { ...state.items, fifty: state.items.fifty - 1 },
        fifty: { turn: action.turn, indexes: action.indexes },
      }
    case 'use-hint':
      return {
        ...state,
        items: { ...state.items, hint: state.items.hint - 1 },
        hintTurn: action.turn,
      }
    default:
      return state
  }
}

function FloorStrip({ floor, phase }) {
  return (
    <div className={`floor-strip ${phase}`}>
      <span className="torch left" />
      <span className="torch right" />
      <span className="floor-plaque">{floor === 0 ? 'Entrance' : `B${floor}`}</span>
      <span className="floor-ledge" />
    </div>
  )
}

function HealMeter({ streak, needed, full }) {
  if (full) return <span className="dungeon-badge">Hearts full</span>
  const progress = streak % needed
  return (
    <span className="dungeon-badge">
      Heal
      {Array.from({ length: needed }, (_, i) => (
        <span key={i} className={i < progress ? 'heal-pip filled' : 'heal-pip'} />
      ))}
    </span>
  )
}

function DungeonScene({ depth, state, stats, settings, feedback, ghost, turn, best }) {
  const events = feedback ? state.events : []
  const hit = events.includes('hit')
  const blocked = events.includes('blocked')

  let heroClass = 'dungeon-hero pixel-icon'
  if (hit) heroClass += ' hit'
  if (events.includes('regen')) heroClass += ' healing'

  let ghostClass = 'dungeon-ghost pixel-icon'
  if (feedback) ghostClass += feedback.correct ? ' banished' : ' lunge'

  return (
    <div className="dungeon-scene" aria-hidden="true">
      <div className="dungeon-shaft">
        {depth > 0 ? (
          <FloorStrip key={depth - 1} floor={depth - 1} phase="leaving" />
        ) : null}
        <FloorStrip key={depth} floor={depth} phase={depth > 0 ? 'entering' : ''} />
      </div>

      <div className="dungeon-badges">
        <HealMeter
          streak={stats.streak}
          needed={settings.regenStreak}
          full={state.lives >= state.maxLives}
        />
        {state.ghostQueue.length > 0 ? (
          <span className="dungeon-badge">
            <img className="pixel-icon" src={ghostSprite} alt="" />×
            {state.ghostQueue.length}
          </span>
        ) : null}
        {state.newRecord ? (
          <span className="dungeon-badge record">New record!</span>
        ) : best !== null ? (
          <span className="dungeon-badge best">Best B{best}</span>
        ) : null}
      </div>

      <div className="hero-spot">
        {state.shields > 0 || blocked ? (
          <span
            key={`shield-${state.eventId}`}
            className={blocked ? 'shield-bubble popped' : 'shield-bubble'}
          />
        ) : null}
        <img
          key={`hero-${state.eventId}-${feedback ? 'fb' : 'idle'}`}
          className={heroClass}
          src={heroSprite}
          alt=""
        />
      </div>

      {ghost ? (
        <img key={`ghost-${turn}`} className={ghostClass} src={ghostSprite} alt="" />
      ) : null}

      {state.perkChoice ? (
        <span className="checkpoint-banner">Checkpoint! B{depth}</span>
      ) : null}
    </div>
  )
}

function Hearts({ lives, maxLives, regen }) {
  return (
    <span className="hud-value lives">
      {Array.from({ length: maxLives }, (_, i) => {
        let className = 'pixel-icon heart'
        if (i >= lives) className += ' lost'
        else if (regen && i === lives - 1) className += ' regen'
        return (
          <img key={i} className={className} src={heartIcon} alt="" width={24} height={24} />
        )
      })}
      <span className="visually-hidden">
        {lives} of {maxLives} hearts
      </span>
    </span>
  )
}

function PerkPicker({ perks, depth, onChoose }) {
  return (
    <div className="perk-picker">
      <p className="perk-title">Checkpoint B{depth}! Choose an upgrade:</p>
      <div className="perk-options">
        {perks.map((perk) => (
          <button key={perk} type="button" className="perk-btn" onClick={() => onChoose(perk)}>
            <img className="pixel-icon" src={PERK_ICONS[perk]} alt="" />
            <span className="perk-name">{PERKS[perk].name}</span>
            <span className="perk-desc">{PERKS[perk].description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function Survival({ questions, settings, onFinish, recordKey }) {
  const [state, dispatch] = useReducer(reducer, settings, init)
  const [best] = useState(() => loadBest(MODE_ID, recordKey)?.depth ?? null)
  const stateRef = useRef(state)
  const turnRef = useRef(0)
  const finishedRef = useRef(false)

  const session = useGameSession(
    questions,
    ({ queued }) => (queued ? 1 + settings.ghostBonusFloors : 1),
    {
      isOver: () => state.lives <= 0,
      takeQueued: () => {
        const due = takeDueGhost(stateRef.current.ghostQueue, turnRef.current + 1)
        if (!due) return null
        stateRef.current = { ...stateRef.current, ghostQueue: due.rest }
        dispatch({ type: 'take-ghost', rest: due.rest })
        return due.ghost.index
      },
    },
  )
  const { question, questionIndex, turn, queued, stats, feedback, submitAnswer } = session
  const depth = stats.score

  useEffect(() => {
    stateRef.current = state
    turnRef.current = turn
  })

  function finish(outcome) {
    if (finishedRef.current) return
    finishedRef.current = true
    const newBest = Boolean(recordKey) && depth > (best ?? 0)
    if (newBest) saveBest(MODE_ID, recordKey, { depth })
    onFinish({ ...stats, outcome, newBest, previousBest: best })
  }

  useEffect(() => {
    if (state.lives > 0) return undefined
    // Let the player see the correct answer for the final miss first.
    const timeout = setTimeout(() => finish('out-of-lives'), WRONG_FEEDBACK_MS)
    return () => clearTimeout(timeout)
  })

  function handleAnswer(response) {
    const depthBefore = stats.score
    const outcome = submitAnswer(response)
    if (!outcome) return
    const depthAfter = outcome.stats.score
    let perks = []
    if (
      outcome.correct &&
      crossedCheckpoint(depthBefore, depthAfter, settings.checkpointEvery)
    ) {
      perks = choosePerks(getEligiblePerks(state, questions, settings))
    }
    dispatch({
      type: 'answered',
      correct: outcome.correct,
      ghost: queued,
      questionIndex,
      turn,
      streak: outcome.stats.streak,
      depthAfter,
      best,
      perks,
      settings,
    })
  }

  const choosing = Boolean(state.perkChoice) && !feedback
  const fiftyHere = state.fifty?.turn === turn ? state.fifty.indexes : []
  const hintHere = state.hintTurn === turn && question ? getHint(question) : null
  const canFifty =
    state.items.fifty > 0 && !feedback && fiftyHere.length === 0 && canUseFifty(question)
  const canHint = state.items.hint > 0 && !feedback && !hintHere && canUseHint(question)
  const showItems = state.shields > 0 || state.items.fifty > 0 || state.items.hint > 0

  return (
    <section className="game-play dungeon">
      <div className="game-hud">
        <div className="hud-stat">
          <span className="hud-label">Hearts</span>
          <Hearts
            lives={state.lives}
            maxLives={state.maxLives}
            regen={feedback ? state.events.includes('regen') : false}
          />
        </div>
        <div className="hud-stat">
          <span className="hud-label">Floor</span>
          <span className="hud-value">B{depth}</span>
        </div>
        <div className="hud-stat">
          <span className="hud-label">Streak</span>
          <span className="hud-value">{stats.streak}</span>
        </div>
      </div>

      <DungeonScene
        depth={depth}
        state={state}
        stats={stats}
        settings={settings}
        feedback={feedback}
        ghost={queued && !choosing}
        turn={turn}
        best={best}
      />

      {showItems && !choosing ? (
        <div className="item-bar">
          {state.shields > 0 ? (
            <span className="item-chip">
              <img className="pixel-icon" src={shieldIcon} alt="" />
              Shield ×{state.shields}
            </span>
          ) : null}
          {state.items.fifty > 0 ? (
            <button
              type="button"
              className="item-btn"
              disabled={!canFifty}
              onClick={() =>
                dispatch({ type: 'use-fifty', turn, indexes: pickEliminated(question) })
              }
            >
              <img className="pixel-icon" src={fiftyIcon} alt="" />
              50/50 ×{state.items.fifty}
            </button>
          ) : null}
          {state.items.hint > 0 ? (
            <button
              type="button"
              className="item-btn"
              disabled={!canHint}
              onClick={() => dispatch({ type: 'use-hint', turn })}
            >
              <img className="pixel-icon" src={hintIcon} alt="" />
              Hint ×{state.items.hint}
            </button>
          ) : null}
        </div>
      ) : null}

      {choosing ? (
        <PerkPicker
          perks={state.perkChoice}
          depth={depth}
          onChoose={(perk) => dispatch({ type: 'choose-perk', perk })}
        />
      ) : null}

      {queued && !choosing && question ? (
        <p className="ghost-warning">
          <img className="pixel-icon" src={ghostSprite} alt="" />A ghost of a card
          you missed! Banish it for {settings.ghostBonusFloors} bonus floor.
        </p>
      ) : null}

      {question && !choosing ? (
        <div className={queued ? 'ghost-card' : undefined}>
          <QuestionCard
            key={turn}
            question={question}
            feedback={feedback}
            onSubmit={handleAnswer}
            eliminated={fiftyHere}
            hint={hintHere}
          />
        </div>
      ) : null}

      <div className="feedback-line" aria-live="polite">
        {/* Answer messages show with the answer; an upgrade notice stays until the next one. */}
        {feedback ? state.message : state.notice}
      </div>

      <button type="button" className="quit-btn" onClick={() => finish()}>
        End run
      </button>
    </section>
  )
}

export default Survival
