import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Mail, Lock, User, UserPlus, CheckCircle2, AlertCircle, ChevronDown, Search, ArrowRight } from 'lucide-react'

export default function Signup() {
  const navigate = useNavigate()
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
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'mentor')
    if (!error && data) setMentors(data)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (!mentorId) {
      setError('Please select a mentor to continue.')
      return
    }

    setLoading(true)
    setError('')

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'student',
          mentor_id: mentorId
        }
      }
    })

    if (signupError) {
      setError(signupError.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    }
  }

  const filteredMentors = mentors.filter(m => 
    m.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedMentor = mentors.find(m => m.id === mentorId)

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000000',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'sans-serif'
    }}>
      {/* Bg FX */}
      <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.08), transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-5%', left: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.05), transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '64px', 
            height: '64px', 
            borderRadius: '20px', 
            background: 'linear-gradient(145deg, #1e40af, #1d4ed8)', 
            marginBottom: '20px',
            boxShadow: '0 15px 30px -8px rgba(37,99,235,0.4)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <UserPlus size={28} style={{ color: '#fff' }} />
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
            Create <span style={{ color: '#3b82f6' }}>Account</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '10px', fontWeight: 500 }}>Join the JEE Mentorship platform today.</p>
        </div>

        {success ? (
          <div style={{ background: '#080c1d', padding: '40px', borderRadius: '32px', border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center' }}>
            <CheckCircle2 size={48} style={{ color: '#10b981', marginBottom: '16px' }} />
            <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: 800 }}>Success!</h2>
            <p style={{ color: '#94a3b8', marginTop: '8px' }}>Provisioning your profile. Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {error && (
              <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '20px', 
              background: 'rgba(8,12,28,0.4)', 
              padding: '28px', 
              borderRadius: '32px', 
              border: '1px solid rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)'
            }}>
              {/* Full Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Full Name</label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '0 14px', height: '52px' }}>
                  <User size={18} style={{ color: '#4b5563', flexShrink: 0 }} />
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your name" required style={{ flex: 1, background: 'transparent', border: 'none', padding: '0 12px', color: '#fff', outline: 'none', fontSize: '14px' }} />
                </div>
              </div>

              {/* Email Address */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Email Address</label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '0 14px', height: '52px' }}>
                  <Mail size={18} style={{ color: '#4b5563', flexShrink: 0 }} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required style={{ flex: 1, background: 'transparent', border: 'none', padding: '0 12px', color: '#fff', outline: 'none', fontSize: '14px' }} />
                </div>
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Secure Password</label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '0 14px', height: '52px' }}>
                  <Lock size={18} style={{ color: '#4b5563', flexShrink: 0 }} />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" required minLength={8} style={{ flex: 1, background: 'transparent', border: 'none', padding: '0 12px', color: '#fff', outline: 'none', fontSize: '14px' }} />
                </div>
              </div>

              {/* Mentor Selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
                <label style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Assigned Mentor</label>
                <button type="button" onClick={() => setShowMentorDropdown(!showMentorDropdown)} style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '0 14px', height: '52px', cursor: 'pointer', color: selectedMentor ? '#fff' : '#4b5563', fontSize: '14px'
                }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedMentor ? selectedMentor.full_name : 'Choose your mentor...'}</span>
                  <ChevronDown size={18} style={{ transition: 'transform 0.3s', transform: showMentorDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>

                {showMentorDropdown && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', background: '#0a1025', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '16px', padding: '8px', zIndex: 50, boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '0 10px', height: '36px', marginBottom: '8px' }}>
                      <Search size={14} style={{ color: '#4b5563' }} />
                      <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." style={{ flex: 1, background: 'transparent', border: 'none', padding: '0 10px', color: '#fff', fontSize: '12px', outline: 'none' }} />
                    </div>
                    <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
                      {filteredMentors.length > 0 ? filteredMentors.map(m => (
                        <div key={m.id} onClick={() => { setMentorId(m.id); setShowMentorDropdown(false); setSearchTerm('') }} style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '12px', color: mentorId === m.id ? '#3b82f6' : '#94a3b8', cursor: 'pointer', fontWeight: mentorId === m.id ? 800 : 500 }}>
                          {m.full_name}
                        </div>
                      )) : <div style={{ padding: '12px', textAlign: 'center', fontSize: '10px', color: '#4b5563', fontStyle: 'italic' }}>No mentors found.</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ 
              width: '100%', height: '58px', borderRadius: '18px', background: 'linear-gradient(135deg, #2563eb, #1e40af)', border: 'none', color: '#fff', fontSize: '15px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 15px 30px rgba(37,99,235,0.3)', transition: 'all 0.2s ease', opacity: loading ? 0.7 : 1
            }}>
              {loading ? 'Creating...' : <>Register Profile <ArrowRight size={18} /></>}
            </button>

            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', fontWeight: 500 }}>
              Already a user? <Link to="/login" style={{ color: '#3b82f6', fontWeight: 800, textDecoration: 'none', marginLeft: '4px' }}>Sign In</Link>
            </p>
          </form>
        )}
      </div>

      <style>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.3); border-radius: 10px; }
        input::placeholder { color: #334155 !important; }
      `}</style>
    </div>
  )
}
