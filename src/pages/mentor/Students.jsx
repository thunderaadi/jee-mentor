import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { Plus, Users, Mail, Lock, User, AlertCircle, Sparkles, UserPlus, Shield } from 'lucide-react'

export default function MentorStudents() {
  const { profile } = useAuth()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => { loadStudents() }, [])

  const loadStudents = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .eq('mentor_id', profile?.id)
      .order('created_at', { ascending: false })
    setStudents(data || [])
    setLoading(false)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setCreating(true)

    try {
      // Use the invoke method but handle the error response body
      const { data, error: fnError } = await supabase.functions.invoke('create-student', {
        body: {
          email,
          password,
          full_name: fullName,
          mentor_id: profile?.id,
        },
      })

      // If there's an error, try to get the message from the body first
      if (fnError) {
        let msg = 'Failed to create student.'
        
        // Try to extract JSON error from the response if possible
        try {
          const body = await fnError.context.response.json()
          msg = body.error || msg
        } catch (e) {
          msg = fnError.message || msg
        }
        
        setError(msg)
        return
      }

      setSuccess(`Account for ${fullName} is ready!`)
      setFullName(''); setEmail(''); setPassword('')
      setTimeout(() => {
        setShowModal(false)
        setSuccess('')
        loadStudents()
      }, 2000)
    } catch (err) {
      setError('System Error: ' + err.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            My <span style={{ color: '#60a5fa' }}>Students</span>
          </h1>
          <p style={{ fontSize: '14px', marginTop: '4px', color: '#94a3b8' }}>
            Manage student access and monitor their individual performance.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary" style={{ padding: '11px 22px' }}>
          <UserPlus size={18} />
          <span>Add New Student</span>
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #1e40af', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : students.length === 0 ? (
        <EmptyState icon={Users} title="No students linked yet" description="Start building your classroom by creating student accounts." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {students.map((s) => (
            <div key={s.id} className="glass-card" style={{
              padding: '24px',
              background: 'rgba(5, 8, 20, 0.4)',
              border: '1px solid rgba(30, 64, 175, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{ 
                width: '52px', 
                height: '52px', 
                borderRadius: '14px', 
                background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px',
                fontWeight: 800
              }}>
                {s.full_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9' }}>{s.full_name}</h3>
                <p style={{ fontSize: '12px', color: '#64748b' }}>{s.email}</p>
                <div style={{ marginTop: '8px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, background: 'rgba(16, 185, 129, 0.1)', color: '#34d399' }}>ACTIVE</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setError(''); setSuccess('') }} title="Provision New Account">
        {error && (
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', fontSize: '13px', marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}
        
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Student Name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field" placeholder="Full Name" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="student@example.com" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="Temporary Password" required />
          </div>
          <button type="submit" disabled={creating} className="btn-primary" style={{ marginTop: '12px' }}>
            {creating ? 'Creating Account...' : 'Create Student Account'}
          </button>
        </form>
      </Modal>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
