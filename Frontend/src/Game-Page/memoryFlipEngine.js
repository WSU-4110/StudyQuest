import { formatCorrectAnswer, normalizeText, shuffle } from './gameEngine.js'

const SOFT_HYPHEN = '­'
const LONG_WORD = /\p{L}{10,}/gu
const HYPHEN_EVERY = 5
const MIN_TAIL = 3

// The pixel font is wide, so long words don't fit on narrow cards. Soft
// hyphens let them wrap with a visible hyphen; browsers only draw the hyphen
// where they actually break the line.
export function addSoftHyphens(text) {
  return text.replace(LONG_WORD, (word) => {
    let result = ''
    for (let i = 0; i < word.length; i += HYPHEN_EVERY) {
      const tail = word.length - (i + HYPHEN_EVERY)
      result += word.slice(i, i + HYPHEN_EVERY)
      if (tail >= MIN_TAIL) result += SOFT_HYPHEN
    }
    return result
  })
}

// True/false statements don't get their own answer card. They're sorted onto
// a shared True or False card instead.
const BIN_LABELS = { true: 'True', false: 'False' }

function isTrueFalse(question) {
  return question.type === 'true_false'
}

// Repeated prompts or answers are skipped so every tile has exactly one
// partner on the board. When true/false statements are in play, an ordinary
// card whose answer is literally "True" or "False" is skipped too, so it
// can't be mixed up with the True and False cards.
function pickPairs(questions, limit = Infinity) {
  const prompts = new Set()
  const answers = new Set()
  if (questions.some(isTrueFalse)) {
    answers.add('true')
    answers.add('false')
  }
  const pairs = []

  for (const question of questions) {
    if (pairs.length >= limit) break
    const promptKey = normalizeText(question.prompt)
    if (prompts.has(promptKey)) continue
    if (isTrueFalse(question)) {
      prompts.add(promptKey)
      pairs.push({ question, answer: null })
      continue
    }
    const answer = formatCorrectAnswer(question)
    const answerKey = normalizeText(answer)
    if (answers.has(answerKey)) continue
    prompts.add(promptKey)
    answers.add(answerKey)
    pairs.push({ question, answer })
  }
  return pairs
}

// How many pairs this set can make, for the start screen's pair picker.
export function countPairs(questions) {
  return pickPairs(questions).length
}

// Picks maxPairs questions at random and makes a question tile and an answer
// tile for each. The two columns are shuffled separately, so a question's row
// says nothing about where its answer is.
export function dealPairs(questions, settings) {
  const pairs = pickPairs(shuffle(questions), settings.maxPairs)
  const indexed = pairs.map((pair, pairId) => ({ ...pair, pairId }))
  const hasTrueFalse = pairs.some(({ question }) => isTrueFalse(question))

  return {
    questionTiles: shuffle(
      indexed.map(({ question, pairId }) => ({
        id: `q${pairId}`,
        pairId,
        kind: 'question',
        text: question.prompt,
        question,
      })),
    ),
    answerTiles: shuffle(
      indexed
        .filter(({ question }) => !isTrueFalse(question))
        .map(({ question, answer, pairId }) => ({
          id: `a${pairId}`,
          pairId,
          kind: 'answer',
          text: answer,
          question,
        })),
    ),
    // Both bins always show, so an all-true board doesn't give answers away.
    bins: hasTrueFalse
      ? [true, false].map((value) => ({
          id: `bin-${value}`,
          pairId: null,
          kind: 'answer',
          bin: true,
          value,
          text: BIN_LABELS[value],
        }))
      : [],
  }
}

// A question matches its own answer card, or for a true/false statement, the
// bin holding its truth value.
export function isMatch(question, answer) {
  if (answer.bin) {
    return isTrueFalse(question.question) && question.question.answer === answer.value
  }
  return question.pairId === answer.pairId
}

// streak includes the match being scored, so the first match earns the base.
export function getMatchPoints(settings, streak) {
  return settings.pointsPerMatch + (streak - 1) * settings.streakBonus
}

// Adds a question paired with the wrong answer to the review list, once per
// question and wrong answer.
export function recordMiss(missed, question, answer) {
  const already = missed.some(
    (entry) =>
      entry.question.id === question.question.id &&
      entry.responseText === answer.text,
  )
  if (already) return missed
  return [...missed, { question: question.question, responseText: answer.text }]
}
