import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#000' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
               style={{ borderColor: '#2563eb', borderTopColor: 'transparent' }} />
          <p style={{ color: '#94a3b8' }}>Loading Session...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#000', color: '#fff', padding: '20px', fontFamily: 'sans-serif' }}>
        <div className="max-w-md w-full bg-[#0a0f1d] p-8 rounded-2xl border border-[#1e40af33] text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg size={32} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Profile Missing</h2>
          <p className="text-gray-400 mb-8">Your account exists but doesn't have a "Mentor" or "Student" role yet.</p>
          
          <div className="bg-black/40 p-4 rounded-xl mb-8 text-left border border-white/5">
            <p className="text-[10px] text-blue-400 font-bold uppercase mb-2 tracking-widest">Logged In As</p>
            <p className="text-sm font-mono text-gray-300 mb-1 break-all">ID: {user.id}</p>
            <p className="text-sm font-mono text-gray-300 break-all">Email: {user.email}</p>
          </div>

          <button onClick={() => window.location.reload()} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all">
            Retry Loading
          </button>
          
          <p className="mt-6 text-xs text-gray-500">
            Copy your email above and use it in the SQL command I gave you!
          </p>
        </div>
      </div>
    )
  }

  if (requiredRole && profile.role !== requiredRole) {
    const redirectTo = profile.role === 'mentor' ? '/mentor' : '/student'
    return <Navigate to={redirectTo} replace />
  }

  return children
}
