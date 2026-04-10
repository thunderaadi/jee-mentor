'use client'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, addDoc, serverTimestamp, deleteDoc, doc, orderBy } from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { MessageSquare, Send, Clock, CheckCircle2, X } from 'lucide-react'

export default function StudentDoubtsPage() {
  const { user, profile } = useAuth()
  const [doubts, setDoubts] = useState([])
  const [loading, setLoading] = useState(true)
  const [subject, setSubject] = useState('Physics')
  const [question, setQuestion] = useState('')

  useEffect(() => {
    if (user) loadDoubts()
  }, [user])

  const loadDoubts = async () => {
    setLoading(true)
    try {
      const q = query(
        collection(db, "doubts"),
        where("student_id", "==", user.uid),
        orderBy("created_at", "desc")
      );
      const snap = await getDocs(q);
      setDoubts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!profile?.mentor_id) {
       alert("No mentor assigned to your flee. Contact HQ.")
       return
    }
    await addDoc(collection(db, "doubts"), {
      student_id: user.uid,
      student_name: profile.full_name,
      mentor_id: profile.mentor_id,
      subject,
      question,
      status: 'pending',
      created_at: serverTimestamp(),
      date_str: new Date().toLocaleDateString()
    })
    setQuestion('')
    loadDoubts()
  }

  return (
    <div className="space-y-10 animate-fade-in max-w-6xl mx-auto">
      <div className="pb-2 border-b border-white/5">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Support <span className="text-blue-500">Channel</span></h1>
        <p className="text-gray-500 text-sm font-medium mt-1 italic">Transmit tactical queries to your mentor for immediate clarification.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1">
          <div className="glass-card p-8 sticky top-32">
             <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-xl">
                   <MessageSquare size={20} />
                </div>
                Broadcast Query
             </h2>
             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Specialization</label>
                   <select value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field py-4">
                      <option className="bg-black">Physics</option>
                      <option className="bg-black">Chemistry</option>
                      <option className="bg-black">Mathematics</option>
                      <option className="bg-black">Strategy</option>
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Transmission Detail</label>
                   <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Describe your doubt in detail..." className="input-field min-h-[150px] py-4" required />
                </div>
                <button type="submit" className="btn-primary w-full py-5 text-sm uppercase tracking-widest shadow-xl shadow-blue-500/10">
                   <Send size={18}/> Transmit Doubt
                </button>
             </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
           <h2 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] px-2">Recent Transmissions</h2>
           {loading ? (
             <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-blue-600 border-t-white rounded-full animate-spin" /></div>
           ) : doubts.length > 0 ? doubts.map(d => (
             <div key={d.id} className="glass-card p-6 border-white/5 relative group transition-all hover:bg-white/[0.02]">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        d.status === 'pending' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'
                      }`}>
                         {d.status}
                      </span>
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{d.subject}</span>
                   </div>
                   <button onClick={async () => { if(confirm('Delete log?')) { await deleteDoc(doc(db, "doubts", d.id)); loadDoubts() } }} className="text-gray-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <X size={16}/>
                   </button>
                </div>
                <p className="text-white font-bold italic text-sm leading-relaxed mb-6">{d.question}</p>
                <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                   <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-700 uppercase tracking-widest"><Clock size={12}/> {d.date_str}</div>
                   {d.answer && (
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-blue-500 uppercase tracking-widest"><CheckCircle2 size={12}/> RESOLVED BY MENTOR</div>
                   )}
                </div>
                {d.answer && (
                   <div className="mt-4 p-4 rounded-2xl bg-blue-600/5 border border-blue-500/10 text-xs font-bold text-blue-400 italic">
                      <span className="text-[10px] block mb-1 text-blue-300 opacity-50 not-italic">MENTOR RESPONSE:</span>
                      {d.answer}
                   </div>
                )}
             </div>
           )) : (
              <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-[48px] bg-white/[0.01]">
                 <MessageSquare size={48} className="mx-auto text-gray-800 mb-6" />
                 <h3 className="text-lg font-black text-gray-600 uppercase tracking-tight">Channel Idle</h3>
                 <p className="text-gray-700 text-sm mt-1 italic font-bold">Waiting for your tactical inputs.</p>
              </div>
           )}
        </div>
      </div>
    </div>
  )
}
