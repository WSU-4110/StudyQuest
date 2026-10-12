import { createContext, useContext, useState } from 'react'

const StudySetContext = createContext(null)

export function StudySetProvider({ children }) {
  const [studySets, setStudySets] = useState([])

  function addStudySet({ title, cards }) {
    const newSet = {
      id: crypto.randomUUID(),
      title,
      cards,
      createdAt: new Date().toISOString(),
    }
    setStudySets((prev) => [newSet, ...prev])
    return newSet
  }

  function getStudySet(id) {
    return studySets.find((set) => set.id === id) ?? null
  }

  function removeStudySet(id) {
    setStudySets((prev) => prev.filter((set) => set.id !== id))
  }

  return (
    <StudySetContext.Provider
      value={{ studySets, addStudySet, getStudySet, removeStudySet }}
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
