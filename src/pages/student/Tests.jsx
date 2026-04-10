import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import EmptyState from '../../components/ui/EmptyState'
import { GraduationCap, Award, Calculator, Beaker, Zap, Calendar, AlertCircle } from 'lucide-react'

export default function StudentTests() {
  const { profile } = useAuth()
  const [tests, setTests] = useState([])
  const [scores, setScores] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState({})

  // Entry form
  const [activeTest, setActiveTest] = useState(null)
  const [physics, setPhysics] = useState('')
  const [chemistry, setChemistry] = useState('')
  const [maths, setMaths] = useState('')

  useEffect(() => { loadTests() }, [])

  const loadTests = async () => {
    setLoading(true)
    const { data: testsData } = await supabase
      .from('tests')
      .select('*')
      .eq('mentor_id', profile?.mentor_id)
      .order('test_date', { ascending: false })

    const { data: scoresData } = await supabase
      .from('test_marks')
      .select('*')
      .eq('student_id', profile?.id)

    const map = {}
    scoresData?.forEach(s => { map[s.test_id] = s })

    setTests(testsData || [])
    setScores(map)
    setLoading(false)
  }

  const handleSubmit = async (e, test) => {
    e.preventDefault()
    const p = parseInt(physics) || 0
    const c = parseInt(chemistry) || 0
    const m = parseInt(maths) || 0
    const total = p + c + m

    setSubmitting(prev => ({ ...prev, [test.id]: true }))

    await supabase.from('test_marks').upsert({
      student_id: profile.id,
      test_id: test.id,
      physics_marks: p,
      chemistry_marks: c,
      maths_marks: m,
      total_marks: total,
    }, { onConflict: 'student_id,test_id' })

    setActiveTest(null)
    setPhysics(''); setChemistry(''); setMaths('')
    setSubmitting(prev => ({ ...prev, [test.id]: false }))
    loadTests()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
          Test <span style={{ color: '#60a5fa' }}>Scores</span>
        </h1>
        <p style={{ fontSize: '14px', marginTop: '4px', color: '#94a3b8' }}>
          Log your performance and monitor your subject-wise growth.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #1e40af', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : tests.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No tests assigned" description="Your mentor will post test results here soon." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {tests.map((t) => {
            const score = scores[t.id]
            const isActive = activeTest?.id === t.id
            
            return (
              <div key={t.id} className="glass-card" style={{
                padding: '24px',
                background: 'rgba(8, 12, 28, 0.4)',
                border: '1px solid rgba(30, 64, 175, 0.15)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '10px', 
                      background: 'rgba(30, 64, 175, 0.1)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#60a5fa'
                    }}>
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9' }}>{t.test_name}</h3>
                      <p style={{ fontSize: '11px', color: '#64748b', mt: '2px' }}>
                        {new Date(t.test_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: score ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: score ? '#34d399' : '#fbbf24'
                  }}>
                    {score ? 'RECORDED' : 'PENDING'}
                  </div>
                </div>

                {score && !isActive ? (
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(3, 1fr)', 
                      gap: '12px', 
                      padding: '16px', 
                      borderRadius: '16px', 
                      background: 'rgba(0,0,0,0.2)', 
                      border: '1px solid rgba(255,255,255,0.03)',
                      marginBottom: '20px'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: '#4361ee', textTransform: 'uppercase', mb: '4px' }}>Physics</p>
                        <p style={{ fontSize: '18px', fontWeight: 800, color: '#f1f5f9' }}>{score.physics_marks}</p>
                      </div>
                      <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', mb: '4px' }}>Chemistry</p>
                        <p style={{ fontSize: '18px', fontWeight: 800, color: '#f1f5f9' }}>{score.chemistry_marks}</p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', mb: '4px' }}>Maths</p>
                        <p style={{ fontSize: '18px', fontWeight: 800, color: '#f1f5f9' }}>{score.maths_marks}</p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', mb: '20px' }}>
                       <Award size={18} color="#fbbf24" />
                       <span style={{ fontSize: '24px', fontWeight: 900, color: '#f1f5f9' }}>{score.total_marks}</span>
                       <span style={{ fontSize: '12px', color: '#64748b', mt: 'auto', mb: '4px' }}>/ {t.max_marks} Total</span>
                    </div>

                    <button onClick={() => { setActiveTest(t); setPhysics(score.physics_marks); setChemistry(score.chemistry_marks); setMaths(score.maths_marks); }} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '12px' }}>
                      Edit Scores
                    </button>
                  </div>
                ) : (
                  <form onSubmit={(e) => handleSubmit(e, t)} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: '#64748b', mb: '6px' }}>Physics</label>
                        <input type="number" value={physics} onChange={e=>setPhysics(e.target.value)} className="input-field" placeholder="0" required />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: '#64748b', mb: '6px' }}>Chemistry</label>
                        <input type="number" value={chemistry} onChange={e=>setChemistry(e.target.value)} className="input-field" placeholder="0" required />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: '#64748b', mb: '6px' }}>Maths</label>
                        <input type="number" value={maths} onChange={e=>setMaths(e.target.value)} className="input-field" placeholder="0" required />
                      </div>
                    </div>
                    <button type="submit" disabled={submitting[t.id]} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '13px' }}>
                      {submitting[t.id] ? 'Saving...' : 'Save Results'}
                    </button>
                    {isActive && (
                      <button type="button" onClick={() => setActiveTest(null)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer' }}>
                        Cancel
                      </button>
                    )}
                  </form>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(30, 64, 175, 0.05)', border: '1px solid rgba(30, 64, 175, 0.1)', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <AlertCircle size={24} color="#60a5fa" />
        <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
          Your scores are visible to your mentor. Ensure they are accurate for better performance analysis.
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
