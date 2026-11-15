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

// One review entry per question: missing it again keeps the latest answer
// and counts the misses instead of adding a duplicate.
function addMiss(missed, question, response) {
  const at = missed.findIndex((entry) => entry.question === question)
  if (at === -1) return [...missed, { question, response, times: 1 }]
  return missed.map((entry, i) =>
    i === at ? { ...entry, response, times: entry.times + 1 } : entry,
  )
}

// Options:
// - isOver(stats): stop advancing once it returns true.
// - takeQueued(): called before each new card. Return a question index to show
//   that card next (without using up a card from the deck), or null.
export function useGameSession(questions, getPoints, options = {}) {
  const [deck, setDeck] = useState(() => ({
    order: drawOrder(questions.length),
    position: 0,
    turn: 0,
    queued: null,
  }))
  const [stats, setStats] = useState(INITIAL_STATS)
  const [feedback, setFeedback] = useState(null)
  const shownAtRef = useRef(0)
  const takeQueuedRef = useRef(options.takeQueued)

  const questionIndex = deck.queued ?? deck.order[deck.position]
  const question = questions[questionIndex] ?? null
  const over = options.isOver ? options.isOver(stats) : false

  useEffect(() => {
    takeQueuedRef.current = options.takeQueued
  })

  useEffect(() => {
    shownAtRef.current = Date.now()
  }, [deck])

  function advance() {
    const queued = takeQueuedRef.current?.() ?? null
    setDeck((prev) =>
      queued !== null
        ? { ...prev, queued, turn: prev.turn + 1 }
        : {
            ...advanceDeck(prev, questions.length),
            queued: null,
            turn: prev.turn + 1,
          },
    )
  }

  useEffect(() => {
    if (!feedback || over) return undefined
    const timeout = setTimeout(
      () => {
        setFeedback(null)
        advance()
      },
      feedback.correct ? CORRECT_FEEDBACK_MS : WRONG_FEEDBACK_MS,
    )
    return () => clearTimeout(timeout)
    // advance only reads refs and setters, so it doesn't need to be a dependency.
  }, [feedback, over, questions.length]) // eslint-disable-line react-hooks/exhaustive-deps

  function submitAnswer(response) {
    if (feedback || over || !question) return null

    const correct = isCorrectAnswer(question, response)
    const streak = correct ? stats.streak + 1 : 0
    const points = correct
      ? getPoints({
          streak,
          msTaken: Date.now() - shownAtRef.current,
          question,
          queued: deck.queued !== null,
        })
      : 0

    const nextStats = {
      score: stats.score + points,
      correct: stats.correct + (correct ? 1 : 0),
      answered: stats.answered + 1,
      streak,
      bestStreak: Math.max(stats.bestStreak, streak),
      missed: correct ? stats.missed : addMiss(stats.missed, question, response),
    }

    setStats(nextStats)
    setFeedback({ correct, response, points })
    return { correct, points, stats: nextStats }
  }

  // Moves on without answering. Stats and streak are left alone.
  function skip() {
    if (feedback || over || !question) return false
    advance()
    return true
  }

  return {
    question,
    questionIndex,
    turn: deck.turn,
    queued: deck.queued !== null,
    stats,
    feedback,
    submitAnswer,
    skip,
  }
}
