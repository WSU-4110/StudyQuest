import { useEffect, useState } from 'react'
import { useAuth } from '../Auth-Page/AuthContext.jsx'
import { supabase } from '../lib/supabaseClient.js'
import './results.css'

const MAX_TIP_QUESTIONS = 10

async function getTipsErrorMessage(error) {
  if (error?.name === 'FunctionsFetchError') {
    const cause = error.context
    if (cause?.name === 'AbortError') {
      return 'The request timed out. Please try again; if it keeps happening, check the study-tips function logs in Supabase.'
    }
    if (cause?.message) {
      return `The browser could not reach the study-tips function: ${cause.message}`
    }
  }

  const response = error?.context
  if (response instanceof Response) {
    try {
      const body = await response.clone().json()
      if (typeof body?.details === 'string') {
        return `${body.error ?? 'Tips request failed.'} ${body.details}`
      }
      if (typeof body?.error === 'string') return body.error
    } catch {
      // Fall back to the Supabase error when the response is not JSON.
    }
  }

  return error?.message ?? 'Could not generate study tips.'
}

function StudyTips({ attemptId, missedQuestions }) {
  const [state, setState] = useState({ status: 'idle', tips: [] })
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    if (state.status !== 'loading') return

    const startedAt = Date.now()
    const timerId = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000))
    }, 250)

    return () => clearInterval(timerId)
  }, [state.status])

  async function generateTips() {
    setElapsedSeconds(0)
    setState({ status: 'loading', tips: [] })

    try {
      if (!supabase) {
        throw new Error('Supabase is not configured.')
      }

      const missedToTip = missedQuestions.slice(0, MAX_TIP_QUESTIONS)
      const { data, error } = await supabase.functions.invoke('study-tips', {
        body: { missed: missedToTip },
        timeout: 35_000,
      })

      if (error) throw error
      if (
        !Array.isArray(data?.tips) ||
        data.tips.length < 2 ||
        data.tips.length > 3 ||
        data.tips.some((tip) => typeof tip !== 'string')
      ) {
        throw new Error('The tips service returned an invalid response.')
      }

      setState({ status: 'ready', tips: data.tips })
    } catch (error) {
      setState({
        status: 'error',
        tips: [],
        message: await getTipsErrorMessage(error),
      })
    }
  }

  return (
    <aside className="result-tips" aria-labelledby={`tips-${attemptId}`}>
      <h3 id={`tips-${attemptId}`}>Tips for this result</h3>
      {missedQuestions.length === 0 ? (
        <p>No missed-question details were saved for this attempt.</p>
      ) : null}
      {missedQuestions.length > 0 && state.status === 'idle' && (
        <button type="button" onClick={generateTips}>
          Generate tips
        </button>
      )}
      {state.status === 'loading' && (
        <p role="status" aria-live="polite">
          Generating personalized tips... {elapsedSeconds}s
        </p>
      )}
      {state.status === 'error' && (
        <>
          <p role="alert">Couldn’t generate tips: {state.message}</p>
          <button type="button" onClick={generateTips}>
            Try again
          </button>
        </>
      )}
      {state.status === 'ready' && (
        <>
          <ul>
            {state.tips.map((tip, index) => (
              <li key={`${index}-${tip}`}>{tip}</li>
            ))}
          </ul>
          {missedQuestions.length > MAX_TIP_QUESTIONS && (
            <p>These takeaways summarize the first {MAX_TIP_QUESTIONS} missed questions.</p>
          )}
          <button type="button" onClick={generateTips}>
            Regenerate tips
          </button>
        </>
      )}
    </aside>
  )
}

function QuizResultsPage() {
  const { session, loading: authLoading } = useAuth()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return

    let cancelled = false

    async function loadResults() {
      setLoading(true)
      setError('')

      try {
        if (!session) {
          throw new Error('Please sign in to see your game results.')
        }

        if (!supabase) {
          throw new Error('Supabase is not configured.')
        }

        const { data, error: queryError } = await supabase
          .from('game_attempts')
          .select(
            'attempt_id, study_set_title, mode_id, score, correct, total, completed_at, missed_questions',
          )
          .order('completed_at', { ascending: false })
          .limit(50)

        if (queryError) throw queryError

        if (!cancelled) setResults(data ?? [])
      } catch (err) {
        if (!cancelled) {
          setError(err.message ?? 'Could not load game results.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadResults()

    return () => {
      cancelled = true
    }
  }, [session, authLoading])

  if (authLoading || loading) {
    return (
      <main className="quizresults-page">
        <p>Loading results...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="quizresults-page">
        <h1>Quiz Results</h1>
        <p role="alert">{error}</p>
      </main>
    )
  }

  return (
    <main className="quizresults-page">
      <h1>Quiz Results</h1>

      {results.length === 0 ? (
        <p>No game results saved yet.</p>
      ) : (
        <ol>
          {results.map((result) => (
            <li key={result.attempt_id}>
              <h2>
                {result.study_set_title} —{' '}
                {result.mode_id === 'practice-quiz'
                  ? 'Practice quiz'
                  : result.mode_id}
              </h2>
              <p>
                Score: {result.score}; correct: {result.correct} of {result.total}
              </p>
              <time dateTime={result.completed_at}>
                {new Date(result.completed_at).toLocaleString()}
              </time>
              <StudyTips
                attemptId={result.attempt_id}
                missedQuestions={
                  Array.isArray(result.missed_questions)
                    ? result.missed_questions
                    : []
                }
              />
            </li>
          ))}
        </ol>
      )}
    </main>
  )
}

export default QuizResultsPage