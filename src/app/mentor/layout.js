'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Sidebar from "@/components/mentor/Sidebar";

export default function MentorLayout({ children }) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'mentor')) {
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
      <Sidebar />
      <main className="flex-1 p-10 overflow-auto">
        {children}
      </main>
    </div>
  );
}
