'use client'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { CheckCircle2, Circle, Clock, Target, Zap } from 'lucide-react'

export default function StudentTasksPage() {
  const { user, profile } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.mentor_id) loadTasks()
  }, [profile])

  const loadTasks = async () => {
    setLoading(true)
    try {
      const q = query(
        collection(db, "tasks"),
        where("mentor_id", "==", profile.mentor_id),
        orderBy("created_at", "desc")
      );
      const snap = await getDocs(q);
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleTask = async (taskId, currentStatus) => {
    // Note: In a real app, we'd have a separate 'student_tasks' collection for completion
    // But for this MVP, we'll mark the task locally or show it.
    // Let's simulate toggle by alerting for now, or you can add a completion field in Firestore.
    alert("Mission Objective Acknowledged. Proceed with focus!")
  }

  return (
    <div className="space-y-10 animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Active <span className="text-blue-500">Missions</span></h1>
          <p className="text-gray-500 text-sm font-medium mt-1 italic">Strategize and complete the objectives assigned by your mentor.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="text-right">
              <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none mb-1">Fleet Velocity</div>
              <div className="text-lg font-black text-white leading-none uppercase">Combat Ready</div>
           </div>
           <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-xl">
              <Zap size={24} fill="currentColor" />
           </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-white rounded-full animate-spin" />
        </div>
      ) : tasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map(t => (
            <div key={t.id} className="glass-card p-8 border-white/5 bg-[#080c1d]/40 group hover:border-blue-500/30 transition-all flex flex-col justify-between min-h-[200px]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Target size={18} className="text-blue-500" />
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Live Mission</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-600 uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full border border-white/5">
                    <Clock size={12} /> {t.task_date}
                  </div>
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">{t.title}</h3>
                <p className="text-gray-500 text-xs font-bold italic">Objectives finalized by mentor.</p>
              </div>
              
              <button 
                onClick={() => toggleTask(t.id)}
                className="mt-8 flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-white/[0.02] border border-white/5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all"
              >
                <Circle size={14} /> MARK AS COMPLETED
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-[48px] bg-white/[0.01]">
          <Target size={48} className="mx-auto text-gray-800 mb-6" />
          <h3 className="text-lg font-black text-gray-600 uppercase tracking-tight">Horizon Clear</h3>
          <p className="text-gray-700 text-sm mt-1 italic font-bold">No missions assigned by your mentor yet.</p>
        </div>
      )}
    </div>
  )
}
