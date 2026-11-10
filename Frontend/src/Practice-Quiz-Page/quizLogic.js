// Pure quiz helpers: no React, no Supabase. Works on cards from studysets.sets.

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

const normalize = (value) => String(value ?? '').trim().toLowerCase()

export function isCorrect(question, response) {
  switch (question.type) {
    case 'short_answer':
      return normalize(response) === normalize(question.answer)
    case 'true_false':
      return response === question.answer
    case 'multiple_choice': {
      const picked = [...(response ?? [])].sort((a, b) => a - b)
      const correct = [...question.correctIndexes].sort((a, b) => a - b)
      return (
        picked.length === correct.length &&
        picked.every((value, i) => value === correct[i])
      )
    }
    default:
      return false
  }
}

export function formatCorrectAnswer(question) {
  if (question.type === 'true_false') return question.answer ? 'True' : 'False'
  if (question.type === 'multiple_choice') {
    return question.correctIndexes.map((i) => question.options[i]).join(', ')
  }
  return question.answer
}

export function formatResponse(question, response) {
  if (response === undefined || response === null || response === '') {
    return 'No answer'
  }
  if (question.type === 'true_false') return response ? 'True' : 'False'
  if (question.type === 'multiple_choice') {
    return response.length
      ? response.map((i) => question.options[i]).join(', ')
      : 'No answer'
  }
  return String(response)
}

// responses: { [questionId]: string | boolean | number[] }
export function scoreQuiz(questions, responses) {
  const results = questions.map((question) => ({
    question,
    response: responses[question.id],
    correct: isCorrect(question, responses[question.id]),
  }))
  const score = results.filter((r) => r.correct).length
  const total = questions.length
  const percent = total ? Math.round((score / total) * 100) : 0
  return { score, total, percent, results }
}