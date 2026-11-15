import { useEffect, useReducer, useRef } from 'react'
import bossSprite from '../assets/game-modes/boss-slime.svg'
import heroSprite from '../assets/game-modes/hero-scholar.svg'
import {
  BOSS_NAME,
  createBattle,
  getMoveDamage,
  resolveRound,
} from './bossBattleEngine.js'
import QuestionCard from './QuestionCard.jsx'
import { getBossMaxHp } from './scoring.js'
import {
  CORRECT_FEEDBACK_MS,
  useGameSession,
  WRONG_FEEDBACK_MS,
} from './useGameSession.js'

const MESSAGE_MS = 1300

function init({ settings, bossMaxHp }) {
  const battle = createBattle(settings, bossMaxHp)
  return {
    phase: 'messages',
    battle,
    move: null,
    pending: null,
    messages: [
      {
        text: `The ${BOSS_NAME} blocks your path!`,
        snapshot: { playerHp: battle.playerHp, bossHp: battle.bossHp },
      },
    ],
    messageIndex: 0,
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'choose-move':
      return state.phase === 'menu'
        ? { ...state, phase: 'question', move: action.move }
        : state
    case 'answered':
      return { ...state, phase: 'feedback', pending: action.pending }
    case 'show-round':
      return {
        ...state,
        phase: 'messages',
        messages: state.pending.messages,
        messageIndex: 0,
      }
    case 'next-message': {
      if (state.phase !== 'messages') return state
      if (state.messageIndex + 1 < state.messages.length) {
        return { ...state, messageIndex: state.messageIndex + 1 }
      }
      if (!state.pending) return { ...state, phase: 'menu' }
      const battle = state.pending.next
      return {
        ...state,
        battle,
        pending: null,
        move: null,
        phase: battle.over ? 'over' : 'menu',
      }
    }
    default:
      return state
  }
}

function HpBar({ hp, max }) {
  const percent = (hp / max) * 100
  let level = 'high'
  if (percent <= 20) level = 'low'
  else if (percent <= 50) level = 'mid'

  return (
    <div className="hp-track" aria-hidden="true">
      <div className={`hp-fill ${level}`} style={{ width: `${percent}%` }} />
    </div>
  )
}

function StatusPanel({ name, hp, max, badges }) {
  return (
    <div className="battle-status">
      <div className="battle-status-top">
        <span className="battle-name">{name}</span>
        {badges.map((badge) => (
          <span key={badge.label} className={`battle-badge ${badge.tone}`}>
            {badge.label}
          </span>
        ))}
      </div>
      <HpBar hp={hp} max={max} />
      <span className="battle-hp-text">
        {hp} / {max} HP
      </span>
    </div>
  )
}

function Popup({ message, forAnim }) {
  if (!message?.amount || message.anim !== forAnim) return null
  const sign = forAnim === 'heal' ? '+' : '-'
  return (
    <span className={`damage-popup ${forAnim}`}>
      {sign}
      {message.amount}
    </span>
  )
}

function BossBattle({ questions, settings, onFinish }) {
  const bossMaxHp = getBossMaxHp(settings, questions.length)
  const [state, dispatch] = useReducer(reducer, { settings, bossMaxHp }, init)
  const { question, turn, stats, submitAnswer } = useGameSession(
    questions,
    ({ streak }) => getMoveDamage(settings, state.move, streak).damage,
  )
  const finishedRef = useRef(false)

  useEffect(() => {
    if (state.phase !== 'feedback') return undefined
    const timeout = setTimeout(
      () => dispatch({ type: 'show-round' }),
      state.pending.feedback.correct ? CORRECT_FEEDBACK_MS : WRONG_FEEDBACK_MS,
    )
    return () => clearTimeout(timeout)
  }, [state.phase, state.pending])

  useEffect(() => {
    if (state.phase !== 'messages') return undefined
    const timeout = setTimeout(
      () => dispatch({ type: 'next-message' }),
      MESSAGE_MS,
    )
    return () => clearTimeout(timeout)
  }, [state.phase, state.messageIndex])

  useEffect(() => {
    if (state.phase !== 'over' || finishedRef.current) return
    finishedRef.current = true
    const { won } = state.battle
    onFinish({ ...stats, won, outcome: won ? 'victory' : 'defeat' })
  }, [state.phase, state.battle, stats, onFinish])

  function handleAnswer(response) {
    const { move } = state
    const outcome = submitAnswer(response)
    if (!outcome) return

    const { crit } = getMoveDamage(settings, move, outcome.stats.streak)
    const round = resolveRound(
      state.battle,
      { move, correct: outcome.correct, damage: outcome.points, crit },
      settings,
    )
    dispatch({
      type: 'answered',
      pending: {
        ...round,
        question,
        turn,
        feedback: {
          correct: outcome.correct,
          response,
          points: outcome.points,
        },
      },
    })
  }

  function handleFlee() {
    finishedRef.current = true
    onFinish({ ...stats, won: false })
  }

  const message =
    state.phase === 'messages' || state.phase === 'over'
      ? state.messages[state.messageIndex]
      : null
  const hp = message
    ? message.snapshot
    : { playerHp: state.battle.playerHp, bossHp: state.battle.bossHp }
  const flags =
    state.phase === 'messages' && state.pending
      ? state.pending.next
      : state.battle
  const anim = message?.anim

  let bossClass = 'battle-sprite boss-sprite pixel-icon'
  if (flags.enraged) bossClass += ' enraged'
  if (anim === 'boss-hit') bossClass += ' hit'
  if (anim === 'boss-attack') bossClass += ' lunge'
  if (flags.charging) bossClass += ' charging'
  if (anim === 'boss-defeated' || (state.phase === 'over' && flags.won)) {
    bossClass += ' defeated'
  }

  let heroClass = 'battle-sprite hero-sprite pixel-icon'
  if (anim === 'player-hit') heroClass += ' hit'
  if (anim === 'heal') heroClass += ' healing'
  if (flags.guarded || anim === 'guard') heroClass += ' guarding'
  if (anim === 'player-defeated' || (state.phase === 'over' && !flags.won)) {
    heroClass += ' defeated'
  }

  const bossBadges = []
  if (flags.enraged) bossBadges.push({ label: 'Furious', tone: 'danger' })
  if (flags.charging) bossBadges.push({ label: 'Charging', tone: 'warning' })
  const playerBadges = []
  if (flags.guarded) playerBadges.push({ label: 'Guard', tone: 'info' })
  if (stats.streak >= settings.critStreak - 1) {
    playerBadges.push({ label: 'Crit ready', tone: 'warning' })
  }

  let textboxText = 'Choose your move.'
  if (message) textboxText = message.text
  else if (state.move) {
    textboxText = `${state.move.name}: answer correctly to pull it off!`
  }

  const cardQuestion =
    state.phase === 'feedback' ? state.pending.question : question
  const cardKey = state.phase === 'feedback' ? state.pending.turn : turn

  return (
    <section className="game-play battle">
      <div className="battle-scene">
        <div className="battle-row enemy-row">
          <StatusPanel
            name={BOSS_NAME}
            hp={hp.bossHp}
            max={state.battle.bossMaxHp}
            badges={bossBadges}
          />
          <div className="sprite-spot">
            <img
              key={`boss-${state.messageIndex}-${anim}`}
              className={bossClass}
              src={bossSprite}
              alt={BOSS_NAME}
              width={128}
              height={128}
            />
            <Popup
              key={`boss-pop-${state.messageIndex}`}
              message={message}
              forAnim="boss-hit"
            />
            <span className="platform" aria-hidden="true" />
          </div>
        </div>

        <div className="battle-row player-row">
          <div className="sprite-spot">
            <img
              key={`hero-${state.messageIndex}-${anim}`}
              className={heroClass}
              src={heroSprite}
              alt="You"
              width={96}
              height={96}
            />
            <Popup
              key={`hero-hit-${state.messageIndex}`}
              message={message}
              forAnim="player-hit"
            />
            <Popup
              key={`hero-heal-${state.messageIndex}`}
              message={message}
              forAnim="heal"
            />
            <span className="platform" aria-hidden="true" />
          </div>
          <StatusPanel
            name="You"
            hp={hp.playerHp}
            max={state.battle.playerMaxHp}
            badges={playerBadges}
          />
        </div>
      </div>

      <button
        type="button"
        className="battle-textbox"
        onClick={() => dispatch({ type: 'next-message' })}
        disabled={state.phase !== 'messages'}
        aria-live="polite"
      >
        {textboxText}
        {state.phase === 'messages' ? (
          <span className="textbox-next" aria-hidden="true">
            ▼
          </span>
        ) : null}
      </button>

      {state.phase === 'menu' ? (
        <div className="move-menu">
          {settings.moves.map((move) => {
            const usesLeft = state.battle.uses[move.id]
            return (
              <button
                key={move.id}
                type="button"
                className={`move-btn ${move.kind}`}
                disabled={usesLeft === 0}
                onClick={() => dispatch({ type: 'choose-move', move })}
              >
                <span className="move-name">{move.name}</span>
                <span className="move-desc">{move.description}</span>
                <span className="move-uses">
                  {usesLeft == null ? 'Unlimited' : `${usesLeft} left`}
                </span>
              </button>
            )
          })}
        </div>
      ) : null}

      {(state.phase === 'question' || state.phase === 'feedback') &&
      cardQuestion ? (
        <QuestionCard
          key={cardKey}
          question={cardQuestion}
          feedback={state.phase === 'feedback' ? state.pending.feedback : null}
          onSubmit={handleAnswer}
        />
      ) : null}

      {state.phase !== 'over' ? (
        <button type="button" className="quit-btn" onClick={handleFlee}>
          Flee
        </button>
      ) : null}
    </section>
  )
}

export default BossBattle
