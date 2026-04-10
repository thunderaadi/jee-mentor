'use client'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { ListChecks, Plus, Trash2, Calendar, CheckCircle2, X, ArrowRight } from 'lucide-react'

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md p-8 relative shadow-2xl border-white/10">
        <div className="flex items-center justify-between mb-6 text-white font-black uppercase tracking-tight">
          <h2>{title}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function MentorTasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => { if (user) loadTasks() }, [user])

  const loadTasks = async () => {
    setLoading(true)
    const q = query(collection(db, "tasks"), where("mentor_id", "==", user.uid));
    const snap = await getDocs(q);
    setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    await addDoc(collection(db, "tasks"), {
      mentor_id: user.uid,
      title,
      task_date: taskDate,
      created_at: serverTimestamp(),
      items_count: 0
    })
    setTitle('')
    setShowModal(false)
    loadTasks()
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Daily <span className="text-blue-500">Missions</span></h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Assign objectives to your fleet.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={18} /> New Mission
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-blue-600 border-t-white rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map(t => (
            <div key={t.id} className="glass-card p-6 border-white/5 bg-[#080c1d]/40 group hover:border-blue-500/20 transition-all">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-black text-white uppercase tracking-tight">{t.title}</h3>
                <div className="text-[10px] font-black text-gray-600 bg-black/40 px-3 py-1 rounded-full border border-white/5 uppercase tracking-widest">{t.task_date}</div>
              </div>
              <div className="flex items-center justify-between mt-6">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">{t.items_count || 0} OBJECTIVES</span>
                <button onClick={async () => { if(confirm('Abort mission?')) { await deleteDoc(doc(db, "tasks", t.id)); loadTasks() } }} className="text-gray-700 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Daily Mission">
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Mission Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Physics Revision" className="input-field" required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Deployment Date</label>
            <input type="date" value={taskDate} onChange={(e) => setTaskDate(e.target.value)} className="input-field" required />
          </div>
          <button type="submit" className="btn-primary w-full py-4 uppercase">Initialize Deployment <ArrowRight size={18}/></button>
        </form>
      </Modal>
    </div>
  )
}
