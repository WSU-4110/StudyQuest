import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useAuth } from '../Auth-Page/AuthContext.jsx'
import {
  ensureUserProfile,
  loadStudySets,
  saveStudySets,
} from '../lib/userProfile.js'

const StudySetContext = createContext(null)

export function StudySetProvider({ children }) {
  const { session, loading: authLoading } = useAuth()
  const [studySets, setStudySets] = useState([])
  const [studysetsId, setStudysetsId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const studySetsRef = useRef(studySets)

  useEffect(() => {
    studySetsRef.current = studySets
  }, [studySets])

  const isPersisted = Boolean(session && studysetsId)

  useEffect(() => {
    let cancelled = false

    async function syncProfile() {
      if (authLoading) return

      if (!session) {
        setStudySets([])
        setStudysetsId(null)
        setError(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const id = await ensureUserProfile(session)
        if (cancelled) return
        setStudysetsId(id)

        const sets = await loadStudySets(id)
        if (cancelled) return
        setStudySets(sets)
      } catch (err) {
        if (cancelled) return
        setStudysetsId(null)
        setStudySets([])
        setError(err.message ?? 'Failed to sync study sets.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    syncProfile()

    return () => {
      cancelled = true
    }
  }, [session, authLoading])

  async function persistSets(nextSets) {
    if (!session || !studysetsId) return
    await saveStudySets(studysetsId, nextSets)
  }

  function addStudySet({ title, cards }) {
    const newSet = {
      id: crypto.randomUUID(),
      title,
      cards,
      createdAt: new Date().toISOString(),
    }

    const nextSets = [newSet, ...studySetsRef.current]
    setStudySets(nextSets)
    studySetsRef.current = nextSets

    if (session && studysetsId) {
      persistSets(nextSets).catch((err) => {
        setError(err.message ?? 'Failed to save study set.')
      })
    }

    return newSet
  }

  function getStudySet(id) {
    return studySets.find((set) => set.id === id) ?? null
  }

  function updateStudySet(id, { title, cards }) {
    const nextSets = studySetsRef.current.map((set) =>
      set.id === id
        ? {
            ...set,
            title,
            cards,
            updatedAt: new Date().toISOString(),
          }
        : set,
    )
    setStudySets(nextSets)
    studySetsRef.current = nextSets

    if (session && studysetsId) {
      persistSets(nextSets).catch((err) => {
        setError(err.message ?? 'Failed to update study set.')
      })
    }
  }

  function removeStudySet(id) {
    const nextSets = studySetsRef.current.filter((set) => set.id !== id)
    setStudySets(nextSets)
    studySetsRef.current = nextSets

    if (session && studysetsId) {
      persistSets(nextSets).catch((err) => {
        setError(err.message ?? 'Failed to delete study set.')
      })
    }
  }

  return (
    <StudySetContext.Provider
      value={{
        studySets,
        addStudySet,
        updateStudySet,
        getStudySet,
        removeStudySet,
        loading,
        error,
        isPersisted,
      }}
    >
      {children}
    </StudySetContext.Provider>
  )
}

export function useStudySets() {
  const context = useContext(StudySetContext)
  if (!context) {
    throw new Error('useStudySets must be used within a StudySetProvider')
  }
  return context
}
