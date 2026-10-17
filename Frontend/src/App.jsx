import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import AuthPage from './Auth-Page/App.jsx'
import HomePage from './Home-Page/HomePage.jsx'
import { StudySetProvider } from './Study-Set-Page/StudySetContext.jsx'
import CreateStudySetPage from './Study-Set-Page/CreateStudySetPage.jsx'
import StudySetDetailPage from './Study-Set-Page/StudySetDetailPage.jsx'
import StudySetLibraryPage from './Study-Set-Page/StudySetLibraryPage.jsx'
import './App.css'

function App() {
  return (
    <StudySetProvider>
      <div className="app-shell">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/studysets" element={<StudySetLibraryPage />} />
          <Route path="/create" element={<CreateStudySetPage />} />
          <Route path="/studysets/:id/edit" element={<CreateStudySetPage />} />
          <Route path="/studysets/:id" element={<StudySetDetailPage />} />
          <Route path="/login" element={<AuthPage />} />
        </Routes>
      </div>
    </StudySetProvider>
  )
}

export default App
