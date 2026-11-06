import { useEffect, useState } from 'react'
import { useAuth } from '../Auth-Page/AuthContext.jsx'
import { supabase } from '../lib/supabaseClient.js'
import './results.css'

function QuizResultsPage() {
  const { session, loading: authLoading } = useAuth()
  const [result, setResult] = useState(null)
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
          throw new Error('Please sign in to see your quiz results.')
        }

        if (!supabase) {
          throw new Error('Supabase is not configured.')
        }

        const { data: user, error: userError } = await supabase.from('users').select('quiz_id').eq('auth_user_id', session.user.id).maybeSingle()

        if (userError) throw userError
        if (!user) throw new Error('Your user profile was not found.')

        const { data, error: quizError } = await supabase.from('quiz_attempts').select('currquiz, prevquiz, currtot, prevtot, currdate, prevdate').eq('quiz_id', user.quiz_id).maybeSingle()

        if (quizError) throw quizError
        if (!data) throw new Error('Your quiz results were not found.')

        if (!cancelled) setResult(data)
      } catch (err) {
        if (!cancelled) setError(err.message ?? 'Could not load quiz results.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadResults()

    return () => {
      cancelled = true
    }
  }, [session, authLoading])

  if (loading) {
    return <main className="quizresults-page"><p>Loading results…</p></main>
  }

  if (error) {
    return <main className="quizresults-page"><h1>Quiz Results</h1><p>{error}</p></main>
  }

  const hasCurrentResult = Number(result.currtot) > 0
  const hasPreviousResult = Number(result.prevtot) > 0

  return (
    <main className="quizresults-page">
      <h1>Quiz Results</h1>

      <h2>Most recent quiz</h2>
      {hasCurrentResult ? (
        <p>{result.currquiz} correct out of {result.currtot}</p>
      ) : (
        <p>No quiz results saved yet.</p>
      )}

      <h2>Previous quiz</h2>
      {hasPreviousResult ? (
        <p>{result.prevquiz} correct out of {result.prevtot}</p>
      ) : (
        <p>No previous quiz results.</p>
      )}
    </main>
  )
}

export default QuizResultsPage