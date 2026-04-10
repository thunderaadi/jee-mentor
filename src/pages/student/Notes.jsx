import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import EmptyState from '../../components/ui/EmptyState'
import { StickyNote, Save, Calendar, ChevronLeft, ChevronRight, CheckCircle2, History } from 'lucide-react'

export default function StudentNotes() {
  const { profile } = useAuth()
  const [note, setNote] = useState('')
  const [existingNote, setExistingNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [allDates, setAllDates] = useState([])

  useEffect(() => { loadNote() }, [selectedDate])
  useEffect(() => { loadAllDates() }, [])

  const loadAllDates = async () => {
    const { data } = await supabase
      .from('daily_notes')
      .select('note_date')
      .eq('student_id', profile?.id)
      .order('note_date', { ascending: false })
    setAllDates((data || []).map((d) => d.note_date))
  }

  const loadNote = async () => {
    setLoading(true)
    setSaved(false)
    const { data } = await supabase
      .from('daily_notes')
      .select('*')
      .eq('student_id', profile?.id)
      .eq('note_date', selectedDate)
      .single()

    if (data) {
      setNote(data.content || '')
      setExistingNote(data)
    } else {
      setNote('')
      setExistingNote(null)
    }
    setLoading(false)
  }

  const saveNote = async () => {
    if (!note.trim()) return
    setSaving(true)

    if (existingNote) {
      await supabase
        .from('daily_notes')
        .update({ content: note, updated_at: new Date().toISOString() })
        .eq('id', existingNote.id)
    } else {
      await supabase.from('daily_notes').insert({
        student_id: profile.id,
        note_date: selectedDate,
        content: note,
      })
    }

    setSaving(false)
    setSaved(true)
    loadAllDates()
    setTimeout(() => setSaved(false), 2000)
  }

  const navigateDate = (dir) => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + dir)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  const isToday = selectedDate === new Date().toISOString().split('T')[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Daily <span style={{ color: '#60a5fa' }}>Reflection</span>
          </h1>
          <p style={{ fontSize: '14px', marginTop: '4px', color: '#94a3b8' }}>
            Document your learning progress and key takeaways for the day.
          </p>
        </div>
        {isToday && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '12px', background: 'rgba(96, 165, 250, 0.08)', color: '#60a5fa', fontSize: '12px', fontWeight: 700 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa' }} />
            LIVE JOURNAL
          </div>
        )}
      </div>

      {/* Date navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => navigateDate(-1)} style={{ padding: '10px', borderRadius: '12px', border: '1px solid rgba(30, 64, 175, 0.2)', background: 'rgba(30, 64, 175, 0.05)', color: '#94a3b8', cursor: 'pointer' }}>
          <ChevronLeft size={18} />
        </button>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          padding: '8px 20px', 
          background: 'rgba(30, 64, 175, 0.1)', 
          borderRadius: '12px',
          border: '1px solid rgba(30, 64, 175, 0.15)',
          flex: 1,
          maxWidth: '300px'
        }}>
          <Calendar size={18} color="#60a5fa" />
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                 style={{ background: 'none', border: 'none', color: '#f1f5f9', outline: 'none', fontSize: '14px', fontWeight: 600, width: '100%', cursor: 'pointer' }} />
        </div>
        <button onClick={() => navigateDate(1)} style={{ padding: '10px', borderRadius: '12px', border: '1px solid rgba(30, 64, 175, 0.2)', background: 'rgba(30, 64, 175, 0.05)', color: '#94a3b8', cursor: 'pointer' }}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Note editor */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #1e40af', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ 
            padding: '4px',
            background: 'rgba(8, 12, 28, 0.4)',
            border: '1px solid rgba(30, 64, 175, 0.15)',
          }}>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What did you learn today? What challenges did you face? Any breakthroughs?"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                minHeight: '350px',
                padding: '24px',
                color: '#f1f5f9',
                fontSize: '15px',
                lineHeight: 1.8,
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit'
              }}
            />
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '16px 24px', 
              background: 'rgba(0,0,0,0.2)', 
              borderTop: '1px solid rgba(255,255,255,0.03)',
              borderBottomLeftRadius: '16px',
              borderBottomRightRadius: '16px'
            }}>
              <p style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                {note.length} CHARACTERS
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {saved && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '12px', fontWeight: 700 }}>
                    <CheckCircle2 size={14} /> SAVED
                  </div>
                )}
                <button 
                  onClick={saveNote} 
                  disabled={saving || !note.trim()} 
                  className="btn-primary"
                  style={{ padding: '10px 24px', opacity: (saving || !note.trim()) ? 0.6 : 1, fontSize: '13px' }}
                >
                  {saving ? 'Saving...' : (existingNote ? 'Update Journal' : 'Save Journal')}
                  <Save size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Past notes timeline */}
          {allDates.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <History size={16} color="#475569" />
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Entries</h3>
              </div>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                {allDates.slice(0, 15).map((d) => (
                  <button 
                    key={d} 
                    onClick={() => setSelectedDate(d)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: d === selectedDate ? 'rgba(30, 64, 175, 0.2)' : 'rgba(10, 15, 30, 0.4)',
                      color: d === selectedDate ? '#60a5fa' : '#64748b',
                      border: `1px solid ${d === selectedDate ? '#1e40af' : 'rgba(255,255,255,0.03)'}`,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        ::-webkit-scrollbar { height: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(30, 64, 175, 0.2); border-radius: 10px; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
