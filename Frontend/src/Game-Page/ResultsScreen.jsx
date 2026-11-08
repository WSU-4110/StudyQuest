import { Link } from 'react-router-dom'
import coinIcon from '../assets/game-modes/coin.svg'
import { formatCorrectAnswer, formatResponse } from './gameEngine.js'

const TITLES = {
  victory: 'Victory!',
  defeat: 'Defeated',
  'out-of-lives': 'Out of lives',
}

function RewardPanel({ reward }) {
  if (!reward) return null

  if (reward.status === 'none') {
    return (
      <div className="reward-panel">
        <p>No rewards this round. Get an answer right to earn XP.</p>
      </div>
    )
  }

  return (
    <div className="reward-panel">
      <div className="reward-amounts">
        <span className="reward-xp">+{reward.earned.xp} XP</span>
        <span className="reward-coins">
          <img
            className="pixel-icon"
            src={coinIcon}
            alt=""
            width={24}
            height={24}
          />
          +{reward.earned.currency}
        </span>
      </div>
      {reward.status === 'saving' ? <p>Saving rewards…</p> : null}
      {reward.status === 'error' ? (
        <p className="reward-error">Couldn't save rewards: {reward.error}</p>
      ) : null}
      {reward.status === 'saved' && reward.leveledUp ? (
        <p className="level-up">Level up! You're now level {reward.level}.</p>
      ) : null}
    </div>
  )
}

function MissedList({ missed }) {
  if (missed.length === 0) return null

  return (
    <div className="missed-section">
      <h2>Review your misses ({missed.length})</h2>
      <ol className="missed-list">
        {missed.map(({ question, response }, index) => (
          <li key={`${question.id}-${index}`} className="missed-item">
            <p className="missed-prompt">{question.prompt}</p>
            <p className="missed-yours">
              Your answer: {formatResponse(question, response)}
            </p>
            <p className="missed-correct">
              Correct answer: {formatCorrectAnswer(question)}
            </p>
          </li>
        ))}
      </ol>
    </div>
  )
}

function ResultsScreen({ result, mode, reward, studySetId, onPlayAgain }) {
  const accuracy = result.answered
    ? Math.round((result.correct / result.answered) * 100)
    : 0
  const perfect = result.answered > 0 && result.missed.length === 0

  return (
    <section className="results-screen">
      <h1>{TITLES[result.outcome] ?? 'Round over'}</h1>
      <p className="summary-score">{result.score}</p>
      <p className="summary-score-label">{mode.scoreLabel}</p>

      <dl className="summary-stats">
        <div>
          <dt>Correct</dt>
          <dd>
            {result.correct} / {result.answered}
          </dd>
        </div>
        <div>
          <dt>Accuracy</dt>
          <dd>{accuracy}%</dd>
        </div>
        <div>
          <dt>Best streak</dt>
          <dd>{result.bestStreak}</dd>
        </div>
      </dl>

      <RewardPanel reward={reward} />

      {perfect ? (
        <p className="perfect-round">No misses. Perfect round!</p>
      ) : null}
      <MissedList missed={result.missed} />

      <div className="summary-actions">
        <button type="button" className="start-btn" onClick={onPlayAgain}>
          Play again
        </button>
        <Link to={`/studysets/${studySetId}`}>Try another mode</Link>
      </div>
    </section>
  )
}

export default ResultsScreen
