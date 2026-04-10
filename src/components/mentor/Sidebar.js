'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CheckSquare, 
  BookOpen, 
  GraduationCap, 
  LogOut 
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Sidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  const links = [
    { name: 'Dashboard', href: '/mentor', icon: LayoutDashboard },
    { name: 'Students', href: '/mentor/students', icon: Users },
    { name: 'Assignments', href: '/mentor/assignments', icon: FileText },
    { name: 'Tasks', href: '/mentor/tasks', icon: CheckSquare },
    { name: 'Materials', href: '/mentor/materials', icon: BookOpen },
    { name: 'Tests', href: '/mentor/tests', icon: GraduationCap },
    { name: 'Formula Sheets', href: '/mentor/formula-sheets', icon: Sparkles },
  ]

  return (
    <aside className="w-64 border-r border-white/5 bg-black h-screen flex flex-col p-6 sticky top-0 overflow-hidden">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">M</div>
        <span className="font-black text-white uppercase tracking-widest text-sm">Mentor<span className="text-blue-500">Node</span></span>
      </div>

      <nav className="flex-1 space-y-2">
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
        className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-bold text-sm"
      >
        <LogOut size={18} />
        Log Out
      </button>
    </aside>
  )
}
