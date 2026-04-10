'use client'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { GraduationCap, Calendar, Trophy, ChevronRight } from 'lucide-react'

export default function StudentTestsPage() {
  const { profile } = useAuth()
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.mentor_id) loadTests()
  }, [profile])

  const loadTests = async () => {
    setLoading(true)
    try {
      const q = query(
        collection(db, "tests"),
        where("mentor_id", "==", profile.mentor_id),
        orderBy("test_date", "desc")
      );
      const snap = await getDocs(q);
      setTests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div className="pb-2 border-b border-white/5">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Assessment <span className="text-blue-500">Center</span></h1>
        <p className="text-gray-500 text-sm font-medium mt-1 italic">Monitor upcoming mock tests and preparation cycles.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-white rounded-full animate-spin" />
        </div>
      ) : tests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map(t => (
            <div key={t.id} className="glass-card p-6 group hover:border-orange-500/30 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-orange-600/10 flex items-center justify-center text-orange-500 border border-orange-500/20 shadow-xl">
                  <GraduationCap size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight leading-none mb-1">{t.test_name}</h3>
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/5 bg-white/5">Tactical Phase</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-gray-500 bg-black/40 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2"><Calendar size={14} className="text-orange-500" /> {t.test_date}</div>
                </div>
                
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-orange-400 bg-orange-400/5 p-3 rounded-xl border border-orange-400/10">
                   <div className="flex items-center gap-2"><Trophy size={14} /> AVG SCORE: {t.average_score}%</div>
                   <ChevronRight size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-[48px] bg-white/[0.01]">
          <Trophy size={48} className="mx-auto text-gray-800 mb-6" />
          <h3 className="text-xl font-black text-gray-500 uppercase tracking-tight">No Tests Scheduled</h3>
          <p className="text-gray-700 text-sm mt-2 font-bold italic">Stand by for upcoming tactical assessments.</p>
        </div>
      )}
    </div>
  )
}
