'use client'

import { motion } from 'framer-motion'
import { updateWorkStatus } from '@/app/actions'
import { useState } from 'react'
import { CheckCircle2, Circle, Archive, Clock, ShieldAlert, Sparkles, User, ChevronRight } from 'lucide-react'

export default function WorkCard({ work, currentUser }: { work: any, currentUser: any }) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [pointsInput, setPointsInput] = useState(work.points || 10)
  const isCompleted = work.status === 'Completed'
  const isArchived = work.status === 'Archived'
  const isPending = work.status === 'Pending'
  const isAdmin = currentUser?.role === 'ADMIN'
  const isEditedByAdmin = work.editedByAdminId && work.editedByAdmin

  const handleStatusChange = async (newStatus: string, customPoints?: number) => {
    if (!isAdmin) return
    setIsUpdating(true)
    try {
      await updateWorkStatus(work.id, newStatus, customPoints ?? pointsInput)
    } catch (e) {
      console.error(e)
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusBadge = () => {
    switch (work.status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full select-none animate-pulse">
            Pending Approval
          </span>
        )
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full select-none">
            Completed (+10 Points)
          </span>
        )
      case 'Archived':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-500/10 border border-zinc-500/20 px-2.5 py-0.5 rounded-full select-none">
            Archived
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#63BDF2] bg-[#63BDF2]/10 border border-[#63BDF2]/20 px-2.5 py-0.5 rounded-full select-none">
            Active
          </span>
        )
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative group p-6 rounded-3xl border transition-all duration-300 flex flex-col h-full overflow-hidden select-none bg-gradient-to-br ${
        isCompleted 
          ? 'from-secondary/15 via-[#0d0e12] to-secondary/10 border-emerald-500/20 shadow-lg shadow-emerald-500/5' 
          : isArchived
            ? 'from-transparent to-transparent border-dashed border-white/5 opacity-50'
            : isPending
              ? 'from-amber-500/5 via-[#0d0e12] to-amber-500/0 border-amber-500/30'
              : 'from-[#0d0e12] via-[#09090b] to-secondary/20 border-white/10 hover:border-[#63BDF2]/40 hover:shadow-2xl hover:shadow-[#63BDF2]/5'
      }`}
    >
      {/* Decorative Brand Accent Glows */}
      {!isArchived && !isCompleted && !isPending && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#63BDF2]/5 rounded-full blur-2xl group-hover:bg-[#63BDF2]/10 transition-all pointer-events-none" />
      )}

      <div className="space-y-3 flex-1">
        {/* Upper metadata row */}
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1 min-w-0">
            <h3 className={`text-base font-bold tracking-tight leading-snug ${
              isCompleted || isArchived ? 'line-through text-muted-foreground' : 'text-white'
            } truncate`}>
              {work.name}
            </h3>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
            </div>
          </div>
        </div>

        {/* Small description */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {work.description}
        </p>

        {isEditedByAdmin && (
          <div className="text-[9px] uppercase tracking-wider text-orange-400/90 flex items-center gap-1.5 bg-orange-500/10 p-2 rounded-xl border border-orange-500/25">
            <ShieldAlert size={12} className="shrink-0" />
            Edited by Admin ({work.editedByAdmin.name})
          </div>
        )}
      </div>

      {/* User profile footer & timestamp */}
      <div className="flex items-center justify-between text-xs text-muted-foreground/80 pt-4 mt-6 border-t border-white/5">
        <div className="flex items-center gap-2">
          {work.creator?.profilePhoto ? (
            <img src={work.creator.profilePhoto} alt={work.creator.name} className="w-6 h-6 rounded-full object-cover border border-white/10" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-[#63BDF2]/20 text-[#63BDF2] flex items-center justify-center font-black text-[9px] uppercase">
              {work.creator?.name ? work.creator.name.charAt(0) : '?'}
            </div>
          )}
          <span className="font-semibold text-white/90 text-[11px] truncate max-w-[100px]">{work.creator?.name || 'Unknown'}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock size={11} />
          <span suppressHydrationWarning>{new Date(work.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Admin Action Strips (PERMANENTLY VISIBLE & MOBILE RESPONSIVE!) */}
      {isAdmin && (
        <div className="mt-4 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase font-bold text-muted-foreground">Reward Points:</span>
            <input 
              type="number"
              min="0"
              value={pointsInput}
              onChange={(e) => setPointsInput(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-12 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-center text-xs font-bold font-mono text-[#63BDF2] focus:outline-none focus:border-[#63BDF2]"
            />
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            {isPending && (
              <button 
                onClick={() => handleStatusChange('Active')}
                disabled={isUpdating}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 size={11} /> Approve
              </button>
            )}
            {!isCompleted && !isArchived && !isPending && (
              <button 
                onClick={() => handleStatusChange('Completed')}
                disabled={isUpdating}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 size={11} /> Complete
              </button>
            )}
            {!isArchived && !isPending && (
              <button 
                onClick={() => handleStatusChange('Archived')}
                disabled={isUpdating}
                className="bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/25 text-orange-400 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Archive size={11} /> Archive
              </button>
            )}
            {(isCompleted || isArchived) && (
              <button 
                onClick={() => handleStatusChange('Active')}
                disabled={isUpdating}
                className="bg-[#63BDF2]/10 hover:bg-[#63BDF2]/20 border border-[#63BDF2]/25 text-[#63BDF2] px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Circle size={11} /> Activate
              </button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}
