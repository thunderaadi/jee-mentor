import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Users, HelpCircle, GraduationCap, ListChecks, TrendingUp, Clock } from 'lucide-react'

export default function MentorDashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({ students: 0, doubts: 0, tests: 0, tasks: 0 })
  const [recentDoubts, setRecentDoubts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const [studentsRes, doubtsRes, testsRes, tasksRes, recentDoubtsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'student').eq('mentor_id', profile?.id),
        supabase.from('doubts').select('id', { count: 'exact' }).eq('status', 'open'),
        supabase.from('tests').select('id', { count: 'exact' }).eq('mentor_id', profile?.id),
        supabase.from('tasks').select('id', { count: 'exact' }).eq('mentor_id', profile?.id),
        supabase.from('doubts').select('*, profiles!doubts_student_id_fkey(full_name)').eq('status', 'open').order('created_at', { ascending: false }).limit(5),
      ])

      setStats({
        students: studentsRes.count || 0,
        doubts: doubtsRes.count || 0,
        tests: testsRes.count || 0,
        tasks: tasksRes.count || 0,
      })
      setRecentDoubts(recentDoubtsRes.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { label: 'Total Students', value: stats.students, icon: Users, iconColor: '#60a5fa', iconBg: 'rgba(30, 64, 175, 0.2)' },
    { label: 'Open Doubts', value: stats.doubts, icon: HelpCircle, iconColor: '#fbbf24', iconBg: 'rgba(245, 158, 11, 0.15)' },
    { label: 'Tests Created', value: stats.tests, icon: GraduationCap, iconColor: '#34d399', iconBg: 'rgba(16, 185, 129, 0.15)' },
    { label: 'Tasks Assigned', value: stats.tasks, icon: ListChecks, iconColor: '#f87171', iconBg: 'rgba(239, 68, 68, 0.15)' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ paddingTop: '8px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
          Welcome back, <span style={{
            background: 'linear-gradient(135deg, #60a5fa, #2563eb)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>{profile?.full_name || 'Mentor'}</span> 👋
        </h1>
        <p style={{ fontSize: '14px', marginTop: '6px', color: '#94a3b8' }}>
          Here's what's happening with your students today.
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
      }}>
        {statCards.map((card, idx) => (
          <div key={card.label} className="glass-card" style={{
            padding: '22px',
            background: 'rgba(10, 15, 40, 0.4)',
            borderColor: 'rgba(30, 64, 175, 0.15)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            animation: `slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${idx * 0.08}s both`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: card.iconBg,
                border: `1px solid ${card.iconColor}25`,
              }}>
                <card.icon size={22} color={card.iconColor} />
              </div>
              <TrendingUp size={16} color="#475569" />
            </div>
            <p style={{ fontSize: '32px', fontWeight: 800, color: '#f1f5f9', lineHeight: 1, letterSpacing: '-0.02em' }}>
              {loading ? '—' : card.value}
            </p>
            <p style={{ fontSize: '12px', marginTop: '6px', color: '#64748b', fontWeight: 500 }}>{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Doubts section */}
      <div className="glass-card" style={{ padding: '24px', background: 'rgba(8, 12, 30, 0.4)', borderColor: 'rgba(30, 64, 175, 0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9' }}>
            Recent Doubts
          </h2>
          <span className="badge badge-warning">{stats.doubts} open</span>
        </div>

        {recentDoubts.length === 0 ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            background: 'rgba(30, 64, 175, 0.03)',
            borderRadius: '12px',
            border: '1px dashed rgba(30, 64, 175, 0.1)',
          }}>
            <p style={{ fontSize: '14px', color: '#64748b' }}>No open doubts right now 🎉</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentDoubts.map((d) => (
              <div key={d.id} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '12px',
                background: 'rgba(15, 20, 50, 0.4)',
                border: '1px solid rgba(30, 64, 175, 0.1)',
                transition: 'all 0.2s ease',
              }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                  color: 'white',
                  flexShrink: 0,
                }}>
                  {d.profiles?.full_name?.charAt(0) || '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {d.question_text}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{d.profiles?.full_name}</span>
                    <span className="badge badge-info" style={{ fontSize: '10px', padding: '2px 8px' }}>{d.subject}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
