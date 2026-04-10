'use client'
import { useEffect } from 'react'

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("CRASH DETECTED:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <div className="p-8 rounded-[32px] bg-red-500/10 border border-red-500/20 max-w-xl w-full">
        <h1 className="text-2xl font-black text-white uppercase mb-4">Critical System Error</h1>
        <div className="bg-black/50 p-4 rounded-xl border border-white/5 mb-6 overflow-x-auto text-left">
          <code className="text-red-400 text-xs font-mono break-all whitespace-pre-wrap">
            {error?.message || "Unknown Exception Occurred"}
          </code>
        </div>
        <button
          onClick={() => reset()}
          className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all"
        >
          Attempt Recovery
        </button>
      </div>
    </div>
  )
}
