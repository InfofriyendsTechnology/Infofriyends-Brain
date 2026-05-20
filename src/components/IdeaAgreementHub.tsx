'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Lightbulb, Check, Plus, Clock, Calendar, User as UserIcon,
  ThumbsUp, CheckCircle2, Loader2, Play, ListOrdered,
  ChevronDown, ChevronUp, History, ArrowRightCircle
} from 'lucide-react'
import { createWork, updateWorkStatus, toggleIdeaSupport, queueIdea } from '@/app/actions'
import SectionGuide from './SectionGuide'

interface Idea {
  id: string
  name: string
  description: string
  priority: string
  points: number
  status: string
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
  const [activeTab, setActiveTab] = useState<'open' | 'queued'>('open')
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [votingId, setVotingId] = useState<string | null>(null)
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [queuingId, setQueuingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const openIdeas = ideas.filter(f => f.status === 'IDEA')
  const queuedIdeas = ideas.filter(f => f.status === 'QUEUED')

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
      } else {
        alert(res.error || 'Failed to submit proposal')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleVote(id: string) {
    if (!currentUser) return alert('Please login to vote')
    setVotingId(id)
    try {
      await toggleIdeaSupport(id)
    } catch (err) {
      console.error(err)
    } finally {
      setVotingId(null)
    }
  }

  async function handleStartWork(id: string) {
    setResolvingId(id)
    try {
      const res = await updateWorkStatus(id, 'ACTIVE')
      if (!res.success) alert(res.error || 'Failed to start work')
    } catch (err) {
      console.error(err)
    } finally {
      setResolvingId(null)
    }
  }

  async function handleQueue(id: string) {
    setQueuingId(id)
    try {
      const res = await queueIdea(id)
      if (!res.success) alert(res.error || 'Failed to update queue')
    } catch (err) {
      console.error(err)
    } finally {
      setQueuingId(null)
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-400 bg-red-500/10 border-red-500/20'
      case 'HIGH': return 'text-orange-400 bg-orange-500/10 border-orange-500/20'
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    }
  }

  function renderIdeaCard(idea: Idea) {
    const userVoted = currentUser && idea.supports.some(v => v.userId === currentUser.id)
    const approvalRate = membersCount > 0 ? Math.round((idea.supports.length / membersCount) * 100) : 0
    const isExpanded = expandedId === idea.id
    const isQueued = idea.status === 'QUEUED'

    return (
      <motion.div 
        key={idea.id}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border p-5 rounded-2xl space-y-4 transition-all ${
          isQueued 
            ? 'bg-purple-500/5 border-purple-500/15 hover:border-purple-500/25' 
            : 'bg-[#09090b]/40 border-white/5 hover:border-white/10'
        }`}
      >
        {/* Header Row: Title + Priority + Status Badge */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-white tracking-tight">{idea.name}</h4>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-md border font-black uppercase tracking-wider ${getPriorityBadge(idea.priority)}`}>
                {idea.priority}
              </span>
              {isQueued && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/25 text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <ListOrdered size={10} /> In Queue
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{idea.description}</p>
            
            {/* Deep Entry Details — Who Created + When */}
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
                <span>Proposed by <strong className="text-zinc-300 font-bold">{idea.creator?.name || 'Unknown'}</strong></span>
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
            {/* Agree Vote */}
            <button
              onClick={() => handleVote(idea.id)}
              disabled={votingId === idea.id}
              className={`text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none ${
                userVoted 
                  ? 'bg-[#63BDF2]/20 border border-[#63BDF2]/40 text-[#63BDF2] hover:bg-[#63BDF2]/30' 
                  : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
              }`}
            >
              {votingId === idea.id ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <ThumbsUp size={12} className={userVoted ? 'fill-[#63BDF2]' : ''} />
              )}
              <span>Agree</span>
            </button>

            {/* Queue Toggle (Admin/Creator only) */}
            {(currentUser?.role === 'ADMIN' || currentUser?.id === idea.creator?.id) && (
              <button
                onClick={() => handleQueue(idea.id)}
                disabled={queuingId === idea.id}
                className={`text-xs px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none ${
                  isQueued
                    ? 'bg-purple-500/15 border border-purple-500/30 text-purple-400 hover:bg-purple-500/25'
                    : 'bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {queuingId === idea.id ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <ListOrdered size={12} />
                )}
                <span>{isQueued ? 'Remove Queue' : 'Add to Queue'}</span>
              </button>
            )}

            {/* Start Work (Admin/Creator only) */}
            {(currentUser?.role === 'ADMIN' || currentUser?.id === idea.creator?.id) && (
              <button
                onClick={() => handleStartWork(idea.id)}
                disabled={resolvingId === idea.id}
                className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none"
              >
                {resolvingId === idea.id ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Play size={10} className="fill-emerald-400 text-emerald-400" />
                )}
                <span>Start Work</span>
              </button>
            )}
          </div>
        </div>

        {/* Support Progress Bar */}
        <div className="pt-3 space-y-1.5 border-t border-white/5">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white/95">Team Support:</span>
              <span>{idea.supports.length} of {membersCount} agreed ({approvalRate}%)</span>
            </div>
            {approvalRate === 100 && (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check size={12} /> Complete Consensus
              </span>
            )}
          </div>
          
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#63BDF2] to-blue-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, approvalRate)}%` }}
            />
          </div>

          {/* Supporters with Timestamps */}
          {idea.supports.length > 0 && (
            <div className="pt-2 space-y-1.5">
              <span className="text-[9px] uppercase font-bold text-muted-foreground">Agreement Timeline:</span>
              <div className="flex flex-wrap gap-2">
                {idea.supports.map(v => (
                  <div key={v.userId} className="flex items-center gap-1.5 bg-white/5 border border-white/5 rounded-lg px-2 py-1">
                    {v.user.profilePhoto ? (
                      <img src={v.user.profilePhoto} alt={v.user.name} className="w-4 h-4 rounded-full object-cover" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[7px] uppercase">
                        {v.user.name.charAt(0)}
                      </div>
                    )}
                    <span className="text-[10px] font-bold text-zinc-300">{v.user.name}</span>
                    <span className="text-[9px] text-zinc-600" suppressHydrationWarning>• {formatRelativeTime(v.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Expandable Activity Log Timeline */}
        {idea.activityLogs && idea.activityLogs.length > 0 && (
          <div className="border-t border-white/5 pt-3">
            <button
              onClick={() => setExpandedId(isExpanded ? null : idea.id)}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors select-none"
            >
              <History size={12} />
              Activity Log ({idea.activityLogs.length})
              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 space-y-0 relative pl-4 before:absolute before:left-[7px] before:top-1 before:bottom-1 before:w-px before:bg-white/10">
                    {idea.activityLogs.map((log, i) => (
                      <div key={log.id} className="relative flex items-start gap-3 pb-3">
                        {/* Timeline dot */}
                        <div className="absolute left-[-13px] top-1.5 w-2 h-2 rounded-full bg-zinc-700 border border-zinc-600 shrink-0 z-10" />
                        
                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {log.user?.profilePhoto ? (
                              <img src={log.user.profilePhoto} alt={log.user.name} className="w-3.5 h-3.5 rounded-full object-cover" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full bg-zinc-700 text-zinc-400 flex items-center justify-center text-[6px] font-bold uppercase">
                                {log.user?.name?.charAt(0) || '?'}
                              </div>
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

  return (
    <div className="bg-secondary/20 border border-border rounded-3xl p-6 md:p-8 space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Lightbulb className="text-yellow-400" size={20} />
          <h2 className="text-lg font-bold text-white tracking-tight">Proposals & Ideas Alignment</h2>
          <SectionGuide 
            title="Proposals & Ideas Board" 
            content="Got an idea for the company or a new workspace project? Post it here as a Proposal! All team members can vote 'Agree' to show support. Use 'Add to Queue' to mark ideas ready for execution. Once consensus is reached, admins move proposals to Active Projects. Every action is timestamped and tracked."
          />
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs bg-white text-black hover:bg-white/90 px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none"
        >
          <Plus size={14} /> New Proposal
        </button>
      </div>

      {/* Add Idea Proposal Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAddIdea} className="bg-[#09090b]/30 border border-white/5 p-4 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-white uppercase">Submit New Proposal</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-muted-foreground font-bold">Proposal Title</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g., Weekly Team Meetup or Client Dashboard Redesign"
                    className="w-full bg-[#0c0d12]/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-muted-foreground font-bold">Priority</label>
                  <select
                    name="priority"
                    className="w-full bg-[#0c0d12]/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-muted-foreground font-bold">Details / Explanation</label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  placeholder="Explain the idea, benefits, or workflow in detail..."
                  className="w-full bg-[#0c0d12]/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl text-muted-foreground hover:text-white cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="text-xs bg-primary text-black hover:bg-primary/90 px-4 py-2 rounded-xl font-bold disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : 'Submit Proposal'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs: Open Ideas vs Queued */}
      <div className="flex bg-[#0c0d12]/60 p-1 rounded-xl border border-white/10 w-fit shrink-0 select-none">
        <button
          onClick={() => setActiveTab('open')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'open' ? 'bg-white text-black' : 'text-muted-foreground hover:text-white'
          }`}
        >
          <Lightbulb size={12} /> Open Ideas ({openIdeas.length})
        </button>
        <button
          onClick={() => setActiveTab('queued')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'queued' ? 'bg-white text-black' : 'text-muted-foreground hover:text-white'
          }`}
        >
          <ListOrdered size={12} /> Execution Queue ({queuedIdeas.length})
        </button>
      </div>

      {/* Queue Info Banner */}
      {activeTab === 'queued' && (
        <div className="flex items-start gap-2.5 bg-purple-500/5 border border-purple-500/10 rounded-2xl p-3.5 text-[11px] text-purple-300/80 leading-relaxed">
          <ArrowRightCircle size={14} className="shrink-0 mt-0.5 text-purple-400" />
          <span>
            <strong className="text-purple-300">Execution Queue</strong> — Ideas here are approved and waiting to be started as Active Work. 
            The team has reviewed and aligned on these. Admin or creator can click "Start Work" to move them into production.
          </span>
        </div>
      )}

      {/* Card Listing */}
      <div className="space-y-4">
        {activeTab === 'open' ? (
          openIdeas.length === 0 ? (
            <div className="text-center py-12 bg-[#09090b]/10 border border-dashed border-white/5 rounded-3xl text-muted-foreground text-xs italic">
              No open proposals right now. Click "New Proposal" to share your idea!
            </div>
          ) : (
            <div className="space-y-4">
              {openIdeas.map(idea => renderIdeaCard(idea))}
            </div>
          )
        ) : (
          queuedIdeas.length === 0 ? (
            <div className="text-center py-12 bg-[#09090b]/10 border border-dashed border-white/5 rounded-3xl text-muted-foreground text-xs italic">
              No ideas in queue. Move ideas here when the team agrees and they're ready for execution.
            </div>
          ) : (
            <div className="space-y-4">
              {queuedIdeas.map(idea => renderIdeaCard(idea))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
