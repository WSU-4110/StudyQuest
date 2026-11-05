import { supabase } from '../lib/supabaseClient.js'

function normalizeText(value){
    return String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function toBoolean(value){
    if (typeof value === 'boolean') return value;
    if (typeof value !== 'string') return null;

    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;

    return null;
}


function isCorrectAnswer(card, submittedAnswer) {
  const type = card.type ?? 'short_answer'

  if (type === 'multiple_choice') {
    const correct = card.correctIndexes ?? (
      Number.isInteger(card.correctIndex) ? [card.correctIndex] : []
    )
    const submitted = Array.isArray(submittedAnswer) ? submittedAnswer : [submittedAnswer]

    if (correct.length === 0 || submitted.length === 0) return false

    const expected = [...correct].sort((a, b) => a - b)
    const actual = submitted.filter(Number.isInteger).sort((a, b) => a - b)

    return (
      actual.length === expected.length &&
      actual.every((index, i) => index === expected[i])
    )
  }

  if (type === 'true_false') {
    const expected = toBoolean(card.answer)
    return expected !== null && toBoolean(submittedAnswer) === expected
  }

  return normalizeText(submittedAnswer) === normalizeText(card.answer)
}

const result = getResults(studySet.cards, answers);

const quizData = {
    currQuiz: result.correctCount,
    currTot: result.total,
    currData: result.completedAt,
}

export async function saveQuizResult({ correctCount, total }) {
  if (!supabase) {
    throw new Error('Supabase is not configured.')
  }

  const { error } = await supabase.rpc('record_quiz_result', {
    p_correct: correctCount,
    p_total: total,
  })

  if (error) {
    throw new Error(error.message)
  }
}