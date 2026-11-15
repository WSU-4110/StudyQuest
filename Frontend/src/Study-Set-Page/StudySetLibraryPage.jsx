import { Link } from 'react-router-dom'
import { useAuth } from '../Auth-Page/AuthContext.jsx'
import { useStudySets } from './StudySetContext.jsx'
import { useState } from 'react'
import './StudySetLibraryPage.css'

function StudySetLibraryPage() {
  const { session } = useAuth()
  const { studySets, removeStudySet, loading, error, isPersisted } =
    useStudySets()

  const [searchText, setSearchText] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const filterSets = studySets.filter((set) =>
    set.title.toLowerCase().includes(searchTerm.trim().toLowerCase())
  )
  function handleSearch() {
    setSearchTerm(searchText)
  }
  function handleClear() {
    setSearchText('')
    setSearchTerm('')
  }

  function handleDelete(event, id, title) {
    event.preventDefault()
    event.stopPropagation()
    if (window.confirm(`Delete "${title}"?`)) {
      removeStudySet(id)
    }
  }

  return (
    <main className="study-set-library">
      <div className="library-header">
        <h1>My study sets</h1>
        <Link className="create-link" to="/create">
          Create study set
        </Link>
      </div>

      {session && isPersisted ? (
        <p className="library-sync-note">Synced to your account.</p>
      ) : null}

      {!session ? (
        <p className="library-sync-note">
          <Link to="/login">Sign in</Link> to save study sets to your account.
        </p>
      ) : null}

      {error ? <p className="library-sync-error">{error}</p> : null}

      {loading ? (
        <p className="library-sync-note">Loading your study sets…</p>
      ) : null}
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Search study sets…"
          className="search-input"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => { 
            if (e.key === 'Enter') handleSearch() }}
        />
        <button className="searchbar-button" onClick={handleSearch}>
          Search
        </button>
        {searchTerm || searchText ? (
          <button className="searchbar-button" onClick={handleClear}>
            Clear
          </button>
        ) : null}
      </div>

    

      {!loading && studySets.length === 0 ? (
        <div className="empty-state">
          <p>No study sets yet.</p>
          <Link to="/create">Create your first study set</Link>
        </div>
      ) : null}

      {!loading && studySets.length > 0 && filterSets.length === 0 ? (
        <div className="empty-state">
          <p>No study sets match your search.</p>
        </div>
      ) : null}

      {!loading && studySets.length > 0 ? (
        <ul className="study-set-list">
          {filterSets.map((set) => (
            <li key={set.id} className="study-set-item">
              <Link className="study-set-main" to={`/studysets/${set.id}`}>
                <h2>{set.title}</h2>
                <p>
                  {set.cards.length}{' '}
                  {set.cards.length === 1 ? 'card' : 'cards'}
                </p>
              </Link>
              <div className="item-actions">
                <Link className="edit-btn" to={`/studysets/${set.id}/edit`}>
                  Edit
                </Link>
                <button
                  type="button"
                  className="delete-btn"
                  onClick={(event) => handleDelete(event, set.id, set.title)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  )
}

export default StudySetLibraryPage
