import { useEffect, useRef } from 'react'
import bossSprite from '../assets/game-modes/boss-slime.svg'
import heartIcon from '../assets/game-modes/survival.svg'
import QuestionCard from './QuestionCard.jsx'
import { getBossDamage, getBossMaxHp } from './scoring.js'
import { useGameSession, WRONG_FEEDBACK_MS } from './useGameSession.js'

const DEFEAT_ANIMATION_MS = 1200

function getHeartsLeft(settings, stats) {
  return settings.playerHearts - (stats.answered - stats.correct)
}

function BossBattle({ questions, settings, onFinish }) {
  const maxHp = getBossMaxHp(settings, questions.length)
  const finishedRef = useRef(false)
  const { question, turn, stats, feedback, submitAnswer } = useGameSession(
    questions,
    (context) => getBossDamage(settings, context),
    {
      isOver: (current) =>
        current.score >= maxHp || getHeartsLeft(settings, current) <= 0,
    },
  )

  const bossHp = Math.max(0, maxHp - stats.score)
  const heartsLeft = getHeartsLeft(settings, stats)
  const won = bossHp <= 0
  const lost = heartsLeft <= 0

  useEffect(() => {
    if ((!won && !lost) || finishedRef.current) return
    const timeout = setTimeout(
      () => {
        finishedRef.current = true
        onFinish({ ...stats, won, outcome: won ? 'victory' : 'defeat' })
      },
      won ? DEFEAT_ANIMATION_MS : WRONG_FEEDBACK_MS,
    )
    return () => clearTimeout(timeout)
  }, [won, lost, stats, onFinish])

  function handleFlee() {
    finishedRef.current = true
    onFinish({ ...stats, won: false })
  }

  let bossClass = 'boss-sprite pixel-icon'
  if (won) bossClass += ' defeated'
  else if (feedback?.correct) bossClass += ' hit'

  return (
    <section className="game-play">
      <div className="boss-arena">
        <div className="boss-header">
          <span className="boss-name">Slime King</span>
          <span className="boss-hp-text">
            {bossHp} / {maxHp} HP
          </span>
        </div>
        <div className="boss-hp-track" aria-hidden="true">
          <div
            className="boss-hp-bar"
            style={{ width: `${(bossHp / maxHp) * 100}%` }}
          />
        </div>
        <div className="boss-stage">
          <img
            className={bossClass}
            src={bossSprite}
            alt=""
            width={128}
            height={128}
          />
          {feedback?.correct ? (
            <span key={turn} className="damage-popup">
              -{feedback.points}
            </span>
          ) : null}
        </div>
      </div>

      <div
        className={
          feedback && !feedback.correct ? 'player-hearts hurt' : 'player-hearts'
        }
      >
        {Array.from({ length: settings.playerHearts }, (_, i) => (
          <img
            key={i}
            className={
              i < heartsLeft ? 'pixel-icon heart' : 'pixel-icon heart lost'
            }
            src={heartIcon}
            alt=""
            width={24}
            height={24}
          />
        ))}
        <span className="visually-hidden">
          {heartsLeft} of {settings.playerHearts} hearts left
        </span>
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
        {feedback?.correct && !won ? `Hit! ${feedback.points} damage` : null}
        {won ? 'The Slime King is defeated!' : null}
        {feedback && !feedback.correct
          ? lost
            ? 'You ran out of hearts!'
            : `Ouch! ${heartsLeft} hearts left`
          : null}
      </div>

      <button type="button" className="quit-btn" onClick={handleFlee}>
        Flee
      </button>
    </section>
  )
}

export default BossBattle
