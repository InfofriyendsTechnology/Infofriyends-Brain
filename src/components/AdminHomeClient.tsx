'use client'

import { Crown, Activity, Users, Lightbulb, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdminHomeClient({ session, members, works }: { session: any, members: any[], works: any[] }) {
  const activeWorks = works.filter(w => w.status === 'ACTIVE')
  const completedWorks = works.filter(w => w.status === 'COMPLETED' || w.status === 'ARCHIVED')
  const openIdeas = works.filter(w => w.status === 'IDEA')

  return (
    <div className="w-full h-full p-4 sm:p-6 lg:p-12 space-y-8">
      {/* Super Admin Crown Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#3188DA]/30 bg-gradient-to-br from-[#1B2B3A] via-background to-[#0D1A26] p-8 md:p-12 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#63BDF2]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#3188DA]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#63BDF2]/10 border border-[#63BDF2]/20 text-xs font-bold text-[#63BDF2] uppercase tracking-widest shadow-[0_0_15px_rgba(99,189,242,0.15)]">
            <Crown size={14} className="text-[#63BDF2]" /> 
            Super Admin Access
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Global <span className="text-[#63BDF2]">Oversight</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl leading-relaxed">
            Welcome back, <span className="text-white font-bold">{session?.user?.name}</span>. You are viewing the global analytics dashboard. As a Super Admin, you oversee all operations but do not participate in ideas.
          </p>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-zinc-950/50 border border-[#63BDF2]/20 p-6 rounded-3xl shadow-[0_0_20px_-10px_rgba(99,189,242,0.1)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Total Members</h3>
            <div className="w-10 h-10 rounded-2xl bg-[#63BDF2]/10 flex items-center justify-center text-[#63BDF2]">
              <Users size={18} />
            </div>
          </div>
          <p className="text-4xl font-black text-white">{members.length}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-zinc-950/50 border border-emerald-500/20 p-6 rounded-3xl shadow-[0_0_20px_-10px_rgba(16,185,129,0.1)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Completed Work</h3>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="text-4xl font-black text-white">{completedWorks.length}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-zinc-950/50 border border-[#63BDF2]/20 p-6 rounded-3xl shadow-[0_0_20px_-10px_rgba(99,189,242,0.1)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Active Sprints</h3>
            <div className="w-10 h-10 rounded-2xl bg-[#63BDF2]/10 flex items-center justify-center text-[#63BDF2]">
              <Activity size={18} />
            </div>
          </div>
          <p className="text-4xl font-black text-white">{activeWorks.length}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-zinc-950/50 border border-amber-500/20 p-6 rounded-3xl shadow-[0_0_20px_-10px_rgba(245,158,11,0.1)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Open Proposals</h3>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Lightbulb size={18} />
            </div>
          </div>
          <p className="text-4xl font-black text-white">{openIdeas.length}</p>
        </motion.div>
      </div>
      
      {/* Informational Message */}
      <div className="p-6 bg-zinc-900/40 border border-white/5 rounded-3xl text-center">
        <p className="text-zinc-500 text-sm">
          To manage members or login as a specific member, navigate to the <a href="/members" className="text-[#63BDF2] hover:underline font-bold">Team Directory</a>.
        </p>
      </div>
    </div>
  )
}
