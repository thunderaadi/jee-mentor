import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId) => {
    console.log('[Auth] Fetching profile for:', userId)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.warn('[Auth] Profile fetch warning:', error.message)
        return null
      }
      
      if (data) {
        console.log('[Auth] Profile loaded successfully')
        setProfile(data)
        return data
      }
      return null
    } catch (err) {
      console.error('[Auth] Profile fetch crash:', err)
      return null
    }
  }

  useEffect(() => {
    let mounted = true
    console.log('[Auth] Initializing Auth system...')

    // SAFETY TIMEOUT: Ensure loading is never stuck
    const safetyTimer = setTimeout(() => {
      if (mounted && loading) {
        console.warn('[Auth] Safety timeout reached! Forcing loading to false.')
        setLoading(false)
      }
    }, 6000)

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('[Auth] GetSession error:', sessionError.message)
        }

        if (!mounted) return

        setSession(initialSession)
        setUser(initialSession?.user ?? null)
        
        if (initialSession?.user) {
          await fetchProfile(initialSession.user.id)
        }
      } catch (err) {
        console.error('[Auth] Initialization crash:', err)
      } finally {
        if (mounted) {
          console.log('[Auth] Initialization complete')
          setLoading(false)
          clearTimeout(safetyTimer)
        }
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('[Auth] State Change Event:', event)
        if (!mounted) return

        setSession(newSession)
        setUser(newSession?.user ?? null)
        
        if (newSession?.user) {
          await fetchProfile(newSession.user.id)
        } else {
          setProfile(null)
        }
        
        if (mounted) setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
      clearTimeout(safetyTimer)
    }
  }, [])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signOut,
    isAdmin: profile?.role === 'mentor',
    isStudent: profile?.role === 'student',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
