import { useEffect, useRef, useState } from 'react'
import starSprite from '../assets/game-modes/dizzy-star.svg'
import doubleIcon from '../assets/game-modes/powerup-double.svg'
import freezeIcon from '../assets/game-modes/powerup-freeze.svg'
import skipIcon from '../assets/game-modes/powerup-skip.svg'
import bookSprite from '../assets/game-modes/race-book.svg'
import rockSprite from '../assets/game-modes/race-rock.svg'
import runnerSheet from '../assets/game-modes/scholar-run.svg'
import { loadBest, saveBest } from './personalBests.js'
import QuestionCard from './QuestionCard.jsx'
import { getSpeedRoundDistance } from './scoring.js'
import { getPickup, POWER_UPS } from './speedRoundEngine.js'
import { useCountdown } from './useCountdown.js'
import {
  CORRECT_FEEDBACK_MS,
  useGameSession,
  WRONG_FEEDBACK_MS,
} from './useGameSession.js'

const MODE_ID = 'speed-round'
const LOW_TIME_MS = 10000
// Scenery speed in px per second with no streak.
const BASE_SPEED = 220
const STREAK_SPEEDUP = 0.2
const BOOST_SPEEDUP = 1.9
// How quickly the runner eases to a new speed. Higher is snappier.
const ACCELERATION = 7
// One full run cycle: both legs take a step.
const BASE_RUN_CYCLE_MS = 600
const RUN_CYCLE_SPEEDUP_MS = 60
const BOOST_RUN_CYCLE_MS = 360
const DIZZY_STARS = 3
const POWER_UP_ICONS = { freeze: freezeIcon, double: doubleIcon, skip: skipIcon }

function getTrackSpeed(settings, streak) {
  if (streak >= settings.streakForMultiplier) return BASE_SPEED * BOOST_SPEEDUP
  return BASE_SPEED * (1 + streak * STREAK_SPEEDUP)
}

function getRunCycleMs(settings, streak) {
  if (streak >= settings.streakForMultiplier) return BOOST_RUN_CYCLE_MS
  return BASE_RUN_CYCLE_MS - streak * RUN_CYCLE_SPEEDUP_MS
}

// Scrolls the scenery by writing --scroll onto the scene every frame. Easing
// toward the target speed lets the runner skid to a stop when they trip and
// pick up pace with a streak, instead of jumping between speeds.
function useScrollingScenery(sceneRef, targetSpeed) {
  const targetRef = useRef(targetSpeed)

  useEffect(() => {
    targetRef.current = targetSpeed
  }, [targetSpeed])

  useEffect(() => {
    const scene = sceneRef.current
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (!scene || reduceMotion) return undefined

    let frameId = 0
    let last = performance.now()
    let speed = 0
    let offset = 0

    function tick(now) {
      const seconds = Math.min(now - last, 100) / 1000
      last = now
      speed += (targetRef.current - speed) * Math.min(1, seconds * ACCELERATION)
      offset += speed * seconds
      scene.style.setProperty('--scroll', offset.toFixed(1))
      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [sceneRef])
}

function BoostMeter({ streak, needed }) {
  return (
    <span className="boost-meter">
      Boost
      {Array.from({ length: needed }, (_, i) => (
        <span key={i} className={i < streak ? 'boost-pip filled' : 'boost-pip'} />
      ))}
    </span>
  )
}

function Pickup({ kind, state }) {
  return (
    <img
      className={`race-pickup ${state} pixel-icon`}
      src={POWER_UP_ICONS[kind]}
      alt=""
    />
  )
}

function RaceScene({ settings, stats, feedback, msLeft, frozenMs, doubleMs, pickup }) {
  const sceneRef = useRef(null)
  const tripped = Boolean(feedback) && !feedback.correct
  const dashing = Boolean(feedback?.correct)
  const boosted = stats.streak >= settings.streakForMultiplier
  const finalStretch = msLeft <= LOW_TIME_MS
  const frozen = frozenMs > 0

  useScrollingScenery(
    sceneRef,
    tripped ? 0 : getTrackSpeed(settings, stats.streak),
  )

  let sceneClass = 'race-scene'
  if (boosted) sceneClass += ' boosted'
  if (finalStretch) sceneClass += ' final-stretch'
  if (frozen) sceneClass += ' frozen'

  let runnerClass = 'runner'
  if (tripped) runnerClass += ' tripping'
  else if (dashing) runnerClass += ' dashing'

  let pickupState = 'incoming'
  if (feedback) pickupState = feedback.correct ? 'collected' : 'missed'

  return (
    <div
      ref={sceneRef}
      className={sceneClass}
      style={{
        '--run-cycle-ms': `${getRunCycleMs(settings, stats.streak)}ms`,
        '--trip-ms': `${WRONG_FEEDBACK_MS}ms`,
        '--dash-ms': `${CORRECT_FEEDBACK_MS}ms`,
      }}
      aria-hidden="true"
    >
      <div className="race-clouds" />
      <div className="race-far" />
      <div className="race-trees" />
      <div className="race-ground" />

      <div className="race-badges">
        {boosted ? (
          <span className="race-badge boost">
            {settings.streakMultiplier}× boost
          </span>
        ) : (
          <BoostMeter
            streak={stats.streak}
            needed={settings.streakForMultiplier}
          />
        )}
        {frozen ? (
          <span className="race-badge freeze">
            <img className="pixel-icon" src={freezeIcon} alt="" />
            {Math.ceil(frozenMs / 1000)}s
          </span>
        ) : null}
        {doubleMs > 0 ? (
          <span className="race-badge double">
            <img className="pixel-icon" src={doubleIcon} alt="" />
            2× {Math.ceil(doubleMs / 1000)}s
          </span>
        ) : null}
        {finalStretch ? (
          <span className="race-badge final">Final stretch</span>
        ) : null}
      </div>

      {boosted ? (
        <div className="speed-lines">
          <span />
          <span />
          <span />
          <span />
        </div>
      ) : null}

      <div className="runner-spot">
        {tripped ? (
          <img className="race-rock pixel-icon" src={rockSprite} alt="" />
        ) : null}
        {pickup ? <Pickup kind={pickup} state={pickupState} /> : null}
        <div
          className={runnerClass}
          style={{ backgroundImage: `url(${runnerSheet})` }}
        />
        {tripped ? (
          <>
            <img className="race-book pixel-icon" src={bookSprite} alt="" />
            <div className="dizzy-stars">
              {Array.from({ length: DIZZY_STARS }, (_, i) => (
                <span key={i} className="dizzy-star">
                  <img className="pixel-icon" src={starSprite} alt="" />
                </span>
              ))}
            </div>
          </>
        ) : null}
        {dashing ? (
          <span className="race-popup">+{feedback.points} m</span>
        ) : null}
      </div>
    </div>
  )
}

function getFeedbackText(feedback, pickup, notice) {
  if (!feedback) return notice
  if (feedback.correct) {
    const got = pickup ? ` Got ${POWER_UPS[pickup].name}!` : ''
    return `Correct! +${feedback.points} m.${got}`
  }
  return pickup
    ? 'Not quite. You tripped and the power-up rolled away!'
    : 'Not quite. You tripped!'
}

function SpeedRound({ questions, settings, onFinish, recordKey }) {
  const clock = useCountdown(settings.durationSeconds * 1000, {
    maxMs: settings.maxSeconds * 1000,
  })
  const { msLeft, frozenMs } = clock
  const maxMs = settings.maxSeconds * 1000
  const [seed] = useState(() => Math.floor(Math.random() * 2 ** 31))
  const [best] = useState(() => loadBest(MODE_ID, recordKey))
  const [doubleUntil, setDoubleUntil] = useState(0)
  const [skips, setSkips] = useState(0)
  const [timeDelta, setTimeDelta] = useState(null)
  const [notice, setNotice] = useState(null)
  const doubleUntilRef = useRef(0)
  const finishedRef = useRef(false)

  const { question, turn, stats, feedback, submitAnswer, skip } =
    useGameSession(questions, (context) =>
      getSpeedRoundDistance(
        settings,
        context,
        Date.now() < doubleUntilRef.current,
      ),
    )
  const pickup = getPickup(settings, seed, turn)

  function finish(outcome) {
    if (finishedRef.current) return
    finishedRef.current = true
    const previousBest = best?.distance ?? null
    const newBest = Boolean(recordKey) && stats.score > (previousBest ?? 0)
    if (newBest) {
      saveBest(MODE_ID, recordKey, { distance: stats.score })
    }
    onFinish({ ...stats, outcome, newBest, previousBest })
  }

  useEffect(() => {
    if (msLeft > 0) return
    finish()
  })

  function showTimeChange(ms) {
    if (ms === 0) return
    setTimeDelta((prev) => ({ seconds: Math.round(ms / 1000), n: (prev?.n ?? 0) + 1 }))
  }

  function collect(kind) {
    if (kind === 'freeze') clock.freeze(settings.freezeSeconds * 1000)
    if (kind === 'double') {
      const until = Date.now() + settings.doubleSeconds * 1000
      doubleUntilRef.current = until
      setDoubleUntil(until)
    }
    if (kind === 'skip') setSkips((count) => Math.min(settings.maxSkips, count + 1))
  }

  function handleAnswer(response) {
    const outcome = submitAnswer(response)
    if (!outcome) return
    setNotice(null)
    if (outcome.correct) {
      showTimeChange(clock.addTime(settings.timeGainSeconds * 1000))
      if (pickup) collect(pickup)
    } else {
      showTimeChange(clock.addTime(-settings.timePenaltySeconds * 1000))
    }
  }

  function handleSkip() {
    if (skips === 0 || !skip()) return
    setSkips((count) => count - 1)
    setNotice('Card skipped.')
  }

  const now = Date.now()
  const doubleMs = Math.max(0, doubleUntil - now)

  const multiplierActive = stats.streak >= settings.streakForMultiplier
  let timeClass = 'timer-bar'
  if (frozenMs > 0) timeClass += ' frozen'
  else if (msLeft <= LOW_TIME_MS) timeClass += ' low'

  return (
    <section className="game-play race">
      <div className="game-hud">
        <div className="hud-stat">
          <span className="hud-label">Time</span>
          <span className={frozenMs > 0 ? 'hud-value frozen' : 'hud-value'}>
            {Math.ceil(msLeft / 1000)}s
          </span>
          {timeDelta ? (
            <span
              key={timeDelta.n}
              className={`time-delta ${timeDelta.seconds > 0 ? 'gain' : 'loss'}`}
              aria-hidden="true"
            >
              {timeDelta.seconds > 0 ? '+' : '−'}
              {Math.abs(timeDelta.seconds)}s
            </span>
          ) : null}
        </div>
        <div className="hud-stat">
          <span className="hud-label">Distance</span>
          <span className="hud-value">{stats.score} m</span>
        </div>
        <div className="hud-stat">
          <span className="hud-label">Streak</span>
          <span className="hud-value">
            {stats.streak}
            {multiplierActive ? (
              <span className="multiplier-badge">
                {settings.streakMultiplier}×
              </span>
            ) : null}
          </span>
        </div>
      </div>

      <div className="timer-track" aria-hidden="true">
        <div
          className={timeClass}
          style={{ width: `${(msLeft / maxMs) * 100}%` }}
        />
      </div>

      <RaceScene
        settings={settings}
        stats={stats}
        feedback={feedback}
        msLeft={msLeft}
        frozenMs={frozenMs}
        doubleMs={doubleMs}
        pickup={pickup}
      />

      {pickup && !feedback ? (
        <p className="pickup-hint">
          <img className="pixel-icon" src={POWER_UP_ICONS[pickup]} alt="" />
          Answer this one right to grab <strong>{POWER_UPS[pickup].name}</strong>
          {' '}({POWER_UPS[pickup].effect.toLowerCase()})!
        </p>
      ) : null}

      {question ? (
        <QuestionCard
          key={turn}
          question={question}
          feedback={feedback}
          onSubmit={handleAnswer}
        />
      ) : null}

      <div className="feedback-line" aria-live="polite">
        {getFeedbackText(feedback, pickup, notice)}
      </div>

      <div className="race-actions">
        {skips > 0 ? (
          <button
            type="button"
            className="item-btn"
            onClick={handleSkip}
            disabled={Boolean(feedback)}
          >
            <img className="pixel-icon" src={skipIcon} alt="" />
            Skip card ({skips})
          </button>
        ) : null}
        <button type="button" className="quit-btn" onClick={() => finish()}>
          End round
        </button>
      </div>
    </section>
  )
}

export default SpeedRound
