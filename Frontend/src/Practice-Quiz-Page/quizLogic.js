// Pure quiz helpers: no React, no Supabase. Works on cards from studysets.sets.
// Scoring/formatting now lives in scoringStrategies.js (Strategy pattern).
import { defaultScorer } from './ScoringStrategies.js'

export function getCardType(card) {
  return card.type ?? 'short_answer'
}

function getCorrectIndexes(card) {
  if (Array.isArray(card.correctIndexes)) return card.correctIndexes
  if (typeof card.correctIndex === 'number') return [card.correctIndex]
  return []
}

// Cards have no id, so the card's position in the set is the question id.
// Cards that can't be scored (missing answer/options) are skipped.
export function generateQuiz(studySet, { shuffle = false } = {}) {
  const cards = studySet?.cards ?? []
  const questions = []

  cards.forEach((card, index) => {
    const type = getCardType(card)
    const prompt = String(card.question ?? '').trim()
    if (!prompt) return

    if (type === 'multiple_choice') {
      const options = Array.isArray(card.options) ? card.options : []
      const correctIndexes = getCorrectIndexes(card)
      if (options.length < 2 || correctIndexes.length === 0) return
      questions.push({ id: index, type, prompt, options, correctIndexes })
    } else if (type === 'true_false') {
      if (typeof card.answer !== 'boolean') return
      questions.push({ id: index, type, prompt, answer: card.answer })
    } else {
      const answer = String(card.answer ?? '').trim()
      if (!answer) return
      questions.push({ id: index, type: 'short_answer', prompt, answer })
    }
  })

  if (shuffle) {
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[questions[i], questions[j]] = [questions[j], questions[i]]
    }
  }

  return questions
}

// Same exports as before, so PracticeQuizPage.jsx needs no changes.
export const isCorrect = (question, response) =>
  defaultScorer.isCorrect(question, response)

export const formatCorrectAnswer = (question) =>
  defaultScorer.formatCorrectAnswer(question)

export const formatResponse = (question, response) =>
  defaultScorer.formatResponse(question, response)

export const scoreQuiz = (questions, responses) =>
  defaultScorer.scoreQuiz(questions, responses)