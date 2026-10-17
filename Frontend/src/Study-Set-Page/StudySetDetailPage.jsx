import { Link, useParams } from 'react-router-dom'
import { useStudySets } from './StudySetContext.jsx'
import './StudySetDetailPage.css'

function getCardType(card) {
  return card.type ?? 'short_answer'
}

function typeLabel(type) {
  if (type === 'multiple_choice') return 'Multiple choice'
  if (type === 'true_false') return 'True / false'
  return 'Short answer'
}

function getCorrectIndexes(card) {
  if (Array.isArray(card.correctIndexes)) return card.correctIndexes
  if (typeof card.correctIndex === 'number') return [card.correctIndex]
  return []
}

function CardAnswer({ card }) {
  const type = getCardType(card)

  if (type === 'multiple_choice') {
    const correctIndexes = getCorrectIndexes(card)
    return (
      <div>
        <h2>Options</h2>
        <ul className="detail-option-list">
          {(card.options ?? []).map((option, optionIndex) => {
            const isCorrect = correctIndexes.includes(optionIndex)
            return (
              <li
                key={`${option}-${optionIndex}`}
                className={isCorrect ? 'detail-option correct' : 'detail-option'}
              >
                <span>{option}</span>
                {isCorrect ? (
                  <span className="correct-badge">Correct</span>
                ) : null}
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  if (type === 'true_false') {
    return (
      <div>
        <h2>Answer</h2>
        <p>{card.answer ? 'True' : 'False'}</p>
      </div>
    )
  }

  return (
    <div>
      <h2>Answer</h2>
      <p>{card.answer}</p>
    </div>
  )
}

function StudySetDetailPage() {
  const { id } = useParams()
  const { getStudySet } = useStudySets()
  const studySet = getStudySet(id)

  if (!studySet) {
    return (
      <main className="study-set-detail">
        <p>Study set not found.</p>
        <Link to="/studysets">Back to library</Link>
      </main>
    )
  }

  return (
    <main className="study-set-detail">
      <div className="detail-top">
        <Link className="back-link" to="/studysets">
          Back to library
        </Link>
        <Link className="edit-link" to={`/studysets/${studySet.id}/edit`}>
          Edit
        </Link>
      </div>
      <h1>{studySet.title}</h1>
      <p className="card-count">
        {studySet.cards.length}{' '}
        {studySet.cards.length === 1 ? 'card' : 'cards'}
      </p>

      <ol className="detail-card-list">
        {studySet.cards.map((card, index) => {
          const type = getCardType(card)
          return (
            <li key={`${studySet.id}-${index}`} className="detail-card">
              <span className="card-number" aria-hidden="true">
                {index + 1}
              </span>
              <div className="detail-fields">
                <div>
                  <p className="card-type-label">{typeLabel(type)}</p>
                  <h2>Question</h2>
                  <p>{card.question}</p>
                </div>
                <CardAnswer card={card} />
              </div>
            </li>
          )
        })}
      </ol>
    </main>
  )
}

export default StudySetDetailPage
