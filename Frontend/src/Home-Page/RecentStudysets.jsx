import {useState, useEffect} from 'react'
import {Link} from 'react-router-dom'
import {useAuth} from '../Auth/AuthContext'
import {useStudySets} from '../Study-Set-Page/StudySetContext'
import {supabase} from '../services/supabaseClient'
import './RecentStudysets.css'


const MAX_RECENT_SETS = 3

const getQuizPath = (setId) => `/quizzes/${setId}`

function RecentStudysets() {
  const {session} = useAuth()
  const {studySets} = useStudySets()
  const [recentSets, setRecentSets] = useState([])

    useEffect(() => {
        if(!session || !supabase) return

        let cancelled = false
        async function fetchRecentSets() {
            const {data, error} = await supabase
                .from('game_attempts')
                .select('attempt_id, study_set_title, correct, total, completed_at')
                .order('completed_at', {ascending: false})
                .limit(MAX_RECENT_SETS)
            if (error || cancelled) return

            const opened = new Set()
            const recent = []

            for(const attempt of data ?? []) {
                if(opened.has(attempt.study_set_title)) continue
                opened.add(attempt.study_set_title)
                recent.push(attempt)
            }

            setRecentSets(recent.slice(0, MAX_RECENT_SETS))
        }
        fetchRecentSets()

        return () => {
            cancelled = true
        }
        }, [session])

        if(!session || recentSets.length === 0){
            return null
        } 

       return (
        <div className="recent-studysets-row">
        {recentSets.map((attempt) => {
            const set = studySets.find((s) => s.title === attempt.study_set_title)
            if (!set) return null

            const percentage = attempt.total > 0 ? Math.round((attempt.correct / attempt.total) * 100): 0

            return (
            <div className="recent-studyset" key={attempt.attempt_id}>
                <h3>{set.title}</h3>
                <p>Score: {percentage}%</p>
                <Link to={getQuizPath(set.id)}>Review</Link>
            </div>
            )
      })}
    </div>
  )
}