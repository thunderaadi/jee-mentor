'use client'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { Users, Mail, UserPlus, Search, ExternalLink } from 'lucide-react'

export default function MentorStudentsPage() {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (user) loadStudents()
  }, [user])

  const loadStudents = async () => {
    setLoading(true)
    try {
      const q = query(
        collection(db, "users"), 
        where("role", "==", "student"),
        where("mentor_id", "==", user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const studentsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(studentsList)
    } catch (err) {
      console.error("Error loading students:", err);
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(s => 
    s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">My <span className="text-blue-500">Fleet</span></h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Command and monitor your student division.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..." 
              className="bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:border-blue-500/50 outline-none w-[280px] transition-all"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-white rounded-full animate-spin" />
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="glass-card p-20 text-center border-dashed border-white/10">
          <Users size={48} className="text-gray-800 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-400 uppercase tracking-widest">No Students found</h2>
          <p className="text-gray-600 text-sm mt-2">Active students will appear here after they join via your signup link.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((s) => (
            <div key={s.id} className="group glass-card p-6 flex items-center gap-5 transition-all hover:bg-blue-600/5 hover:border-blue-500/20 translate-y-0 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-500/20">
                {s.full_name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-black text-white truncate uppercase tracking-tight">{s.full_name}</h3>
                <div className="flex items-center gap-1.5 text-gray-500 mt-1">
                  <Mail size={12} />
                  <p className="text-[11px] font-bold truncate">{s.email}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-500 tracking-widest uppercase">Active</span>
                  <button className="text-gray-700 hover:text-blue-500 transition-colors p-1.5 rounded-lg hover:bg-blue-500/10">
                    <ExternalLink size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
