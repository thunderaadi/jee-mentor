'use client'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { MessageSquare, CheckCircle2, Send, X, Clock, HelpCircle } from 'lucide-react'

export default function MentorDoubtsPage() {
  const { user } = useAuth()
  const [doubts, setDoubts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDoubt, setSelectedDoubt] = useState(null)
  const [reply, setReply] = useState('')

  useEffect(() => {
    if (user) loadDoubts()
  }, [user])

  const loadDoubts = async () => {
    setLoading(true)
    try {
      const q = query(
        collection(db, "doubts"),
        where("mentor_id", "==", user.uid),
        orderBy("created_at", "desc")
      );
      const snap = await getDocs(q);
      setDoubts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Doubt error:", err)
      if (err.message.includes("index")) {
        alert("Doubt Sync (Mentor): " + err.message);
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (e) => {
    e.preventDefault()
    if (!selectedDoubt) return
    await updateDoc(doc(db, "doubts", selectedDoubt.id), {
      answer: reply,
      status: 'resolved',
      resolved_at: new Date().toISOString()
    })
    setReply('')
    setSelectedDoubt(null)
    loadDoubts()
  }

  return (
    <div className="space-y-10 animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Doubt <span className="text-blue-500">Center</span></h1>
          <p className="text-gray-500 text-sm font-medium mt-1 italic">Provide tactical resolution to student queries.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="text-right">
              <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none mb-1">Queue Status</div>
              <div className="text-lg font-black text-white leading-none uppercase">{doubts.filter(d => d.status === 'pending').length} PENDING</div>
           </div>
           <div className="w-12 h-12 rounded-xl bg-orange-600/10 flex items-center justify-center text-orange-500 border border-orange-500/20 shadow-xl">
              <HelpCircle size={24} />
           </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-white rounded-full animate-spin" />
        </div>
      ) : doubts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {doubts.map(d => (
            <div key={d.id} className={`glass-card p-8 border-l-[6px] transition-all ${
              d.status === 'pending' ? 'border-l-orange-500 bg-orange-500/[0.02]' : 'border-l-blue-500 bg-blue-500/[0.02]'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                   <div className="flex items-center gap-4 mb-4">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-black/50 px-3 py-1 rounded-full border border-white/5">{d.subject}</span>
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">{d.student_name}</span>
                      <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest flex items-center gap-1"><Clock size={12}/> {d.date_str}</span>
                   </div>
                   <p className="text-lg font-bold text-white italic leading-relaxed mb-6">"{d.question}"</p>
                   
                   {d.answer ? (
                      <div className="p-5 rounded-[24px] bg-blue-600/5 border border-blue-500/10 text-sm font-bold text-blue-400 italic">
                         <span className="text-[10px] block mb-2 text-blue-300 opacity-50 not-italic">YOUR RESOLUTION:</span>
                         {d.answer}
                      </div>
                   ) : (
                      <button onClick={() => setSelectedDoubt(d)} className="btn-primary py-3 px-8 text-[11px] uppercase tracking-widest flex items-center gap-2">
                         <Send size={16}/> Resolve Doubt
                      </button>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-[48px] bg-white/[0.01]">
          <MessageSquare size={48} className="mx-auto text-gray-800 mb-6" />
          <h3 className="text-lg font-black text-gray-600 uppercase tracking-tight">Queue Clear</h3>
          <p className="text-gray-700 text-sm mt-1 italic font-bold">No student queries in the tactical pipeline.</p>
        </div>
      )}

      {/* Resolution Modal */}
      {selectedDoubt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
          <div className="glass-card w-full max-w-2xl p-10 relative shadow-2xl border-white/10 animate-scale-up">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">Resolution Protocol</h2>
                <button onClick={() => setSelectedDoubt(null)} className="text-gray-500 hover:text-white"><X size={24}/></button>
             </div>
             
             <div className="mb-8 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] block mb-2 text-gray-600 uppercase font-black tracking-widest">Studnet Query:</span>
                <p className="text-white font-bold italic">"{selectedDoubt.question}"</p>
             </div>

             <form onSubmit={handleReply} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] px-1">Tactical Response</label>
                   <textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Enter full resolution..." className="input-field min-h-[180px] py-4" required />
                </div>
                <button type="submit" className="btn-primary w-full py-5 text-sm uppercase tracking-widest shadow-2xl shadow-blue-500/20"><CheckCircle2 size={20}/> Send Intellectual Resolution</button>
             </form>
          </div>
        </div>
      )}
    </div>
  )
}
