'use client'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { BookOpen, ExternalLink, Link2, Search, Zap } from 'lucide-react'

export default function StudentIntelPage() {
  const { profile } = useAuth()
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (profile?.mentor_id) loadMaterials()
  }, [profile])

  const loadMaterials = async () => {
    setLoading(true)
    try {
      const q = query(
        collection(db, "materials"),
        where("mentor_id", "==", profile.mentor_id),
        orderBy("created_at", "desc")
      );
      const snap = await getDocs(q);
      setMaterials(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = materials.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Study <span className="text-blue-500">Intel</span></h1>
          <p className="text-gray-500 text-sm font-medium mt-1 italic">Knowledge artifacts deployed by your mentor.</p>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search resources..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/[0.03] border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all w-full md:w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-white rounded-full animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map(m => (
            <div key={m.id} className="glass-card p-6 flex items-center justify-between group hover:border-blue-500/30 transition-all">
              <div className="flex items-center gap-5 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-xl">
                  <Link2 size={24} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-black text-white uppercase tracking-tight truncate mb-1">{m.title}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{m.material_date}</span>
                    <span className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full border border-blue-400/20 uppercase tracking-widest">Resource</span>
                  </div>
                </div>
              </div>
              <a 
                href={m.link_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-primary p-3 rounded-xl shadow-lg shadow-blue-500/10 group-hover:scale-110 transition-transform"
              >
                <ExternalLink size={18} />
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-[48px] bg-white/[0.01]">
          <BookOpen size={48} className="mx-auto text-gray-800 mb-6" />
          <h3 className="text-xl font-black text-gray-500 uppercase tracking-tight">No Intel Found</h3>
          <p className="text-gray-700 text-sm mt-2 font-bold italic">Check back later for new mission assets.</p>
        </div>
      )}
    </div>
  )
}
