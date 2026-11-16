import {useState, useEffect} from 'react'
import {Link} from 'react-router-dom'
import {useAuth} from '../Auth-Page/AuthContext.jsx'
import {useStudySets} from '../Study-Set-Page/StudySetContext.jsx'
import {supabase} from '../lib/supabaseClient.js'
import './RecentStudysets.css'


const MAX_RECENT_SETS = 3

const getQuizPath = (setId) => `/studysets/${setId}`

function RecentStudysets() {
  const {session} = useAuth()
  const {studySets} = useStudySets()
  const [attempts, setAttempts] = useState([])

    useEffect(() => {
        if(!session || !supabase){
            setAttempts([])
            return
        }

        let cancelled = false
        async function fetchRecentSets() {
            const {data, error} = await supabase
                .from('game_attempts')
                .select('attempt_id, study_set_title, correct, total, completed_at')
                .order('completed_at', {ascending: false})
                .limit(20)
            if (error || cancelled) return

            const opened = new Set()
            const recent = []

            for(const attempt of data ?? []) {
                if(opened.has(attempt.study_set_title)) continue
                opened.add(attempt.study_set_title)
                recent.push(attempt)
            }

            setAttempts(recent)
        }
        fetchRecentSets()

        return () => {
            cancelled = true
        }
        }, [session])

         const playedCards = attempts
        .map((attempt) => ({ attempt, set: studySets.find((s) => s.title === attempt.study_set_title),}))
        .filter((card) => card.set)

        const playedIds = new Set(playedCards.map((card) => card.set.id))
        const fillerCards = studySets
        .filter((s) => !playedIds.has(s.id))
        .map((set) => ({ attempt: null, set }))

        const cards = [...playedCards, ...fillerCards].slice(0, MAX_RECENT_SETS)

        if (cards.length === 0) {
            return (
            <p className="hero-text">
                No study sets yet. <Link to="/create">Create one</Link> to get started.
            </p>
            )
        }

         return (
            <div className="recent-studyset-row">
            {cards.map(({ attempt, set }) => {
                const percentage =
                attempt && attempt.total > 0
                    ? Math.round((attempt.correct / attempt.total) * 100)
                    : null

                return (
                <div className="recent-studyset" key={set.id}>
                    <h3>{set.title}</h3>
                    <p>
                    {percentage !== null ? `Score: ${percentage}%` : 'Not played yet'}
                    </p>
                    <Link to={getQuizPath(set.id)}>
                    {percentage !== null ? 'Review' : 'Start'}
                    </Link>
                </div>
            )
      })}
    </div>
  )}
export default RecentStudysets