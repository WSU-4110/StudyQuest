import { useEffect, useRef, useState } from 'react'
import { advanceDeck, drawOrder, isCorrectAnswer } from './gameEngine.js'

export const CORRECT_FEEDBACK_MS = 600
export const WRONG_FEEDBACK_MS = 1500

const INITIAL_STATS = {
  score: 0,
  correct: 0,
  answered: 0,
  streak: 0,
  bestStreak: 0,
  missed: [],
}

export function useGameSession(questions, getPoints, { isOver } = {}) {
  const [deck, setDeck] = useState(() => ({
    order: drawOrder(questions.length),
    position: 0,
    turn: 0,
  }))
  const [stats, setStats] = useState(INITIAL_STATS)
  const [feedback, setFeedback] = useState(null)
  const shownAtRef = useRef(0)

  const question = questions[deck.order[deck.position]] ?? null
  const over = isOver ? isOver(stats) : false

  useEffect(() => {
    shownAtRef.current = Date.now()
  }, [deck])

  useEffect(() => {
    if (!feedback || over) return
    const timeout = setTimeout(
      () => {
        setFeedback(null)
        setDeck((prev) => ({
          ...advanceDeck(prev, questions.length),
          turn: prev.turn + 1,
        }))
      },
      feedback.correct ? CORRECT_FEEDBACK_MS : WRONG_FEEDBACK_MS,
    )
    return () => clearTimeout(timeout)
  }, [feedback, over, questions.length])

  function submitAnswer(response) {
    if (feedback || over || !question) return null

    const correct = isCorrectAnswer(question, response)
    const streak = correct ? stats.streak + 1 : 0
    const points = correct
      ? getPoints({ streak, msTaken: Date.now() - shownAtRef.current })
      : 0

    const nextStats = {
      score: stats.score + points,
      correct: stats.correct + (correct ? 1 : 0),
      answered: stats.answered + 1,
      streak,
      bestStreak: Math.max(stats.bestStreak, streak),
      missed: correct ? stats.missed : [...stats.missed, { question, response }],
    }

    setStats(nextStats)
    setFeedback({ correct, response, points })
    return { correct, points, stats: nextStats }
  }

  return { question, turn: deck.turn, stats, feedback, submitAnswer }
}
