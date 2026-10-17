import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStudySets } from './StudySetContext.jsx'
import './CreateStudySetPage.css'

const CARD_TYPES = [
  { value: 'short_answer', label: 'Short' },
  { value: 'multiple_choice', label: 'Multiple choice' },
  { value: 'true_false', label: 'True / false' },
]

function createEmptyCard(type = 'short_answer') {
  const base = { id: crypto.randomUUID(), question: '', type }

  if (type === 'multiple_choice') {
    return { ...base, options: ['', ''], correctIndexes: [0] }
  }

  if (type === 'true_false') {
    return { ...base, answer: true }
  }

  return { ...base, answer: '' }
}

function fieldsForType(type) {
  if (type === 'multiple_choice') {
    return {
      options: ['', ''],
      correctIndexes: [0],
      answer: undefined,
    }
  }

  if (type === 'true_false') {
    return {
      answer: true,
      options: undefined,
      correctIndexes: undefined,
    }
  }

  return {
    answer: '',
    options: undefined,
    correctIndexes: undefined,
  }
}

function isCardComplete(card) {
  if (!card.question.trim()) return false

  if (card.type === 'multiple_choice') {
    const filled = card.options
      .map((option, index) => ({ text: option.trim(), index }))
      .filter((option) => option.text)

    if (filled.length < 2) return false

    const correctIndexes = card.correctIndexes ?? []
    return correctIndexes.some((index) => card.options[index]?.trim())
  }

  if (card.type === 'true_false') {
    return typeof card.answer === 'boolean'
  }

  return Boolean(String(card.answer ?? '').trim())
}

function serializeCard(card) {
  const question = card.question.trim()

  if (card.type === 'multiple_choice') {
    const options = card.options.map((option) => option.trim())
    const filledIndexes = options
      .map((text, index) => ({ text, index }))
      .filter((option) => option.text)
      .map((option) => option.index)

    const remappedOptions = filledIndexes.map((index) => options[index])
    const correctIndexes = (card.correctIndexes ?? [])
      .map((oldIndex) =>
        filledIndexes.findIndex((filledIndex) => filledIndex === oldIndex),
      )
      .filter((index) => index >= 0)
      .sort((a, b) => a - b)

    return {
      type: 'multiple_choice',
      question,
      options: remappedOptions,
      correctIndexes:
        correctIndexes.length > 0 ? correctIndexes : [0],
    }
  }

  if (card.type === 'true_false') {
    return {
      type: 'true_false',
      question,
      answer: Boolean(card.answer),
    }
  }

  return {
    type: 'short_answer',
    question,
    answer: String(card.answer ?? '').trim(),
  }
}

function hydrateCard(card) {
  const type = card.type ?? 'short_answer'
  const id = crypto.randomUUID()

  if (type === 'multiple_choice') {
    const options =
      Array.isArray(card.options) && card.options.length >= 2
        ? [...card.options]
        : ['', '']
    const correctIndexes = Array.isArray(card.correctIndexes)
      ? [...card.correctIndexes]
      : typeof card.correctIndex === 'number'
        ? [card.correctIndex]
        : [0]

    return { id, type, question: card.question ?? '', options, correctIndexes }
  }

  if (type === 'true_false') {
    return {
      id,
      type,
      question: card.question ?? '',
      answer: Boolean(card.answer),
    }
  }

  return {
    id,
    type: 'short_answer',
    question: card.question ?? '',
    answer: card.answer ?? '',
  }
}

function CreateStudySetPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addStudySet, updateStudySet, getStudySet } = useStudySets()
  const isEditing = Boolean(id)
  const existingSet = isEditing ? getStudySet(id) : null

  const [title, setTitle] = useState('')
  const [cards, setCards] = useState(() => [
    createEmptyCard(),
    createEmptyCard(),
    createEmptyCard(),
  ])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) {
      setTitle('')
      setCards([createEmptyCard(), createEmptyCard(), createEmptyCard()])
      setError('')
      return
    }

    const studySet = getStudySet(id)
    if (!studySet) return

    setTitle(studySet.title)
    setCards(
      studySet.cards.length > 0
        ? studySet.cards.map(hydrateCard)
        : [createEmptyCard()],
    )
    setError('')
  }, [id])

  function updateCard(id, field, value) {
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, [field]: value } : card)),
    )
  }

  function changeCardType(id, type) {
    setCards((prev) =>
      prev.map((card) =>
        card.id === id
          ? { id: card.id, question: card.question, type, ...fieldsForType(type) }
          : card,
      ),
    )
  }

  function updateOption(cardId, optionIndex, value) {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id !== cardId) return card
        const options = card.options.map((option, index) =>
          index === optionIndex ? value : option,
        )
        return { ...card, options }
      }),
    )
  }

  function addOption(cardId) {
    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId
          ? { ...card, options: [...card.options, ''] }
          : card,
      ),
    )
  }

  function toggleCorrectOption(cardId, optionIndex) {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id !== cardId) return card

        const current = card.correctIndexes ?? []
        const isSelected = current.includes(optionIndex)
        const correctIndexes = isSelected
          ? current.filter((index) => index !== optionIndex)
          : [...current, optionIndex].sort((a, b) => a - b)

        return { ...card, correctIndexes }
      }),
    )
  }

  function removeOption(cardId, optionIndex) {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id !== cardId || card.options.length <= 2) return card

        const options = card.options.filter((_, index) => index !== optionIndex)
        const correctIndexes = (card.correctIndexes ?? [])
          .filter((index) => index !== optionIndex)
          .map((index) => (index > optionIndex ? index - 1 : index))

        return {
          ...card,
          options,
          correctIndexes:
            correctIndexes.length > 0 ? correctIndexes : [0],
        }
      }),
    )
  }

  function addCard() {
    setCards((prev) => [...prev, createEmptyCard()])
  }

  function removeCard(id) {
    setCards((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((card) => card.id !== id)
    })
  }

  function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const trimmedTitle = title.trim()
    const filledCards = cards.filter(isCardComplete)

    if (!trimmedTitle) {
      setError('Enter a study set title.')
      return
    }

    if (filledCards.length === 0) {
      setError(
        'Add at least one complete card. Multiple choice needs a question, two filled options, and at least one correct choice.',
      )
      return
    }

    const payload = {
      title: trimmedTitle,
      cards: filledCards.map(serializeCard),
    }

    if (isEditing) {
      updateStudySet(id, payload)
      navigate(`/studysets/${id}`)
      return
    }

    addStudySet(payload)
    navigate('/studysets')
  }

  if (isEditing && !existingSet) {
    return (
      <main className="create-study-set">
        <p>Study set not found.</p>
        <Link to="/studysets">Back to library</Link>
      </main>
    )
  }

  return (
    <main className="create-study-set">
      <h1>{isEditing ? 'Edit study set' : 'Create a study set'}</h1>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="study-set-title">Title</label>
          <input
            id="study-set-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title"
            autoComplete="off"
          />
        </div>

        <ol className="card-list">
          {cards.map((card, index) => (
            <li key={card.id} className="card-row">
              <div className="card-header">
                <span className="card-number" aria-hidden="true">
                  {index + 1}
                </span>
                <div
                  className="card-type-chips"
                  role="group"
                  aria-label={`Card ${index + 1} type`}
                >
                  {CARD_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      className={
                        card.type === type.value
                          ? 'type-chip active'
                          : 'type-chip'
                      }
                      aria-pressed={card.type === type.value}
                      onClick={() => changeCardType(card.id, type.value)}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeCard(card.id)}
                  disabled={cards.length <= 1}
                >
                  Remove
                </button>
              </div>

              <div className="card-fields">
                <div className="field">
                  <label htmlFor={`question-${card.id}`}>Question</label>
                  <input
                    id={`question-${card.id}`}
                    type="text"
                    value={card.question}
                    onChange={(e) =>
                      updateCard(card.id, 'question', e.target.value)
                    }
                    placeholder="Enter a question"
                    autoComplete="off"
                  />
                </div>

                {card.type === 'short_answer' ? (
                  <div className="field">
                    <label htmlFor={`answer-${card.id}`}>Answer</label>
                    <input
                      id={`answer-${card.id}`}
                      type="text"
                      value={card.answer}
                      onChange={(e) =>
                        updateCard(card.id, 'answer', e.target.value)
                      }
                      placeholder="Enter an answer"
                      autoComplete="off"
                    />
                  </div>
                ) : null}

                {card.type === 'true_false' ? (
                  <fieldset className="tf-fieldset">
                    <legend>Correct answer</legend>
                    <label className="choice-row">
                      <input
                        type="radio"
                        name={`tf-${card.id}`}
                        checked={card.answer === true}
                        onChange={() => updateCard(card.id, 'answer', true)}
                      />
                      True
                    </label>
                    <label className="choice-row">
                      <input
                        type="radio"
                        name={`tf-${card.id}`}
                        checked={card.answer === false}
                        onChange={() => updateCard(card.id, 'answer', false)}
                      />
                      False
                    </label>
                  </fieldset>
                ) : null}

                {card.type === 'multiple_choice' ? (
                  <div className="mc-options">
                    <p className="mc-label">
                      Options — check all that are correct
                    </p>
                    <ul className="option-list">
                      {card.options.map((option, optionIndex) => (
                        <li key={`${card.id}-option-${optionIndex}`}>
                          <label className="choice-row option-row">
                            <input
                              type="checkbox"
                              checked={(card.correctIndexes ?? []).includes(
                                optionIndex,
                              )}
                              onChange={() =>
                                toggleCorrectOption(card.id, optionIndex)
                              }
                              aria-label={`Mark option ${optionIndex + 1} as correct`}
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) =>
                                updateOption(
                                  card.id,
                                  optionIndex,
                                  e.target.value,
                                )
                              }
                              placeholder={`Option ${optionIndex + 1}`}
                              autoComplete="off"
                            />
                          </label>
                          <button
                            type="button"
                            className="remove-option-btn"
                            onClick={() => removeOption(card.id, optionIndex)}
                            disabled={card.options.length <= 2}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className="add-option-btn"
                      onClick={() => addOption(card.id)}
                    >
                      + Add option
                    </button>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ol>

        <div className="actions">
          <button type="button" onClick={addCard}>
            + Add card
          </button>
          <button type="submit">{isEditing ? 'Save changes' : 'Create'}</button>
        </div>

        {error ? <p className="form-error">{error}</p> : null}
      </form>
    </main>
  )
}

export default CreateStudySetPage
