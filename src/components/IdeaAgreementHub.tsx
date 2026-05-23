'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Lightbulb, Check, Plus, Clock, Calendar, 
  ThumbsUp, ThumbsDown, MessageSquare, CornerDownRight, Loader2, Play, ListOrdered, XCircle, Pause, RotateCcw, Trash2,
  ChevronDown, ChevronUp, History, ArrowRightCircle, AlertTriangle, Archive, Edit2, Send, Users
} from 'lucide-react'
import { createWork, updateWorkStatus, toggleIdeaSupport, queueIdea, declineIdea, shelveIdea, reviveIdea, deleteIdea, editWork, getWorks, disagreeWithIdea, replyToDisagree, removeDisagree, adminAllAgree } from '@/app/actions'
import { getMembers } from '@/app/actions/admin'
import { useEffect } from 'react'
import SectionGuide from './SectionGuide'

interface Idea {
  id: string
  name: string
  description: string
  priority: string
  points?: number
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
  disagrees?: {
    id: string
    reason: string
    userId: string
    createdAt: string
    user: {
      id: string
      name: string
      profilePhoto: string | null
      role: string
    }
    replies: {
      id: string
      content: string
      userId: string
      createdAt: string
      user: {
        id: string
        name: string
        profilePhoto: string | null
        role: string
      }
    }[]
  }[]
  personMentions?: {
    id: string
    userId: string
    user: {
      id: string
      name: string
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
  const [activeTab, setActiveTab] = useState<'open' | 'queued' | 'declined' | 'shelved' | 'deleted'>('open')
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [votingId, setVotingId] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  
  // Decline modal state
  const [declineModalId, setDeclineModalId] = useState<string | null>(null)
  const [declineReason, setDeclineReason] = useState('')
  const [isDeclining, setIsDeclining] = useState(false)

  // Disagree state
  const [disagreeModalId, setDisagreeModalId] = useState<string | null>(null)
  const [disagreeReason, setDisagreeReason] = useState('')
  const [isDisagreeing, setIsDisagreeing] = useState(false)

  // Reply state
  const [replyModalId, setReplyModalId] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isReplying, setIsReplying] = useState(false)

  // Mentions state
  const [members, setMembers] = useState<any[]>([])
  const [works, setWorks] = useState<any[]>([])
  const [selectedPersonMentions, setSelectedPersonMentions] = useState<string[]>([])

  useEffect(() => {
    if (!showAddForm) return
    async function loadData() {
      try {
        const [memberList, workList] = await Promise.all([getMembers(), getWorks()])
        setMembers(memberList)
        setWorks(workList.filter((w: any) => w.status !== 'DELETED' && w.status !== 'ARCHIVED'))
      } catch (err) {
        console.error('Failed to load data:', err)
      }
    }
    loadData()
  }, [showAddForm])

  // All Agree (Super Admin)
  const [allAgreeId, setAllAgreeId] = useState<string | null>(null)

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Edit inline state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editPriority, setEditPriority] = useState('MEDIUM')
  const [editDescription, setEditDescription] = useState('')

  const openIdeas = ideas.filter(f => f.status === 'IDEA')
  const queuedIdeas = ideas.filter(f => f.status === 'QUEUED')
  const declinedIdeas = ideas.filter(f => f.status === 'DECLINED')
  const shelvedIdeas = ideas.filter(f => f.status === 'SHELVED')
  const deletedIdeas = ideas.filter(f => f.status === 'DELETED')

  const isAdmin = currentUser?.role === 'ADMIN'
  const isCreator = (idea: Idea) => currentUser?.id === idea.creator?.id
  const canManage = (idea: Idea) => isAdmin || isCreator(idea)

  async function handleAddIdea(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    formData.append('status', 'IDEA')
    if (selectedPersonMentions.length > 0) {
      formData.append('personMentions', JSON.stringify(selectedPersonMentions))
    }
    try {
      const res = await createWork(formData)
      if (res.success) {
        setShowAddForm(false)
        setSelectedPersonMentions([])
        ;(e.target as HTMLFormElement).reset()
      } else alert(res.error || 'Failed to submit proposal')
    } catch (err) { console.error(err) }
    finally { setIsSubmitting(false) }
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>, ideaId: string) {
    e.preventDefault()
    setActionId(ideaId)
    const formData = new FormData(e.currentTarget)
    try {
      const res = await editWork(ideaId, formData)
      if (res.success) {
        setEditingId(null)
      } else alert(res.error || 'Failed to update proposal')
    } catch (err) {
      console.error(err)
    } finally {
      setActionId(null)
    }
  }

  async function handleVote(id: string) {
    if (!currentUser) return alert('Please login to vote')
    setVotingId(id)
    try { await toggleIdeaSupport(id) } catch (err) { console.error(err) }
    finally { setVotingId(null) }
  }

  async function handleDisagreeSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!disagreeModalId || !disagreeReason.trim()) return
    setIsDisagreeing(true)
    try {
      const res = await disagreeWithIdea(disagreeModalId, disagreeReason)
      if (res.success) {
        setDisagreeModalId(null)
        setDisagreeReason('')
      } else alert(res.error || 'Failed to submit disagreement')
    } catch (err) { console.error(err) }
    finally { setIsDisagreeing(false) }
  }

  async function handleReplySubmit(e: React.FormEvent, disagreeId: string) {
    e.preventDefault()
    if (!replyContent.trim()) return
    setIsReplying(true)
    try {
      const res = await replyToDisagree(disagreeId, replyContent)
      if (res.success) {
        setReplyModalId(null)
        setReplyContent('')
      } else alert(res.error || 'Failed to submit reply')
    } catch (err) { console.error(err) }
    finally { setIsReplying(false) }
  }

  async function handleAction(id: string, action: () => Promise<any>) {
    setActionId(id)
    try {
      const res = await action()
      if (res && !res.success) alert(res.error || 'Action failed')
    } catch (err) { console.error(err) }
    finally { setActionId(null) }
  }

  async function handleAllAgree(ideaId: string) {
    setActionId(ideaId)
    try {
      const res = await adminAllAgree(ideaId)
      if (res.success) {
        setAllAgreeId(null)
      } else {
        alert(res.error || 'Failed to execute All Agree')
      }
    } catch (err) { console.error(err) }
    finally { setActionId(null) }
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
      case 'DELETED': return 'bg-zinc-950/40 border-red-500/10 hover:border-red-500/20 opacity-70'
      default: return 'bg-[#09090b]/40 border-white/5 hover:border-white/10'
    }
  }

  function renderIdeaCard(idea: Idea) {
    const userVoted = currentUser && idea.supports.some(v => v.userId === currentUser.id)
    const userDisagreed = currentUser && idea.disagrees?.some(d => d.userId === currentUser.id)
    const approvalRate = membersCount > 0 ? Math.round((idea.supports.length / membersCount) * 100) : 0
    const isExpanded = expandedId === idea.id
    const isQueued = idea.status === 'QUEUED'
    const isDeclined = idea.status === 'DECLINED'
    const isShelved = idea.status === 'SHELVED'
    const isDeleted = idea.status === 'DELETED'
    const isArchived = isDeclined || isShelved || isDeleted

    // Edit Inline Render
    if (editingId === idea.id) {
      return (
        <motion.div 
          key={idea.id}
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-zinc-950/40 border border-amber-500/20 p-4 sm:p-5 rounded-2xl space-y-4"
        >
          <form onSubmit={(e) => handleEditSubmit(e, idea.id)} className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
              <Edit2 size={12} className="text-amber-400" /> Edit Proposal Details
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] uppercase text-zinc-500 font-bold">Proposal Title</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-zinc-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase text-zinc-500 font-bold">Priority</label>
                <select 
                  name="priority" 
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="w-full bg-zinc-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-[9px] uppercase text-zinc-500 font-bold">Details / Explanation</label>
              <textarea 
                name="description" 
                required 
                rows={3} 
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full bg-zinc-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 resize-none" 
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-1">
              <button 
                type="button" 
                onClick={() => setEditingId(null)} 
                className="text-xs bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl text-zinc-400 hover:text-white cursor-pointer font-bold transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={actionId === idea.id} 
                className="text-xs bg-amber-500 text-black hover:bg-amber-400 px-4 py-2 rounded-xl font-bold disabled:opacity-50 cursor-pointer flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/5"
              >
                {actionId === idea.id ? <Loader2 size={12} className="animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      )
    }

    return (
      <motion.div 
        key={idea.id}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl space-y-4 transition-all ${getStatusStyle(idea.status)}`}
      >
        {/* Top Header Area: Title & Badges */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <h4 className={`text-sm sm:text-base font-bold tracking-tight ${isArchived ? 'text-zinc-400 line-through' : 'text-white'}`}>
                {idea.name}
              </h4>
              <div className="flex flex-wrap gap-1.5 shrink-0">
                <span className={`text-[9px] px-2 py-0.5 rounded-md border font-black uppercase tracking-wider ${getPriorityBadge(idea.priority)}`}>
                  {idea.priority}
                </span>
                {isQueued && (
                  <span className="text-[9px] px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/25 text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <ListOrdered size={10} /> In Queue
                  </span>
                )}
                {isDeclined && (
                  <span className="text-[9px] px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/25 text-red-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <XCircle size={10} /> Declined
                  </span>
                )}
                {isShelved && (
                  <span className="text-[9px] px-2 py-0.5 rounded-md bg-zinc-500/10 border border-zinc-500/25 text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Pause size={10} /> Shelved
                  </span>
                )}
                {isDeleted && (
                  <span className="text-[9px] px-2 py-0.5 rounded-md bg-red-950/20 border border-red-500/25 text-red-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Trash2 size={10} /> Deleted
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${isArchived ? 'text-zinc-500' : 'text-zinc-300'}`}>
            {idea.description}
          </p>

          {/* Mentions / Idea Creators */}
          {idea.personMentions && idea.personMentions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              <span className="text-[10px] font-bold text-yellow-500/70 uppercase tracking-wider flex items-center mr-1">Creators:</span>
              {idea.personMentions.map((mention: any) => (
                <span key={mention.id} className="text-[9px] px-2 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold uppercase">
                  @{mention.user.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Decline Reason Banner */}
        {isDeclined && idea.blockedReason && (
          <div className="flex items-start gap-2.5 bg-red-500/5 border border-red-500/10 rounded-xl p-3 sm:p-4 mt-1">
            <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Decline Reason</span>
              <p className="text-[11px] sm:text-xs text-red-300/70 leading-relaxed mt-0.5">{idea.blockedReason}</p>
            </div>
          </div>
        )}

        {/* Born Info / Origin Details */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 border-t border-white/5 text-[10px] text-zinc-500">
          <div className="flex items-center gap-1.5">
            <div className="shrink-0">
              {idea.creator?.profilePhoto ? (
                <img src={idea.creator.profilePhoto} alt={idea.creator.name} className="w-4 h-4 rounded-full object-cover ring-1 ring-white/10" />
              ) : (
                <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[7px] uppercase">
                  {idea.creator?.name?.charAt(0) || '?'}
                </div>
              )}
            </div>
            <span>By <strong className="text-zinc-300 font-medium">{idea.creator?.name || 'Unknown'}</strong></span>
          </div>
          <div className="flex items-center gap-1" suppressHydrationWarning>
            <Calendar size={11} className="text-zinc-600" />
            <span suppressHydrationWarning>{formatDateTime(idea.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1" suppressHydrationWarning>
            <Clock size={11} className="text-zinc-600" />
            <span suppressHydrationWarning>{formatRelativeTime(idea.createdAt)}</span>
          </div>
        </div>

        {/* Card Footer: Support and Action Controls */}
        <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Left Side: Support Progress or Meta Status */}
          <div className="flex-1 min-w-0">
            {!isArchived ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-white/90">Support Progress:</span>
                    <span>{idea.supports.length} of {membersCount} agreed ({approvalRate}%)</span>
                  </div>
                  {approvalRate === 100 && (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Check size={11} /> Full Consensus
                    </span>
                  )}
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#63BDF2] to-blue-500 h-full rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${Math.min(100, approvalRate)}%` }} 
                  />
                </div>
              </div>
            ) : (
              <div className="text-[10px] text-zinc-500 italic">
                {isDeleted 
                  ? 'Archived proposal (deleted by creator/admin)' 
                  : isDeclined 
                    ? 'Archived proposal (declined by team)' 
                    : 'Archived proposal (shelved for later)'}
              </div>
            )}
          </div>

          {/* Right Side: Action Trigger Trays */}
          <div className="flex flex-wrap items-center gap-1.5 sm:justify-end shrink-0">
            
            {/* For OPEN/QUEUED proposals */}
            {!isArchived && (
              <>
                {currentUser?.role !== 'ADMIN' && (
                  <>
                  <button
                    onClick={() => handleVote(idea.id)}
                  disabled={votingId === idea.id}
                  className={`text-xs px-3.5 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 ${
                    userVoted 
                      ? 'bg-[#63BDF2]/15 border border-[#63BDF2]/35 text-[#63BDF2] hover:bg-[#63BDF2]/25' 
                      : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  {votingId === idea.id ? <Loader2 size={12} className="animate-spin" /> : <ThumbsUp size={12} className={userVoted ? 'fill-[#63BDF2]' : ''} />}
                  <span>{userVoted ? 'Agreed' : 'Agree'}</span>
                </button>

                <button
                  onClick={() => userDisagreed ? handleAction(idea.id, () => removeDisagree(idea.id)) : setDisagreeModalId(idea.id)}
                  disabled={actionId === idea.id}
                  className={`text-xs px-3.5 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 ${
                    userDisagreed 
                      ? 'bg-red-500/15 border border-red-500/35 text-red-400 hover:bg-red-500/25' 
                      : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
                  title="Disagree with this proposal"
                >
                  {actionId === idea.id ? <Loader2 size={12} className="animate-spin" /> : <ThumbsDown size={12} className={userDisagreed ? 'fill-red-500' : ''} />}
                  <span>{userDisagreed ? 'Disagreed' : 'Disagree'}</span>
                </button>
                  </>
                )}

                {/* ALL AGREE — Super Admin Only, hidden if anyone has disagreed */}
                {isAdmin && approvalRate < 100 && (!idea.disagrees || idea.disagrees.length === 0) && (
                  allAgreeId === idea.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleAllAgree(idea.id)}
                        disabled={actionId === idea.id}
                        className="text-xs bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none active:scale-95"
                      >
                        {actionId === idea.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                        <span>Confirm All Agree</span>
                      </button>
                      <button
                        onClick={() => setAllAgreeId(null)}
                        className="text-xs bg-zinc-800/50 border border-white/10 text-zinc-400 p-2 rounded-xl hover:bg-zinc-700/50 transition-all cursor-pointer"
                      >
                        <XCircle size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAllAgreeId(idea.id)}
                      className="text-xs bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-500/25 text-amber-400 px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none active:scale-95"
                      title="Mark all members as agreed (Super Admin only). Each member's name will be shown, with a note that this was done via All Agree."
                    >
                      <Users size={12} />
                      <span>All Agree</span>
                    </button>
                  )
                )}

                {canManage(idea) && (
                  <>
                    <button 
                      onClick={() => handleAction(idea.id, () => queueIdea(idea.id))} 
                      disabled={actionId === idea.id}
                      className={`text-xs p-2 rounded-xl font-bold flex items-center justify-center transition-all cursor-pointer select-none active:scale-95 ${
                        isQueued 
                          ? 'bg-purple-500/15 border border-purple-500/35 text-purple-400' 
                          : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
                      }`} 
                      title={isQueued ? 'Remove from Queue' : 'Add to Queue'}
                    >
                      {actionId === idea.id ? <Loader2 size={12} className="animate-spin" /> : <ListOrdered size={12} />}
                    </button>

                    {/* Convert to Work — ONLY at 100% consensus */}
                    {approvalRate >= 100 ? (
                      <button 
                        onClick={() => handleAction(idea.id, () => updateWorkStatus(idea.id, 'ACTIVE'))} 
                        disabled={actionId === idea.id}
                        className="text-xs bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-400 px-3 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none animate-pulse hover:animate-none active:scale-95"
                        title="All members agreed — Convert to Active Work"
                      >
                        {actionId === idea.id ? <Loader2 size={12} className="animate-spin" /> : <Play size={10} className="fill-emerald-400 text-emerald-400" />}
                        <span>Convert</span>
                      </button>
                    ) : (
                      <div 
                        className="text-[9px] text-zinc-500 bg-zinc-900/40 border border-white/5 px-2.5 py-2 rounded-xl font-bold flex items-center gap-1 select-none cursor-not-allowed" 
                        title={`Need ${membersCount - idea.supports.length} more agreements to convert`}
                      >
                        <Play size={10} className="text-zinc-700" />
                        <span>{approvalRate}%</span>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => setDeclineModalId(idea.id)}
                      className="text-xs bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-red-400 p-2 rounded-xl font-bold flex items-center justify-center transition-all cursor-pointer select-none active:scale-95"
                      title="Decline Proposal"
                    >
                      <XCircle size={12} />
                    </button>

                    <button 
                      onClick={() => handleAction(idea.id, () => shelveIdea(idea.id))}
                      className="text-xs bg-zinc-500/5 hover:bg-zinc-500/10 border border-zinc-500/10 text-zinc-400 p-2 rounded-xl font-bold flex items-center justify-center transition-all cursor-pointer select-none active:scale-95"
                      title="Shelve for Later"
                    >
                      <Archive size={12} />
                    </button>

                    {/* Edit Details */}
                    <button 
                      onClick={() => {
                        setEditingId(idea.id)
                        setEditName(idea.name)
                        setEditPriority(idea.priority)
                        setEditDescription(idea.description)
                      }}
                      className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white p-2 rounded-xl font-bold flex items-center justify-center transition-all cursor-pointer select-none active:scale-95"
                      title="Edit Details"
                    >
                      <Edit2 size={12} />
                    </button>

                    {/* Delete Proposal */}
                    {deleteConfirmId === idea.id ? (
                      <div className="flex items-center gap-1 bg-red-500/15 border border-red-500/35 rounded-xl p-0.5 animate-fadeIn">
                        <button 
                          onClick={() => handleDelete(idea.id)} 
                          disabled={actionId === idea.id}
                          className="text-[9px] bg-red-500 hover:bg-red-650 text-white px-2 py-0.5 rounded font-bold transition-all cursor-pointer"
                        >
                          {actionId === idea.id ? <Loader2 size={10} className="animate-spin" /> : 'Yes'}
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-[9px] bg-white/5 hover:bg-white/10 text-zinc-400 px-2 py-0.5 rounded font-bold transition-all cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setDeleteConfirmId(idea.id)}
                        className="text-xs bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-red-400 p-2 rounded-xl font-bold flex items-center justify-center transition-all cursor-pointer select-none active:scale-95"
                        title="Delete Proposal"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </>
                )}
              </>
            )}

            {/* For DECLINED/SHELVED proposals */}
            {isArchived && !isDeleted && (
              <>
                {canManage(idea) && (
                  <button 
                    onClick={() => handleAction(idea.id, () => reviveIdea(idea.id))} 
                    disabled={actionId === idea.id}
                    className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 px-3.5 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none active:scale-95"
                  >
                    {actionId === idea.id ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                    <span>Revive</span>
                  </button>
                )}

                {canManage(idea) && (
                  <div className="flex items-center gap-1.5">
                    {deleteConfirmId === idea.id ? (
                      <>
                        <button 
                          onClick={() => handleDelete(idea.id)} 
                          disabled={actionId === idea.id}
                          className="text-xs bg-red-500 text-white hover:bg-red-655 px-3 py-2 rounded-xl font-bold transition-all cursor-pointer"
                        >
                          {actionId === idea.id ? <Loader2 size={10} className="animate-spin" /> : 'Yes, Delete'}
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-xs bg-white/5 hover:bg-white/10 text-zinc-400 px-2.5 py-2 rounded-xl font-bold transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => setDeleteConfirmId(idea.id)}
                        className="text-xs bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-red-400 p-2 rounded-xl font-bold flex items-center justify-center transition-all cursor-pointer select-none active:scale-95"
                        title="Delete Permanently"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {/* For DELETED proposals */}
            {isDeleted && canManage(idea) && (
              <button 
                onClick={() => handleAction(idea.id, () => reviveIdea(idea.id))} 
                disabled={actionId === idea.id}
                className="text-xs bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/25 text-emerald-400 px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none active:scale-95"
              >
                {actionId === idea.id ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                <span>Restore Proposal</span>
              </button>
            )}
          </div>
        </div>

        {/* Agreement Support List */}
        {!isArchived && idea.supports.length > 0 && (
          <div className="pt-2 space-y-1.5 border-t border-white/5">
            <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Agreement Timeline:</span>
            <div className="flex flex-wrap gap-1.5">
              {idea.supports.map(v => (
                <div key={v.userId} className="flex items-center gap-1.5 bg-white/5 border border-white/5 rounded-lg px-2 py-1">
                  {v.user.profilePhoto ? (
                    <img src={v.user.profilePhoto} alt={v.user.name} className="w-3.5 h-3.5 rounded-full object-cover" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[6px] uppercase">{v.user.name.charAt(0)}</div>
                  )}
                  <span className="text-[10px] font-bold text-zinc-300">{v.user.name}</span>
                  <span className="text-[9px] text-zinc-550" suppressHydrationWarning>• {formatRelativeTime(v.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disagreements List */}
        {!isArchived && idea.disagrees && idea.disagrees.length > 0 && (
          <div className="pt-3 space-y-3 border-t border-white/5">
            <span className="text-[9px] uppercase font-bold text-red-500 tracking-wider">Disagreements / Concerns:</span>
            <div className="space-y-3">
              {idea.disagrees.map(d => (
                <div key={d.id} className="bg-red-500/5 border border-red-500/10 rounded-xl p-3 space-y-2 relative">
                  <div className="flex items-center gap-1.5">
                    {d.user.profilePhoto ? (
                      <img src={d.user.profilePhoto} alt={d.user.name} className="w-4 h-4 rounded-full object-cover" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-[8px] uppercase">{d.user.name.charAt(0)}</div>
                    )}
                    <span className="text-xs font-bold text-red-400">{d.user.name}</span>
                    <span className="text-[9px] text-zinc-500" suppressHydrationWarning>• {formatRelativeTime(d.createdAt)}</span>
                  </div>
                  <p className="text-xs text-zinc-300 pl-5 leading-relaxed">{d.reason}</p>
                  
                  {/* Replies */}
                  {d.replies.length > 0 && (
                    <div className="pl-5 space-y-2 mt-2 pt-2 border-t border-white/5">
                      {d.replies.map(r => (
                        <div key={r.id} className="flex gap-2">
                          <CornerDownRight size={10} className="text-zinc-600 shrink-0 mt-1" />
                          <div className="bg-white/5 rounded-lg p-2 flex-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[10px] font-bold text-zinc-300">{r.user.name}</span>
                              <span className="text-[8px] text-zinc-500" suppressHydrationWarning>{formatRelativeTime(r.createdAt)}</span>
                            </div>
                            <p className="text-[10px] text-zinc-400">{r.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Button */}
                  <button 
                    onClick={() => setReplyModalId(d.id)}
                    className="absolute top-2 right-2 text-[9px] text-zinc-500 hover:text-white flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition-colors"
                  >
                    <MessageSquare size={10} /> Reply
                  </button>

                  {/* Reply Form */}
                  <AnimatePresence>
                    {replyModalId === d.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pl-5 mt-2">
                        <form onSubmit={(e) => handleReplySubmit(e, d.id)} className="flex items-end gap-2">
                          <div className="flex-1 bg-[#0c0d12]/60 border border-white/10 rounded-xl px-3 py-2 flex items-center focus-within:border-white/30 transition-colors">
                            <input
                              type="text"
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder="Type a reply (you can use @mentions)..."
                              className="w-full bg-transparent text-[10px] text-white focus:outline-none"
                              autoFocus
                            />
                          </div>
                          <button type="submit" disabled={isReplying || !replyContent.trim()} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl disabled:opacity-50 transition-colors">
                            {isReplying ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                          </button>
                          <button type="button" onClick={() => { setReplyModalId(null); setReplyContent(''); }} className="p-2 text-zinc-500 hover:text-white transition-colors">
                            <XCircle size={12} />
                          </button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disagree Modal Form */}
        <AnimatePresence>
          {disagreeModalId === idea.id && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <form onSubmit={handleDisagreeSubmit} className="mt-4 bg-red-500/5 border border-red-500/20 p-4 rounded-xl space-y-3">
                <h4 className="text-[10px] uppercase font-bold text-red-400 flex items-center gap-1.5">
                  <AlertTriangle size={12} /> Why do you disagree?
                </h4>
                <textarea 
                  value={disagreeReason}
                  onChange={e => setDisagreeReason(e.target.value)}
                  placeholder="Explain your concerns so the team can discuss and resolve them..."
                  rows={2}
                  className="w-full bg-[#0c0d12]/60 border border-red-500/20 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 resize-none"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => { setDisagreeModalId(null); setDisagreeReason(''); }} className="text-[10px] bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors">Cancel</button>
                  <button type="submit" disabled={isDisagreeing || !disagreeReason.trim()} className="text-[10px] bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold disabled:opacity-50 transition-colors flex items-center gap-1">
                    {isDisagreeing ? <Loader2 size={10} className="animate-spin" /> : 'Submit'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Activity Log Audit Timeline */}
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
                            <span className="text-[9px] text-zinc-550" suppressHydrationWarning>• {formatDateTime(log.createdAt)}</span>
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
    { key: 'deleted' as const, label: 'Deleted', icon: <Trash2 size={12} />, count: deletedIdeas.length, color: '' },
  ]

  const currentList = 
    activeTab === 'open' ? openIdeas : 
    activeTab === 'queued' ? queuedIdeas : 
    activeTab === 'declined' ? declinedIdeas : 
    activeTab === 'shelved' ? shelvedIdeas : 
    deletedIdeas
  
  const emptyMessages: Record<string, string> = {
    open: 'No open proposals right now. Click "New Proposal" to share your idea!',
    queued: 'No ideas in execution queue. Move ideas here when the team agrees.',
    declined: 'No declined proposals. Ideas that don\'t pass team review appear here with reasons.',
    shelved: 'No shelved proposals. Ideas saved for future reconsideration appear here.',
    deleted: 'No deleted proposals. Deleted ideas appear here with their complete history.',
  }

  const bannerMessages: Record<string, { icon: React.ReactNode; color: string; text: string } | null> = {
    open: null,
    queued: { icon: <ArrowRightCircle size={14} className="shrink-0 mt-0.5 text-purple-400" />, color: 'bg-purple-500/5 border-purple-500/10 text-purple-300/80', text: 'Execution Queue — Ideas approved by the team, waiting to start as Active Work. Admin or creator can click the play button to begin.' },
    declined: { icon: <AlertTriangle size={14} className="shrink-0 mt-0.5 text-red-400" />, color: 'bg-red-500/5 border-red-500/10 text-red-300/70', text: 'Declined Archive — These proposals were reviewed but not approved. Each has a documented reason. They can be revived if the situation changes, or permanently deleted.' },
    shelved: { icon: <Pause size={14} className="shrink-0 mt-0.5 text-zinc-400" />, color: 'bg-zinc-500/5 border-zinc-500/10 text-zinc-300/70', text: 'Shelved Ideas — Not rejected, just paused. These might be reconsidered in the future when timing or resources are better. Revive anytime.' },
    deleted: { icon: <Trash2 size={14} className="shrink-0 mt-0.5 text-zinc-500" />, color: 'bg-zinc-500/5 border-zinc-500/10 text-zinc-300/70', text: 'Deleted Archives — Proposals deleted by their creator or an admin. Full history, dates, and agreement timelines are preserved for audit purposes.' },
  }

  return (
    <div className="bg-secondary/15 border border-border/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/30">
        <div className="flex items-center gap-2 min-w-0">
          <Lightbulb className="text-yellow-400 shrink-0" size={20} />
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">Proposals & Ideas</h2>
          <SectionGuide 
            title="Full Idea Lifecycle" 
            content="IDEA → Team votes Agree → QUEUED (ready for work) → ACTIVE (started). If team doesn't agree, ideas can be DECLINED (with reason) or SHELVED (maybe later). Declined/Shelved ideas can be REVIVED or permanently DELETED. Every action is timestamped with full audit trail."
          />
        </div>
        {!isAdmin && (
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black px-4 py-2.5 rounded-xl font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none shrink-0 w-full sm:w-auto shadow-md shadow-yellow-500/10 active:scale-95 border-0"
          >
            <Plus size={14} className="stroke-[3]" /> New Proposal
          </button>
        )}
      </div>

      {/* Add Idea Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <form onSubmit={handleAddIdea} className="bg-zinc-950/40 border border-white/5 p-4 sm:p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Submit New Proposal</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase text-zinc-500 font-bold">Proposal Title</label>
                  <input type="text" name="name" required placeholder="e.g., Weekly Team Meetup or Client Dashboard Redesign"
                    className="w-full bg-[#0c0d12]/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-yellow-500/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase text-zinc-500 font-bold">Priority</label>
                  <select name="priority" className="w-full bg-[#0c0d12]/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-500/50">
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-zinc-500 font-bold">Details / Explanation</label>
                <textarea name="description" required rows={3} placeholder="Explain the idea, benefits, or workflow in detail..."
                  className="w-full bg-[#0c0d12]/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-yellow-500/50 resize-none" />
              </div>
              
              {/* Mentions Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-4 mt-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">Idea Creators (10 pts)</label>
                  <div className="flex flex-wrap gap-1.5 p-2 bg-[#0c0d12]/60 border border-white/10 rounded-xl min-h-[38px]">
                     {members.filter(m => m.role !== 'ADMIN').map(m => (
                       <button
                         type="button"
                         key={m.id}
                         onClick={() => {
                           if (selectedPersonMentions.includes(m.id)) {
                             setSelectedPersonMentions(prev => prev.filter(id => id !== m.id))
                           } else {
                             setSelectedPersonMentions(prev => [...prev, m.id])
                           }
                         }}
                         className={`px-2 py-1 text-[9px] rounded-lg border transition-colors cursor-pointer ${
                           selectedPersonMentions.includes(m.id) 
                           ? 'bg-purple-500/20 border-purple-500/50 text-purple-400 font-bold' 
                           : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                         }`}
                       >
                         {m.name}
                       </button>
                     ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="parentWorkId" className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">Parent Work (10 pts)</label>
                  <select
                    name="parentWorkId"
                    className="w-full bg-[#0c0d12]/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-500/50 transition-all"
                  >
                    <option value="">None (Standalone)</option>
                    {works.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowAddForm(false)} className="text-xs bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl text-zinc-400 hover:text-white cursor-pointer font-bold">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="text-xs bg-yellow-500 text-black hover:bg-yellow-450 px-4 py-2 rounded-xl font-bold disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-md shadow-yellow-500/5">
                  {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : 'Submit Proposal'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5-Tab Navigation Bar */}
      <div className="w-full relative">
        <div className="overflow-x-auto scrollbar-none -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0">
          <div className="flex bg-zinc-950/60 p-1 rounded-2xl border border-white/5 select-none gap-1 w-max min-w-full md:w-full md:grid md:grid-cols-5">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex-shrink-0 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 whitespace-nowrap ${
                activeTab === tab.key 
                  ? 'bg-gradient-to-br from-white to-zinc-200 text-black shadow-lg shadow-white/5 font-black' 
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}>
              <span className="shrink-0">{tab.icon}</span>
              <span>{tab.label}</span>
              <span className="text-[10px] opacity-60 font-mono">({tab.count})</span>
            </button>
          ))}
          </div>
        </div>
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
