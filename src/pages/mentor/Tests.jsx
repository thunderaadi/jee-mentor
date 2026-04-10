import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { Plus, GraduationCap, Calendar, Trash2, Award, ClipboardList } from 'lucide-react'

export default function MentorTests() {
  const { profile } = useAuth()
  const [tests, setTests] = useState([])
  const [testMarks, setTestMarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedTest, setSelectedTest] = useState(null)

  // Form
  const [testName, setTestName] = useState('')
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0])
  const [maxMarks, setMaxMarks] = useState('300')

  useEffect(() => { loadTests() }, [])

  const loadTests = async () => {
    setLoading(true)
    const { data: testsData } = await supabase
      .from('tests')
      .select('*')
      .eq('mentor_id', profile?.id)
      .order('test_date', { ascending: false })

    setTests(testsData || [])

    if (testsData?.length > 0) {
      const { data: marksData } = await supabase
        .from('test_marks')
        .select('*, profiles!test_marks_student_id_fkey(full_name)')
        .in('test_id', testsData.map(t => t.id))
      setTestMarks(marksData || [])
    }
    setLoading(false)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!testName.trim()) return

    await supabase.from('tests').insert({
      mentor_id: profile.id,
      test_name: testName,
      test_date: testDate,
      max_marks: parseInt(maxMarks) || 300,
    })

    setTestName(''); setTestDate(new Date().toISOString().split('T')[0]); setMaxMarks('300')
    setShowModal(false)
    loadTests()
  }

  const deleteTest = async (id) => {
    if (!confirm('Are you sure? This will delete all student scores for this test.')) return
    await supabase.from('test_marks').delete().eq('test_id', id)
    await supabase.from('tests').delete().eq('id', id)
    loadTests()
  }

  const getSubjectColor = (mark) => {
    const pct = (mark / (parseInt(selectedTest?.max_marks || 300) / 3)) * 100
    if (pct >= 80) return '#34d399'
    if (pct >= 50) return '#fbbf24'
    return '#f87171'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Result <span style={{ color: '#60a5fa' }}>Tracker</span>
          </h1>
          <p style={{ fontSize: '14px', marginTop: '4px', color: '#94a3b8' }}>
            Evaluate student performance and track subject-wise progress.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary" style={{ padding: '11px 22px' }}>
          <Plus size={18} />
          <span>New Test Result</span>
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #1e40af', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : tests.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No tests recorded" description="Start by recording your first test and its results." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {tests.map((t) => {
            const results = testMarks.filter(m => m.test_id === t.id)
            return (
              <div key={t.id} className="glass-card" style={{
                padding: '24px',
                background: 'rgba(8, 12, 28, 0.4)',
                border: '1px solid rgba(30, 64, 175, 0.15)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={{ 
                    width: '42px', 
                    height: '42px', 
                    borderRadius: '12px', 
                    background: 'rgba(30, 64, 175, 0.1)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#60a5fa'
                  }}>
                    <ClipboardList size={22} />
                  </div>
                  <button 
                    onClick={() => deleteTest(t.id)} 
                    style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}
                    onMouseOver={e=>e.currentTarget.style.color='#ef4444'}
                    onMouseOut={e=>e.currentTarget.style.color='#475569'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9', marginBottom: '4px' }}>{t.test_name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                    <Calendar size={12} /> {new Date(t.test_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#818cf8', fontWeight: 600 }}>
                    <Award size={12} /> {t.max_marks} Marks
                  </div>
                </div>

                <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.03)', marginBottom: '20px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                    <span>Rank List</span>
                    <span>{results.length} students</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {results.slice(0, 3).map((r, i) => (
                      <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ color: '#94a3b8' }}>{i+1}. {r.profiles?.full_name}</span>
                        <span style={{ fontWeight: 700, color: '#f1f5f9' }}>{r.total_marks}/{t.max_marks}</span>
                      </div>
                    ))}
                    {results.length > 3 && (
                      <span style={{ fontSize: '11px', color: '#475569', textAlign: 'center', marginTop: '4px' }}>+ {results.length - 3} more</span>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedTest(t)}
                  className="btn-secondary" 
                  style={{ width: '100%', justifyContent: 'center', fontSize: '12px', padding: '10px' }}
                >
                  View Full Scorecard
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Scorecard Modal */}
      <Modal 
        isOpen={!!selectedTest} 
        onClose={() => setSelectedTest(null)} 
        title={`Scorecard: ${selectedTest?.test_name}`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {testMarks.filter(m => m.test_id === selectedTest?.id).length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No marks entered yet.</p>
          ) : (
            testMarks
              .filter(m => m.test_id === selectedTest?.id)
              .sort((a,b) => b.total_marks - a.total_marks)
              .map((r, i) => (
                <div key={r.id} style={{ 
                  padding: '16px', 
                  borderRadius: '16px', 
                  background: 'rgba(10, 15, 40, 0.4)', 
                  border: '1px solid rgba(30, 64, 175, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    background: i === 0 ? 'rgba(245,158,11,0.2)' : 'rgba(30,64,175,0.1)', 
                    color: i === 0 ? '#fbbf24' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 800
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>{r.profiles?.full_name}</p>
                    <div style={{ display: 'flex', gap: '8px', mt: '4px' }}>
                      <span style={{ fontSize: '11px', color: getSubjectColor(r.physics_marks) }}>Phy: {r.physics_marks}</span>
                      <span style={{ fontSize: '11px', color: getSubjectColor(r.chemistry_marks) }}>Che: {r.chemistry_marks}</span>
                      <span style={{ fontSize: '11px', color: getSubjectColor(r.maths_marks) }}>Mat: {r.maths_marks}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '18px', fontWeight: 800, color: '#f1f5f9' }}>{r.total_marks}</p>
                    <p style={{ fontSize: '10px', color: '#64748b' }}>TOTAL</p>
                  </div>
                </div>
              ))
          )}
        </div>
      </Modal>

      {/* Create Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Test Result">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#94a3b8' }}>Test Name</label>
            <input
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="e.g. Unit Test 1: Mechanics"
              className="input-field"
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#94a3b8' }}>Test Date</label>
              <input
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#94a3b8' }}>Max Marks</label>
              <input
                type="number"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}>
            <span>Register Test</span>
          </button>
        </form>
      </Modal>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
