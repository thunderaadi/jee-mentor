'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function HomePage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log("HomePage State:", { loading, user: user?.email, profile: profile?.role });
    if (!loading) {
      if (!user) {
        console.log("No user, redirecting to login");
        router.push('/login')
      } else if (profile) {
        console.log("User & Profile found, redirecting based on role:", profile.role);
        if (profile.role === 'mentor') {
          router.push('/mentor/students')
        } else {
          router.push('/student')
        }
      } else {
        console.log("User found, but profile still null. Waiting or falling back.");
        // Fallback if profile is slow
        setTimeout(() => { if (!profile) router.push('/login') }, 5000)
      }
    }
  }, [user, profile, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-white rounded-full animate-spin" />
    </div>
  )
}
