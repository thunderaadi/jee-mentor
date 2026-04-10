'use client'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Users, 
  Search, 
  FileDown, 
  Zap, 
  Waves, 
  BookOpen, 
  CheckCircle2, 
  Clock,
  Sparkles
} from 'lucide-react'

export default function MentorFormulaView() {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [sheets, setSheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (user) loadAllData()
  }, [user])

  const loadAllData = async () => {
    setLoading(true)
    try {
      // 1. Fetch all students for this mentor
      const studentQ = query(
        collection(db, "users"), 
        where("role", "==", "student"),
        where("mentor_id", "==", user.uid)
      );
      const studentSnap = await getDocs(studentQ);
      const studentData = studentSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // 2. Fetch all formula sheets for this mentor's students
      const sheetQ = query(
        collection(db, "formula_sheets"),
        where("mentor_id", "==", user.uid)
      );
      const sheetSnap = await getDocs(sheetQ);
      const sheetData = sheetSnap.docs.map(d => d.data());

      setStudents(studentData);
      setSheets(sheetData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredStudents = students.filter(s => 
    s.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getSheet = (studentId, subject) => {
    return sheets.find(s => s.student_id === studentId && s.subject === subject);
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Strategic <span className="text-blue-500">Vault</span></h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Audit student formula sheets and tactical intelligence.</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={16} />
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search students..." 
            className="bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:border-blue-500/50 outline-none w-[280px] transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-white rounded-full animate-spin" />
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="glass-card p-20 text-center border-dashed border-white/10">
          <Sparkles size={48} className="text-gray-800 mx-auto mb-4" />
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">No intelligence gathered yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredStudents.map((s) => (
            <div key={s.id} className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-blue-500/20 transition-all">
              <div className="flex items-center gap-4 min-w-[200px]">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20">
                  {s.full_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">{s.full_name}</h3>
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">Academy Member</p>
                </div>
              </div>

              <div className="flex flex-1 items-center justify-between md:justify-end gap-3 md:gap-10">
                {[
                  { id: 'physics', icon: Zap, label: 'PHY', color: 'blue' },
                  { id: 'chemistry', icon: Waves, label: 'CHM', color: 'emerald' },
                  { id: 'maths', icon: BookOpen, label: 'MTH', color: 'orange' }
                ].map((sub) => {
                  const sheet = getSheet(s.id, sub.id);
                  const Icon = sub.icon;
                  return (
                    <div key={sub.id} className="flex flex-col items-center gap-2 min-w-[70px]">
                      <div className={`p-3 rounded-xl border ${sheet ? `bg-${sub.color}-600/10 border-${sub.color}-500/20 text-${sub.color}-500 shadow-lg shadow-${sub.color}-500/5` : 'bg-white/5 border-white/5 text-gray-800'}`}>
                        <Icon size={20} />
                      </div>
                      <span className="text-[9px] font-black text-gray-600 tracking-tighter uppercase">{sub.label}</span>
                      {sheet ? (
                         <a href={sheet.file_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest underline underline-offset-4 decoration-blue-500/20">View</a>
                      ) : (
                         <span className="text-[10px] font-black text-gray-800 uppercase tracking-widest">N/A</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
