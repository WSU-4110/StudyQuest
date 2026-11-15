function getCorrectIndexes(card) {
  if (Array.isArray(card.correctIndexes)) return card.correctIndexes
  if (typeof card.correctIndex === 'number') return [card.correctIndex]
  return []
}

// Cards without enough data to be scored are skipped.
export function toQuestions(cards) {
  const questions = []

  ;(cards ?? []).forEach((card, index) => {
    const type = card.type ?? 'short_answer'
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

  return questions
}

export function shuffle(items) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// A shuffled order of question indexes. `avoidFirst` stops the last question
// of one pass from showing up again as the first of the next.
export function drawOrder(count, avoidFirst = null) {
  const order = shuffle(Array.from({ length: count }, (_, i) => i))
  if (count > 1 && order[0] === avoidFirst) {
    ;[order[0], order[count - 1]] = [order[count - 1], order[0]]
  }
  return order
}

export function advanceDeck(deck, count) {
  if (deck.position + 1 < deck.order.length) {
    return { ...deck, position: deck.position + 1 }
  }
  return { order: drawOrder(count, deck.order[deck.position]), position: 0 }
}

export function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

export function isCorrectAnswer(question, response) {
  if (question.type === 'short_answer') {
    return normalizeText(response) === normalizeText(question.answer)
  }
  if (question.type === 'true_false') {
    return response === question.answer
  }
  if (question.type === 'multiple_choice') {
    const picked = [...(response ?? [])].sort((a, b) => a - b)
    const correct = [...question.correctIndexes].sort((a, b) => a - b)
    return (
      picked.length === correct.length &&
      picked.every((value, i) => value === correct[i])
    )
  }
  return false
}

export function formatResponse(question, response) {
  if (response === undefined || response === null || response === '') {
    return 'No answer'
  }
  if (question.type === 'true_false') return response ? 'True' : 'False'
  if (question.type === 'multiple_choice') {
    return response.map((i) => question.options[i]).join(', ')
  }
  return String(response)
}

export function formatCorrectAnswer(question) {
  if (question.type === 'true_false') return question.answer ? 'True' : 'False'
  if (question.type === 'multiple_choice') {
    return question.correctIndexes.map((i) => question.options[i]).join(', ')
  }
  return question.answer
}
