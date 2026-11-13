import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../Auth-Page/AuthContext.jsx'
import { awardRewards, REWARD_AMOUNTS } from '../services/rewards.js'
import { useStudySets } from '../Study-Set-Page/StudySetContext.jsx'
import BossBattle from './BossBattle.jsx'
import { toQuestions } from './gameEngine.js'
import { getEligibleCards, getGameMode } from './gameModes.js'
import MemoryFlip from './MemoryFlip.jsx'
import { countPairs } from './memoryFlipEngine.js'
import PairCountPicker from './PairCountPicker.jsx'
import ResultsScreen from './ResultsScreen.jsx'
import { calculateRewards, MAX_XP_PER_GAME, XP_PER_LEVEL } from './rewards.js'
import SpeedRound from './SpeedRound.jsx'
import Survival from './Survival.jsx'
import './GamePage.css'
import { supabase } from '../lib/supabaseClient.js'

const MODE_COMPONENTS = {
  'speed-round': SpeedRound,
  survival: Survival,
  'boss-battle': BossBattle,
  'memory-flip': MemoryFlip,
}

const MIN_PAIRS = 3

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
  // Match Up's pair count from the start screen. null means the default.
  const [pairChoice, setPairChoice] = useState(null)
  const awardedRoundRef = useRef(0)
  const completionIdRef = useRef(null)
  const [resultSave, setResultSave] = useState(null)

  function startRound() {
    completionIdRef.current = crypto.randomUUID()

    setResult(null)
    setReward(null)
    setResultSave(null)
    setRound((prev) => prev + 1)
    setPhase('playing')
  }

  async function saveGameResult(stats) {
  setResultSave({ status: 'saving' })

  try {
    if (!supabase) {
      throw new Error('Supabase is not configured.')
    }

    const { error } = await supabase.from('game_attempts').insert({
      attempt_id: completionIdRef.current,
      auth_user_id: session.user.id,
      study_set_id: studySet.id,
      study_set_title: studySet.title,
      mode_id: mode.id,
      score: stats.score,
      correct: stats.correct,
      total: stats.answered,
    })

    if (error) throw error

    setResultSave({ status: 'saved' })
  } catch (error) {
    setResultSave({
      status: 'error',
      message: error.message ?? 'Could not save this game result.',
    })
  }
}

  function finishRound(stats) {
    setResult(stats)
    setPhase('finished')

    if (awardedRoundRef.current === round) return
    awardedRoundRef.current = round

    void saveGameResult(stats)

    const earned = calculateRewards(mode.id, stats)
    if (earned.xp === 0) {
      setReward({ status: 'none', earned })
      return
    }


    setReward({ status: 'saving', earned })

    awardRewards('game', earned, completionIdRef.current)
      .then((totals) => {
        const previousLevel =
          1 + Math.floor((totals.xp - earned.xp) / XP_PER_LEVEL)

        setReward({
          status: 'saved',
          earned: {
            xp: earned.xp,
            currency: REWARD_AMOUNTS.game.currency,
          },
          xp: totals.xp,
          level: totals.level,
          currency: totals.currency,

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
  const ModeComponent = MODE_COMPONENTS[mode.id]

  const choosesPairs = mode.id === 'memory-flip'
  const pairLimit = choosesPairs ? countPairs(questions) : 0
  const minPairs = Math.min(MIN_PAIRS, pairLimit)
  const pairCount = Math.min(pairLimit, pairChoice ?? mode.settings.maxPairs)
  const settings = choosesPairs
    ? { ...mode.settings, maxPairs: pairCount }
    : mode.settings

  if (phase === 'playing' && ModeComponent) {
    return (
      <main className="game-page">
        <ModeComponent
          key={round}
          questions={questions}
          settings={settings}
          onFinish={finishRound}
          // Personal bests are kept per account and study set.
          recordKey={`${session.user.id}:${studySet.id}`}
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
          resultSave={resultSave}
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
          <ul className="quick-rules">
            {mode.quickRules.map((rule) => (
              <li key={rule.text}>
                <img className="pixel-icon" src={rule.icon} alt="" />
                {rule.text}
              </li>
            ))}
          </ul>
          <p className="start-reward">Earn up to {MAX_XP_PER_GAME} XP</p>
        </div>

        {playable && choosesPairs && pairLimit > 0 ? (
          <PairCountPicker
            value={pairCount}
            min={minPairs}
            max={pairLimit}
            onChange={setPairChoice}
          />
        ) : null}

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
