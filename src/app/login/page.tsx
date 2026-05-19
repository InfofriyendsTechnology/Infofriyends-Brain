'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ShieldAlert, ArrowRight, Activity, Loader2, Eye, EyeOff } from 'lucide-react'
import { loginAction } from '@/app/actions/auth'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [isRedirecting, setIsRedirecting] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError(null)
    try {
      const res = await loginAction(formData)
      if (res?.success) {
        setIsRedirecting(true)
        router.push('/')
        router.refresh()
      } else {
        setError(res?.error || 'An unexpected error occurred.')
        setIsSubmitting(false)
      }
    } catch (e: any) {
      setError(e.message || 'Network communication failure.')
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
              <div className="relative bg-[#14161f] border border-white/10 p-3 w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg">
                <img src="/IB_LOGO.png" alt="Logo" className="max-h-full max-w-full object-contain" />
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
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-[#63BDF2] focus:ring-1 focus:ring-[#63BDF2]/30 transition-all font-medium"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* High-Contrast Connect Button (Text is Black on the gorgeous gradient for maximum legibility!) */}
            <button
              type="submit"
              disabled={isSubmitting || isRedirecting}
              className="w-full relative bg-gradient-to-r from-[#63BDF2] to-[#3188DA] text-black hover:opacity-95 py-3.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-black/20"
            >
              {isSubmitting || isRedirecting ? (
                <span className="flex items-center justify-center gap-2 font-bold">
                  <Loader2 size={16} className="animate-spin" />
                  Connecting to Brain...
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

      {/* Holographic scanner redirect overlay to prevent feeling of freeze/hang */}
      {isRedirecting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#09090b]/90 backdrop-blur-xl"
        >
          <div className="relative flex flex-col items-center space-y-6">
            {/* Holographic Glowing Scanner Outer Ring */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-[#63BDF2]/10" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-t-[#63BDF2] border-r-transparent border-b-transparent border-l-transparent"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute w-18 h-18 rounded-full border border-b-[#3188DA] border-t-transparent border-r-transparent border-l-transparent"
              />
              <Activity className="text-[#63BDF2] animate-pulse" size={32} />
            </div>
            
            {/* Text HUD */}
            <div className="text-center space-y-2 select-none">
              <h2 className="text-md font-black text-white uppercase tracking-[0.25em] animate-pulse">
                Access Granted
              </h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-1.5">
                <Loader2 size={12} className="animate-spin text-[#63BDF2]" />
                Initializing Brain OS...
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
