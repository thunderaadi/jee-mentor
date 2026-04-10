'use client'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { BookOpen, Plus, Trash2, Link2, ExternalLink, X, ArrowRight } from 'lucide-react'

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

export default function MentorMaterialsPage() {
  const { user } = useAuth()
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')

  useEffect(() => { if (user) loadMaterials() }, [user])

  const loadMaterials = async () => {
    setLoading(true)
    const q = query(collection(db, "materials"), where("mentor_id", "==", user.uid));
    const snap = await getDocs(q);
    setMaterials(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    await addDoc(collection(db, "materials"), {
      mentor_id: user.uid,
      title,
      link_url: linkUrl,
      material_date: new Date().toISOString().split('T')[0],
      created_at: serverTimestamp()
    })
    setTitle('')
    setLinkUrl('')
    setShowModal(false)
    loadMaterials()
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Intel <span className="text-blue-500">Repository</span></h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Share knowledge artifacts with your fleet.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={18} /> New Material
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-blue-600 border-t-white rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {materials.map(m => (
            <div key={m.id} className="glass-card p-6 border-white/5 bg-[#080c1d]/40 group hover:border-blue-500/20 transition-all flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20"><Link2 size={24}/></div>
                <div className="min-w-0">
                   <h3 className="text-sm font-black text-white uppercase tracking-tight truncate">{m.title}</h3>
                   <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">{m.material_date}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <a href={m.link_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-500 transition-colors"><ExternalLink size={18}/></a>
                <button onClick={async () => { if(confirm('Delete Intel?')) { await deleteDoc(doc(db, "materials", m.id)); loadMaterials() } }} className="text-gray-700 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Intel Entry">
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Resource Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Physics Formula Sheet" className="input-field" required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Source URL</label>
            <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." className="input-field" required />
          </div>
          <button type="submit" className="btn-primary w-full py-4 uppercase">Publish Intel <ArrowRight size={18}/></button>
        </form>
      </Modal>
    </div>
  )
}
