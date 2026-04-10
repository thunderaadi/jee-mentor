'use client'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { supabase } from '@/lib/supabase'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  X,
  FileDown,
  ArrowRight,
  ShieldCheck
} from 'lucide-react'

// Simple Modal Component
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-md p-8 relative shadow-2xl scale-in border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-white uppercase tracking-tight">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function StudentAssignmentsPage() {
  const { profile } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (profile) loadData()
  }, [profile])

  const loadData = async () => {
    setLoading(true)
    try {
      // Fetch Assignments for the student's mentor
      const asnQ = query(
        collection(db, "assignments"),
        where("mentor_id", "==", profile.mentor_id),
        orderBy("created_at", "desc")
      );
      const asns = await getDocs(asnQ);
      setAssignments(asns.docs.map(d => ({ id: d.id, ...d.data() })));

      // Fetch student's own submissions
      const subQ = query(
        collection(db, "submissions"),
        where("student_id", "==", profile.uid)
      );
      const subs = await getDocs(subQ);
      setSubmissions(subs.docs.map(d => d.data()));
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (files.length === 0) return setError('Please select at least one file.')
    setSubmitting(true)

    try {
      const urls = []
      for (const f of files) {
        const filePath = `submissions/${profile.uid}/${Date.now()}_${f.name}`;
        const { data, error } = await supabase.storage
          .from('jee_mentor')
          .upload(filePath, f);
        
        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('jee_mentor')
          .getPublicUrl(filePath);
        
        urls.push(publicUrl);
      }

      await addDoc(collection(db, "submissions"), {
        assignment_id: selectedAssignment.id,
        student_id: profile.uid,
        image_urls: urls,
        submitted_at: serverTimestamp()
      });

      setSuccess('Success! Assignment linked to mission profile.')
      setTimeout(() => {
        setShowModal(false)
        setSuccess('')
        loadData()
      }, 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 space-y-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">Operations</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Assignment <span className="text-blue-500">Vault</span></h1>
          <p className="text-gray-500 text-sm mt-1 font-medium italic">Execute your tasks. Excellence is non-negotiable.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-white rounded-full animate-spin" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="glass-card p-20 text-center border-dashed border-white/5">
          <p className="text-gray-600 font-bold uppercase tracking-widest">No active briefings</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {assignments.map((a) => {
            const isDone = submissions.some(s => s.assignment_id === a.id)
            return (
              <div key={a.id} className="group glass-card overflow-hidden flex flex-col border-white/5 bg-[#080c1d]/40 transition-all hover:border-blue-500/30">
                <div className="p-8 flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-2 rounded-xl ${isDone ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                      {isDone ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                    </div>
                    <span className="text-[10px] font-black text-gray-500 bg-black/40 px-3 py-1.5 rounded-full border border-white/5 uppercase tracking-widest">{a.due_date ? `DUE: ${new Date(a.due_date).toLocaleDateString()}` : 'OPEN'}</span>
                  </div>

                  <h3 className="text-xl font-black text-white mb-3 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{a.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-8 italic">{a.description || 'Proceed with standard protocols.'}</p>

                  <div className="flex flex-wrap gap-4 mb-8">
                    {a.file_url && (
                      <a href={a.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-black transition-all hover:bg-blue-600/20 uppercase tracking-tighter shadow-lg shadow-blue-500/5">
                        <FileDown size={14} /> View Reference Intel
                      </a>
                    )}
                  </div>
                  
                  {isDone ? (
                    <div className="flex items-center justify-between p-4 bg-green-500/5 rounded-2xl border border-green-500/10">
                      <span className="text-[10px] font-black text-green-500 uppercase tracking-[0.2em]">Mission Confirmed</span>
                      <ShieldCheck size={18} className="text-green-500" />
                    </div>
                  ) : (
                    <button 
                      onClick={() => { setSelectedAssignment(a); setShowModal(true) }}
                      className="w-full btn-primary py-4"
                    >
                      Deploy Response <ArrowRight size={18} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setFiles([]); setError('') }} title="Submit Assignment">
        {success ? (
          <div className="text-center py-10">
            <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4 animate-bounce" />
            <h3 className="text-xl font-black text-white uppercase mb-2">Authenticated</h3>
            <p className="text-gray-500 text-sm font-bold italic">{success}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 rounded-2xl bg-blue-600/5 border border-blue-500/10">
              <h4 className="text-sm font-black text-white uppercase tracking-tight">{selectedAssignment?.title}</h4>
              <p className="text-[11px] text-gray-500 mt-1 font-bold italic">Upload visual evidence of completion.</p>
            </div>

            <div className="relative border-2 border-dashed border-white/5 rounded-[28px] p-10 text-center hover:border-blue-500/30 transition-all cursor-pointer bg-black/20 group">
              <input type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <Upload size={32} className="mx-auto mb-4 text-gray-700 group-hover:text-blue-500 transition-colors" />
              <p className="text-sm font-black text-white uppercase tracking-tight">Select Artifacts</p>
              <p className="text-[10px] text-gray-600 mt-1 font-bold uppercase tracking-widest">{files.length > 0 ? `${files.length} selected` : 'Images only'}</p>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full py-4 uppercase">
              {submitting ? 'Enciphering...' : 'Finalize Submission'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  )
}
