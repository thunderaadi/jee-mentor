import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Modal from '../../components/ui/Modal'
import ImageUploader from '../../components/ui/ImageUploader'
import EmptyState from '../../components/ui/EmptyState'
import { HelpCircle, Plus, Send, Clock, CheckCircle2, MessageSquare, BookOpen, Layers, Hash } from 'lucide-react'

const SUBJECTS = ['Physics', 'Chemistry', 'Maths']

export default function StudentDoubts() {
  const { profile } = useAuth()
  const [doubts, setDoubts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState('all')

  // Form
  const [questionText, setQuestionText] = useState('')
  const [questionNumber, setQuestionNumber] = useState('')
  const [section, setSection] = useState('')
  const [chapter, setChapter] = useState('')
  const [subject, setSubject] = useState('Physics')
  const [uploadedUrls, setUploadedUrls] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { loadDoubts() }, [filter])

  const loadDoubts = async () => {
    setLoading(true)
    let query = supabase
      .from('doubts')
      .select('*')
      .eq('student_id', profile?.id)
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data } = await query
    setDoubts(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!questionText.trim()) return
    setSubmitting(true)

    await supabase.from('doubts').insert({
      student_id: profile.id,
      question_text: questionText,
      question_number: questionNumber || null,
      section: section || null,
      chapter: chapter || null,
      subject,
      image_urls: uploadedUrls.length > 0 ? uploadedUrls : null,
      status: 'open',
    })

    setQuestionText(''); setQuestionNumber(''); setSection(''); setChapter('')
    setSubject('Physics'); setUploadedUrls([])
    setShowModal(false)
    setSubmitting(false)
    loadDoubts()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            My <span style={{ color: '#60a5fa' }}>Doubts</span>
          </h1>
          <button onClick={() => setShowModal(true)} className="btn-primary" style={{ padding: '10px 20px' }}>
            <Plus size={18} /><span>Ask Doubt</span>
          </button>
        </div>
        <p style={{ fontSize: '14px', color: '#94a3b8' }}>
          Clarify your concepts and get guidance from your mentor.
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', padding: '4px', background: 'rgba(30, 64, 175, 0.05)', borderRadius: '14px', width: 'fit-content', border: '1px solid rgba(30, 64, 175, 0.1)' }}>
        {['all', 'open', 'resolved'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '8px 20px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: filter === s ? 'linear-gradient(135deg, #1e3a8a, #2563eb)' : 'transparent',
              color: filter === s ? 'white' : '#64748b',
              border: 'none',
              boxShadow: filter === s ? '0 4px 12px rgba(30, 58, 138, 0.3)' : 'none'
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #1e40af', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : doubts.length === 0 ? (
        <EmptyState icon={HelpCircle} title="All clear!" description="You haven't posted any doubts yet. Use the button above to ask one." />
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {doubts.map((d) => (
            <div key={d.id} className="glass-card" style={{
              padding: '24px',
              background: 'rgba(8, 12, 28, 0.4)',
              borderColor: d.status === 'resolved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 64, 175, 0.15)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    background: 'rgba(30, 64, 175, 0.15)',
                    color: '#60a5fa',
                    border: '1px solid rgba(30, 64, 175, 0.2)'
                  }}>
                    {d.subject}
                  </span>
                  {d.chapter && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', fontSize: '11px', color: '#94a3b8' }}>
                      <BookOpen size={10} /> {d.chapter}
                    </div>
                  )}
                  {d.section && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', fontSize: '11px', color: '#94a3b8' }}>
                      <Layers size={10} /> {d.section}
                    </div>
                  )}
                  {d.question_number && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', fontSize: '11px', color: '#94a3b8' }}>
                      <Hash size={10} /> Q.{d.question_number}
                    </div>
                  )}
                </div>
                <div style={{
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: d.status === 'open' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  color: d.status === 'open' ? '#fbbf24' : '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {d.status === 'open' ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                  {d.status.toUpperCase()}
                </div>
              </div>

              <p style={{ fontSize: '15px', color: '#f1f5f9', lineHeight: 1.6, marginBottom: '20px' }}>
                {d.question_text}
              </p>

              {/* Images */}
              {d.image_urls?.length > 0 && (
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {d.image_urls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0 }}>
                      <img src={url} alt="" style={{ width: '120px', height: '120px', objectCover: 'cover', borderRadius: '12px', border: '1px solid rgba(30, 64, 175, 0.2)', transition: 'transform 0.2s' }} onMouseOver={e=>e.target.style.transform='scale(1.05)'} onMouseOut={e=>e.target.style.transform='scale(1)'} />
                    </a>
                  ))}
                </div>
              )}

              {/* Mentor Reply */}
              {d.mentor_reply && (
                <div style={{
                  padding: '20px',
                  borderRadius: '16px',
                  background: 'rgba(16, 185, 129, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.1)',
                  marginTop: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <MessageSquare size={14} color="#34d399" />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Mentor's Response
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#f1f5f9', lineHeight: 1.6 }}>
                    {d.mentor_reply}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                <Clock size={12} color="#475569" />
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Posted on {new Date(d.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ask Doubt Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Ask a Doubt">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: '#94a3b8' }}>Select Subject</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {SUBJECTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSubject(s)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: subject === s ? 'rgba(30, 64, 175, 0.2)' : 'rgba(0,0,0,0.2)',
                    color: subject === s ? '#60a5fa' : '#64748b',
                    border: `1px solid ${subject === s ? '#1e40af' : 'rgba(30, 64, 175, 0.1)'}`,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px', color: '#64748b' }}>Question No.</label>
              <input value={questionNumber} onChange={(e) => setQuestionNumber(e.target.value)} className="input-field" placeholder="e.g. 15" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px', color: '#64748b' }}>Section</label>
              <input value={section} onChange={(e) => setSection(e.target.value)} className="input-field" placeholder="e.g. Exercise 1" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px', color: '#64748b' }}>Chapter</label>
              <input value={chapter} onChange={(e) => setChapter(e.target.value)} className="input-field" placeholder="e.g. Vectors" />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#94a3b8' }}>Doubt Detail</label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="input-field"
              rows={4}
              placeholder="What specifically are you struggling with?"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#94a3b8' }}>Upload Images</label>
            <ImageUploader
              bucket="doubt-images"
              folder={profile?.id}
              onUpload={(urls) => setUploadedUrls((prev) => [...prev, ...urls])}
              maxFiles={5}
            />
            {uploadedUrls.length > 0 && (
              <p style={{ fontSize: '12px', marginTop: '12px', color: '#10b981', fontWeight: 500 }}>
                ✓ {uploadedUrls.length} file(s) attached
              </p>
            )}
          </div>

          <button type="submit" disabled={submitting} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}>
            {submitting ? 'Submitting...' : 'Send Doubt to Mentor'}
            <Send size={18} />
          </button>
        </form>
      </Modal>

      <style>{`
        ::-webkit-scrollbar { height: 6px; }
        ::-webkit-scrollbar-thumb { background: rgba(30, 64, 175, 0.2); border-radius: 10px; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
