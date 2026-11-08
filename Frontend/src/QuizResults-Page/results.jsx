import { useEffect, useState } from 'react'
import { useAuth } from '../Auth-Page/AuthContext.jsx'
import { studyQuest } from '../services/studyQuestFacade.js'
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

    const data = await studyQuest.quizResults()
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