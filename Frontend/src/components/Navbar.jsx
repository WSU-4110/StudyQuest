
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../Auth-Page/AuthContext.jsx'
import { getPlayerRewards } from '../services/rewards.js'
import { XP_PER_LEVEL } from '../Game-Page/rewards.js'
import coinIcon from '../assets/game-modes/coin.svg'

function Navbar() {
  const { session, loading, signOut } = useAuth()
  const [rewards, setRewards] = useState(null)


  useEffect(() => {
    let active = true

  setRewards(null)

  async function loadRewards() {
    if (loading || !session) return

    try {
      const data = await getPlayerRewards()

      if (active) {
        setRewards(data)
      }
    } catch (error) {
      console.error('Failed to load navbar rewards:', error)
    }
  }

  loadRewards()

  // Refresh the navbar whenever XP or coins are awarded.
  window.addEventListener('studyquest:rewards-updated', loadRewards)

  return () => {
    active = false
    window.removeEventListener('studyquest:rewards-updated', loadRewards)
  }
}, [session?.user?.id, loading])


  const xp = rewards?.xp ?? 0
  const level = rewards?.level ?? 1
  const currentLevelXp = xp % XP_PER_LEVEL
  const progress = (currentLevelXp / XP_PER_LEVEL) * 100

  return (
    <nav className="app-nav" aria-label="Main">
      <Link className="app-nav-brand" to="/">
        StudyQuest
      </Link>

      <div className="app-nav-right">
        {session && rewards && (
          <div className="nav-rewards">
            <div className="nav-xp">
              <div className="nav-xp-label">
                <span>LVL {level}</span>
                <span>{currentLevelXp}/{XP_PER_LEVEL} XP</span>
              </div>

              <div
                className="nav-xp-track"
                role="progressbar"
                aria-label="Progress to next level"
                aria-valuenow={currentLevelXp}
                aria-valuemin={0}
                aria-valuemax={XP_PER_LEVEL}
              >
                <div
                  className="nav-xp-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="nav-coins" title="Your coins">
              <img src={coinIcon} alt="" />
              <span>{rewards.currency}</span>
            </div>
          </div>
        )}

        <NavLink to="/studysets" end>
          Library
        </NavLink>
        <NavLink to="/create">Create</NavLink>
        <NavLink to="/quiz-results">Quiz Results</NavLink>

        {loading ? null : session ? (
          <button
            type="button"
            className="app-nav-button"
            onClick={signOut}
          >
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