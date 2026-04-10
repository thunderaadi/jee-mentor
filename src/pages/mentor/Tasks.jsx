import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { Plus, ListChecks, Trash2, Calendar, GripVertical, CheckCircle2, Layout } from 'lucide-react'

export default function MentorTasks() {
  const { profile } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  // Form state
  const [title, setTitle] = useState('')
  const [items, setItems] = useState([''])
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    loadTasks()
  }, [selectedDate])

  const loadTasks = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('tasks')
      .select('*, task_items(*)')
      .eq('mentor_id', profile?.id)
      .eq('task_date', selectedDate)
      .order('created_at', { ascending: false })

    setTasks(data || [])
    setLoading(false)
  }

  const addItem = () => setItems([...items, ''])
  const updateItem = (i, val) => {
    const copy = [...items]
    copy[i] = val
    setItems(copy)
  }
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i))

  const handleCreate = async (e) => {
    e.preventDefault()
    const filtered = items.filter((i) => i.trim())
    if (!title.trim() || !filtered.length) return

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({ mentor_id: profile.id, title, task_date: taskDate })
      .select()
      .single()

    if (error || !task) return

    const taskItems = filtered.map((content, idx) => ({
      task_id: task.id,
      content,
      sort_order: idx,
    }))

    await supabase.from('task_items').insert(taskItems)

    setTitle('')
    setItems([''])
    setShowModal(false)
    loadTasks()
  }

  const deleteTask = async (id) => {
    await supabase.from('task_items').delete().eq('task_id', id)
    await supabase.from('tasks').delete().eq('id', id)
    loadTasks()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Daily <span style={{ color: '#60a5fa' }}>Curriculum</span>
          </h1>
          <p style={{ fontSize: '14px', marginTop: '4px', color: '#94a3b8' }}>
            Design and assign daily learning checklists for your students.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary" style={{ padding: '11px 22px' }}>
          <Plus size={18} />
          <span>New Checklist</span>
        </button>
      </div>

      {/* Date filter & Stats */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          padding: '6px 16px', 
          background: 'rgba(30, 64, 175, 0.05)', 
          borderRadius: '12px',
          border: '1px solid rgba(30, 64, 175, 0.1)'
        }}>
          <Calendar size={16} color="#64748b" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#f1f5f9', 
              outline: 'none', 
              fontSize: '13px', 
              fontWeight: 600,
              cursor: 'pointer'
            }}
          />
        </div>
        <div style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ display: 'flex', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Showing <b>{tasks.length}</b> checklist(s) for <b>Today</b>
          </span>
        </div>
      </div>

      {/* Task list */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #1e40af', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState icon={ListChecks} title="No tasks for today" description="Help your students stay focused by creating their daily study plan." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {tasks.map((task) => (
            <div key={task.id} className="glass-card" style={{
              padding: '24px',
              background: 'rgba(8, 12, 28, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'rgba(30, 64, 175, 0.15)'
            }} onMouseOver={e=>e.currentTarget.style.borderColor='rgba(30, 64, 175, 0.3)'} onMouseOut={e=>e.currentTarget.style.borderColor='rgba(30, 64, 175, 0.15)'}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '38px', 
                    height: '38px', 
                    borderRadius: '10px', 
                    background: 'rgba(30, 64, 175, 0.1)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#60a5fa'
                  }}>
                    <Layout size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9' }}>{task.title}</h3>
                    <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      {task.task_items?.length || 0} objective(s)
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => deleteTask(task.id)} 
                  style={{ 
                    padding: '8px', 
                    borderRadius: '8px', 
                    background: 'none', 
                    border: 'none', 
                    color: '#475569', 
                    cursor: 'pointer',
                    transition: 'color 0.2s'
                  }}
                  onMouseOver={e=>e.currentTarget.style.color='#ef4444'}
                  onMouseOut={e=>e.currentTarget.style.color='#475569'}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(task.task_items || [])
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((item, idx) => (
                    <div key={item.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px', 
                      padding: '10px 14px', 
                      borderRadius: '10px', 
                      background: 'rgba(0,0,0,0.2)',
                      border: '1px solid rgba(255,255,255,0.03)'
                    }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: 'rgba(96, 165, 250, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#60a5fa' }}>
                        {idx + 1}
                      </div>
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>{item.content}</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Study Checklist">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#94a3b8' }}>Checklist Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Physics: Laws of Motion"
              className="input-field"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#94a3b8' }}>Assign Date</label>
            <input
              type="date"
              value={taskDate}
              onChange={(e) => setTaskDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>Checklist Items</label>
              <span style={{ fontSize: '11px', color: '#475569' }}>Minimum 1 required</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '24px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#475569' }}>{i + 1}.</div>
                  <input
                    value={item}
                    onChange={(e) => updateItem(i, e.target.value)}
                    placeholder="e.g. Solve HC Verma Page 42"
                    className="input-field"
                    style={{ flex: 1 }}
                    required={i === 0}
                  />
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)} style={{ padding: '8px', border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addItem} className="btn-secondary" style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '12px' }}>
              <Plus size={14} />
              <span>Add Step</span>
            </button>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px', marginTop: '12px' }}>
            <CheckCircle2 size={18} />
            <span>Assign Checklist</span>
          </button>
        </form>
      </Modal>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
