'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import StudentSidebar from "@/components/student/Sidebar";
import bgImage from '@/../carousel-1.jpg'

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
    <div className="flex flex-col md:flex-row bg-black min-h-screen">
      <StudentSidebar />
      <main className="flex-1 p-5 md:p-10 pt-20 md:pt-10 overflow-auto w-full max-w-[100vw] relative z-0">
        <div 
          className="fixed inset-0 z-[-1] bg-cover bg-center opacity-[0.08]" 
          style={{ backgroundImage: `url(${bgImage.src})` }}
        />
        {children}
      </main>
    </div>
  );
}
