import { Link, useParams } from 'react-router-dom'
import { useStudySets } from '../context/StudySetContext.jsx'
import './StudySetDetailPage.css'

function StudySetDetailPage() {
  const { id } = useParams()
  const { getStudySet } = useStudySets()
  const studySet = getStudySet(id)

  if (!studySet) {
    return (
      <main className="study-set-detail">
        <p>Study set not found.</p>
        <Link to="/">Back to library</Link>
      </main>
    )
  }

  return (
    <main className="study-set-detail">
      <Link className="back-link" to="/">
        Back to library
      </Link>
      <h1>{studySet.title}</h1>
      <p className="card-count">
        {studySet.cards.length}{' '}
        {studySet.cards.length === 1 ? 'card' : 'cards'}
      </p>

      <ol className="detail-card-list">
        {studySet.cards.map((card, index) => (
          <li key={`${studySet.id}-${index}`} className="detail-card">
            <span className="card-number" aria-hidden="true">
              {index + 1}
            </span>
            <div className="detail-fields">
              <div>
                <h2>Question</h2>
                <p>{card.question}</p>
              </div>
              <div>
                <h2>Answer</h2>
                <p>{card.answer}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </main>
  )
}

export default StudySetDetailPage
