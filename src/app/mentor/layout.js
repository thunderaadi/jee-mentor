'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Sidebar from "@/components/mentor/Sidebar";

import imgRoorkee from '@/../IIT_Roorkee.jpg'
import imgSignup from '@/../0199f88e-9bbd-4f15-bd8c-623a5c69d8f7_1280x712.jpg'
import imgOne from '@/../1596789144797.jpeg'
import imgTwo from '@/../carousel-1.jpg'
import imgThree from '@/../serpentine.jpg'

export default function MentorLayout({ children }) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const getBackgroundImage = () => {
    if (pathname.includes('/assignments')) return imgOne.src;
    if (pathname.includes('/tasks')) return imgTwo.src;
    if (pathname.includes('/doubts')) return imgThree.src;
    if (pathname.includes('/materials') || pathname.includes('/formula-sheets')) return imgSignup.src;
    if (pathname.includes('/tests')) return imgThree.src;
    return imgRoorkee.src;
  }

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
    <div className="flex flex-col md:flex-row bg-black min-h-screen">
      <Sidebar />
      <main className="flex-1 p-5 md:p-10 pt-20 md:pt-10 overflow-auto w-full max-w-[100vw] relative z-0">
        <div 
          className="fixed inset-0 z-[-2] bg-cover bg-center transition-all duration-700" 
          style={{ backgroundImage: `url(${getBackgroundImage()})` }}
        />
        <div className="fixed inset-0 z-[-1] bg-black/60 pointer-events-none" />
        {children}
      </main>
    </div>
  );
}
