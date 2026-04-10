'use client'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, addDoc, serverTimestamp, deleteDoc, doc, orderBy } from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { StickyNote, Plus, Trash2, X, Save } from 'lucide-react'

export default function StudentNotesPage() {
  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    if (user) loadNotes()
  }, [user])

  const loadNotes = async () => {
    setLoading(true)
    try {
      const q = query(
        collection(db, "notes"),
        where("user_id", "==", user.uid),
        orderBy("created_at", "desc")
      );
      const snap = await getDocs(q);
      setNotes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    await addDoc(collection(db, "notes"), {
      user_id: user.uid,
      title,
      content,
      created_at: serverTimestamp(),
      last_updated: new Date().toISOString().split('T')[0]
    })
    setTitle('')
    setContent('')
    setShowModal(false)
    loadNotes()
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Mission <span className="text-blue-500">Log</span></h1>
          <p className="text-gray-500 text-sm font-medium mt-1 italic">Maintain your personal tactical records and strategy notes.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={18} /> New Entry
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-white rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map(n => (
            <div key={n.id} className="glass-card p-6 flex flex-col group hover:border-blue-500/20 transition-all min-h-[220px]">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-xl">
                  <StickyNote size={24} />
                </div>
                <button onClick={async () => { if(confirm('Erase log?')) { await deleteDoc(doc(db, "notes", n.id)); loadNotes() } }} className="text-gray-700 hover:text-red-500 transition-colors">
                  <Trash2 size={16}/>
                </button>
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2 truncate">{n.title}</h3>
              <p className="text-gray-500 text-xs font-bold flex-1 line-clamp-4 italic leading-relaxed">{n.content}</p>
              <div className="mt-6 pt-4 border-t border-white/5 text-[9px] font-black text-gray-700 uppercase tracking-widest italic text-right">
                Log Date: {n.last_updated}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="glass-card w-full max-w-2xl p-10 relative shadow-2xl border-white/10 animate-scale-up">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Broadcast to Mission Log</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white"><X size={24}/></button>
             </div>
             <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">Entry Heading</label>
                   <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Thermodynamics Formula Strategy" className="input-field py-4" required />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">Tactical Analysis</label>
                   <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Enter details..." className="input-field min-h-[200px] py-4" required />
                </div>
                <button type="submit" className="btn-primary w-full py-5 text-sm uppercase tracking-widest"><Save size={20}/> Encrypt & Save Entry</button>
             </form>
          </div>
        </div>
      )}
    </div>
  )
}
