import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../Auth-Page/AuthContext.jsx'
import { awardRewards } from '../lib/userProfile.js'
import { useStudySets } from '../Study-Set-Page/StudySetContext.jsx'
import { toQuestions } from './gameEngine.js'
import { getEligibleCards, getGameMode } from './gameModes.js'
import ResultsScreen from './ResultsScreen.jsx'
import { calculateRewards, MAX_XP_PER_GAME, XP_PER_LEVEL } from './rewards.js'
import './GamePage.css'

function GamePage() {
  const { id, modeId } = useParams()
  const { session, loading: authLoading } = useAuth()
  const { getStudySet, loading: setsLoading } = useStudySets()
  const studySet = getStudySet(id)
  const mode = getGameMode(modeId)
  const [phase, setPhase] = useState('start')
  const [round, setRound] = useState(0)
  const [result, setResult] = useState(null)
  const [reward, setReward] = useState(null)
  const awardedRoundRef = useRef(0)

  function startRound() {
    setResult(null)
    setReward(null)
    setRound((prev) => prev + 1)
    setPhase('playing')
  }

  function finishRound(stats) {
    setResult(stats)
    setPhase('finished')

    if (awardedRoundRef.current === round) return
    awardedRoundRef.current = round

    const earned = calculateRewards(mode, stats)
    if (earned.xp === 0) {
      setReward({ status: 'none', earned })
      return
    }

    setReward({ status: 'saving', earned })
    awardRewards(earned)
      .then((totals) => {
        const previousLevel =
          1 + Math.floor((totals.xp - earned.xp) / XP_PER_LEVEL)
        setReward({
          status: 'saved',
          earned,
          level: totals.level,
          leveledUp: totals.level > previousLevel,
        })
      })
      .catch((err) => {
        setReward({ status: 'error', earned, error: err.message })
      })
  }

  if (authLoading || setsLoading) {
    return (
      <main className="game-page">
        <p>Loading study set…</p>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="game-page">
        <p>
          <Link to="/login">Sign in</Link> to play games with your study sets.
        </p>
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

  const questions = toQuestions(getEligibleCards(mode, studySet.cards))
  const playable = questions.length >= mode.minCards
  const ModeComponent = mode.Component

  if (phase === 'playing' && ModeComponent) {
    return (
      <main className="game-page">
        <ModeComponent
          key={round}
          questions={questions}
          settings={mode.settings}
          onFinish={finishRound}
        />
      </main>
    )
  }

  if (phase === 'finished' && result) {
    return (
      <main className="game-page">
        <ResultsScreen
          result={result}
          mode={mode}
          reward={reward}
          studySetId={studySet.id}
          onPlayAgain={startRound}
        />
      </main>
    )
  }

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

        {!playable ? (
          <p>
            This mode needs at least {mode.minCards} eligible cards (this set
            has {questions.length}).
          </p>
        ) : ModeComponent ? (
          <button type="button" className="start-btn" onClick={startRound}>
            Start
          </button>
        ) : (
          <button type="button" className="start-btn" disabled>
            Coming soon
          </button>
        )}
      </section>
    </main>
  )
}

export default GamePage
