'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore'
import { 
  ListChecks, 
  GraduationCap, 
  Link2, 
  Target, 
  TrendingUp, 
  Zap, 
  BookOpen, 
  Calendar, 
  ChevronRight, 
  Trophy 
} from 'lucide-react'

export default function StudentDashboard() {
  const { profile } = useAuth()
  const [todayTasks, setTodayTasks] = useState([])
  const [upcomingTests, setUpcomingTests] = useState([])
  const [recentMaterials, setRecentMaterials] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) loadDashboard()
  }, [profile])

  const loadDashboard = async () => {
    try {
      // Fetch Recent Tests
      const testsQ = query(
        collection(db, "tests"), 
        where("mentor_id", "==", profile.mentor_id),
        orderBy("test_date", "desc"),
        limit(2)
      );
      const testsSnap = await getDocs(testsQ);
      setUpcomingTests(testsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Fetch Recent Materials
      const matsQ = query(
        collection(db, "materials"), 
        where("mentor_id", "==", profile.mentor_id),
        orderBy("material_date", "desc"),
        limit(2)
      );
      const matsSnap = await getDocs(matsQ);
      setRecentMaterials(matsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Fetch Tasks
      const tasksQ = query(
        collection(db, "tasks"), 
        where("mentor_id", "==", profile.mentor_id),
        limit(3)
      );
      const tasksSnap = await getDocs(tasksQ);
      setTodayTasks(tasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 space-y-10 animate-fade-in max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative overflow-hidden p-10 rounded-[48px] bg-gradient-to-br from-[#080c1d] via-[#02040a] to-[#000] border border-white/5 shadow-2xl">
        <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-6">
              <span className="px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-[10px] font-black text-blue-400 tracking-[0.2em] uppercase">Student Collective</span>
              <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] font-black text-orange-400 tracking-[0.2em] uppercase">
                <Zap size={12} fill="currentColor" /> GRINDING
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
              Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-600 to-blue-800 uppercase">{profile?.full_name?.split(' ')[0] || 'Warrior'}</span> 👋
            </h1>
            <p className="text-gray-500 text-lg mt-5 max-w-xl font-bold leading-relaxed italic">
              "Victory loves preparation." Your journey to IIT begins with the choices you make today.
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 bg-white/[0.02] p-6 rounded-[32px] border border-white/5 shadow-inner">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/5" />
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" 
                        strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * 65) / 100}
                        className="text-blue-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">65%</span>
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Efficiency</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Target, label: 'Objectives', value: '4 / 6 Done', color: 'blue' },
          { icon: TrendingUp, label: 'Velocity', value: '7 Day Streak', color: 'orange' },
          { icon: Trophy, label: 'Rank', value: 'Aspirant', color: 'green' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-card p-6 flex items-center gap-6 transition-all hover:-translate-y-1">
              <div className={`w-16 h-16 rounded-[20px] bg-${stat.color}-600/10 flex items-center justify-center text-${stat.color}-500 border border-${stat.color}-500/20 shadow-xl`}>
                <Icon size={32} />
              </div>
              <div>
                <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <h4 className="text-2xl font-black text-white tracking-tight leading-none">{stat.value}</h4>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <ListChecks size={24} />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight uppercase">Daily Briefing</h3>
            </div>
            <button className="text-[11px] font-black text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-[0.2em]">Full Intel</button>
          </div>
          
          <div className="space-y-4">
            {todayTasks.length > 0 ? todayTasks.map((t) => (
              <div key={t.id} className="group glass-card p-5 hover:bg-white/[0.04] transition-all flex items-center justify-between border-white/[0.03]">
                <div className="flex items-center gap-5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-black/50 flex items-center justify-center border border-white/10 text-gray-600 group-hover:text-blue-500 transition-colors shadow-inner">
                    <BookOpen size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-black text-white truncate leading-none uppercase tracking-tight mb-1.5">{t.title}</p>
                    <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest flex items-center gap-1.5"><Clock size={10} /> 08:30 AM Deployment</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-800 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
            )) : (
              <div className="p-10 text-center border-2 border-dashed border-white/5 rounded-[32px]">
                <p className="text-sm font-bold text-gray-700 italic">No missions assigned. Scan for opportunities.</p>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-4 px-4">
            <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
              <Calendar size={24} />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight uppercase">Intelligence Feed</h3>
          </div>
          
          <div className="grid gap-4">
            {upcomingTests.map((t) => (
              <div key={t.id} className="glass-card p-6 border-l-[6px] border-l-green-600 bg-green-600/[0.03] shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="p-3 rounded-2xl bg-green-600/10 text-green-500 border border-green-500/20">
                      <GraduationCap size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-white uppercase tracking-tight mb-1">{t.test_name}</h4>
                      <p className="text-[11px] text-green-500/80 font-black uppercase tracking-[0.2em]">Critical Assessment</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-white/50 bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                    {new Date(t.test_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}

            {recentMaterials.map((m) => (
              <a key={m.id} href={m.link_url} target="_blank" rel="noopener noreferrer" 
                 className="glass-card p-6 border-l-[6px] border-l-blue-600 bg-blue-600/[0.03] block transition-all hover:translate-x-2 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="p-3 rounded-2xl bg-blue-600/10 text-blue-500 border border-blue-500/20">
                      <Link2 size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-white truncate uppercase tracking-tight mb-1">{m.title}</h4>
                      <p className="text-[11px] text-blue-500/80 font-black uppercase tracking-[0.2em]">Shared Intel</p>
                    </div>
                  </div>
                  <ChevronRight size={24} className="text-gray-800" />
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
