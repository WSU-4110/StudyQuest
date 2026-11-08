import { Link, NavLink } from 'react-router-dom'
import coinIcon from '../assets/game-modes/coin.svg'
import { useAuth } from '../Auth-Page/AuthContext.jsx'
import { usePlayerStats } from '../Game-Page/PlayerStatsContext.jsx'
import { XP_PER_LEVEL } from '../Game-Page/rewards.js'

function PlayerStats({ stats }) {
  const xpIntoLevel = stats.xp % XP_PER_LEVEL

  return (
    <div
      className="nav-player-stats"
      title={`${xpIntoLevel} / ${XP_PER_LEVEL} XP to level ${stats.level + 1}`}
    >
      <span className="nav-level">Lv {stats.level}</span>
      <span className="nav-xp-track" aria-hidden="true">
        <span
          className="nav-xp-bar"
          style={{ width: `${(xpIntoLevel / XP_PER_LEVEL) * 100}%` }}
        />
      </span>
      <span className="nav-currency">
        <img
          className="pixel-icon"
          src={coinIcon}
          alt="Coins"
          width={20}
          height={20}
        />
        {stats.currency}
      </span>
    </div>
  )
}

function Navbar() {
  const { session, loading, signOut } = useAuth()
  const { playerStats } = usePlayerStats()

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
        <NavLink to="/quiz-results">Quiz Results</NavLink>
        {session && playerStats ? <PlayerStats stats={playerStats} /> : null}
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
