'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { updateWorkStatus, addWorkUpdate, editWork } from '@/app/actions'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { 
  CheckCircle2, Circle, Archive, Clock, ShieldAlert, Sparkles, 
  User, ChevronDown, ChevronUp, AlertTriangle, MessageSquare, Plus, Loader2, Lightbulb, Zap, Trash2, Edit2, X
} from 'lucide-react'
import CustomSelect from './CustomSelect'
export default function WorkCard({ work, currentUser }: { work: any, currentUser: any }) {
  const router = useRouter()
  const { addToast, showConfirm } = useStore()

  const [isUpdating, setIsUpdating] = useState(false)
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [isPostingUpdate, setIsPostingUpdate] = useState(false)
  const [newUpdate, setNewUpdate] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [showBlockInput, setShowBlockInput] = useState(false)
  const [blockReason, setBlockReason] = useState('')

  // Edit State
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(work.name)
  const [editDesc, setEditDesc] = useState(work.description)

  // Delete State
  const [showDeleteInput, setShowDeleteInput] = useState(false)
  const [deleteReason, setDeleteReason] = useState('')

  // Completion Modal State
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [actualDays, setActualDays] = useState<number | ''>('')
  const [actualHours, setActualHours] = useState<number | ''>('')

  const isCompleted = work.status === 'COMPLETED'
  const isArchived = work.status === 'ARCHIVED'
  const isBlocked = work.status === 'BLOCKED'
  const isIdea = work.status === 'IDEA'
  const isActive = work.status === 'ACTIVE'
  const isDeleted = work.status === 'DELETED'

  const totalPoints = (work.timeLogs?.reduce((acc: number, log: any) => acc + log.points, 0) || 0) + 
                      (work.personMentions?.length ? 10 : 0) + 
                      (work.parentWorkId ? 10 : 0)

  const calculatePoints = (days: number | '', hours: number | '') => {
    const d = days !== '' ? Number(days) : 0
    const h = hours !== '' ? Number(hours) : 0
    const totalHours = (d * 24) + h
    const pDays = Math.floor(totalHours / 24)
    const pHours = totalHours % 24
    const extraPoints = pHours >= 4 ? 5 : pHours >= 2 ? 2 : pHours >= 1 ? 1 : 0
    return (pDays * 5) + extraPoints
  }

  const isAdmin = currentUser?.role === 'ADMIN'
  const isCreatorOrAssignee = currentUser && (work.creatorId === currentUser.id || work.assignees?.some((a: any) => a.id === currentUser.id))
  const isAuthorized = isAdmin || isCreatorOrAssignee

  const stopDurationInputRef = useRef<HTMLInputElement>(null)

  const handleStatusChange = async (newStatus: string, reason?: string) => {
    if (!isAuthorized) return
    setIsUpdating(true)
    try {
      const res = await updateWorkStatus(work.id, newStatus, reason)
      if (res && !res.success) {
        addToast(res.error || `Failed to update status to ${newStatus}`, 'error')
      } else {
        addToast(`Work status successfully updated to ${newStatus}`, 'success')
        router.refresh()
      }
    } catch (e: any) {
      console.error(e)
      addToast(e.message || 'An error occurred', 'error')
    } finally {
      setIsUpdating(false)
      setActiveAction(null)
      setShowBlockInput(false)
    }
  }

  const submitCompleteWork = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthorized || (actualDays === '' && actualHours === '')) return
    setIsUpdating(true)
    setActiveAction('COMPLETE')
    
    const d = actualDays !== '' ? Number(actualDays) : 0
    const h = actualHours !== '' ? Number(actualHours) : 0
    const totalActual = (d * 24) + h
    
    try {
      const res = await updateWorkStatus(work.id, 'COMPLETED', undefined, totalActual)
      if (res && !res.success) {
        addToast(res.error || 'Failed to complete work', 'error')
      } else {
        addToast('Work successfully completed! Points awarded!', 'success')
        setShowCompleteModal(false)
        router.refresh()
      }
    } catch (e: any) {
      console.error(e)
      addToast(e.message || 'An error occurred during completion', 'error')
    } finally {
      setIsUpdating(false)
      setActiveAction(null)
    }
  }

  const submitBlockedState = () => {
    if (!blockReason.trim()) return
    setActiveAction('STOP')
    handleStatusChange('BLOCKED', blockReason)
  }

  const handlePostUpdate = async () => {
    if (!newUpdate.trim()) return
    setIsPostingUpdate(true)
    try {
      const res = await addWorkUpdate(work.id, newUpdate.trim())
      if (res && res.success) {
        setNewUpdate('')
        addToast('Update posted successfully', 'success')
        router.refresh()
      } else {
        addToast(res?.error || 'Failed to post update', 'error')
      }
    } catch (e: any) {
      console.error(e)
      addToast(e.message || 'An error occurred', 'error')
    } finally {
      setIsPostingUpdate(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editName.trim() || !editDesc.trim()) return
    setIsUpdating(true)
    setActiveAction('EDIT')
    try {
      const formData = new FormData()
      formData.append('name', editName)
      formData.append('description', editDesc)
      formData.append('priority', work.priority)
      if (work.assignees) {
        work.assignees.forEach((a: any) => formData.append('assigneeIds', a.id))
      }
      if (work.dueDate) formData.append('dueDate', new Date(work.dueDate).toISOString())
      
      const res = await editWork(work.id, formData)
      if (res.success) {
        addToast('Work updated successfully', 'success')
        setIsEditing(false)
        router.refresh()
      } else {
        addToast(res.error || 'Failed to edit work', 'error')
      }
    } catch (error: any) {
      console.error(error)
      addToast(error.message || 'An error occurred during edit', 'error')
    } finally {
      setIsUpdating(false)
      setActiveAction(null)
    }
  }

  const handleFastUpdate = async (suggestion: string) => {
    setIsPostingUpdate(true)
    try {
      const res = await addWorkUpdate(work.id, suggestion)
      if (res && res.success) {
        addToast('Quick update posted', 'success')
        router.refresh()
      } else {
        addToast(res?.error || 'Failed to post update', 'error')
      }
    } catch (e: any) {
      console.error(e)
      addToast(e.message || 'An error occurred', 'error')
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

  const getTypeBadge = () => {
    return (
      <span className={`inline-flex items-center text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
        work.type === 'ACTION' 
          ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
          : 'text-fuchsia-400 bg-fuchsia-500/10 border border-fuchsia-500/20'
      }`}>
        {work.type === 'ACTION' ? 'Action' : 'Idea'}
      </span>
    )
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
            <CheckCircle2 size={10} className="shrink-0" /> Completed
          </span>
        )
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-500/10 border border-zinc-500/20 px-2.5 py-0.5 rounded-full select-none">
            <Archive size={10} className="shrink-0" /> Archived
          </span>
        )
      case 'DELETED':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-red-400 bg-red-900/40 border border-red-500/30 px-2.5 py-0.5 rounded-full select-none">
            <Trash2 size={10} className="shrink-0" /> Deleted
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
        timeStr: new Date(up.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
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
        timeStr: new Date(log.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
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
      className={`relative group p-4 md:p-6 md:rounded-3xl transition-all duration-300 flex flex-col h-full overflow-hidden border-b border-white/5 md:border md:bg-gradient-to-br ${
        isDeleted
          ? 'md:from-red-950/20 md:via-[#0d0e12] md:to-red-950/10 md:border-red-900/50 opacity-60 grayscale'
          : isCompleted 
            ? 'md:from-secondary/15 md:via-[#0d0e12] md:to-secondary/10 md:border-emerald-500/20 shadow-lg shadow-emerald-500/5' 
            : isArchived
              ? 'md:from-transparent md:to-transparent border-dashed md:border-white/5 opacity-55'
              : isBlocked
                ? 'md:from-red-950/5 md:via-[#0d0e12] md:to-red-950/0 md:border-red-500/30'
                : 'md:from-[#0d0e12] md:via-[#09090b] md:to-secondary/20 md:border-white/10 hover:border-[#63BDF2]/40 hover:shadow-2xl hover:shadow-[#63BDF2]/5'
      }`}
    >
      {/* Decorative Glow */}
      {!isArchived && !isCompleted && !isBlocked && !isDeleted && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#63BDF2]/5 rounded-full blur-2xl group-hover:bg-[#63BDF2]/10 transition-all pointer-events-none" />
      )}

      {/* Main Card Content */}
      <div className="space-y-4 flex-1">
        {/* Badges Row */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {getStatusBadge()}
            {getTypeBadge()}
            {getPriorityBadge()}
          </div>
          {totalPoints > 0 && (
            <div className="flex items-center gap-1 bg-[#63BDF2]/10 border border-[#63BDF2]/20 px-2 py-0.5 rounded-md text-[10px] font-bold text-[#63BDF2]">
              <Sparkles size={10} />
              <span>{totalPoints} pts</span>
            </div>
          )}
        </div>

        {/* Name and Description */}
        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="space-y-2">
            <input 
              autoFocus
              type="text" 
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="w-full bg-[#0c0d12]/80 border border-[#63BDF2]/40 rounded-xl px-3 py-1.5 text-sm font-bold text-white focus:outline-none"
            />
            <textarea 
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              rows={3}
              className="w-full bg-[#0c0d12]/80 border border-[#63BDF2]/40 rounded-xl px-3 py-1.5 text-xs text-zinc-300 focus:outline-none resize-none"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setIsEditing(false)} className="text-[10px] text-zinc-400 hover:text-white px-2 py-1">Cancel</button>
              <button type="submit" disabled={isUpdating} className="bg-[#63BDF2] text-black px-3 py-1 text-[10px] font-black rounded-lg hover:bg-[#3188DA] flex items-center gap-1 cursor-pointer disabled:opacity-50">
                {activeAction === 'EDIT' ? <Loader2 size={10} className="animate-spin" /> : null}
                Save
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-1.5 group/title cursor-pointer" onClick={() => router.push(`/works/${work.id}`)}>
            <h3 className={`text-base font-bold tracking-tight leading-snug text-white group-hover/title:text-[#63BDF2] transition-colors ${
              isCompleted || isArchived || isDeleted ? 'line-through text-muted-foreground' : ''
            }`}>
              {work.name}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {work.description}
            </p>
          </div>
        )}

        {/* Due Date Indicator */}
        {work.dueDate && (
          <div className="flex items-center gap-1.5 text-[10px] text-orange-400/90 font-bold bg-orange-500/5 border border-orange-500/10 px-2.5 py-1 rounded-xl w-fit">
            <Clock size={11} />
            <span>Due: <span suppressHydrationWarning>{new Date(work.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span></span>
          </div>
        )}

        {/* Mentions Display */}
        {(work.parentWork || (work.personMentions && work.personMentions.length > 0)) && (
          <div className="flex flex-col gap-1.5 pt-2 border-t border-white/5">
            {work.parentWork && (
              <div className="flex items-center gap-1.5 text-[10px] text-[#63BDF2]/80 bg-[#63BDF2]/5 px-2 py-1 rounded-lg w-fit">
                <span className="font-bold">Work Mention:</span> {work.parentWork.name}
              </div>
            )}
            {work.personMentions && work.personMentions.length > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] text-purple-400/80 bg-purple-500/5 px-2 py-1 rounded-lg w-fit">
                <span className="font-bold">Idea Creators:</span>
                {work.personMentions.map((pm: any) => pm.user.name).join(', ')}
              </div>
            )}
          </div>
        )}

        {/* Blocked or Deleted Reason Banner */}
        {((isBlocked || isDeleted) && work.blockedReason) && (
          <div className={`p-3 border rounded-2xl text-xs space-y-1 ${
            isDeleted ? 'bg-red-950/20 border-red-900/40 text-red-500' : 'bg-red-500/5 border-red-500/20 text-red-400'
          }`}>
            <div className="font-black uppercase text-[9px] tracking-wider flex items-center gap-1">
              {isDeleted ? <Trash2 size={12} /> : <AlertTriangle size={12} />} 
              {isDeleted ? 'Deletion Note:' : 'Blocked Reason:'}
            </div>
            <p className="italic leading-relaxed">{work.blockedReason}</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-muted-foreground">
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
            {work.creator && (
              <span className="text-[7px] text-muted-foreground border border-white/10 px-1 py-0.2 rounded font-bold uppercase tracking-widest bg-white/5">
                {work.creator.customRole || work.creator.role}
              </span>
            )}
          </div>

          {/* Assignees */}
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] uppercase tracking-wider">Assigned:</span>
            {work.assignees && work.assignees.length > 0 ? (
              <div className="flex -space-x-1.5 overflow-hidden">
                {work.assignees.map((assignee: any) => (
                  <div key={assignee.id} className="relative z-10" title={`${assignee.name} (${assignee.customRole || assignee.role})`}>
                    {assignee.profilePhoto ? (
                      <img src={assignee.profilePhoto} alt={assignee.name} className="w-4 h-4 rounded-full object-cover border border-[#0d0e12]" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-[#63BDF2]/20 text-[#63BDF2] flex items-center justify-center font-bold text-[8px] uppercase border border-[#0d0e12]">
                        {assignee.name.charAt(0)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-zinc-500 italic">Unassigned</span>
            )}
          </div>
        </div>

        {/* Date Logged */}
        <div className="text-[9px] text-muted-foreground flex justify-start">
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
                      disabled={isPostingUpdate}
                      className="text-[9px] bg-white/5 hover:bg-white/10 border border-white/5 text-muted-foreground hover:text-white px-2 py-0.5 rounded-full transition-colors cursor-pointer disabled:opacity-50"
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


          {/* Quick status selector */}
          <div className="flex flex-wrap items-center gap-1.5 justify-start">
            {/* Transition: Active */}
            {!isActive && !isCompleted && !isArchived && (
              <button 
                onClick={async () => {
                  setActiveAction('ACTIVE')
                  await handleStatusChange('ACTIVE')
                }}
                disabled={isUpdating}
                className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 text-blue-400 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {activeAction === 'ACTIVE' ? <Loader2 size={10} className="animate-spin" /> : null}
                Make Active
              </button>
            )}

            {/* Transition: Start Work (when Active but not started) */}
            {isActive && !work.startedAt && (
              <button 
                onClick={async () => {
                  setActiveAction('START')
                  await handleStatusChange('ACTIVE')
                }}
                disabled={isUpdating}
                className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 text-blue-400 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 animate-pulse"
              >
                {activeAction === 'START' ? <Loader2 size={10} className="animate-spin" /> : null}
                Start Work
              </button>
            )}

            {/* Transition: Completed */}
            {!isCompleted && !isArchived && (
              <button 
                onClick={() => setShowCompleteModal(true)}
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
                Stop/Pause Work
              </button>
            )}

            {/* Transition: Archive */}
            {!isArchived && (
              <button 
                onClick={async () => {
                  setActiveAction('ARCHIVED')
                  await handleStatusChange('ARCHIVED')
                }}
                disabled={isUpdating}
                className="bg-zinc-500/10 hover:bg-zinc-500/20 border border-zinc-500/25 text-zinc-400 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {activeAction === 'ARCHIVED' ? <Loader2 size={10} className="animate-spin" /> : null}
                Archive
              </button>
            )}

            {/* Transition: Send back to Idea */}
            {(isCompleted || isArchived || isBlocked || isDeleted) && (
              <button 
                onClick={async () => {
                  setActiveAction('IDEA')
                  await handleStatusChange('IDEA')
                }}
                disabled={isUpdating}
                className="bg-[#63BDF2]/10 hover:bg-[#63BDF2]/20 border border-[#63BDF2]/25 text-[#63BDF2] px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {activeAction === 'IDEA' ? <Loader2 size={10} className="animate-spin" /> : null}
                Move to Idea
              </button>
            )}

            {/* Edit / Delete actions for Creator */}
            {isAuthorized && !isDeleted && (
              <>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={isUpdating}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Edit2 size={10} /> Edit
                </button>
                <button 
                  onClick={() => setShowDeleteInput(true)}
                  disabled={isUpdating}
                  className="bg-red-900/20 hover:bg-red-900/40 border border-red-500/20 text-red-500 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 size={10} /> Delete
                </button>
              </>
            )}
          </div>

          {/* Block Reason Form Dialog (Inline overlay) */}
          {showBlockInput && (
            <div className="mt-3 p-3 bg-red-950/20 border border-red-500/30 rounded-2xl space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-red-400">Stop Duration (Optional)</label>
                <input 
                  type="text"
                  placeholder="e.g. 2 days, 1 week..."
                  ref={stopDurationInputRef}
                  className="w-full bg-[#0c0d12]/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-red-500/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-red-400">Specify Block/Stop Reason</label>
                <input 
                  type="text"
                  placeholder="e.g. Waiting on AWS server credentials..."
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full bg-[#0c0d12]/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-red-500/50"
                />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button 
                  type="button"
                  onClick={() => setShowBlockInput(false)}
                  className="px-2 py-1 text-[10px] text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    const durationStr = stopDurationInputRef.current?.value?.trim()
                    const finalReason = durationStr ? `[Stopped for: ${durationStr}] ${blockReason}` : blockReason
                    if (!finalReason.trim()) return
                    setActiveAction('STOP')
                    handleStatusChange('BLOCKED', finalReason)
                  }}
                  disabled={isUpdating || !blockReason.trim()}
                  className="bg-red-500 hover:bg-red-600 text-black px-2.5 py-1 rounded-xl text-[10px] font-black disabled:opacity-50 cursor-pointer flex items-center gap-1"
                >
                  {activeAction === 'STOP' ? <Loader2 size={10} className="animate-spin" /> : null}
                  Stop Task
                </button>
              </div>
            </div>
          )}

          {/* Delete Reason Form Dialog */}
          {showDeleteInput && (
            <div className="mt-3 p-3 bg-red-950/20 border border-red-500/30 rounded-2xl space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-red-400">Reason for Deletion</label>
                <input 
                  type="text"
                  placeholder="e.g. Duplicate task, No longer needed..."
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full bg-[#0c0d12]/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-red-500/50"
                />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button 
                  type="button"
                  onClick={() => setShowDeleteInput(false)}
                  className="px-2 py-1 text-[10px] text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={async () => {
                    if (!deleteReason.trim()) return
                    const confirmed = await showConfirm({
                      title: 'Delete Work Item',
                      message: `Are you sure you want to delete "${work.name}"? This action is irreversible.`,
                      confirmText: 'Yes, Delete',
                      cancelText: 'Cancel',
                      danger: true
                    })
                    if (!confirmed) return
                    const finalReason = `[Deleted by ${currentUser?.name || 'Creator'}] ${deleteReason}`
                    setActiveAction('DELETE')
                    await handleStatusChange('DELETED', finalReason)
                    setShowDeleteInput(false)
                  }}
                  disabled={isUpdating || !deleteReason.trim()}
                  className="bg-red-500 hover:bg-red-600 text-black px-2.5 py-1 rounded-xl text-[10px] font-black disabled:opacity-50 cursor-pointer flex items-center gap-1"
                >
                  {activeAction === 'DELETE' ? <Loader2 size={10} className="animate-spin" /> : null}
                  Confirm Delete
                </button>
              </div>
            </div>
          )}

          {/* Complete Work Form Dialog */}
          {showCompleteModal && (
            <form onSubmit={submitCompleteWork} className="mt-3 p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2">
              <h4 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-400" /> Confirm Completion
              </h4>
              <p className="text-[10px] text-emerald-300/80 leading-relaxed">
                Great job! Please specify the exact duration this task took to complete.
              </p>
              
              {work.startedAt && (
                <div className="bg-[#0c0d12]/50 p-3 rounded-xl border border-white/5 space-y-1">
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>Started:</span>
                    <span className="text-white font-medium">{new Date(work.startedAt).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</span>
                  </div>
                  {work.totalBlockedHours > 0 && (
                    <div className="flex justify-between text-[10px] text-orange-400/80">
                      <span>Paused Time:</span>
                      <span className="font-medium">{work.totalBlockedHours.toFixed(1)} Hours</span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] uppercase font-bold text-emerald-400">Actual Effort (Days & Hours)</label>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Est: {calculatePoints(actualDays, actualHours)} pts
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    min="1"
                    required
                    value={actualDays}
                    onChange={(e) => {
                      const daysVal = e.target.value ? Number(e.target.value) : ''
                      if (daysVal !== '' && Number(daysVal) < 1) {
                        setActualDays(1)
                      } else {
                        setActualDays(daysVal)
                      }
                      const finalDays = daysVal !== '' ? Number(daysVal) : 0
                      if (finalDays > 0) {
                        if (actualHours === '' || actualHours > 24) {
                          setActualHours(0)
                        }
                      }
                    }}
                    placeholder="Days"
                    className="w-full bg-[#0c0d12]/60 border border-emerald-500/30 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/70"
                  />
                  <CustomSelect 
                    value={(!actualDays || Number(actualDays) === 0) ? actualHours : (actualHours === '' ? 0 : actualHours)}
                    onChange={setActualHours}
                    options={(!actualDays || Number(actualDays) === 0)
                      ? Array.from({ length: 24 }, (_, i) => i + 1).map((h) => ({
                          value: h,
                          label: `${h} ${h === 1 ? 'Hour' : 'Hours'}`
                        }))
                      : Array.from({ length: 25 }, (_, i) => i).map((h) => ({
                          value: h,
                          label: `${h} ${h === 1 ? 'Hour' : 'Hours'}`
                        }))
                    }
                    placeholder="Select Hours"
                    borderColorClass="border-emerald-500/30 focus:border-emerald-500/70"
                    className="!py-1.5 !rounded-lg"
                  />
                </div>
                <p className="text-[8px] text-emerald-500/70 font-bold mt-1.5">*Your final points will be calculated based on: 1 Day (24 Hours) = 5 Points, Extra Hours (1h = 1pt, 2-3h = 2pts, 4h+ = 5pts).</p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-2 py-1 text-[10px] text-emerald-400/70 hover:text-emerald-300"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isUpdating || (actualDays === '' && actualHours === '')}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider disabled:opacity-50 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {isUpdating ? <Loader2 size={10} className="animate-spin" /> : null} Confirm Finish
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </motion.div>
  )
}
