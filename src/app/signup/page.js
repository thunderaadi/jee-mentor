'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { Mail, Lock, User, UserPlus, CheckCircle2, AlertCircle, ChevronDown, Search, ArrowRight } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const { signup } = useAuth()
  const [role, setRole] = useState('student')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mentorId, setMentorId] = useState('')
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showMentorDropdown, setShowMentorDropdown] = useState(false)

  useEffect(() => {
    fetchMentors()
  }, [])

  const fetchMentors = async () => {
    try {
      const q = query(collection(db, "users"), where("role", "==", "mentor"));
      const querySnapshot = await getDocs(q);
      const mentorsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMentors(mentorsList)
    } catch (err) {
      console.error("Error fetching mentors:", err);
      alert("Mentor Sync: " + err.message);
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (role === 'student' && !mentorId) return setError('Please choose a mentor.')
    
    setLoading(true)
    setError('')

    try {
      // For mentors, mentorId is passed as null
      await signup(email, password, fullName, role, role === 'mentor' ? null : mentorId)
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2000)
    } catch (err) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const filteredMentors = mentors.filter(m => 
    m.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedMentor = mentors.find(m => m.id === mentorId)

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black relative overflow-hidden font-sans">
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-5%] left-[-5%] w-[400px] h-[400px] rounded-full bg-blue-900/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[440px] relative z-10 animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 mb-6 shadow-2xl border border-white/10">
            <UserPlus className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Join <span className="text-blue-500">Academy</span></h1>
        </div>

        {success ? (
          <div className="bg-[#080c1d] p-10 rounded-[32px] border border-green-500/20 text-center scale-in">
            <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Authenticated</h2>
            <p className="text-gray-400">Your profile is now live.</p>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="flex flex-col gap-8">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle size={16} /> <span>{error}</span>
              </div>
            )}

            {/* Role Switcher */}
            <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
              <button 
                type="button"
                onClick={() => setRole('student')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === 'student' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                Student
              </button>
              <button 
                type="button"
                onClick={() => setRole('mentor')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === 'mentor' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                Mentor
              </button>
            </div>

            <div className="flex flex-col gap-5 bg-[#080c1d]/40 p-8 rounded-[32px] border border-white/5 backdrop-blur-xl shadow-inner">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Identity</label>
                <div className="flex items-center bg-black/40 border border-white/5 rounded-2xl px-4 py-3.5">
                  <User size={18} className="text-gray-500" />
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" required className="flex-1 bg-transparent border-none outline-none text-white px-3 text-sm" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Credentials</label>
                <div className="flex items-center bg-black/40 border border-white/5 rounded-2xl px-4 py-3.5 mb-2">
                  <Mail size={18} className="text-gray-500" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="flex-1 bg-transparent border-none outline-none text-white px-3 text-sm" />
                </div>
                <div className="flex items-center bg-black/40 border border-white/5 rounded-2xl px-4 py-3.5">
                  <Lock size={18} className="text-gray-500" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="flex-1 bg-transparent border-none outline-none text-white px-3 text-sm" />
                </div>
              </div>

              {role === 'student' && (
                <div className="flex flex-col gap-2 relative">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Mentor Support</label>
                  <button type="button" onClick={() => setShowMentorDropdown(!showMentorDropdown)} className="flex items-center justify-between bg-black/40 border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-gray-400 transition-all hover:border-blue-500/30">
                    <span>{selectedMentor ? selectedMentor.full_name : 'Select a Mentor'}</span>
                    <ChevronDown className={`transition-transform ${showMentorDropdown ? 'rotate-180' : ''}`} size={18} />
                  </button>

                  {showMentorDropdown && (
                    <div className="absolute top-[105%] left-0 right-0 bg-[#0d152a] border border-blue-500/20 rounded-2xl shadow-2xl p-3 z-50 animate-fade-in scale-in">
                      <div className="flex items-center bg-black/20 rounded-xl px-3 py-2 mb-2">
                        <Search size={14} className="text-gray-600" />
                        <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." className="flex-1 bg-transparent border-none outline-none text-xs px-2 text-white" />
                      </div>
                      <div className="max-h-40 overflow-y-auto custom-scroll">
                        {filteredMentors.map(m => (
                          <div key={m.id} onClick={() => { setMentorId(m.id); setShowMentorDropdown(false) }} className={`px-4 py-2.5 rounded-lg text-xs cursor-pointer transition-colors ${mentorId === m.id ? 'bg-blue-600 text-white font-bold' : 'text-gray-400 hover:bg-white/5'}`}>
                            {m.full_name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary py-4.5">
              {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <>Join {role === 'mentor' ? 'as Mentor' : 'Academy'} <ArrowRight size={20} /></>}
            </button>
            <p className="text-center text-sm text-gray-500">Member? <Link href="/login" className="text-blue-500 font-bold">Sign In</Link></p>
          </form>
        )}
      </div>
    </div>
  )
}
