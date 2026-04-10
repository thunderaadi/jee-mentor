import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { Plus, FileText, Calendar, Clock, Trash2, Users, ExternalLink, Upload, FileDown, Loader2 } from 'lucide-react'

export default function MentorAssignments() {
  const { profile } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState(null)

  // Form
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => { loadAssignments() }, [])

  const loadAssignments = async () => {
    setLoading(true)
    const { data: asns } = await supabase
      .from('assignments')
      .select('*')
      .eq('mentor_id', profile?.id)
      .order('created_at', { ascending: false })

    setAssignments(asns || [])

    if (asns?.length > 0) {
      const { data: subs } = await supabase
        .from('assignment_submissions')
        .select('*, profiles!assignment_submissions_student_id_fkey(full_name)')
        .in('assignment_id', asns.map(a => a.id))
      setSubmissions(subs || [])
    }
    setLoading(false)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setUploading(true)

    try {
      let fileUrl = null
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${profile.id}/${fileName}`

        const { error: uploadError, data } = await supabase.storage
          .from('assignment-files')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('assignment-files')
          .getPublicUrl(filePath)
        
        fileUrl = publicUrl
      }

      await supabase.from('assignments').insert({
        mentor_id: profile.id,
        title,
        description,
        due_date: dueDate || null,
        file_url: fileUrl
      })

      setTitle(''); setDescription(''); setDueDate(''); setFile(null)
      setShowModal(false)
      loadAssignments()
    } catch (err) {
      alert('Error uploading assignment: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const deleteAssignment = async (id) => {
    if (!confirm('Are you sure? All submissions will be lost.')) return
    await supabase.from('assignment_submissions').delete().eq('assignment_id', id)
    await supabase.from('assignments').delete().eq('id', id)
    loadAssignments()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Homework <span style={{ color: '#60a5fa' }}>Vault</span>
          </h1>
          <p style={{ fontSize: '14px', marginTop: '4px', color: '#94a3b8' }}>
            Post assignments and track student submissions in real-time.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary" style={{ padding: '11px 22px' }}>
          <Plus size={18} />
          <span>Post Assignment</span>
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #1e40af', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState icon={FileText} title="No assignments posted" description="Post your first assignment to start tracking student progress." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {assignments.map((a) => {
            const assignmentSubs = submissions.filter(s => s.assignment_id === a.id)
            return (
              <div key={a.id} className="glass-card" style={{
                padding: '24px',
                background: 'rgba(8, 12, 28, 0.4)',
                border: '1px solid rgba(30, 64, 175, 0.15)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
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
                    <FileText size={20} />
                  </div>
                  <button 
                    onClick={() => deleteAssignment(a.id)} 
                    style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}
                    onMouseOver={e=>e.currentTarget.style.color='#ef4444'}
                    onMouseOut={e=>e.currentTarget.style.color='#475569'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>{a.title}</h3>
                <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '20px', flex: 1 }}>{a.description}</p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}>
                    <Calendar size={12} />
                    Due: {a.due_date ? new Date(a.due_date).toLocaleDateString('en-IN') : 'No deadline'}
                  </div>
                  {a.file_url && (
                    <a href={a.file_url} target="_blank" rel="noopener noreferrer" 
                       style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}>
                      <FileDown size={12} />
                      Document attached
                    </a>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#34d399', fontWeight: 600 }}>
                    <Users size={12} />
                    {assignmentSubs.length} Submissions
                  </div>
                </div>

                <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                  <button 
                    onClick={() => setSelectedAssignment(a)}
                    className="btn-secondary" 
                    style={{ width: '100%', justifyContent: 'center', fontSize: '12px', padding: '10px' }}
                  >
                    View Submissions
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Submissions Modal */}
      <Modal 
        isOpen={!!selectedAssignment} 
        onClose={() => setSelectedAssignment(null)} 
        title={`Submissions: ${selectedAssignment?.title}`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {submissions.filter(s => s.assignment_id === selectedAssignment?.id).length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>No submissions yet</p>
          ) : (
            submissions.filter(s => s.assignment_id === selectedAssignment?.id).map((s) => (
              <div key={s.id} style={{ 
                padding: '16px', 
                borderRadius: '14px', 
                background: 'rgba(0,0,0,0.2)', 
                border: '1px solid rgba(30, 64, 175, 0.1)' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 700 }}>
                      {s.profiles?.full_name?.charAt(0)}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>{s.profiles?.full_name}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    {new Date(s.submitted_at || s.created_at).toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {s.image_urls?.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0 }}>
                      <img src={url} alt="" style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }} />
                    </a>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Create Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Post New Assignment">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#94a3b8' }}>Assignment Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Daily Practice Problems - Integration"
              className="input-field"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#94a3b8' }}>Description / Instructions</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief details about the task..."
              className="input-field"
              rows={4}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#94a3b8' }}>Attach Document (PDF)</label>
            <div style={{ 
              position: 'relative', 
              border: '2px dashed rgba(30, 64, 175, 0.2)', 
              borderRadius: '12px', 
              padding: '20px', 
              textAlign: 'center',
              background: file ? 'rgba(30, 64, 175, 0.05)' : 'transparent',
              transition: 'all 0.3s ease'
            }}>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
              />
              <Upload size={20} style={{ color: file ? '#60a5fa' : '#475569', marginBottom: '8px' }} />
              <p style={{ fontSize: '12px', color: file ? '#f8fafc' : '#64748b' }}>
                {file ? file.name : 'Click or drag PDF to upload'}
              </p>
            </div>
          </div>
          <button type="submit" disabled={uploading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}>
            {uploading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <span>Publish Assignment</span>
                <ExternalLink size={18} />
              </>
            )}
          </button>
        </form>
      </Modal>

      <style>{`
        ::-webkit-scrollbar { height: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(30, 64, 175, 0.2); border-radius: 10px; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
