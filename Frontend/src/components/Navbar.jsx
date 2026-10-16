import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../Auth-Page/AuthContext.jsx'

function Navbar() {
  const { session, loading, signOut } = useAuth()

  return (
    <nav className="app-nav" aria-label="Main">
      <Link className="app-nav-brand" to="/">
        StudyQuest
      </Link>

      <div className="app-nav-right">
        <NavLink to="/studysets" end>
          Library
        </NavLink>
        <NavLink to="/create">Create</NavLink>
        {loading ? null : session ? (
          <button type="button" className="app-nav-button" onClick={signOut}>
            Sign out
          </button>
        ) : (
          <Link className="app-nav-button" to="/login">
            Login
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar
