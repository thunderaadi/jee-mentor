import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: authError } = await signIn(email, password)
      if (authError) {
        setError(authError.message)
        return
      }

      const { supabase } = await import('../lib/supabase')
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile?.role === 'mentor') {
        navigate('/mentor', { replace: true })
      } else {
        navigate('/student', { replace: true })
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

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
      {/* Background Decor */}
      <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.08), transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-5%', left: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.05), transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '72px', 
            height: '72px', 
            borderRadius: '24px', 
            background: 'linear-gradient(145deg, #1e40af, #1d4ed8)', 
            marginBottom: '24px',
            boxShadow: '0 20px 40px -10px rgba(37,99,235,0.4)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Sparkles size={34} style={{ color: '#fff' }} />
          </div>
          <h1 style={{ fontSize: '42px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0, lineHeight: 1 }}>
            Welcome <span style={{ color: '#3b82f6' }}>Back</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px', marginTop: '14px', fontWeight: 500 }}>Log in to your JEE dashboard.</p>
        </div>

        {error && (
          <div style={{ 
            padding: '16px', 
            borderRadius: '16px', 
            background: 'rgba(239,68,68,0.1)', 
            border: '1px solid rgba(239,68,68,0.2)', 
            color: '#f87171', 
            fontSize: '13px', 
            marginBottom: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px' 
          }}>
            <AlertCircle size={18} /> <strong>{error}</strong>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '24px', 
            background: 'rgba(8,12,28,0.4)', 
            padding: '32px', 
            borderRadius: '32px', 
            border: '1px solid rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)'
          }}>
            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '10px', fontWeight: 900, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.2em', paddingLeft: '4px' }}>
                Email Account
              </label>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                background: 'rgba(0,0,0,0.5)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '16px',
                padding: '0 16px',
                transition: 'all 0.2s ease',
                height: '56px'
              }}>
                <Mail size={18} style={{ color: '#4b5563', flexShrink: 0 }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    padding: '0 14px',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '14px',
                    width: '100%'
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '10px', fontWeight: 900, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.2em', paddingLeft: '4px' }}>
                Secure Key
              </label>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                background: 'rgba(0,0,0,0.5)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '16px',
                padding: '0 16px',
                transition: 'all 0.2s ease',
                height: '56px'
              }}>
                <Lock size={18} style={{ color: '#4b5563', flexShrink: 0 }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    padding: '0 14px',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '14px',
                    width: '100%'
                  }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '60px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #2563eb, #1e40af)',
              border: 'none',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              boxShadow: '0 20px 40px -12px rgba(37,99,235,0.4)',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? (
              <div style={{ width: '24px', height: '24px', border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            ) : (
              <>
                Confirm Access
                <ArrowRight size={20} />
              </>
            )}
          </button>

          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', fontWeight: 500 }}>
            New student? <Link to="/signup" style={{ color: '#3b82f6', fontWeight: 800, textDecoration: 'none', marginLeft: '6px' }}>Join the academy</Link>
          </p>
        </form>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #334155 !important; }
      `}</style>
    </div>
  )
}
