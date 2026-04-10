'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  BookOpen, 
  GraduationCap, 
  LogOut,
  Sparkles,
  MessageSquare,
  StickyNote,
  Menu,
  X
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function StudentSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (err) {
      console.error(err)
    }
  }

  const links = [
    { name: 'Home', href: '/student', icon: LayoutDashboard },
    { name: 'Assignments', href: '/student/assignments', icon: FileText },
    { name: 'Daily Tasks', href: '/student/tasks', icon: CheckSquare },
    { name: 'Formula Vault', href: '/student/formula-sheets', icon: Sparkles },
    { name: 'Study Intel', href: '/student/materials', icon: BookOpen },
    { name: 'Mock Tests', href: '/student/tests', icon: GraduationCap },
    { name: 'Notes', href: '/student/notes', icon: StickyNote },
    { name: 'Doubts', href: '/student/doubts', icon: MessageSquare },
  ]

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-50 w-10 h-10 bg-black border border-white/10 rounded-xl flex items-center justify-center text-white shadow-xl hover:bg-white/5 transition-all"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 border-r border-white/5 bg-black flex flex-col p-6 z-50 overflow-hidden transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">S</div>
        <span className="font-black text-white uppercase tracking-widest text-sm">Student<span className="text-blue-500">Node</span></span>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link 
              key={link.name} 
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10' 
                : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={18} />
              <span className="text-sm font-bold">{link.name}</span>
            </Link>
          )
        })}
      </nav>

      <button 
        onClick={handleLogout}
        className="mt-8 flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-bold text-sm"
      >
        <LogOut size={18} />
        Log Out
      </button>
      </aside>
    </>
  )
}
