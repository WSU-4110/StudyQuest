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

  function updateStudySet(id, { title, cards }) {
    setStudySets((prev) =>
      prev.map((set) =>
        set.id === id
          ? {
              ...set,
              title,
              cards,
              updatedAt: new Date().toISOString(),
            }
          : set,
      ),
    )
  }

  function removeStudySet(id) {
    setStudySets((prev) => prev.filter((set) => set.id !== id))
  }

  return (
    <StudySetContext.Provider
      value={{
        studySets,
        addStudySet,
        updateStudySet,
        getStudySet,
        removeStudySet,
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
