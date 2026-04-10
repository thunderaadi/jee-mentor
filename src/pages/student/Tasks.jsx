import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import EmptyState from '../../components/ui/EmptyState'
import { ListChecks, Calendar, CheckCircle2, Circle, Clock } from 'lucide-react'

export default function StudentTasks() {
  const { profile } = useAuth()
  const [tasks, setTasks] = useState([])
  const [progress, setProgress] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadTasks() }, [])

  const loadTasks = async () => {
    setLoading(true)
    const { data: taskData } = await supabase
      .from('tasks')
      .select('*, task_items(*)')
      .eq('mentor_id', profile?.mentor_id)
      .order('task_date', { ascending: false })

    const { data: progressData } = await supabase
      .from('student_task_progress')
      .select('*')
      .eq('student_id', profile?.id)

    const progMap = {}
    progressData?.forEach((p) => {
      progMap[p.task_item_id] = p.is_completed
    })

    setTasks(taskData || [])
    setProgress(progMap)
    setLoading(false)
  }

  const toggleItem = async (itemId) => {
    const isCurrentlyDone = progress[itemId] || false
    const newStatus = !isCurrentlyDone

    // Optimistic update
    setProgress((prev) => ({ ...prev, [itemId]: newStatus }))

    const { error } = await supabase
      .from('student_task_progress')
      .upsert({
        student_id: profile.id,
        task_item_id: itemId,
        is_completed: newStatus,
        updated_at: new Date().toISOString()
      }, { onConflict: 'student_id,task_item_id' })

    if (error) {
      // Revert on error
      setProgress((prev) => ({ ...prev, [itemId]: isCurrentlyDone }))
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
          Daily <span style={{ color: '#60a5fa' }}>Tasks</span>
        </h1>
        <p style={{ fontSize: '14px', marginTop: '4px', color: '#94a3b8' }}>
          Check off your completed tasks for today.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #1e40af', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState icon={ListChecks} title="No tasks assigned" description="Your mentor hasn't assigned any tasks yet." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {tasks.map((task) => {
            const items = task.task_items || []
            const doneCount = items.filter(i => progress[i.id]).length
            const isFullyDone = items.length > 0 && doneCount === items.length

            return (
              <div key={task.id} className="glass-card" style={{
                padding: '24px',
                background: 'rgba(8, 12, 28, 0.4)',
                borderColor: isFullyDone ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 64, 175, 0.15)',
                boxShadow: isFullyDone ? '0 4px 20px rgba(16, 185, 129, 0.05)' : 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isFullyDone ? 'rgba(16, 185, 129, 0.1)' : 'rgba(30, 64, 175, 0.1)',
                      color: isFullyDone ? '#34d399' : '#60a5fa'
                    }}>
                      <Calendar size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9' }}>{task.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          {new Date(task.task_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </span>
                        <span style={{ color: '#334155' }}>•</span>
                        <span style={{ fontSize: '12px', color: isFullyDone ? '#34d399' : '#94a3b8', fontWeight: 500 }}>
                          {doneCount}/{items.length} completed
                        </span>
                      </div>
                    </div>
                  </div>
                  {isFullyDone && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '10px',
                      background: 'rgba(16, 185, 129, 0.08)',
                      color: '#34d399',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      <CheckCircle2 size={14} /> Perfect Day
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        background: progress[item.id] ? 'rgba(16, 185, 129, 0.03)' : 'rgba(0,0,0,0.2)',
                        border: `1px solid ${progress[item.id] ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 64, 175, 0.1)'}`,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        width: '100%'
                      }}
                    >
                      {progress[item.id] ? (
                        <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0 }} />
                      ) : (
                        <Circle size={20} color="#334155" style={{ flexShrink: 0 }} />
                      )}
                      <span style={{
                        fontSize: '14px',
                        color: progress[item.id] ? '#94a3b8' : '#cbd5e1',
                        textDecoration: progress[item.id] ? 'line-through' : 'none'
                      }}>
                        {item.content}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
