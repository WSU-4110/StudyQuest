import { useEffect, useRef } from 'react'
import heartIcon from '../assets/game-modes/survival.svg'
import QuestionCard from './QuestionCard.jsx'
import { useGameSession, WRONG_FEEDBACK_MS } from './useGameSession.js'

function getLivesLeft(settings, stats) {
  return settings.lives - (stats.answered - stats.correct)
}

function Survival({ questions, settings, onFinish }) {
  const finishedRef = useRef(false)
  const { question, turn, stats, feedback, submitAnswer } = useGameSession(
    questions,
    () => 1,
    { isOver: (current) => getLivesLeft(settings, current) <= 0 },
  )
  const livesLeft = getLivesLeft(settings, stats)

  useEffect(() => {
    if (livesLeft > 0 || finishedRef.current) return
    // Let the player see the correct answer for the final miss first.
    const timeout = setTimeout(() => {
      finishedRef.current = true
      onFinish({ ...stats, outcome: 'out-of-lives' })
    }, WRONG_FEEDBACK_MS)
    return () => clearTimeout(timeout)
  }, [livesLeft, stats, onFinish])

  function handleQuit() {
    finishedRef.current = true
    onFinish(stats)
  }

  return (
    <section className="game-play">
      <div className="game-hud">
        <div className="hud-stat">
          <span className="hud-label">Lives</span>
          <span className="hud-value lives">
            {Array.from({ length: settings.lives }, (_, i) => (
              <img
                key={i}
                className={
                  i < livesLeft ? 'pixel-icon heart' : 'pixel-icon heart lost'
                }
                src={heartIcon}
                alt=""
                width={28}
                height={28}
              />
            ))}
            <span className="visually-hidden">
              {livesLeft} of {settings.lives}
            </span>
          </span>
        </div>
        <div className="hud-stat">
          <span className="hud-label">Correct</span>
          <span className="hud-value">{stats.correct}</span>
        </div>
        <div className="hud-stat">
          <span className="hud-label">Streak</span>
          <span className="hud-value">{stats.streak}</span>
        </div>
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
        {feedback?.correct ? 'Correct!' : null}
        {feedback && !feedback.correct
          ? livesLeft > 0
            ? `Lost a life. ${livesLeft} left`
            : 'Out of lives!'
          : null}
      </div>

      <button type="button" className="quit-btn" onClick={handleQuit}>
        End run
      </button>
    </section>
  )
}

export default Survival
