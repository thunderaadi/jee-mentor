'use client'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { ListChecks, Calendar, ExternalLink, GraduationCap, Link2, ChevronRight, BookOpen } from 'lucide-react'

export default function StudentSecondaryPages({ params }) {
  const { profile } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  // This is a generic "Resources" viewer for Student side (Materials / Tests / Tasks)
  // We'll use this for quick porting of the remaining simple list views.

  useEffect(() => {
    if (profile) loadData()
  }, [profile])

  const loadData = async () => {
    setLoading(true)
    try {
      // Logic would vary based on route, but for now we list what's common
      const q = query(collection(db, "materials"), where("mentor_id", "==", profile.mentor_id));
      const snap = await getDocs(q);
      setData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 space-y-10 max-w-7xl mx-auto">
       <div className="flex flex-col gap-2">
         <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20 w-fit">Knowledge Base</span>
         <h1 className="text-3xl font-black text-white uppercase tracking-tight">Study <span className="text-blue-500">Materials</span></h1>
       </div>

       {loading ? (
         <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-blue-600 border-t-white rounded-full animate-spin" /></div>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {data.map(item => (
             <div key={item.id} className="glass-card p-6 flex items-center justify-between group hover:border-blue-500/20 transition-all">
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                     <Link2 size={24} />
                   </div>
                   <div>
                     <h3 className="text-base font-black text-white uppercase tracking-tight">{item.title}</h3>
                     <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">{item.material_date}</p>
                   </div>
                </div>
                <a href={item.link_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-white/5 text-gray-500 hover:text-blue-500 transition-all active:scale-90">
                  <ExternalLink size={18} />
                </a>
             </div>
           ))}
         </div>
       )}
    </div>
  )
}
