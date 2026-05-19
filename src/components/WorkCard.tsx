'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { updateWorkStatus, addWorkUpdate } from '@/app/actions'
import { useState } from 'react'
import { 
  CheckCircle2, Circle, Archive, Clock, ShieldAlert, Sparkles, 
  User, ChevronDown, ChevronUp, AlertTriangle, MessageSquare, Plus, Loader2, Lightbulb, Zap 
} from 'lucide-react'

export default function WorkCard({ work, currentUser }: { work: any, currentUser: any }) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [isPostingUpdate, setIsPostingUpdate] = useState(false)
  const [newUpdate, setNewUpdate] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [showBlockInput, setShowBlockInput] = useState(false)
  const [blockReason, setBlockReason] = useState('')
  const [pointsInput, setPointsInput] = useState(work.points || 10)

  const isCompleted = work.status === 'COMPLETED'
  const isArchived = work.status === 'ARCHIVED'
  const isBlocked = work.status === 'BLOCKED'
  const isIdea = work.status === 'IDEA'
  const isActive = work.status === 'ACTIVE'

  const isAdmin = currentUser?.role === 'ADMIN'
  const isCreatorOrAssignee = currentUser && (work.creatorId === currentUser.id || work.assigneeId === currentUser.id)
  const isAuthorized = isAdmin || isCreatorOrAssignee

  const handleStatusChange = async (newStatus: string, customPoints?: number, reason?: string) => {
    if (!isAuthorized) return
    setIsUpdating(true)
    try {
      await updateWorkStatus(work.id, newStatus, customPoints ?? pointsInput, reason)
    } catch (e) {
      console.error(e)
    } finally {
      setIsUpdating(false)
      setShowBlockInput(false)
    }
  }

  const submitBlockedState = () => {
    if (!blockReason.trim()) return
    handleStatusChange('BLOCKED', pointsInput, blockReason)
  }

  const handlePostUpdate = async () => {
    if (!newUpdate.trim()) return
    setIsPostingUpdate(true)
    try {
      const res = await addWorkUpdate(work.id, newUpdate.trim())
      if (res && res.success) {
        setNewUpdate('')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsPostingUpdate(false)
    }
  }

  const handleFastUpdate = async (suggestion: string) => {
    setIsPostingUpdate(true)
    try {
      await addWorkUpdate(work.id, suggestion)
    } catch (e) {
      console.error(e)
    } finally {
      setIsPostingUpdate(false)
    }
  }

  const getPriorityBadge = () => {
    switch (work.priority) {
      case 'URGENT':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md animate-pulse">
            Urgent
          </span>
        )
      case 'HIGH':
        return (
          <span className="inline-flex items-center text-[9px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-md">
            High
          </span>
        )
      case 'LOW':
        return (
          <span className="inline-flex items-center text-[9px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-500/10 border border-zinc-500/20 px-2 py-0.5 rounded-md">
            Low
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center text-[9px] font-bold uppercase tracking-wider text-[#63BDF2] bg-[#63BDF2]/10 border border-[#63BDF2]/20 px-2 py-0.5 rounded-md">
            Medium
          </span>
        )
    }
  }

  const getStatusBadge = () => {
    switch (work.status) {
      case 'IDEA':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full select-none">
            <Lightbulb size={10} className="shrink-0" /> Idea
          </span>
        )
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full select-none">
            <Zap size={10} className="shrink-0" /> Active
          </span>
        )
      case 'BLOCKED':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-red-400 bg-red-500/20 border border-red-500/30 px-2.5 py-0.5 rounded-full select-none">
            <AlertTriangle size={10} className="shrink-0 text-red-400" /> Blocked
          </span>
        )
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full select-none">
            <CheckCircle2 size={10} className="shrink-0" /> Completed (+{work.points} PTS)
          </span>
        )
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-500/10 border border-zinc-500/20 px-2.5 py-0.5 rounded-full select-none">
            <Archive size={10} className="shrink-0" /> Archived
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-white bg-white/10 border border-white/20 px-2.5 py-0.5 rounded-full select-none">
            {work.status}
          </span>
        )
    }
  }

  // Build timeline history
  const timeline: any[] = []
  if (work.workUpdates) {
    work.workUpdates.forEach((up: any) => {
      timeline.push({
        id: up.id,
        type: 'UPDATE',
        userName: up.user?.name || 'Unknown',
        content: up.content,
        date: new Date(up.createdAt),
        timeStr: new Date(up.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      })
    })
  }
  if (work.activityLogs) {
    work.activityLogs.forEach((log: any) => {
      timeline.push({
        id: log.id,
        type: 'LOG',
        userName: log.user?.name || 'System',
        content: log.details || log.action,
        date: new Date(log.createdAt),
        timeStr: new Date(log.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      })
    })
  }
  timeline.sort((a, b) => b.date.getTime() - a.date.getTime())

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative group p-6 rounded-3xl border transition-all duration-300 flex flex-col h-full overflow-hidden bg-gradient-to-br ${
        isCompleted 
          ? 'from-secondary/15 via-[#0d0e12] to-secondary/10 border-emerald-500/20 shadow-lg shadow-emerald-500/5' 
          : isArchived
            ? 'from-transparent to-transparent border-dashed border-white/5 opacity-55'
            : isBlocked
              ? 'from-red-950/5 via-[#0d0e12] to-red-950/0 border-red-500/30'
              : 'from-[#0d0e12] via-[#09090b] to-secondary/20 border-white/10 hover:border-[#63BDF2]/40 hover:shadow-2xl hover:shadow-[#63BDF2]/5'
      }`}
    >
      {/* Decorative Glow */}
      {!isArchived && !isCompleted && !isBlocked && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#63BDF2]/5 rounded-full blur-2xl group-hover:bg-[#63BDF2]/10 transition-all pointer-events-none" />
      )}

      {/* Main Card Content */}
      <div className="space-y-4 flex-1">
        {/* Badges Row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {getStatusBadge()}
          {getPriorityBadge()}
        </div>

        {/* Name and Description */}
        <div className="space-y-1.5">
          <h3 className={`text-base font-bold tracking-tight leading-snug text-white ${
            isCompleted || isArchived ? 'line-through text-muted-foreground' : ''
          }`}>
            {work.name}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
            {work.description}
          </p>
        </div>

        {/* Due Date Indicator */}
        {work.dueDate && (
          <div className="flex items-center gap-1.5 text-[10px] text-orange-400/90 font-bold bg-orange-500/5 border border-orange-500/10 px-2.5 py-1 rounded-xl w-fit">
            <Clock size={11} />
            <span>Due: <span suppressHydrationWarning>{new Date(work.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span></span>
          </div>
        )}

        {/* Blocked Reason Banner */}
        {isBlocked && work.blockedReason && (
          <div className="p-3 bg-red-500/5 border border-red-500/20 text-red-400 rounded-2xl text-xs space-y-1">
            <div className="font-black uppercase text-[9px] tracking-wider flex items-center gap-1">
              <AlertTriangle size={12} /> Blocked Reason:
            </div>
            <p className="italic leading-relaxed">{work.blockedReason}</p>
          </div>
        )}
      </div>

      {/* Roster & Member Details (Creator and Assignee) */}
      <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          {/* Creator */}
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] uppercase tracking-wider">Creator:</span>
            {work.creator?.profilePhoto ? (
              <img src={work.creator.profilePhoto} alt={work.creator.name} className="w-4 h-4 rounded-full object-cover border border-white/10" />
            ) : (
              <div className="w-4 h-4 rounded-full bg-[#3188DA]/20 text-[#3188DA] flex items-center justify-center font-bold text-[8px] uppercase">
                {work.creator?.name ? work.creator.name.charAt(0) : '?'}
              </div>
            )}
            <span className="text-white/80 font-medium truncate max-w-[80px]">{work.creator?.name || 'System'}</span>
          </div>

          {/* Assignee */}
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] uppercase tracking-wider">Assigned:</span>
            {work.assignee ? (
              <>
                {work.assignee.profilePhoto ? (
                  <img src={work.assignee.profilePhoto} alt={work.assignee.name} className="w-4 h-4 rounded-full object-cover border border-white/10" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-[#63BDF2]/20 text-[#63BDF2] flex items-center justify-center font-bold text-[8px] uppercase">
                    {work.assignee.name.charAt(0)}
                  </div>
                )}
                <span className="text-white/80 font-medium truncate max-w-[80px]">{work.assignee.name}</span>
              </>
            ) : (
              <span className="text-zinc-500 italic">Unassigned</span>
            )}
          </div>
        </div>

        {/* Date Logged */}
        <div className="text-[9px] text-muted-foreground flex justify-end">
          <span>Logged: <strong suppressHydrationWarning className="text-white/50">{new Date(work.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</strong></span>
        </div>
      </div>

      {/* Expand Timeline & Updates Action Button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-4 flex items-center justify-between w-full bg-white/5 hover:bg-white/10 text-xs px-4 py-2 rounded-2xl text-muted-foreground hover:text-white transition-all cursor-pointer select-none"
      >
        <div className="flex items-center gap-1.5">
          <MessageSquare size={13} />
          <span>Timeline & Logs ({timeline.length})</span>
        </div>
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Expanded Section (Activity Log and Quick Updates Panel) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-4 pt-4 border-t border-white/5 space-y-4"
          >
            {/* Quick Update Post Box */}
            {currentUser && (
              <div className="space-y-2">
                <div className="flex gap-1.5">
                  <input 
                    type="text"
                    placeholder="Post timeline update..."
                    value={newUpdate}
                    onChange={(e) => setNewUpdate(e.target.value)}
                    className="flex-1 bg-[#0c0d12]/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                  />
                  <button 
                    onClick={handlePostUpdate}
                    disabled={isPostingUpdate || !newUpdate.trim()}
                    className="bg-gradient-to-r from-[#63BDF2] to-[#3188DA] text-black px-3 py-1.5 rounded-xl text-xs font-bold disabled:opacity-50 flex items-center justify-center cursor-pointer shrink-0"
                  >
                    {isPostingUpdate ? <Loader2 size={12} className="animate-spin" /> : <Plus size={14} />}
                  </button>
                </div>

                {/* Suggested Fast Clicks */}
                <div className="flex flex-wrap gap-1">
                  {["UI completed", "Waiting for API", "Client replied", "Testing pending"].map((sug) => (
                    <button 
                      key={sug}
                      onClick={() => handleFastUpdate(sug)}
                      className="text-[9px] bg-white/5 hover:bg-white/10 border border-white/5 text-muted-foreground hover:text-white px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Combined Timeline (Work Updates + Activity Logs) */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              <h4 className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Sprint Timeline</h4>
              <div className="space-y-2.5 relative pl-3 border-l border-white/5 ml-1">
                {timeline.map((t: any) => (
                  <div key={t.id} className="relative text-xs">
                    {/* Dot marker */}
                    <span className={`absolute -left-[16.5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-[#0d0e12] ${
                      t.type === 'LOG' ? 'bg-[#3188DA]' : 'bg-emerald-400'
                    }`} />
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                      <span className="font-semibold text-white/95">{t.userName}</span>
                      <span>•</span>
                      <span suppressHydrationWarning>{t.timeStr}</span>
                    </div>
                    <p className="text-white/80 mt-0.5 leading-relaxed text-[11px]">{t.content}</p>
                  </div>
                ))}
                {timeline.length === 0 && (
                  <div className="text-[10px] text-muted-foreground italic py-1">No activity or updates yet.</div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Controls Panel */}
      {isAuthorized && (
        <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
          {/* Admin points management */}
          {isAdmin && (
            <div className="flex items-center gap-2 select-none">
              <span className="text-[9px] uppercase font-bold text-muted-foreground">Reward Points:</span>
              <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={async () => {
                    const nextVal = Math.max(0, pointsInput - 1)
                    setPointsInput(nextVal)
                    await updateWorkStatus(work.id, work.status, nextVal)
                  }}
                  className="px-2.5 py-1 text-xs text-muted-foreground hover:text-white hover:bg-white/5 transition-all cursor-pointer font-black"
                >
                  -
                </button>
                <span className="px-3 text-xs font-bold font-mono text-[#63BDF2] min-w-[28px] text-center bg-white/5 border-x border-white/5">
                  {pointsInput}
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    const nextVal = pointsInput + 1
                    setPointsInput(nextVal)
                    await updateWorkStatus(work.id, work.status, nextVal)
                  }}
                  className="px-2.5 py-1 text-xs text-muted-foreground hover:text-white hover:bg-white/5 transition-all cursor-pointer font-black"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Quick status selector */}
          <div className="flex flex-wrap items-center gap-1.5 justify-end">
            {/* Transition: Active */}
            {!isActive && !isCompleted && !isArchived && (
              <button 
                onClick={() => handleStatusChange('ACTIVE')}
                disabled={isUpdating}
                className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 text-blue-400 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                Start Active
              </button>
            )}

            {/* Transition: Completed */}
            {!isCompleted && !isArchived && (
              <button 
                onClick={() => handleStatusChange('COMPLETED')}
                disabled={isUpdating}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                Complete
              </button>
            )}

            {/* Transition: Blocked Dialog Trigger */}
            {!isBlocked && !isCompleted && !isArchived && (
              <button 
                onClick={() => setShowBlockInput(true)}
                disabled={isUpdating}
                className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                Block Work
              </button>
            )}

            {/* Transition: Archive */}
            {!isArchived && (
              <button 
                onClick={() => handleStatusChange('ARCHIVED')}
                disabled={isUpdating}
                className="bg-zinc-500/10 hover:bg-zinc-500/20 border border-zinc-500/25 text-zinc-400 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                Archive
              </button>
            )}

            {/* Transition: Send back to Idea */}
            {(isCompleted || isArchived || isBlocked) && (
              <button 
                onClick={() => handleStatusChange('IDEA')}
                disabled={isUpdating}
                className="bg-[#63BDF2]/10 hover:bg-[#63BDF2]/20 border border-[#63BDF2]/25 text-[#63BDF2] px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                Move to Idea
              </button>
            )}
          </div>

          {/* Block Reason Form Dialog (Inline overlay) */}
          {showBlockInput && (
            <div className="mt-3 p-3 bg-red-950/20 border border-red-500/30 rounded-2xl space-y-2">
              <label className="text-[9px] uppercase font-bold text-red-400">Specify Block Reason</label>
              <input 
                type="text"
                placeholder="e.g. Waiting on AWS server credentials..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="w-full bg-[#0c0d12]/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-red-500/50"
              />
              <div className="flex gap-2 justify-end">
                <button 
                  type="button"
                  onClick={() => setShowBlockInput(false)}
                  className="px-2 py-1 text-[10px] text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={submitBlockedState}
                  disabled={!blockReason.trim()}
                  className="bg-red-500 hover:bg-red-600 text-black px-2.5 py-1 rounded-xl text-[10px] font-black disabled:opacity-50 cursor-pointer"
                >
                  Block Task
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
