'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'

import sparkImage from '@/../IIT_Roorkee.jpg' // Using specific uploaded asset

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const { login, resetPassword } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { user } = await login(email, password)
      router.push('/')
    } catch (err) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (!email) return setError('Please enter your email first.')
    setError('')
    try {
      await resetPassword(email)
      setResetSent(true)
      setTimeout(() => setResetSent(false), 5000)
    } catch (err) {
      setError(err.message || 'Reset failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black relative overflow-hidden">
      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" 
        style={{ backgroundImage: `url(${sparkImage.src})` }}
      />
      <div className="absolute inset-0 z-0 bg-black/40" /> {/* Slight dark tint for text readability */}
      
      <div className="fixed top-[-15%] right-[-10%] w-[550px] h-[550px] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[450px] h-[450px] rounded-full bg-blue-700/5 blur-[100px] pointer-events-none z-0" />

      <div className="w-full max-w-[420px] relative z-10 animate-fade-in text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 mb-6 shadow-[0_0_40px_rgba(37,99,235,0.3)] border border-blue-400/30">
          <Sparkles size={32} className="text-white" />
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight leading-none mb-4">
          Welcome <span className="text-blue-500">Back</span>
        </h1>
        <p className="text-gray-400 text-sm mb-10 font-medium italic">Continue your JEE conquest.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left">
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3">
              <AlertCircle size={18} />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {resetSent && (
            <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs flex items-center gap-3">
              <AlertCircle size={18} />
              <span className="font-semibold">Reset link sent to your email!</span>
            </div>
          )}

          <div className="flex flex-col gap-6 bg-black/20 backdrop-blur-2xl p-8 rounded-[32px] border border-white/20 shadow-2xl">
            <div className="flex flex-col gap-2.5">
              <label className="text-[10px] font-black text-white/90 uppercase tracking-[0.2em] px-1 drop-shadow-md">Email Account</label>
              <div className="flex items-center bg-black/30 border border-white/20 rounded-2xl px-4 focus-within:border-blue-400 focus-within:bg-black/40 transition-all">
                <Mail className="text-gray-300" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-transparent py-4.5 px-3 text-white placeholder-gray-400 outline-none text-sm font-medium"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="text-[10px] font-black text-white/90 uppercase tracking-[0.2em] px-1 drop-shadow-md">Secure Key</label>
              <div className="flex items-center bg-black/30 border border-white/20 rounded-2xl px-4 focus-within:border-blue-400 focus-within:bg-black/40 transition-all">
                <Lock className="text-gray-300" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent py-4.5 px-3 text-white placeholder-gray-400 outline-none text-sm font-medium"
                  required
                />
              </div>
              <button 
                type="button" 
                onClick={handleReset}
                className="text-[10px] font-bold text-gray-600 hover:text-blue-500 mt-2 text-right transition-colors"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-4.5"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span className="text-base tracking-tight">Access Portal</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-400 font-medium">
            New here? <Link href="/signup" className="text-blue-500 hover:text-blue-400 font-bold underline underline-offset-4 decoration-blue-500/20">Create profile</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
