import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStudySets } from '../context/StudySetContext.jsx'
import './CreateStudySetPage.css'

function createEmptyCard() {
  return { id: crypto.randomUUID(), question: '', answer: '' }
}

function CreateStudySetPage() {
  const navigate = useNavigate()
  const { addStudySet } = useStudySets()
  const [title, setTitle] = useState('')
  const [cards, setCards] = useState(() => [
    createEmptyCard(),
    createEmptyCard(),
    createEmptyCard(),
  ])
  const [error, setError] = useState('')

  function updateCard(id, field, value) {
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, [field]: value } : card)),
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

  function handleCreate(event) {
    event.preventDefault()
    setError('')

    const trimmedTitle = title.trim()
    const filledCards = cards.filter(
      (card) => card.question.trim() && card.answer.trim(),
    )

    if (!trimmedTitle) {
      setError('Enter a study set title.')
      return
    }

    if (filledCards.length === 0) {
      setError('Add at least one card with both a question and an answer.')
      return
    }

    addStudySet({
      title: trimmedTitle,
      cards: filledCards.map(({ question, answer }) => ({
        question: question.trim(),
        answer: answer.trim(),
      })),
    })

    navigate('/')
  }

  return (
    <main className="create-study-set">
      <h1>Create a study set</h1>

      <form onSubmit={handleCreate}>
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
              <span className="card-number" aria-hidden="true">
                {index + 1}
              </span>
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
              </div>
              <button
                type="button"
                className="remove-btn"
                onClick={() => removeCard(card.id)}
                disabled={cards.length <= 1}
              >
                Remove
              </button>
            </li>
          ))}
        </ol>

        <div className="actions">
          <button type="button" onClick={addCard}>
            + Add card
          </button>
          <button type="submit">Create</button>
        </div>

        {error ? <p className="form-error">{error}</p> : null}
      </form>
    </main>
  )
}

export default CreateStudySetPage
