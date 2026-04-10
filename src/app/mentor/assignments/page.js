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
  deleteDoc, 
  doc, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Plus, 
  FileText, 
  Calendar, 
  Clock, 
  Trash2, 
  Users, 
  ExternalLink, 
  Upload, 
  FileDown, 
  Loader2, 
  X,
  ArrowRight
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

export default function MentorAssignmentsPage() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  
  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (user) loadAssignments()
  }, [user])

  const loadAssignments = async () => {
    setLoading(true)
    try {
      const q = query(
        collection(db, "assignments"),
        where("mentor_id", "==", user.uid),
        orderBy("created_at", "desc")
      );
      const snap = await getDocs(q);
      setAssignments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Error loading assignments:", err);
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setUploading(true)

    try {
      let fileUrl = null
      if (file) {
        const filePath = `assignments/${user.uid}/${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
          .from('jee_mentor')
          .upload(filePath, file);
        
        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('jee_mentor')
          .getPublicUrl(filePath);
        
        fileUrl = publicUrl;
      }

      await addDoc(collection(db, "assignments"), {
        mentor_id: user.uid,
        title,
        description,
        due_date: dueDate || null,
        file_url: fileUrl,
        created_at: serverTimestamp(),
        submissions_count: 0
      });

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
    if (!confirm('Are you sure? This will remove the assignment for all students.')) return
    try {
      await deleteDoc(doc(db, "assignments", id))
      loadAssignments()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Assignment <span className="text-blue-500">Vault</span></h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Deploy challenges to your student fleet.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={18} />
          <span>New Deployment</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-white rounded-full animate-spin" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="glass-card p-20 text-center border-dashed border-white/10">
          <FileText size={48} className="text-gray-800 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-400 uppercase tracking-widest">Vault is Empty</h2>
          <p className="text-gray-600 text-sm mt-2">Start by deploying your first assignment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {assignments.map((a) => (
            <div key={a.id} className="glass-card overflow-hidden border-white/5 bg-[#080c1d]/40 group hover:border-blue-500/20 transition-all">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-black text-white group-hover:text-blue-500 transition-colors uppercase tracking-tight">{a.title}</h3>
                  <button onClick={() => deleteAssignment(a.id)} className="text-gray-700 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-500/10">
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2 italic">{a.description || 'No instructions provided.'}</p>
                
                <div className="flex items-center gap-6 mb-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                    <Calendar size={12} />
                    Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'N/A'}
                  </div>
                  {a.file_url && (
                    <a href={a.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400">
                      <FileDown size={12} /> Doc Attached
                    </a>
                  )}
                  <div className="flex items-center gap-2 text-[10px] font-black text-green-500 uppercase tracking-widest">
                    <Users size={12} /> {a.submissions_count || 0} Subs
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Deployment">
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Assignment Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Kinematics DPP-1" className="input-field" required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Instructions</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Specific details..." className="input-field min-h-[100px] py-4" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input-field" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Attach Intel (PDF)</label>
            <div className="relative border-2 border-dashed border-white/5 rounded-2xl p-6 text-center hover:border-blue-500/30 transition-all cursor-pointer">
              <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
              <Upload size={20} className={`mx-auto mb-2 ${file ? 'text-blue-500' : 'text-gray-600'}`} />
              <p className="text-[11px] font-bold text-gray-500">{file ? file.name : 'Click to select PDF'}</p>
            </div>
          </div>
          <button type="submit" disabled={uploading} className="btn-primary w-full py-4">
            {uploading ? <Loader2 className="animate-spin" size={18} /> : <>Publish Assignment <ArrowRight size={18} /></>}
          </button>
        </form>
      </Modal>
    </div>
  )
}
