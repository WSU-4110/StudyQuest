import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../Auth-Page/AuthContext.jsx'
import { awardRewards } from '../lib/userProfile.js'
import { useStudySets } from '../Study-Set-Page/StudySetContext.jsx'
import { getEligibleCards, getGameMode } from './gameModes.js'
import { MAX_XP_PER_GAME } from './rewards.js'
import './GamePage.css'

function GamePage() {
  const { id, modeId } = useParams()
  const { session } = useAuth()
  const { getStudySet, loading } = useStudySets()
  const studySet = getStudySet(id)
  const mode = getGameMode(modeId)
  const [testResult, setTestResult] = useState(null)

  async function handleTestRewards() {
    try {
      const totals = await awardRewards({ xp: 10, currency: 2 })
      setTestResult(
        `XP ${totals.xp} · Level ${totals.level} · Currency ${totals.currency}`,
      )
    } catch (err) {
      setTestResult(err.message ?? 'Failed to award rewards.')
    }
  }

  if (loading) {
    return (
      <main className="game-page">
        <p>Loading study set…</p>
      </main>
    )
  }

  if (!studySet || !mode) {
    return (
      <main className="game-page">
        <p>{studySet ? 'Game mode not found.' : 'Study set not found.'}</p>
        <Link to={studySet ? `/studysets/${studySet.id}` : '/studysets'}>
          Back
        </Link>
      </main>
    )
  }

  const eligibleCount = getEligibleCards(mode, studySet.cards).length
  const playable = eligibleCount >= mode.minCards

  return (
    <main className="game-page">
      <div className="game-top">
        <Link className="back-link" to={`/studysets/${studySet.id}`}>
          Back to set
        </Link>
      </div>

      <section className="start-screen">
        <img
          className="pixel-icon"
          src={mode.icon}
          alt=""
          width={96}
          height={96}
        />
        <h1>{mode.name}</h1>
        <p className="game-subtitle">{studySet.title}</p>
        <p className="start-tagline">{mode.tagline}</p>

        <div className="start-rules">
          <h2>How to play</h2>
          <ul>
            {mode.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
          <p className="start-reward">Earn up to {MAX_XP_PER_GAME} XP</p>
        </div>

        {playable ? (
          <button type="button" className="start-btn" disabled>
            Start (coming soon)
          </button>
        ) : (
          <p>
            This mode needs at least {mode.minCards} eligible cards (this set
            has {eligibleCount}).
          </p>
        )}
      </section>

      {import.meta.env.DEV && session ? (
        <div className="dev-panel">
          <p>Dev only: award 10 XP and 2 currency to test award_rewards.</p>
          <button type="button" onClick={handleTestRewards}>
            Test awardRewards
          </button>
          {testResult ? <p>{testResult}</p> : null}
        </div>
      ) : null}
    </main>
  )
}

export default GamePage
