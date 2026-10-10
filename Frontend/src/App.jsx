import { NavLink, Route, Routes } from 'react-router-dom'
import { StudySetProvider } from './context/StudySetContext.jsx'
import CreateStudySetPage from './pages/CreateStudySetPage.jsx'
import StudySetDetailPage from './pages/StudySetDetailPage.jsx'
import StudySetLibraryPage from './pages/StudySetLibraryPage.jsx'
import './App.css'

function App() {
  return (
    <StudySetProvider>
      <div className="app-shell">
        <nav className="app-nav">
          <NavLink to="/" end>
            Library
          </NavLink>
          <NavLink to="/create">Create</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<StudySetLibraryPage />} />
          <Route path="/create" element={<CreateStudySetPage />} />
          <Route path="/studysets/:id" element={<StudySetDetailPage />} />
        </Routes>
      </div>
    </StudySetProvider>
  )
}

export default App
