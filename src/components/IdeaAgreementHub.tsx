'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Lightbulb, Check, Plus, Clock, Calendar, 
  ThumbsUp, Loader2, Play, ListOrdered, XCircle, Pause, RotateCcw, Trash2,
  ChevronDown, ChevronUp, History, ArrowRightCircle, AlertTriangle, Archive
} from 'lucide-react'
import { createWork, updateWorkStatus, toggleIdeaSupport, queueIdea, declineIdea, shelveIdea, reviveIdea, deleteIdea } from '@/app/actions'
import SectionGuide from './SectionGuide'

interface Idea {
  id: string
  name: string
  description: string
  priority: string
  points: number
  status: string
  blockedReason: string | null
  createdAt: string
  updatedAt: string
  creator: {
    id: string
    name: string
    profilePhoto: string | null
    role: string
  }
  assignee?: {
    id: string
    name: string
    profilePhoto: string | null
    role: string
  } | null
  supports: {
    userId: string
    createdAt: string
    user: {
      id: string
      name: string
      profilePhoto: string | null
      role: string
    }
  }[]
  activityLogs: {
    id: string
    action: string
    details: string | null
    createdAt: string
    user: {
      id: string
      name: string
      profilePhoto: string | null
      role: string
    }
  }[]
}

interface IdeaAgreementHubProps {
  ideas: Idea[]
  currentUser: any
  membersCount: number
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr)
  const day = d.getDate()
  const month = d.toLocaleString('en-IN', { month: 'short' })
  const year = d.getFullYear()
  const time = d.toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  return `${day} ${month} ${year}, ${time}`
}

function formatRelativeTime(dateStr: string) {
  const now = new Date()
  const d = new Date(dateStr)
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDateTime(dateStr)
}

export default function IdeaAgreementHub({ ideas, currentUser, membersCount }: IdeaAgreementHubProps) {
  const [activeTab, setActiveTab] = useState<'open' | 'queued' | 'declined' | 'shelved'>('open')
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [votingId, setVotingId] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  
  // Decline modal state
  const [declineModalId, setDeclineModalId] = useState<string | null>(null)
  const [declineReason, setDeclineReason] = useState('')
  const [isDeclining, setIsDeclining] = useState(false)

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const openIdeas = ideas.filter(f => f.status === 'IDEA')
  const queuedIdeas = ideas.filter(f => f.status === 'QUEUED')
  const declinedIdeas = ideas.filter(f => f.status === 'DECLINED')
  const shelvedIdeas = ideas.filter(f => f.status === 'SHELVED')

  const isAdmin = currentUser?.role === 'ADMIN'
  const isCreator = (idea: Idea) => currentUser?.id === idea.creator?.id
  const canManage = (idea: Idea) => isAdmin || isCreator(idea)

  async function handleAddIdea(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    formData.append('status', 'IDEA')
    try {
      const res = await createWork(formData)
      if (res.success) {
        setShowAddForm(false)
        ;(e.target as HTMLFormElement).reset()
      } else alert(res.error || 'Failed to submit proposal')
    } catch (err) { console.error(err) }
    finally { setIsSubmitting(false) }
  }

  async function handleVote(id: string) {
    if (!currentUser) return alert('Please login to vote')
    setVotingId(id)
    try { await toggleIdeaSupport(id) } catch (err) { console.error(err) }
    finally { setVotingId(null) }
  }

  async function handleAction(id: string, action: () => Promise<any>) {
    setActionId(id)
    try {
      const res = await action()
      if (res && !res.success) alert(res.error || 'Action failed')
    } catch (err) { console.error(err) }
    finally { setActionId(null) }
  }

  async function handleDeclineSubmit() {
    if (!declineModalId || !declineReason.trim()) return
    setIsDeclining(true)
    try {
      const res = await declineIdea(declineModalId, declineReason)
      if (res.success) {
        setDeclineModalId(null)
        setDeclineReason('')
      } else alert(res.error || 'Failed to decline')
    } catch (err) { console.error(err) }
    finally { setIsDeclining(false) }
  }

  async function handleDelete(id: string) {
    setActionId(id)
    try {
      const res = await deleteIdea(id)
      if (res.success) {
        setDeleteConfirmId(null)
      } else alert(res.error || 'Failed to delete')
    } catch (err) { console.error(err) }
    finally { setActionId(null) }
  }

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'URGENT': return 'text-red-400 bg-red-500/10 border-red-500/20'
      case 'HIGH': return 'text-orange-400 bg-orange-500/10 border-orange-500/20'
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    }
  }

  const getStatusStyle = (s: string) => {
    switch (s) {
      case 'QUEUED': return 'bg-purple-500/5 border-purple-500/15 hover:border-purple-500/25'
      case 'DECLINED': return 'bg-red-500/5 border-red-500/10 hover:border-red-500/20 opacity-80'
      case 'SHELVED': return 'bg-zinc-500/5 border-zinc-500/10 hover:border-zinc-500/20 opacity-75'
      default: return 'bg-[#09090b]/40 border-white/5 hover:border-white/10'
    }
  }

  function renderIdeaCard(idea: Idea) {
    const userVoted = currentUser && idea.supports.some(v => v.userId === currentUser.id)
    const approvalRate = membersCount > 0 ? Math.round((idea.supports.length / membersCount) * 100) : 0
    const isExpanded = expandedId === idea.id
    const isQueued = idea.status === 'QUEUED'
    const isDeclined = idea.status === 'DECLINED'
    const isShelved = idea.status === 'SHELVED'
    const isArchived = isDeclined || isShelved

    return (
      <motion.div 
        key={idea.id}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border p-5 rounded-2xl space-y-4 transition-all ${getStatusStyle(idea.status)}`}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className={`text-sm font-bold tracking-tight ${isArchived ? 'text-zinc-400 line-through' : 'text-white'}`}>{idea.name}</h4>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-md border font-black uppercase tracking-wider ${getPriorityBadge(idea.priority)}`}>
                {idea.priority}
              </span>
              {isQueued && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/25 text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <ListOrdered size={10} /> In Queue
                </span>
              )}
              {isDeclined && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-red-500/10 border border-red-500/25 text-red-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <XCircle size={10} /> Declined
                </span>
              )}
              {isShelved && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-zinc-500/10 border border-zinc-500/25 text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Pause size={10} /> Shelved
                </span>
              )}
            </div>
            <p className={`text-xs leading-relaxed whitespace-pre-wrap ${isArchived ? 'text-zinc-600' : 'text-muted-foreground'}`}>{idea.description}</p>
            
            {/* Decline Reason */}
            {isDeclined && idea.blockedReason && (
              <div className="flex items-start gap-2 bg-red-500/5 border border-red-500/10 rounded-xl p-3 mt-2">
                <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-red-400 uppercase">Decline Reason</span>
                  <p className="text-[11px] text-red-300/70 leading-relaxed mt-0.5">{idea.blockedReason}</p>
                </div>
              </div>
            )}

            {/* Deep Entry Details */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                <div className="shrink-0">
                  {idea.creator?.profilePhoto ? (
                    <img src={idea.creator.profilePhoto} alt={idea.creator.name} className="w-4 h-4 rounded-full object-cover" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[7px] uppercase">
                      {idea.creator?.name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <span>By <strong className="text-zinc-300 font-bold">{idea.creator?.name || 'Unknown'}</strong></span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-zinc-500" suppressHydrationWarning>
                <Calendar size={10} className="text-zinc-600" />
                <span suppressHydrationWarning>{formatDateTime(idea.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-zinc-500" suppressHydrationWarning>
                <Clock size={10} className="text-zinc-600" />
                <span suppressHydrationWarning>{formatRelativeTime(idea.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-start">
            {/* For OPEN/QUEUED ideas */}
            {!isArchived && (
              <>
                <button
                  onClick={() => handleVote(idea.id)}
                  disabled={votingId === idea.id}
                  className={`text-xs px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none ${
                    userVoted 
                      ? 'bg-[#63BDF2]/20 border border-[#63BDF2]/40 text-[#63BDF2] hover:bg-[#63BDF2]/30' 
                      : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  {votingId === idea.id ? <Loader2 size={12} className="animate-spin" /> : <ThumbsUp size={12} className={userVoted ? 'fill-[#63BDF2]' : ''} />}
                  <span>Agree</span>
                </button>

                {canManage(idea) && (
                  <>
                    <button onClick={() => handleAction(idea.id, () => queueIdea(idea.id))} disabled={actionId === idea.id}
                      className={`text-xs px-2.5 py-2 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer select-none ${
                        isQueued ? 'bg-purple-500/15 border border-purple-500/30 text-purple-400' : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
                      }`} title={isQueued ? 'Remove from Queue' : 'Add to Queue'}>
                      {actionId === idea.id ? <Loader2 size={12} className="animate-spin" /> : <ListOrdered size={12} />}
                    </button>

                    {/* Convert to Work — ONLY at 100% consensus */}
                    {approvalRate >= 100 ? (
                      <button onClick={() => handleAction(idea.id, () => updateWorkStatus(idea.id, 'ACTIVE'))} disabled={actionId === idea.id}
                        className="text-xs bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none animate-pulse hover:animate-none"
                        title="All members agreed — Convert to Active Work">
                        {actionId === idea.id ? <Loader2 size={12} className="animate-spin" /> : <Play size={10} className="fill-emerald-400 text-emerald-400" />}
                        <span>Convert to Work</span>
                      </button>
                    ) : (
                      <div className="text-[9px] text-zinc-600 bg-zinc-800/30 border border-zinc-700/20 px-2.5 py-2 rounded-xl font-bold flex items-center gap-1 select-none cursor-not-allowed" title={`Need ${membersCount - idea.supports.length} more agree to convert`}>
                        <Play size={10} className="text-zinc-700" />
                        <span>{approvalRate}% — Need all</span>
                      </div>
                    )}
                    <button onClick={() => setDeclineModalId(idea.id)}
                      className="text-xs bg-red-500/5 hover:bg-red-500/10 border border-red-500/15 text-red-400 px-2.5 py-2 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer select-none"
                      title="Decline Proposal">
                      <XCircle size={12} />
                    </button>

                    <button onClick={() => handleAction(idea.id, () => shelveIdea(idea.id))}
                      className="text-xs bg-zinc-500/5 hover:bg-zinc-500/10 border border-zinc-500/15 text-zinc-400 px-2.5 py-2 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer select-none"
                      title="Shelve for Later">
                      <Archive size={12} />
                    </button>
                  </>
                )}
              </>
            )}

            {/* For DECLINED/SHELVED — Revive & Delete */}
            {isArchived && canManage(idea) && (
              <>
                <button onClick={() => handleAction(idea.id, () => reviveIdea(idea.id))} disabled={actionId === idea.id}
                  className="text-xs bg-[#63BDF2]/10 hover:bg-[#63BDF2]/20 border border-[#63BDF2]/25 text-[#63BDF2] px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none">
                  {actionId === idea.id ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                  <span>Revive</span>
                </button>

                {deleteConfirmId === idea.id ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-red-400 font-bold">Sure?</span>
                    <button onClick={() => handleDelete(idea.id)} disabled={actionId === idea.id}
                      className="text-[10px] bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-2 py-1 rounded-lg font-bold cursor-pointer select-none">
                      {actionId === idea.id ? <Loader2 size={10} className="animate-spin" /> : 'Yes, Delete'}
                    </button>
                    <button onClick={() => setDeleteConfirmId(null)}
                      className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 px-2 py-1 rounded-lg font-bold cursor-pointer select-none">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteConfirmId(idea.id)}
                    className="text-xs bg-red-500/5 hover:bg-red-500/10 border border-red-500/15 text-red-400/60 px-2.5 py-2 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer select-none"
                    title="Delete Permanently">
                    <Trash2 size={12} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Support Progress Bar — only for non-archived */}
        {!isArchived && (
          <div className="pt-3 space-y-1.5 border-t border-white/5">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white/95">Team Support:</span>
                <span>{idea.supports.length} of {membersCount} agreed ({approvalRate}%)</span>
              </div>
              {approvalRate === 100 && (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Check size={12} /> Full Consensus
                </span>
              )}
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-[#63BDF2] to-blue-500 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, approvalRate)}%` }} />
            </div>

            {idea.supports.length > 0 && (
              <div className="pt-2 space-y-1.5">
                <span className="text-[9px] uppercase font-bold text-muted-foreground">Agreement Timeline:</span>
                <div className="flex flex-wrap gap-2">
                  {idea.supports.map(v => (
                    <div key={v.userId} className="flex items-center gap-1.5 bg-white/5 border border-white/5 rounded-lg px-2 py-1">
                      {v.user.profilePhoto ? (
                        <img src={v.user.profilePhoto} alt={v.user.name} className="w-4 h-4 rounded-full object-cover" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[7px] uppercase">{v.user.name.charAt(0)}</div>
                      )}
                      <span className="text-[10px] font-bold text-zinc-300">{v.user.name}</span>
                      <span className="text-[9px] text-zinc-600" suppressHydrationWarning>• {formatRelativeTime(v.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Activity Log */}
        {idea.activityLogs && idea.activityLogs.length > 0 && (
          <div className="border-t border-white/5 pt-3">
            <button onClick={() => setExpandedId(isExpanded ? null : idea.id)}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors select-none">
              <History size={12} /> Activity Log ({idea.activityLogs.length})
              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            <AnimatePresence>
              {isExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="mt-3 space-y-0 relative pl-4 before:absolute before:left-[7px] before:top-1 before:bottom-1 before:w-px before:bg-white/10">
                    {idea.activityLogs.map(log => (
                      <div key={log.id} className="relative flex items-start gap-3 pb-3">
                        <div className="absolute left-[-13px] top-1.5 w-2 h-2 rounded-full bg-zinc-700 border border-zinc-600 shrink-0 z-10" />
                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {log.user?.profilePhoto ? (
                              <img src={log.user.profilePhoto} alt={log.user.name} className="w-3.5 h-3.5 rounded-full object-cover" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full bg-zinc-700 text-zinc-400 flex items-center justify-center text-[6px] font-bold uppercase">{log.user?.name?.charAt(0) || '?'}</div>
                            )}
                            <span className="text-[10px] font-bold text-zinc-400">{log.user?.name || 'System'}</span>
                            <span className="text-[9px] text-zinc-600" suppressHydrationWarning>• {formatDateTime(log.createdAt)}</span>
                          </div>
                          <p className="text-[10px] text-zinc-500 leading-relaxed pl-5">{log.details || log.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    )
  }

  // Tab config with counts
  const tabs = [
    { key: 'open' as const, label: 'Open Ideas', icon: <Lightbulb size={12} />, count: openIdeas.length, color: '' },
    { key: 'queued' as const, label: 'Queue', icon: <ListOrdered size={12} />, count: queuedIdeas.length, color: '' },
    { key: 'declined' as const, label: 'Declined', icon: <XCircle size={12} />, count: declinedIdeas.length, color: '' },
    { key: 'shelved' as const, label: 'Shelved', icon: <Archive size={12} />, count: shelvedIdeas.length, color: '' },
  ]

  const currentList = activeTab === 'open' ? openIdeas : activeTab === 'queued' ? queuedIdeas : activeTab === 'declined' ? declinedIdeas : shelvedIdeas
  
  const emptyMessages: Record<string, string> = {
    open: 'No open proposals right now. Click "New Proposal" to share your idea!',
    queued: 'No ideas in execution queue. Move ideas here when the team agrees.',
    declined: 'No declined proposals. Ideas that don\'t pass team review appear here with reasons.',
    shelved: 'No shelved proposals. Ideas saved for future reconsideration appear here.',
  }

  const bannerMessages: Record<string, { icon: React.ReactNode; color: string; text: string } | null> = {
    open: null,
    queued: { icon: <ArrowRightCircle size={14} className="shrink-0 mt-0.5 text-purple-400" />, color: 'bg-purple-500/5 border-purple-500/10 text-purple-300/80', text: 'Execution Queue — Ideas approved by the team, waiting to start as Active Work. Admin or creator can click the play button to begin.' },
    declined: { icon: <AlertTriangle size={14} className="shrink-0 mt-0.5 text-red-400" />, color: 'bg-red-500/5 border-red-500/10 text-red-300/70', text: 'Declined Archive — These proposals were reviewed but not approved. Each has a documented reason. They can be revived if the situation changes, or permanently deleted.' },
    shelved: { icon: <Pause size={14} className="shrink-0 mt-0.5 text-zinc-400" />, color: 'bg-zinc-500/5 border-zinc-500/10 text-zinc-300/70', text: 'Shelved Ideas — Not rejected, just paused. These might be reconsidered in the future when timing or resources are better. Revive anytime.' },
  }

  return (
    <div className="bg-secondary/20 border border-border rounded-3xl p-6 md:p-8 space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Lightbulb className="text-yellow-400" size={20} />
          <h2 className="text-lg font-bold text-white tracking-tight">Proposals & Ideas Alignment</h2>
          <SectionGuide 
            title="Full Idea Lifecycle" 
            content="IDEA → Team votes Agree → QUEUED (ready for work) → ACTIVE (started). If team doesn't agree, ideas can be DECLINED (with reason) or SHELVED (maybe later). Declined/Shelved ideas can be REVIVED or permanently DELETED. Every action is timestamped with full audit trail."
          />
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs bg-white text-black hover:bg-white/90 px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none">
          <Plus size={14} /> New Proposal
        </button>
      </div>

      {/* Add Idea Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <form onSubmit={handleAddIdea} className="bg-[#09090b]/30 border border-white/5 p-4 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-white uppercase">Submit New Proposal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-muted-foreground font-bold">Proposal Title</label>
                  <input type="text" name="name" required placeholder="e.g., Weekly Team Meetup or Client Dashboard Redesign"
                    className="w-full bg-[#0c0d12]/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-muted-foreground font-bold">Priority</label>
                  <select name="priority" className="w-full bg-[#0c0d12]/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50">
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-muted-foreground font-bold">Details / Explanation</label>
                <textarea name="description" required rows={3} placeholder="Explain the idea, benefits, or workflow in detail..."
                  className="w-full bg-[#0c0d12]/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none" />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowAddForm(false)} className="text-xs bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl text-muted-foreground hover:text-white cursor-pointer font-bold">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="text-xs bg-primary text-black hover:bg-primary/90 px-4 py-2 rounded-xl font-bold disabled:opacity-50 cursor-pointer flex items-center gap-1.5">
                  {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : 'Submit Proposal'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4-Tab Navigation */}
      <div className="flex flex-wrap bg-[#0c0d12]/60 p-1 rounded-xl border border-white/10 w-fit shrink-0 select-none gap-0.5">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.key ? 'bg-white text-black' : 'text-muted-foreground hover:text-white'
            }`}>
            {tab.icon} {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Tab Banner */}
      {bannerMessages[activeTab] && (
        <div className={`flex items-start gap-2.5 border rounded-2xl p-3.5 text-[11px] leading-relaxed ${bannerMessages[activeTab]!.color}`}>
          {bannerMessages[activeTab]!.icon}
          <span>{bannerMessages[activeTab]!.text}</span>
        </div>
      )}

      {/* Card Listing */}
      <div className="space-y-4">
        {currentList.length === 0 ? (
          <div className="text-center py-12 bg-[#09090b]/10 border border-dashed border-white/5 rounded-3xl text-muted-foreground text-xs italic">
            {emptyMessages[activeTab]}
          </div>
        ) : (
          <div className="space-y-4">{currentList.map(idea => renderIdeaCard(idea))}</div>
        )}
      </div>

      {/* Decline Reason Modal */}
      <AnimatePresence>
        {declineModalId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => { setDeclineModalId(null); setDeclineReason('') }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0d0e12] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-500/10 rounded-xl"><XCircle size={18} className="text-red-400" /></div>
                <div>
                  <h3 className="text-sm font-bold text-white">Decline Proposal</h3>
                  <p className="text-[10px] text-zinc-500">This action is recorded with your name and timestamp</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-muted-foreground font-bold">Reason for Declining *</label>
                <textarea value={declineReason} onChange={e => setDeclineReason(e.target.value)} rows={3} autoFocus
                  placeholder="Explain why this proposal is not approved..."
                  className="w-full bg-[#0c0d12]/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-red-500/50 resize-none" />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => { setDeclineModalId(null); setDeclineReason('') }}
                  className="text-xs bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl text-muted-foreground hover:text-white cursor-pointer font-bold">Cancel</button>
                <button onClick={handleDeclineSubmit} disabled={isDeclining || !declineReason.trim()}
                  className="text-xs bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl font-bold disabled:opacity-50 cursor-pointer flex items-center gap-1.5">
                  {isDeclining ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                  Decline Proposal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
