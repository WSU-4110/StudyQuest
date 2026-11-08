import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '../Auth-Page/AuthContext.jsx'
import { loadPlayerStats } from '../lib/userProfile.js'
import { useStudySets } from '../Study-Set-Page/StudySetContext.jsx'

const PlayerStatsContext = createContext(null)

export function PlayerStatsProvider({ children }) {
  const { session } = useAuth()
  // The profile row only exists once StudySetProvider has run ensure_app_user.
  const { isPersisted } = useStudySets()
  const [playerStats, setPlayerStats] = useState(null)
  const userId = session?.user?.id ?? null

  useEffect(() => {
    if (!userId || !isPersisted) return undefined

    let cancelled = false
    loadPlayerStats(userId)
      .then((stats) => {
        if (!cancelled) setPlayerStats(stats)
      })
      .catch(() => {
        if (!cancelled) setPlayerStats(null)
      })

    return () => {
      cancelled = true
    }
  }, [userId, isPersisted])

  return (
    <PlayerStatsContext.Provider
      value={{
        playerStats: userId ? playerStats : null,
        setPlayerStats,
      }}
    >
      {children}
    </PlayerStatsContext.Provider>
  )
}

export function usePlayerStats() {
  const context = useContext(PlayerStatsContext)
  if (!context) {
    throw new Error('usePlayerStats must be used within a PlayerStatsProvider')
  }
  return context
}
