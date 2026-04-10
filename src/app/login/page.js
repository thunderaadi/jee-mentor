'use client'
import { useState } from 'react'
import { Link } from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { user } = await login(email, password)
      // Next.js handled AuthContext will update profile automatically
      // We wait a beat for profile to sync or just push to home
      router.push('/')
    } catch (err) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#000000] relative overflow-hidden">
      <div className="fixed top-[-15%] right-[-10%] w-[550px] h-[550px] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[450px] h-[450px] rounded-full bg-blue-700/5 blur-[100px] pointer-events-none" />

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

          <div className="flex flex-col gap-6 bg-[#080c1d]/60 p-8 rounded-[32px] border border-white/[0.05] shadow-2xl">
            <div className="flex flex-col gap-2.5">
              <label className="text-[10px] font-black text-blue-400/80 uppercase tracking-[0.2em] px-1">Email Account</label>
              <div className="flex items-center bg-black/40 border border-white/10 rounded-2xl px-4 focus-within:border-blue-500/50 transition-all">
                <Mail className="text-gray-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-transparent py-4.5 px-3 text-white placeholder-gray-700 outline-none text-sm font-medium"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="text-[10px] font-black text-blue-400/80 uppercase tracking-[0.2em] px-1">Secure Key</label>
              <div className="flex items-center bg-black/40 border border-white/10 rounded-2xl px-4 focus-within:border-blue-500/50 transition-all">
                <Lock className="text-gray-500" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent py-4.5 px-3 text-white placeholder-gray-700 outline-none text-sm font-medium"
                  required
                />
              </div>
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
            New here? <a href="/signup" className="text-blue-500 hover:text-blue-400 font-bold underline underline-offset-4 decoration-blue-500/20">Create profile</a>
          </p>
        </form>
      </div>
    </div>
  )
}
