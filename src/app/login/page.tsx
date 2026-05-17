'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BrainCircuit, ShieldAlert, ArrowRight, Activity } from 'lucide-react'
import { loginAction } from '@/app/actions/auth'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError(null)
    try {
      await loginAction(formData)
    } catch (e: any) {
      setError(e.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#09090b]">
      {/* Background Ambient Glows (Clean dark blue/cyan ambient glows, no purple!) */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#63BDF2]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full bg-[#3188DA]/5 blur-[130px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full bg-[#0d0e12] border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative"
        >
          {/* Logo HUD Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4 group select-none">
              <div className="relative bg-[#14161f] border border-white/10 p-4 rounded-2xl text-[#63BDF2] flex items-center justify-center shadow-lg">
                <BrainCircuit size={36} />
              </div>
            </div>
            
            <h1 className="text-2xl font-black text-white tracking-tight text-center">
              Infofriyends <span className="text-[#63BDF2]">Brain OS</span>
            </h1>
            <p className="text-muted-foreground/80 text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
              <Activity size={10} className="text-[#63BDF2]" /> Mad Community, Not Company
            </p>
          </div>

          {/* Form */}
          <form action={handleSubmit} className="space-y-5">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl text-xs flex items-center gap-2"
              >
                <ShieldAlert size={14} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/70 uppercase tracking-wider block">Username</label>
              <input
                name="username"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-[#63BDF2] focus:ring-1 focus:ring-[#63BDF2]/30 transition-all font-medium"
                placeholder="yash959"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/70 uppercase tracking-wider block">Password</label>
              <input
                name="password"
                type="password"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-[#63BDF2] focus:ring-1 focus:ring-[#63BDF2]/30 transition-all font-medium"
                placeholder="••••••••••••"
              />
            </div>

            {/* High-Contrast Connect Button (Text is Black on the gorgeous gradient for maximum legibility!) */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full relative bg-gradient-to-r from-[#63BDF2] to-[#3188DA] text-black hover:opacity-95 py-3.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all disabled:opacity-50 mt-6 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-black/20"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:0.4s]" />
                </span>
              ) : (
                <>
                  Connect to Brain <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
