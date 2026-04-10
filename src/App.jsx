import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Signup from './pages/Signup'

// Mentor pages
import MentorDashboard from './pages/mentor/Dashboard'
import MentorTasks from './pages/mentor/Tasks'
import MentorAssignments from './pages/mentor/Assignments'
import MentorTests from './pages/mentor/Tests'
import MentorMaterials from './pages/mentor/Materials'
import MentorStudents from './pages/mentor/Students'
import MentorDoubts from './pages/mentor/Doubts'

// Student pages
import StudentDashboard from './pages/student/Dashboard'
import StudentTasks from './pages/student/Tasks'
import StudentAssignments from './pages/student/Assignments'
import StudentTests from './pages/student/Tests'
import StudentMaterials from './pages/student/Materials'
import StudentNotes from './pages/student/Notes'
import StudentDoubts from './pages/student/Doubts'

function RootRedirect() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#000' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
               style={{ borderColor: '#1e40af', borderTopColor: 'transparent' }} />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  
  if (!profile) {
    // If user exists but no profile, they are stuck. 
    // ProtectedRoute handles the UI for this, but we'll default to student route to let it catch.
    return <Navigate to="/student" replace />
  }

  if (profile.role === 'mentor') return <Navigate to="/mentor" replace />
  return <Navigate to="/student" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Mentor routes */}
          <Route path="/mentor" element={
            <ProtectedRoute requiredRole="mentor"><Layout /></ProtectedRoute>
          }>
            <Route index element={<MentorDashboard />} />
            <Route path="tasks" element={<MentorTasks />} />
            <Route path="assignments" element={<MentorAssignments />} />
            <Route path="tests" element={<MentorTests />} />
            <Route path="materials" element={<MentorMaterials />} />
            <Route path="students" element={<MentorStudents />} />
            <Route path="doubts" element={<MentorDoubts />} />
          </Route>

          {/* Student routes */}
          <Route path="/student" element={
            <ProtectedRoute requiredRole="student"><Layout /></ProtectedRoute>
          }>
            <Route index element={<StudentDashboard />} />
            <Route path="tasks" element={<StudentTasks />} />
            <Route path="assignments" element={<StudentAssignments />} />
            <Route path="tests" element={<StudentTests />} />
            <Route path="materials" element={<StudentMaterials />} />
            <Route path="notes" element={<StudentNotes />} />
            <Route path="doubts" element={<StudentDoubts />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
