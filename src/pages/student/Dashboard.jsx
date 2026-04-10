import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { 
  ListChecks, 
  FileText, 
  GraduationCap, 
  Link2, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Target, 
  Zap,
  BookOpen,
  Calendar,
  ChevronRight,
  Trophy
} from 'lucide-react'

export default function StudentDashboard() {
  const { profile } = useAuth()
  const [todayTasks, setTodayTasks] = useState([])
  const [progress, setProgress] = useState({ total: 0, done: 0 })
  const [upcomingTests, setUpcomingTests] = useState([])
  const [recentMaterials, setRecentMaterials] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadDashboard() }, [])

  const loadDashboard = async () => {
    const today = new Date().toISOString().split('T')[0]

    try {
      // Today's tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*, task_items(*)')
        .eq('mentor_id', profile?.mentor_id)
        .eq('task_date', today)

      const allItems = (tasks || []).flatMap((t) => t.task_items || [])
      setTodayTasks(tasks || [])

      // Progress
      if (allItems.length > 0) {
        const { data: progressData } = await supabase
          .from('student_task_progress')
          .select('*')
          .eq('student_id', profile?.id)
          .in('task_item_id', allItems.map((i) => i.id))
          .eq('is_completed', true)

        setProgress({ total: allItems.length, done: progressData?.length || 0 })
      }

      // Recent tests
      const { data: tests } = await supabase
        .from('tests')
        .select('*')
        .eq('mentor_id', profile?.mentor_id)
        .order('test_date', { ascending: false })
        .limit(3)
      setUpcomingTests(tests || [])

      // Recent materials
      const { data: mats } = await supabase
        .from('materials')
        .select('*')
        .eq('mentor_id', profile?.mentor_id)
        .order('material_date', { ascending: false })
        .limit(4)
      setRecentMaterials(mats || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const progressPct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-10 pb-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden p-8 rounded-[40px] bg-gradient-to-br from-[#080c1d] via-[#05070f] to-[#000] border border-white/5 shadow-2xl">
        <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[200px] h-[200px] bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 tracking-widest uppercase">Student Portal</span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] font-bold text-orange-400 tracking-widest uppercase">
                <Zap size={10} /> {progressPct === 100 ? 'Level Max' : 'Grinding'}
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">{profile?.full_name || 'Student'}</span> 👋
            </h1>
            <p className="text-gray-400 text-lg mt-3 max-w-xl font-medium leading-relaxed">
              Every hour of study counts. You're building your future, one task at a time.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                        strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * progressPct) / 100}
                        className="text-blue-500 transition-all duration-1000 ease-out" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">{progressPct}%</span>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Done</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center gap-5 translate-y-0 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <Target size={28} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Daily Target</p>
            <h4 className="text-xl font-bold text-white">{progress.done} / {progress.total} Tasks</h4>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-5 translate-y-0 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 rounded-2xl bg-orange-600/10 flex items-center justify-center text-orange-500 border border-orange-500/20 shadow-lg shadow-orange-500/10">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Consistency</p>
            <h4 className="text-xl font-bold text-white">4 Day Streak</h4>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-5 translate-y-0 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 rounded-2xl bg-green-600/10 flex items-center justify-center text-green-500 border border-green-500/20 shadow-lg shadow-green-500/10">
            <Trophy size={28} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Level</p>
            <h4 className="text-xl font-bold text-white">Aspirant</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Tasks Preview */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                <ListChecks size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Daily Mission</h3>
            </div>
            <button className="text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest">View All</button>
          </div>
          
          {todayTasks.length === 0 ? (
            <div className="glass-card p-10 text-center border-dashed border-white/5 bg-transparent">
              <BookOpen size={40} className="mx-auto text-gray-800 mb-4" />
              <p className="text-gray-500 text-sm italic font-medium">No tasks assigned for today. Time for revision?</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayTasks.slice(0, 3).map((t) => (
                <div key={t.id} className="group glass-card p-4 hover:bg-white/[0.03] transition-colors border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center border border-white/5 text-gray-500 group-hover:text-blue-500 transition-colors">
                      <Zap size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{t.title}</p>
                      <p className="text-[10px] text-gray-500 mt-1 font-bold tracking-widest uppercase">{t.task_items?.length || 0} Sub-tasks</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-700 group-hover:text-blue-500 transition-colors" />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Events (Tests & Materials Combined) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                <Calendar size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Upcoming Events</h3>
            </div>
          </div>
          
          <div className="grid gap-3">
            {/* Tests Preview */}
            {upcomingTests.slice(0, 2).map((t) => (
              <div key={t.id} className="glass-card p-4 border-l-4 border-l-green-500/50 bg-green-500/[0.02]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                      <GraduationCap size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{t.test_name}</h4>
                      <p className="text-[10px] text-green-500/70 font-bold uppercase tracking-widest mt-0.5">Mock Test</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-400">{new Date(t.test_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Materials Preview */}
            {recentMaterials.slice(0, 2).map((m) => (
              <a key={m.id} href={m.link_url} target="_blank" rel="noopener noreferrer" 
                 className="glass-card p-4 border-l-4 border-l-blue-500/50 bg-blue-500/[0.02] block transition-transform hover:translate-x-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                      <Link2 size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white truncate">{m.title}</h4>
                      <p className="text-[10px] text-blue-500/70 font-bold uppercase tracking-widest mt-0.5">Study Material</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-700" />
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
