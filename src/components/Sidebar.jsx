import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, ListChecks, FileText, GraduationCap,
  Link2, Users, HelpCircle, StickyNote, LogOut, Menu, X,
  Sparkles
} from 'lucide-react'

const mentorLinks = [
  { to: '/mentor', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/mentor/tasks', icon: ListChecks, label: 'Tasks' },
  { to: '/mentor/assignments', icon: FileText, label: 'Assignments' },
  { to: '/mentor/tests', icon: GraduationCap, label: 'Tests' },
  { to: '/mentor/materials', icon: Link2, label: 'Materials' },
  { to: '/mentor/students', icon: Users, label: 'Students' },
  { to: '/mentor/doubts', icon: HelpCircle, label: 'Doubts' },
]

const studentLinks = [
  { to: '/student', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/student/tasks', icon: ListChecks, label: 'Tasks' },
  { to: '/student/assignments', icon: FileText, label: 'Assignments' },
  { to: '/student/tests', icon: GraduationCap, label: 'Tests' },
  { to: '/student/materials', icon: Link2, label: 'Materials' },
  { to: '/student/notes', icon: StickyNote, label: 'Notes' },
  { to: '/student/doubts', icon: HelpCircle, label: 'Doubts' },
]

export default function Sidebar() {
  const { profile, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  const links = profile?.role === 'mentor' ? mentorLinks : studentLinks

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const sidebarStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 50,
    height: '100vh',
    width: '260px',
    display: 'flex',
    flexDirection: 'column',
    background: '#000000',
    borderRight: '1px solid rgba(30, 64, 175, 0.2)',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflowY: 'auto',
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        id="sidebar-toggle"
        onClick={() => setMobileOpen(true)}
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 60,
          padding: '10px',
          borderRadius: '12px',
          background: '#0a0a0a',
          border: '1px solid #1e293b',
          cursor: 'pointer',
          display: 'none',
        }}
        className="mobile-toggle"
      >
        <Menu size={20} color="#f8fafc" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 40,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(4px)',
          }}
          className="mobile-overlay"
        />
      )}

      {/* Sidebar */}
      <aside style={sidebarStyle} className={mobileOpen ? 'sidebar-open' : 'sidebar-default'}>
        {/* Header */}
        <div style={{ padding: '24px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
              boxShadow: '0 4px 15px rgba(30, 58, 138, 0.4)',
            }}>
              <Sparkles size={22} color="white" />
            </div>
            <div>
              <h1 style={{
                fontSize: '18px',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #60a5fa, #2563eb)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
              }}>JEE Mentor</h1>
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                {profile?.role === 'mentor' ? '✦ Mentor Panel' : '✦ Student Panel'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="mobile-close"
            style={{ display: 'none', padding: '4px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X size={18} color="#64748b" />
          </button>
        </div>

        {/* Divider */}
        <div style={{ margin: '0 20px 8px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(30,64,175,0.2), transparent)' }} />

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '4px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 16px',
                borderRadius: '12px',
                fontSize: '13.5px',
                fontWeight: isActive ? 600 : 500,
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(30, 64, 175, 0.2), rgba(37, 99, 235, 0.1))'
                  : 'transparent',
                color: isActive ? '#60a5fa' : '#94a3b8',
                borderLeft: isActive ? '3px solid #1e40af' : '3px solid transparent',
              })}
            >
              <link.icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(30, 64, 175, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', padding: '4px 8px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
              color: 'white',
              flexShrink: 0,
            }}>
              {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {profile?.full_name || 'User'}
              </p>
              <p style={{ fontSize: '11px', color: '#64748b', textTransform: 'capitalize' }}>
                {profile?.role || 'Loading...'}
              </p>
            </div>
          </div>
          <button
            id="logout-button"
            onClick={handleSignOut}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '9px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(30, 64, 175, 0.3)',
              background: 'rgba(30, 58, 138, 0.1)',
              color: '#94a3b8',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 1023px) {
          .mobile-toggle { display: block !important; }
          .mobile-close { display: block !important; }
          .sidebar-default { transform: translateX(-100%); }
          .sidebar-open { transform: translateX(0); }
        }
        @media (min-width: 1024px) {
          .sidebar-default { transform: translateX(0); }
          .mobile-overlay { display: none !important; }
        }
      `}</style>
    </>
  )
}
