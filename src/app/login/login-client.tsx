'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ShieldAlert, ArrowRight, Activity, Loader2, Eye, EyeOff, Terminal } from 'lucide-react'
import { loginAction } from '@/app/actions/auth'

export default function LoginClient() {
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

      {/* User-friendly dashboard preview loader to prevent feeling of freeze/hang */}
      {isRedirecting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-[#09090b] overflow-hidden flex flex-col p-4 sm:p-6 lg:p-8 pt-6"
        >
          {/* Background Skeleton Page */}
          <div className="w-full max-w-[1960px] mx-auto space-y-8 pb-20 select-none animate-pulse opacity-40 pointer-events-none">
            {/* Header Banner Skeleton */}
            <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0d0e12] p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-muted-foreground uppercase">
                    <Terminal size={12} /> Live Workspace
                  </div>
                  <div className="h-9 md:h-12 w-80 bg-white/5 rounded-2xl" />
                  <div className="h-4 w-full md:w-3/4 bg-white/5 rounded-lg" />
                </div>
              </div>
            </div>

            {/* Metrics Bar Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="relative overflow-hidden p-5 rounded-2xl border border-white/5 bg-[#0d0e12]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-4 w-20 bg-white/5" />
                    <div className="w-8 h-8 rounded-xl bg-white/5" />
                  </div>
                  <div className="h-7 w-12 bg-white/5 rounded-lg" />
                </div>
              ))}
            </div>

            {/* Main Layout Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 space-y-8">
                <div className="bg-[#0d0e12] border border-white/5 rounded-3xl p-6 space-y-6">
                  <div className="h-6 w-48 bg-white/5 rounded-lg" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-6 rounded-3xl border border-white/10 bg-[#09090b] h-40" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Glassmorphic Centered Loader */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-[#0d0e12]/80 border border-white/10 rounded-3xl p-8 max-w-xs w-full shadow-2xl backdrop-blur-md text-center space-y-5 flex flex-col items-center"
            >
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-[#63BDF2]/10" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-t-[#63BDF2] border-r-transparent border-b-transparent border-l-transparent"
                />
                <Activity className="text-[#63BDF2] animate-pulse" size={24} />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Access Granted</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-1">
                  <Loader2 size={10} className="animate-spin text-[#63BDF2]" /> Initializing OS...
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
