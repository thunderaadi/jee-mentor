'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  BookOpen, 
  GraduationCap, 
  LogOut,
  Sparkles,
  MessageSquare,
  StickyNote
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function StudentSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

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
    <aside className="w-64 border-r border-white/5 bg-black h-screen flex flex-col p-6 sticky top-0 overflow-hidden">
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
        onClick={logout}
        className="mt-8 flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-bold text-sm"
      >
        <LogOut size={18} />
        Log Out
      </button>
    </aside>
  )
}
