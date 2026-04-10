'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import StudentSidebar from "@/components/student/Sidebar";

export default function StudentLayout({ children }) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'student')) {
      router.push('/login')
    }
  }, [user, profile, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex bg-black min-h-screen">
      <StudentSidebar />
      <main className="flex-1 p-8 md:p-10 overflow-auto">
        {children}
      </main>
    </div>
  );
}
