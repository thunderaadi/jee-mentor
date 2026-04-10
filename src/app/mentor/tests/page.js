'use client'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { GraduationCap, Plus, Trash2, Calendar, Trophy, X, ArrowRight } from 'lucide-react'

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

export default function MentorTestsPage() {
  const { user } = useAuth()
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => { if (user) loadTests() }, [user])

  const loadTests = async () => {
    setLoading(true)
    const q = query(collection(db, "tests"), where("mentor_id", "==", user.uid));
    const snap = await getDocs(q);
    setTests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    await addDoc(collection(db, "tests"), {
      mentor_id: user.uid,
      test_name: title,
      test_date: testDate,
      created_at: serverTimestamp(),
      average_score: 0
    })
    setTitle('')
    setShowModal(false)
    loadTests()
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Assessment <span className="text-blue-500">Center</span></h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Deploy mock tests and tactical assessments.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={18} /> New Test
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-blue-600 border-t-white rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map(t => (
            <div key={t.id} className="glass-card p-6 border-white/5 bg-[#080c1d]/40 group hover:border-blue-500/20 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-600/10 flex items-center justify-center text-orange-500 border border-orange-500/20"><GraduationCap size={24}/></div>
                <button onClick={async () => { if(confirm('Cancel Test?')) { await deleteDoc(doc(db, "tests", t.id)); loadTests() } }} className="text-gray-700 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">{t.test_name}</h3>
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-600 uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full border border-white/5"><Calendar size={12}/> {t.test_date}</div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-orange-400 uppercase tracking-widest"><Trophy size={12}/> AVG: {t.average_score}%</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Initialize Tactical Assessment">
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Test Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. JEE Full Mock Test-4" className="input-field" required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Scheduled Date</label>
            <input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} className="input-field" required />
          </div>
          <button type="submit" className="btn-primary w-full py-4 uppercase">Authorize Deployment <ArrowRight size={18}/></button>
        </form>
      </Modal>
    </div>
  )
}
