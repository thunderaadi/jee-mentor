import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        marginLeft: '260px',
        minHeight: '100vh',
        width: 'calc(100% - 260px)',
      }}>
        <div style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto' }} className="page-enter">
          <Outlet />
        </div>
      </main>

      {/* Responsive override for mobile */}
      <style>{`
        @media (max-width: 1023px) {
          main {
            margin-left: 0 !important;
            width: 100% !important;
            padding-top: 16px;
          }
        }
      `}</style>
    </div>
  )
}
