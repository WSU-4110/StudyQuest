// Strategy pattern: one interchangeable scoring strategy per question type.
// QuizScorer (the context) picks the strategy that matches question.type.

// Strategy interface (JavaScript has no interfaces, so this is the contract).
export class ScoringStrategy {
  isCorrect(question, response) {
    throw new Error('isCorrect() must be implemented by a concrete strategy')
  }

  formatCorrectAnswer(question) {
    throw new Error('formatCorrectAnswer() must be implemented by a concrete strategy')
  }

  formatResponse(question, response) {
    throw new Error('formatResponse() must be implemented by a concrete strategy')
  }
}

const normalize = (value) => String(value ?? '').trim().toLowerCase()

export class ShortAnswerScoring extends ScoringStrategy {
  isCorrect(question, response) {
    return normalize(response) === normalize(question.answer)
  }

  formatCorrectAnswer(question) {
    return question.answer
  }

  formatResponse(question, response) {
    return String(response)
  }
}

export class TrueFalseScoring extends ScoringStrategy {
  isCorrect(question, response) {
    return response === question.answer
  }

  formatCorrectAnswer(question) {
    return question.answer ? 'True' : 'False'
  }

  formatResponse(question, response) {
    return response ? 'True' : 'False'
  }
}

export class MultipleChoiceScoring extends ScoringStrategy {
  isCorrect(question, response) {
    const picked = [...(response ?? [])].sort((a, b) => a - b)
    const correct = [...question.correctIndexes].sort((a, b) => a - b)
    return (
      picked.length === correct.length &&
      picked.every((value, i) => value === correct[i])
    )
  }

  formatCorrectAnswer(question) {
    return question.correctIndexes.map((i) => question.options[i]).join(', ')
  }

  formatResponse(question, response) {
    return response.length
      ? response.map((i) => question.options[i]).join(', ')
      : 'No answer'
  }
}

// Context: holds the strategies and delegates to the right one.
export class QuizScorer {
  constructor(strategies) {
    this.strategies = strategies
  }

  strategyFor(question) {
    return this.strategies[question.type] ?? null
  }

  isCorrect(question, response) {
    const strategy = this.strategyFor(question)
    return strategy ? strategy.isCorrect(question, response) : false
  }

  formatCorrectAnswer(question) {
    const strategy = this.strategyFor(question)
    return strategy ? strategy.formatCorrectAnswer(question) : question.answer
  }

  formatResponse(question, response) {
    if (response === undefined || response === null || response === '') {
      return 'No answer'
    }
    const strategy = this.strategyFor(question)
    return strategy
      ? strategy.formatResponse(question, response)
      : String(response)
  }

  // responses: { [questionId]: string | boolean | number[] }
  scoreQuiz(questions, responses) {
    const results = questions.map((question) => ({
      question,
      response: responses[question.id],
      correct: this.isCorrect(question, responses[question.id]),
    }))
    const score = results.filter((r) => r.correct).length
    const total = questions.length
    const percent = total ? Math.round((score / total) * 100) : 0
    return { score, total, percent, results }
  }
}

// Registering a new question type = add one strategy class and one entry here.
export const defaultScorer = new QuizScorer({
  short_answer: new ShortAnswerScoring(),
  true_false: new TrueFalseScoring(),
  multiple_choice: new MultipleChoiceScoring(),
})