import { useEffect, useRef } from 'react'
import QuestionCard from './QuestionCard.jsx'
import { getSpeedRoundPoints } from './scoring.js'
import { useCountdown } from './useCountdown.js'
import { useGameSession } from './useGameSession.js'

const LOW_TIME_MS = 10000

function SpeedRound({ questions, settings, onFinish }) {
  const durationMs = settings.durationSeconds * 1000
  const msLeft = useCountdown(durationMs)
  const { question, turn, stats, feedback, submitAnswer } = useGameSession(
    questions,
    (context) => getSpeedRoundPoints(settings, context),
  )
  const finishedRef = useRef(false)

  useEffect(() => {
    if (msLeft > 0 || finishedRef.current) return
    finishedRef.current = true
    onFinish(stats)
  }, [msLeft, stats, onFinish])

  function handleQuit() {
    finishedRef.current = true
    onFinish(stats)
  }

  const multiplierActive = stats.streak >= settings.streakForMultiplier
  const timeClass = msLeft <= LOW_TIME_MS ? 'timer-bar low' : 'timer-bar'

  return (
    <section className="game-play">
      <div className="game-hud">
        <div className="hud-stat">
          <span className="hud-label">Time</span>
          <span className="hud-value">{Math.ceil(msLeft / 1000)}s</span>
        </div>
        <div className="hud-stat">
          <span className="hud-label">Score</span>
          <span className="hud-value">{stats.score}</span>
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
          style={{ width: `${(msLeft / durationMs) * 100}%` }}
        />
      </div>

      {question ? (
        <QuestionCard
          key={turn}
          question={question}
          feedback={feedback}
          onSubmit={submitAnswer}
        />
      ) : null}

      <div className="feedback-line" aria-live="polite">
        {feedback?.correct ? `Correct! +${feedback.points}` : null}
        {feedback && !feedback.correct ? 'Not quite' : null}
      </div>

      <button type="button" className="quit-btn" onClick={handleQuit}>
        End round
      </button>
    </section>
  )
}

export default SpeedRound
