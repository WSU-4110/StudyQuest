import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../Auth-Page/AuthContext.jsx'
import { supabase } from '../lib/supabaseClient.js'
import { awardRewards } from '../lib/userProfile.js'
import { useStudySets } from '../Study-Set-Page/StudySetContext.jsx'
import {
  formatCorrectAnswer,
  formatResponse,
  generateQuiz,
  scoreQuiz,
} from './quizLogic.js'
import './PracticeQuizPage.css'

// Reward amounts per correct answer. Change these to match the rewards design.
const XP_PER_CORRECT = 10
const CURRENCY_PER_CORRECT = 5

async function recordQuizResult(correct, total) {
  const { error } = await supabase.rpc('record_quiz_result', {
    p_correct: correct,
    p_total: total,
  })
  if (error) throw new Error(error.message)
}

function QuestionField({ question, value, onChange }) {
  const name = `question-${question.id}`

  if (question.type === 'true_false') {
    return (
      <div className="quiz-choices">
        {[true, false].map((option) => (
          <label key={String(option)} className="quiz-choice">
            <input
              type="radio"
              name={name}
              checked={value === option}
              onChange={() => onChange(option)}
            />
            <span>{option ? 'True' : 'False'}</span>
          </label>
        ))}
      </div>
    )
  }

  if (question.type === 'multiple_choice') {
    const selected = value ?? []
    const multi = question.correctIndexes.length > 1
    return (
      <div className="quiz-choices">
        {multi ? <p className="quiz-hint">Select all that apply.</p> : null}
        {question.options.map((option, optionIndex) => (
          <label key={`${option}-${optionIndex}`} className="quiz-choice">
            <input
              type={multi ? 'checkbox' : 'radio'}
              name={name}
              checked={selected.includes(optionIndex)}
              onChange={() => {
                if (!multi) return onChange([optionIndex])
                onChange(
                  selected.includes(optionIndex)
                    ? selected.filter((i) => i !== optionIndex)
                    : [...selected, optionIndex],
                )
              }}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    )
  }

  return (
    <input
      className="quiz-text-input"
      type="text"
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Type your answer"
      autoComplete="off"
    />
  )
}

function PracticeQuizPage() {
  const { id } = useParams()
  const { session } = useAuth()
  const { getStudySet, loading } = useStudySets()
  const studySet = getStudySet(id)

  const [attempt, setAttempt] = useState(0)
  const [responses, setResponses] = useState({})
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null) // { saved, rewards, errors[] }

  // Re-generated (and re-shuffled) only when the set changes or on retake.
  const questions = useMemo(
    () => (studySet ? generateQuiz(studySet, { shuffle: true }) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [studySet, attempt],
  )

  if (loading) {
    return (
      <main className="practice-quiz">
        <p>Loading study set...</p>
      </main>
    )
  }

  if (!studySet) {
    return (
      <main className="practice-quiz">
        <p>Study set not found.</p>
        <Link to="/studysets">Back to library</Link>
      </main>
    )
  }

  if (questions.length === 0) {
    return (
      <main className="practice-quiz">
        <h1>{studySet.title}</h1>
        <p>This set has no questions that can be quizzed yet.</p>
        <Link to={`/studysets/${studySet.id}`}>Back to study set</Link>
      </main>
    )
  }

  const answeredCount = questions.filter((q) => {
    const value = responses[q.id]
    if (q.type === 'multiple_choice') return (value ?? []).length > 0
    if (q.type === 'true_false') return typeof value === 'boolean'
    return String(value ?? '').trim() !== ''
  }).length

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting || result) return
    setSubmitting(true)

    const scored = scoreQuiz(questions, responses)
    setResult(scored)

    const status = { saved: false, rewards: null, errors: [] }

    if (session) {
      try {
        await recordQuizResult(scored.score, scored.total)
        status.saved = true
      } catch (err) {
        status.errors.push(`Could not save your result: ${err.message}`)
      }

      const xp = scored.score * XP_PER_CORRECT
      const currency = scored.score * CURRENCY_PER_CORRECT
      if (xp > 0 || currency > 0) {
        try {
          await awardRewards({ xp, currency })
          status.rewards = { xp, currency }
        } catch (err) {
          status.errors.push(`Could not award rewards: ${err.message}`)
        }
      }
    }

    setSaveStatus(status)
    setSubmitting(false)
  }

  function handleRetake() {
    setResponses({})
    setResult(null)
    setSaveStatus(null)
    setAttempt((n) => n + 1)
  }

  if (result) {
    return (
      <main className="practice-quiz">
        <Link className="back-link" to={`/studysets/${studySet.id}`}>
          Back to study set
        </Link>
        <h1>{studySet.title}</h1>
        <p className="quiz-score" role="status">
          Score: {result.score} / {result.total} ({result.percent}%)
        </p>

        {!session ? (
          <p className="quiz-note">
            Sign in to save your results and earn rewards.
          </p>
        ) : null}
        {saveStatus?.saved ? (
          <p className="quiz-note">Result saved.</p>
        ) : null}
        {saveStatus?.rewards ? (
          <p className="quiz-note">
            Rewards earned: {saveStatus.rewards.xp} XP and{' '}
            {saveStatus.rewards.currency} coins.
          </p>
        ) : null}
        {saveStatus?.errors.map((message) => (
          <p key={message} className="quiz-error" role="alert">
            {message}
          </p>
        ))}

        <ol className="quiz-review">
          {result.results.map(({ question, response, correct }) => (
            <li
              key={question.id}
              className={correct ? 'quiz-item correct' : 'quiz-item incorrect'}
            >
              <p className="quiz-prompt">{question.prompt}</p>
              <p>
                Your answer: {formatResponse(question, response)}{' '}
                <strong>{correct ? '(Correct)' : '(Incorrect)'}</strong>
              </p>
              {correct ? null : (
                <p>Correct answer: {formatCorrectAnswer(question)}</p>
              )}
            </li>
          ))}
        </ol>

        <div className="quiz-actions">
          <button type="button" onClick={handleRetake}>
            Retake quiz
          </button>
          <Link to="/studysets">Back to library</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="practice-quiz">
      <Link className="back-link" to={`/studysets/${studySet.id}`}>
        Back to study set
      </Link>
      <h1>Practice quiz: {studySet.title}</h1>
      <p className="card-count">
        {questions.length} {questions.length === 1 ? 'question' : 'questions'}
      </p>

      <form onSubmit={handleSubmit}>
        <ol className="quiz-list">
          {questions.map((question) => (
            <li key={question.id} className="quiz-item">
              <p className="quiz-prompt">{question.prompt}</p>
              <QuestionField
                question={question}
                value={responses[question.id]}
                onChange={(value) =>
                  setResponses((prev) => ({ ...prev, [question.id]: value }))
                }
              />
            </li>
          ))}
        </ol>

        <div className="quiz-actions">
          <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit quiz'}
          </button>
          <span className="quiz-progress">
            {answeredCount} of {questions.length} answered
          </span>
        </div>
      </form>
    </main>
  )
}

export default PracticeQuizPage