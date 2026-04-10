import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import EmptyState from '../../components/ui/EmptyState'
import { HelpCircle, Send, Clock, CheckCircle2, MessageSquare, User, BookOpen, Layers, Hash } from 'lucide-react'

export default function MentorDoubts() {
  const { profile } = useAuth()
  const [doubts, setDoubts] = useState([])
  const [loading, setLoading] = useState(true)
  const [replies, setReplies] = useState({})
  const [submitting, setSubmitting] = useState({})

  useEffect(() => { loadDoubts() }, [])

  const loadDoubts = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('doubts')
      .select('*, profiles!doubts_student_id_fkey(full_name)')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
    
    setDoubts(data || [])
    setLoading(false)
  }

  const handleReply = async (doubtId) => {
    const reply = replies[doubtId]
    if (!reply?.trim()) return

    setSubmitting(prev => ({ ...prev, [doubtId]: true }))

    await supabase
      .from('doubts')
      .update({
        mentor_reply: reply,
        status: 'resolved',
        resolved_at: new Date().toISOString()
      })
      .eq('id', doubtId)

    setReplies(prev => {
      const copy = { ...prev }
      delete copy[doubtId]
      return copy
    })
    setSubmitting(prev => ({ ...prev, [doubtId]: false }))
    loadDoubts()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
          Doubt <span style={{ color: '#60a5fa' }}>Resolution</span>
        </h1>
        <p style={{ fontSize: '14px', marginTop: '4px', color: '#94a3b8' }}>
          Answer your students' questions and help them overcome obstacles.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #1e40af', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : doubts.length === 0 ? (
        <EmptyState icon={CheckCircle2} title="No open doubts" description="All caught up! Your students don't have any open doubts right now." />
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {doubts.map((d) => (
            <div key={d.id} className="glass-card" style={{
              padding: '24px',
              background: 'rgba(8, 12, 28, 0.4)',
              border: '1px solid rgba(30, 64, 175, 0.15)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 700
                  }}>
                    {d.profiles?.full_name?.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9' }}>{d.profiles?.full_name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', mt: '2px' }}>
                      <span style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase' }}>{d.subject}</span>
                      <span style={{ color: '#334155' }}>•</span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{new Date(d.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {d.chapter && <div style={{ px: '8px', py: '2px', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', fontSize: '10px', color: '#64748b' }}>Ch: {d.chapter}</div>}
                  {d.question_number && <div style={{ px: '8px', py: '2px', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', fontSize: '10px', color: '#64748b' }}>Q.{d.question_number}</div>}
                </div>
              </div>

              <div style={{ 
                padding: '20px', 
                borderRadius: '16px', 
                background: 'rgba(0,0,0,0.2)', 
                border: '1px solid rgba(255,255,255,0.02)',
                marginBottom: '20px'
              }}>
                <p style={{ fontSize: '15px', color: '#f1f5f9', lineHeight: 1.6 }}>{d.question_text}</p>
                {d.image_urls?.length > 0 && (
                  <div style={{ display: 'flex', gap: '10px', mt: '16px', overflowX: 'auto', pb: '4px' }}>
                    {d.image_urls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0 }}>
                        <img src={url} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }} />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ position: 'relative' }}>
                  <MessageSquare size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: '#475569' }} />
                  <textarea
                    value={replies[d.id] || ''}
                    onChange={(e) => setReplies(prev => ({ ...prev, [d.id]: e.target.value }))}
                    placeholder="Type your explanation or answer here..."
                    className="input-field"
                    rows={3}
                    style={{ paddingLeft: '44px', paddingTop: '14px', background: 'rgba(10, 15, 30, 0.4)', borderRadius: '18px' }}
                  />
                </div>
                <button
                  onClick={() => handleReply(d.id)}
                  disabled={submitting[d.id] || !(replies[d.id]?.trim())}
                  className="btn-primary"
                  style={{ alignSelf: 'flex-end', padding: '10px 24px', fontSize: '13px', opacity: (submitting[d.id] || !(replies[d.id]?.trim())) ? 0.6 : 1 }}
                >
                  {submitting[d.id] ? 'Posting...' : 'Mark as Resolved'}
                  <Send size={16} />
                </button>
              </div>
            </div>
          ))}
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
