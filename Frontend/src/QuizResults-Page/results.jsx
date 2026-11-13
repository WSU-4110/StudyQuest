import { useEffect, useState } from 'react'
import { useAuth } from '../Auth-Page/AuthContext.jsx'
import { supabase } from '../lib/supabaseClient.js'
import './results.css'

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
          .select('attempt_id, study_set_title, mode_id, score, correct, total, completed_at')
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
              <h2>{result.study_set_title} — {result.mode_id}</h2>
              <p>
                Score: {result.score}; correct: {result.correct} of {result.total}
              </p>
              <time dateTime={result.completed_at}>
                {new Date(result.completed_at).toLocaleString()}
              </time>
            </li>
          ))}
        </ol>
      )}
    </main>
  )
}

export default QuizResultsPage