'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Lightbulb, Check, Plus, Clock, Calendar, Zap,
  ThumbsUp, ThumbsDown, MessageSquare, CornerDownRight, Loader2, Play, ListOrdered, XCircle, Pause, RotateCcw, Trash2,
  ChevronDown, ChevronUp, History, ArrowRightCircle, AlertTriangle, Archive, Edit2, Send, Users
} from 'lucide-react'
import { createWork, updateWorkStatus, toggleIdeaSupport, queueIdea, declineIdea, shelveIdea, reviveIdea, deleteIdea, editWork, getWorks, disagreeWithIdea, replyToDisagree, removeDisagree, adminAllAgree, convertIdeaToWork, permanentlyDeleteWork } from '@/app/actions'
import { getMembers } from '@/app/actions/admin'
import DateTimePicker from './DateTimePicker'
import SectionGuide from './SectionGuide'
import CustomSelect from './CustomSelect'

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
    customRole?: string | null
  }
  assignees?: {
    id: string
    name: string
    profilePhoto: string | null
    role: string
    customRole?: string | null
  }[]
  type?: string
  expectedDurationHours?: number | null
  dueDate?: string | null
  startedAt?: string | null
  completedAt?: string | null
  actualDurationHours?: number | null
  parentWorkId?: string | null
  supports: {
    userId: string
    createdAt: string
    user: {
      id: string
      name: string
      profilePhoto: string | null
      role: string
      customRole?: string | null
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
  members: any[]
  works: any[]
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

export default function IdeaAgreementHub({ ideas, currentUser, membersCount, members, works }: IdeaAgreementHubProps) {
  const router = useRouter()
  const { addToast, showConfirm } = useStore()

  const calculatePoints = (mode: 'hours' | 'days', daysVal: number | '', hoursVal: number | '') => {
    const h = hoursVal !== '' ? Number(hoursVal) : 0
    if (mode === 'hours') {
      const days = Math.floor(h / 24)
      const extraHours = h % 24
      const extraPoints = extraHours >= 4 ? 5 : extraHours >= 2 ? 2 : extraHours >= 1 ? 1 : 0
      return (days * 5) + extraPoints
    } else {
      const d = daysVal !== '' ? Number(daysVal) : 0
      const extraPoints = h >= 4 ? 5 : h >= 2 ? 2 : h >= 1 ? 1 : 0
      return (d * 5) + extraPoints
    }
  }

  const [activeTab, setActiveTab] = useState<'open' | 'queued' | 'declined' | 'shelved' | 'deleted'>('open')
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [votingId, setVotingId] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  
  // Decline modal state
  const [declineModalId, setDeclineModalId] = useState<string | null>(null)
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>('')
  const [declineReason, setDeclineReason] = useState('')
  const [isDeclining, setIsDeclining] = useState(false)

  // Set default creator when members load
  useEffect(() => {
    if (members && members.length > 0 && !selectedCreatorId) {
      const nonAdminMembers = members.filter((m: any) => m.role !== 'ADMIN')
      if (nonAdminMembers.length > 0) {
        const defaultCreator = currentUser?.role === 'ADMIN' ? nonAdminMembers[0].id : (nonAdminMembers.find((m: any) => m.id === currentUser?.id)?.id || nonAdminMembers[0].id)
        setSelectedCreatorId(defaultCreator)
      }
    }
  }, [members, currentUser, selectedCreatorId])

  // Disagree modal state
  const [disagreeModalId, setDisagreeModalId] = useState<string | null>(null)
  const [disagreeReason, setDisagreeReason] = useState('')
  const [isDisagreeing, setIsDisagreeing] = useState(false)

  // Reply modal state
  const [replyModalId, setReplyModalId] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isReplying, setIsReplying] = useState(false)

  // All agree confirmation modal state
  const [allAgreeId, setAllAgreeId] = useState<string | null>(null)

  // Edit inline state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editPriority, setEditPriority] = useState('MEDIUM')
  const [editDescription, setEditDescription] = useState('')
  const [editDurationMode, setEditDurationMode] = useState<'hours' | 'days'>('hours')
  const [editExpectedDays, setEditExpectedDays] = useState<number | ''>('')
  const [editExpectedHours, setEditExpectedHours] = useState<number | ''>('')
  const [editDeadline, setEditDeadline] = useState<Date | null>(null)
  const [editAssigneeIds, setEditAssigneeIds] = useState<string[]>([])

  // Convert to Work Modal/Inline state
  const [convertModalId, setConvertModalId] = useState<string | null>(null)
  const [convertDurationMode, setConvertDurationMode] = useState<'hours' | 'days'>('hours')
  const [convertExpectedDays, setConvertExpectedDays] = useState<number | ''>('')
  const [convertExpectedHours, setConvertExpectedHours] = useState<number | ''>('')
  const [convertDeadline, setConvertDeadline] = useState<Date | null>(null)
  const [convertAssigneeIds, setConvertAssigneeIds] = useState<string[]>([])

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
    formData.append('creatorId', selectedCreatorId)
    
    try {
      const res = await createWork(formData)
      if (res.success) {
        addToast('Proposal submitted successfully!', 'success')
        setShowAddForm(false)
        ;(e.target as HTMLFormElement).reset()
        router.refresh()
      } else {
        addToast(res.error || 'Failed to submit proposal', 'error')
      }
    } catch (err: any) { 
      console.error(err) 
      addToast(err.message || 'An error occurred', 'error')
    } finally { 
      setIsSubmitting(false) 
    }
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>, ideaId: string) {
    e.preventDefault()
    setActionId(ideaId)
    const formData = new FormData(e.currentTarget)
    editAssigneeIds.forEach(id => formData.append('assigneeIds', id))
    
    const days = editDurationMode === 'days' && editExpectedDays !== '' ? Number(editExpectedDays) : 0
    const hours = editExpectedHours !== '' ? Number(editExpectedHours) : 0
    const totalHours = editDurationMode === 'days' ? (days * 24) + hours : hours
    if (totalHours > 0) {
      formData.append('expectedDurationHours', totalHours.toString())
    } else {
      formData.append('expectedDurationHours', '0')
    }

    if (editDeadline) {
      formData.append('dueDate', editDeadline.toISOString())
    }
    
    try {
      const res = await editWork(ideaId, formData)
      if (res.success) {
        addToast('Proposal updated successfully!', 'success')
        setEditingId(null)
        router.refresh()
      } else {
        addToast(res.error || 'Failed to update proposal', 'error')
      }
    } catch (err: any) {
      console.error(err)
      addToast(err.message || 'An error occurred', 'error')
    } finally {
      setActionId(null)
    }
  }

  async function handleConvertSubmit(e: React.FormEvent<HTMLFormElement>, ideaId: string, ideaType: string) {
    e.preventDefault()
    setActionId(ideaId)
    
    const formData = new FormData()
    convertAssigneeIds.forEach(id => formData.append('assigneeIds', id))
    
    const days = convertDurationMode === 'days' && convertExpectedDays !== '' ? Number(convertExpectedDays) : 0
    const hours = convertExpectedHours !== '' ? Number(convertExpectedHours) : 0
    const totalHours = convertDurationMode === 'days' ? (days * 24) + hours : hours
    
    if (totalHours > 0) {
      formData.append('expectedDurationHours', totalHours.toString())
    }
    if (convertDeadline) {
      formData.append('dueDate', convertDeadline.toISOString())
    }

    try {
      const res = await convertIdeaToWork(ideaId, formData)
      if (res.success) {
        addToast('Converted proposal to active work!', 'success')
        setConvertModalId(null)
        router.refresh()
      } else {
        addToast(res.error || 'Failed to convert proposal', 'error')
      }
    } catch (err: any) { 
      console.error(err) 
      addToast(err.message || 'An error occurred', 'error')
    } finally { 
      setActionId(null) 
    }
  }

  async function handleVote(id: string) {
    if (!currentUser) {
      addToast('Please login to vote', 'error')
      return
    }
    setVotingId(id)
    try { 
      const res = await toggleIdeaSupport(id)
      if (res && !res.success) {
        addToast(res.error || 'Failed to vote', 'error')
      } else {
        addToast('Vote updated', 'success')
        router.refresh()
      }
    } catch (err: any) { 
      console.error(err) 
      addToast(err.message || 'An error occurred', 'error')
    } finally { 
      setVotingId(null) 
    }
  }

  async function handleDisagreeSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!disagreeModalId || !disagreeReason.trim()) return
    setIsDisagreeing(true)
    try {
      const res = await disagreeWithIdea(disagreeModalId, disagreeReason)
      if (res.success) {
        addToast('Disagreement posted successfully', 'success')
        setDisagreeModalId(null)
        setDisagreeReason('')
        router.refresh()
      } else {
        addToast(res.error || 'Failed to submit disagreement', 'error')
      }
    } catch (err: any) { 
      console.error(err) 
      addToast(err.message || 'An error occurred', 'error')
    } finally { 
      setIsDisagreeing(false) 
    }
  }

  async function handleReplySubmit(e: React.FormEvent, disagreeId: string) {
    e.preventDefault()
    if (!replyContent.trim()) return
    setIsReplying(true)
    try {
      const res = await replyToDisagree(disagreeId, replyContent)
      if (res.success) {
        addToast('Reply submitted successfully', 'success')
        setReplyModalId(null)
        setReplyContent('')
        router.refresh()
      } else {
        addToast(res.error || 'Failed to submit reply', 'error')
      }
    } catch (err: any) { 
      console.error(err) 
      addToast(err.message || 'An error occurred', 'error')
    } finally { 
      setIsReplying(false) 
    }
  }

  async function handleAction(id: string, action: () => Promise<any>) {
    setActionId(id)
    try {
      const res = await action()
      if (res && !res.success) {
        addToast(res.error || 'Action failed', 'error')
      } else {
        addToast('Action completed successfully', 'success')
        router.refresh()
      }
    } catch (err: any) { 
      console.error(err) 
      addToast(err.message || 'An error occurred', 'error')
    } finally { 
      setActionId(null) 
    }
  }

  async function handleAllAgree(ideaId: string) {
    setActionId(ideaId)
    try {
      const res = await adminAllAgree(ideaId)
      if (res.success) {
        addToast('All Agree executed successfully', 'success')
        setAllAgreeId(null)
        router.refresh()
      } else {
        addToast(res.error || 'Failed to execute All Agree', 'error')
      }
    } catch (err: any) { 
      console.error(err) 
      addToast(err.message || 'An error occurred', 'error')
    } finally { 
      setActionId(null) 
    }
  }

  async function handleDelete(id: string) {
    setActionId(id)
    try {
      const res = await deleteIdea(id)
      if (res.success) {
        addToast('Proposal deleted successfully', 'success')
        router.refresh()
      } else {
        addToast(res.error || 'Failed to delete proposal', 'error')
      }
    } catch (err: any) { 
      console.error(err) 
      addToast(err.message || 'An error occurred', 'error')
    } finally { 
      setActionId(null) 
    }
  }

  async function handleDeleteClick(idea: any) {
    const confirmed = await showConfirm({
      title: 'Delete Proposal',
      message: `Are you sure you want to delete "${idea.name}"? This action cannot be undone.`,
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      danger: true
    })
    if (confirmed) {
      await handleDelete(idea.id)
    }
  }

  async function handlePermanentDeleteClick(idea: any) {
    const confirmed = await showConfirm({
      title: 'Permanently Delete Proposal',
      message: `Are you sure you want to permanently delete "${idea.name}"? This action is irreversible and will remove all associated data and deduct any awarded points.`,
      confirmText: 'Permanently Delete',
      cancelText: 'Cancel',
      danger: true
    })
    if (confirmed) {
      setActionId(idea.id)
      try {
        const res = await permanentlyDeleteWork(idea.id)
        if (res.success) {
          addToast('Proposal permanently deleted', 'success')
          router.refresh()
        } else {
          addToast(res.error || 'Failed to delete permanently', 'error')
        }
      } catch (err: any) {
        console.error(err)
        addToast(err.message || 'An error occurred', 'error')
      } finally {
        setActionId(null)
      }
    }
  }

  async function handleDeclineSubmit() {
    if (!declineModalId || !declineReason.trim()) return
    setIsDeclining(true)
    try {
      const res = await declineIdea(declineModalId, declineReason)
      if (res.success) {
        addToast('Proposal declined successfully', 'success')
        setDeclineModalId(null)
        setDeclineReason('')
        router.refresh()
      } else {
        addToast(res.error || 'Failed to decline proposal', 'error')
      }
    } catch (err: any) { 
      console.error(err) 
      addToast(err.message || 'An error occurred', 'error')
    } finally { 
      setIsDeclining(false) 
    }
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
      default: return 'bg-zinc-950/40 border-white/5 hover:border-white/10'
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

            {idea.type !== 'IDEA' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-zinc-500 font-bold">Assignees (Workers)</label>
                  <div className="flex flex-wrap gap-1 p-2 bg-zinc-950/60 border border-white/10 rounded-xl min-h-[38px]">
                    {members.filter(m => m.role !== 'ADMIN').map(m => (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => {
                          if (editAssigneeIds.includes(m.id)) {
                            setEditAssigneeIds(prev => prev.filter(id => id !== m.id))
                          } else {
                            setEditAssigneeIds(prev => [...prev, m.id])
                          }
                        }}
                        className={`px-2 py-1 text-[9px] rounded-lg border transition-colors cursor-pointer ${
                          editAssigneeIds.includes(m.id) 
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 font-bold' 
                          : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[9px] uppercase text-zinc-500 font-bold block">Expected Duration</label>
                  
                  {/* Segmented Toggle Control */}
                  <div className="flex bg-zinc-950/80 p-0.5 border border-white/5 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setEditDurationMode('hours');
                        setEditExpectedDays('');
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                        editDurationMode === 'hours'
                          ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400 font-black'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <span className="flex items-center justify-center gap-1.5">
                        <Zap size={10} />
                        Hours Task
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditDurationMode('days')}
                      className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                        editDurationMode === 'days'
                          ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400 font-black'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <span className="flex items-center justify-center gap-1.5">
                        <Calendar size={10} />
                        Multi-Day Task
                      </span>
                    </button>
                  </div>

                  <div className="flex gap-3 items-start">
                    {editDurationMode === 'hours' ? (
                      <div className="flex-1 space-y-1">
                        <CustomSelect 
                          value={editExpectedHours}
                          onChange={setEditExpectedHours}
                          options={Array.from({ length: 24 }, (_, i) => i + 1).map((h) => ({
                            value: h,
                            label: `${h} ${h === 1 ? 'Hour' : 'Hours'}`
                          }))}
                          placeholder="Select Hours"
                          borderColorClass="border-white/10 focus:border-amber-500/50"
                        />
                        <span className="text-[7px] text-zinc-500 font-bold block">1h = 1pt, 2-3h = 2pts, 4h+ = 5pts (max 5pts/day)</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 space-y-1">
                          <input 
                            type="number" 
                            min="1"
                            placeholder="Days"
                            value={editExpectedDays}
                            onChange={(e) => {
                              const val = e.target.value ? Number(e.target.value) : ''
                              if (val !== '' && val < 1) {
                                setEditExpectedDays(1)
                              } else {
                                setEditExpectedDays(val)
                              }
                            }}
                            className="w-full bg-zinc-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50" 
                          />
                          <span className="text-[7px] text-zinc-500 font-bold block">1 Day = 5 Points</span>
                        </div>
                        <div className="flex-1 space-y-1">
                          <CustomSelect 
                            value={editExpectedHours === '' ? 0 : editExpectedHours}
                            onChange={setEditExpectedHours}
                            options={Array.from({ length: 25 }, (_, i) => i).map((h) => ({
                              value: h,
                              label: `${h} ${h === 1 ? 'Hour' : 'Hours'}`
                            }))}
                            placeholder="Select Extra Hours"
                            borderColorClass="border-white/10 focus:border-amber-500/50"
                          />
                          <span className="text-[7px] text-zinc-500 font-bold block">Extra hours (max 24)</span>
                        </div>
                      </>
                    )}

                    {/* Points Counter Badge */}
                    <div className="bg-zinc-950/80 border border-amber-500/15 rounded-xl p-2 flex items-center justify-between min-w-[90px] text-center shadow-inner h-[38px] self-start">
                      <div className="flex flex-col items-center justify-center w-full">
                        <span className="text-xs font-black text-amber-400 leading-none">
                          {calculatePoints(editDurationMode, editExpectedDays, editExpectedHours)}
                        </span>
                        <span className="text-[6px] uppercase tracking-wider text-zinc-500 font-black mt-0.5">Points</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-zinc-500 font-bold">Deadline</label>
                  <DateTimePicker 
                    value={editDeadline ? editDeadline.toISOString() : ''}
                    onChange={(val: string) => setEditDeadline(val ? new Date(val) : null)}
                    placeholder="Select Deadline"
                    className="border-white/10 focus-within:border-amber-500/50"
                  />
                </div>
              </div>
            )}
            
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

    if (convertModalId === idea.id) {
      return (
        <motion.div 
          key={idea.id}
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-emerald-950/20 border border-emerald-500/20 p-4 sm:p-5 rounded-2xl space-y-4"
        >
          <form onSubmit={(e) => handleConvertSubmit(e, idea.id, idea.type || 'IDEA')} className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
              <Play size={12} className="fill-emerald-400 text-emerald-400" /> Convert to Active Work
            </h4>
            
            <p className="text-xs text-emerald-300/80 leading-relaxed mb-4">
              The team has 100% consensus! You are about to convert "${idea.name}" into an active task. Please assign the responsible team members and estimate the hours required.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] uppercase text-zinc-500 font-bold">Assignees (Workers)</label>
                <div className="flex flex-wrap gap-1 p-2 bg-zinc-950/60 border border-emerald-500/10 rounded-xl min-h-[38px]">
                  {members.filter(m => m.role !== 'ADMIN').map(m => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => {
                        if (convertAssigneeIds.includes(m.id)) {
                          setConvertAssigneeIds(prev => prev.filter(id => id !== m.id))
                        } else {
                          setConvertAssigneeIds(prev => [...prev, m.id])
                        }
                      }}
                      className={`px-2 py-1 text-[9px] rounded-lg border transition-colors cursor-pointer ${
                        convertAssigneeIds.includes(m.id) 
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 font-bold' 
                        : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[9px] uppercase text-zinc-500 font-bold block">Expected Duration</label>
                
                {/* Segmented Toggle Control */}
                <div className="flex bg-zinc-950/80 p-0.5 border border-white/5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setConvertDurationMode('hours');
                      setConvertExpectedDays('');
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                      convertDurationMode === 'hours'
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <Zap size={10} />
                      Hours Task
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConvertDurationMode('days')}
                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                      convertDurationMode === 'days'
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <Calendar size={10} />
                      Multi-Day Task
                    </span>
                  </button>
                </div>

                <div className="flex gap-3 items-start">
                  {convertDurationMode === 'hours' ? (
                    <div className="flex-1 space-y-1">
                      <CustomSelect 
                        value={convertExpectedHours}
                        onChange={setConvertExpectedHours}
                        options={Array.from({ length: 24 }, (_, i) => i + 1).map((h) => ({
                          value: h,
                          label: `${h} ${h === 1 ? 'Hour' : 'Hours'}`
                        }))}
                        placeholder="Select Hours"
                        borderColorClass="border-emerald-500/10 focus:border-emerald-500/50"
                      />
                      <span className="text-[7px] text-emerald-500/70 font-bold block">1h = 1pt, 2-3h = 2pts, 4h+ = 5pts (max 5pts/day)</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 space-y-1">
                        <input 
                          type="number" 
                          min="1"
                          placeholder="Days"
                          value={convertExpectedDays}
                          onChange={(e) => {
                            const val = e.target.value ? Number(e.target.value) : ''
                            if (val !== '' && val < 1) {
                              setConvertExpectedDays(1)
                            } else {
                              setConvertExpectedDays(val)
                            }
                          }}
                          className="w-full bg-zinc-950/60 border border-emerald-500/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50" 
                        />
                        <span className="text-[7px] text-emerald-500/70 font-bold block">1 Day = 5 Points</span>
                      </div>
                      <div className="flex-1 space-y-1">
                        <CustomSelect 
                          value={convertExpectedHours === '' ? 0 : convertExpectedHours}
                          onChange={setConvertExpectedHours}
                          options={Array.from({ length: 25 }, (_, i) => i).map((h) => ({
                            value: h,
                            label: `${h} ${h === 1 ? 'Hour' : 'Hours'}`
                          }))}
                          placeholder="Select Extra Hours"
                          borderColorClass="border-emerald-500/10 focus:border-emerald-500/50"
                        />
                        <span className="text-[7px] text-emerald-500/70 font-bold block">Extra hours (max 24)</span>
                      </div>
                    </>
                  )}

                  {/* Points Counter Badge */}
                  <div className="bg-zinc-950/80 border border-emerald-500/15 rounded-xl p-2 flex items-center justify-between min-w-[90px] text-center shadow-inner h-[38px] self-start">
                    <div className="flex flex-col items-center justify-center w-full">
                      <span className="text-xs font-black text-emerald-400 leading-none">
                        {calculatePoints(convertDurationMode, convertExpectedDays, convertExpectedHours)}
                      </span>
                      <span className="text-[6px] uppercase tracking-wider text-zinc-500 font-black mt-0.5">Points</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] uppercase text-zinc-500 font-bold">Deadline</label>
                <DateTimePicker 
                  value={convertDeadline ? convertDeadline.toISOString() : ''}
                  onChange={(val: string) => setConvertDeadline(val ? new Date(val) : null)}
                  placeholder="Select Deadline"
                  className="border-emerald-500/10 focus-within:border-emerald-500/50"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-2 mt-2 border-t border-emerald-500/10">
              <button 
                type="button" 
                onClick={() => setConvertModalId(null)} 
                className="text-xs bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl text-zinc-400 hover:text-white cursor-pointer font-bold transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={actionId === idea.id} 
                className="text-xs bg-emerald-500 text-black hover:bg-emerald-400 px-4 py-2 rounded-xl font-bold disabled:opacity-50 cursor-pointer flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/5"
              >
                {actionId === idea.id ? <Loader2 size={12} className="animate-spin" /> : (idea.type === 'IDEA' ? 'Approve Idea' : 'Confirm Conversion')}
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
        className={`border-b md:border p-4 md:p-6 md:rounded-3xl space-y-4 transition-all ${getStatusStyle(idea.status)}`}
      >
        <div className="flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2 min-w-0 cursor-pointer group/title" onClick={() => router.push(`/works/${idea.id}`)}>
              <h4 className={`text-sm sm:text-base font-bold tracking-tight transition-colors group-hover/title:text-[#63BDF2] ${isArchived ? 'text-zinc-400 line-through' : 'text-white'}`}>
                {idea.name}
              </h4>
              <div className="flex flex-wrap gap-1.5 shrink-0">
                <span className={`text-[9px] px-2 py-0.5 rounded-md border font-black uppercase tracking-wider ${getPriorityBadge(idea.priority)}`}>
                  {idea.priority}
                </span>
                <span className={`text-[9px] px-2 py-0.5 rounded-md border font-black uppercase tracking-wider ${
                  idea.type === 'ACTION' 
                    ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
                    : 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20'
                }`}>
                  {idea.type === 'ACTION' ? 'Action' : 'Idea'}
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

        {isDeclined && idea.blockedReason && (
          <div className="flex items-start gap-2.5 bg-red-500/5 border border-red-500/10 rounded-xl p-3 sm:p-4 mt-1">
            <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Decline Reason</span>
              <p className="text-[11px] sm:text-xs text-red-300/70 leading-relaxed mt-0.5">{idea.blockedReason}</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 border-t border-white/5 text-[10px] text-zinc-500">
          <div className="flex items-center gap-1.5">
            <div className="shrink-0">
              {idea.creator?.profilePhoto ? (
                <img src={idea.creator.profilePhoto} alt={idea.creator.name} className="w-4 h-4 rounded-full object-cover ring-1 ring-white/10" />
              ) : (
                <div className="w-4 h-4 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center font-bold text-[7px] uppercase">
                  {idea.creator?.name?.charAt(0) || '?'}
                </div>
              )}
            </div>
            <span>By <strong className="text-zinc-300 font-medium">{idea.creator?.name || 'Unknown'}</strong></span>
            {idea.creator && (
              <span className="text-[7px] text-muted-foreground border border-white/10 px-1 py-0.2 rounded font-bold uppercase tracking-widest bg-white/5 ml-1">
                {idea.creator.customRole || idea.creator.role}
              </span>
            )}
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

        <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                    className="bg-gradient-to-r from-blue-400 to-blue-500 h-full rounded-full transition-all duration-500 ease-out" 
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

          <div className="flex flex-wrap items-center gap-1.5 sm:justify-end shrink-0">
            {!isArchived && (
              <>
                {currentUser?.role !== 'ADMIN' && (
                  <>
                  <button
                    onClick={() => handleVote(idea.id)}
                    disabled={votingId === idea.id}
                    className={`text-xs px-3.5 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 ${
                      userVoted 
                        ? 'bg-blue-500/15 border border-blue-500/35 text-blue-400 hover:bg-blue-500/25' 
                        : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    {votingId === idea.id ? <Loader2 size={12} className="animate-spin" /> : <ThumbsUp size={12} className={userVoted ? 'fill-blue-400' : ''} />}
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
                  >
                    {actionId === idea.id ? <Loader2 size={12} className="animate-spin" /> : <ThumbsDown size={12} className={userDisagreed ? 'fill-red-400' : ''} />}
                    <span>{userDisagreed ? 'Disagreed' : 'Disagree'}</span>
                  </button>
                  </>
                )}

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
                    >
                      {actionId === idea.id ? <Loader2 size={12} className="animate-spin" /> : <ListOrdered size={12} />}
                    </button>

                    {approvalRate >= 100 ? (
                      <button 
                        onClick={() => {
                          setConvertModalId(idea.id)
                          setConvertAssigneeIds(idea.assignees?.map(a => a.id) || [])
                          const totalHours = idea.expectedDurationHours || 0
                          const isMultiDay = totalHours >= 24
                          setConvertDurationMode(isMultiDay ? 'days' : 'hours')
                          setConvertExpectedDays(isMultiDay ? Math.floor(totalHours / 24) : '')
                          setConvertExpectedHours(isMultiDay ? totalHours % 24 : totalHours || '')
                          setConvertDeadline(idea.dueDate ? new Date(idea.dueDate) : null)
                        }} 
                        disabled={actionId === idea.id}
                        className="text-xs bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-400 px-3 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none animate-pulse hover:animate-none active:scale-95"
                      >
                        {actionId === idea.id ? <Loader2 size={12} className="animate-spin" /> : <Play size={10} className="fill-emerald-400 text-emerald-400" />}
                        <span>Convert</span>
                      </button>
                    ) : (
                      <div 
                        className="text-[9px] text-zinc-500 bg-zinc-900/40 border border-white/5 px-2.5 py-2 rounded-xl font-bold flex items-center gap-1 select-none cursor-not-allowed" 
                      >
                        <Play size={10} className="text-zinc-700" />
                        <span>{approvalRate}%</span>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => setDeclineModalId(idea.id)}
                      className="text-xs bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-red-400 p-2 rounded-xl font-bold flex items-center justify-center transition-all cursor-pointer select-none active:scale-95"
                    >
                      <XCircle size={12} />
                    </button>

                    <button 
                      onClick={() => handleAction(idea.id, () => shelveIdea(idea.id))}
                      className="text-xs bg-zinc-500/5 hover:bg-zinc-500/10 border border-zinc-500/10 text-zinc-400 p-2 rounded-xl font-bold flex items-center justify-center transition-all cursor-pointer select-none active:scale-95"
                    >
                      <Archive size={12} />
                    </button>

                    <button 
                      onClick={() => {
                        setEditingId(idea.id)
                        setEditName(idea.name)
                        setEditPriority(idea.priority)
                        setEditDescription(idea.description)
                        const totalHours = idea.expectedDurationHours || 0
                        const isMultiDay = totalHours >= 24
                        setEditDurationMode(isMultiDay ? 'days' : 'hours')
                        setEditExpectedDays(isMultiDay ? Math.floor(totalHours / 24) : '')
                        setEditExpectedHours(isMultiDay ? totalHours % 24 : totalHours || '')
                        setEditDeadline(idea.dueDate ? new Date(idea.dueDate) : null)
                        setEditAssigneeIds(idea.assignees?.map(a => a.id) || [])
                      }}
                      className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white p-2 rounded-xl font-bold flex items-center justify-center transition-all cursor-pointer select-none active:scale-95"
                    >
                      <Edit2 size={12} />
                    </button>

                    <button 
                      onClick={() => handleDeleteClick(idea)}
                      disabled={actionId === idea.id}
                      className="text-xs bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-red-400 p-2 rounded-xl font-bold flex items-center justify-center transition-all cursor-pointer select-none active:scale-95 disabled:opacity-50"
                    >
                      {actionId === idea.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    </button>
                  </>
                )}
              </>
            )}

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
                  <button 
                    onClick={() => handleDeleteClick(idea)}
                    disabled={actionId === idea.id}
                    className="text-xs bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-red-400 p-2 rounded-xl font-bold flex items-center justify-center transition-all cursor-pointer select-none active:scale-95 disabled:opacity-50"
                  >
                    {actionId === idea.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  </button>
                )}
              </>
            )}

            {isDeleted && canManage(idea) && (
              <>
                <button 
                  onClick={() => handleAction(idea.id, () => reviveIdea(idea.id))} 
                  disabled={actionId === idea.id}
                  className="text-xs bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/25 text-emerald-400 px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none active:scale-95"
                >
                  {actionId === idea.id ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                  <span>Restore Proposal</span>
                </button>
                <button 
                  onClick={() => handlePermanentDeleteClick(idea)} 
                  disabled={actionId === idea.id}
                  className="text-xs bg-red-500/15 hover:bg-red-500/25 border border-red-500/25 text-red-400 px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none active:scale-95"
                >
                  {actionId === idea.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  <span>Permanently Delete</span>
                </button>
              </>
            )}
          </div>
        </div>

        {!isArchived && idea.supports.length > 0 && (
          <div className="pt-2 space-y-1.5 border-t border-white/5">
            <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Agreement Timeline:</span>
            <div className="flex flex-wrap gap-1.5">
              {idea.supports.map(v => (
                <div key={v.userId} className="flex items-center gap-1.5 bg-white/5 border border-white/5 rounded-lg px-2 py-1">
                  {v.user.profilePhoto ? (
                    <img src={v.user.profilePhoto} alt={v.user.name} className="w-3.5 h-3.5 rounded-full object-cover" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center font-bold text-[6px] uppercase">{v.user.name.charAt(0)}</div>
                  )}
                  <span className="text-[10px] font-bold text-zinc-300">{v.user.name}</span>
                  <span className="text-[9px] text-zinc-500" suppressHydrationWarning>• {formatRelativeTime(v.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

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

                  <button 
                    onClick={() => setReplyModalId(d.id)}
                    className="absolute top-2 right-2 text-[9px] text-zinc-500 hover:text-white flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition-colors"
                  >
                    <MessageSquare size={10} /> Reply
                  </button>

                  <AnimatePresence>
                    {replyModalId === d.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pl-5 mt-2">
                        <form onSubmit={(e) => handleReplySubmit(e, d.id)} className="flex items-end gap-2">
                          <div className="flex-1 bg-zinc-950/60 border border-white/10 rounded-xl px-3 py-2 flex items-center focus-within:border-white/30 transition-colors">
                            <input
                              type="text"
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder="Type a reply..."
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
                  placeholder="Explain your concerns..."
                  rows={2}
                  className="w-full bg-zinc-950/60 border border-red-500/20 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 resize-none"
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
                            <span className="text-[9px] text-zinc-500" suppressHydrationWarning>• {formatDateTime(log.createdAt)}</span>
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
    open: 'No open proposals right now.',
    queued: 'No ideas in execution queue.',
    declined: 'No declined proposals.',
    shelved: 'No shelved proposals.',
    deleted: 'No deleted proposals.',
  }

  const bannerMessages: Record<string, { icon: React.ReactNode; color: string; text: string } | null> = {
    open: null,
    queued: { icon: <ArrowRightCircle size={14} className="shrink-0 mt-0.5 text-purple-400" />, color: 'bg-purple-500/5 border-purple-500/10 text-purple-300/80', text: 'Execution Queue — Ideas approved by the team.' },
    declined: { icon: <AlertTriangle size={14} className="shrink-0 mt-0.5 text-red-400" />, color: 'bg-red-500/5 border-red-500/10 text-red-300/70', text: 'Declined Archive — Proposals reviewed but not approved.' },
    shelved: { icon: <Pause size={14} className="shrink-0 mt-0.5 text-zinc-400" />, color: 'bg-zinc-500/5 border-zinc-500/10 text-zinc-300/70', text: 'Shelved Ideas — Paused for later.' },
    deleted: { icon: <Trash2 size={14} className="shrink-0 mt-0.5 text-zinc-500" />, color: 'bg-zinc-500/5 border-zinc-500/10 text-zinc-300/70', text: 'Deleted Archives — Past history preserved.' },
  }

  return (
    <div className="bg-zinc-950/20 border border-white/5 rounded-xl md:rounded-3xl p-4 sm:p-6 md:p-8 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
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
            className="text-xs bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2.5 rounded-xl font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none shrink-0 w-full sm:w-auto shadow-md shadow-yellow-500/10 active:scale-95 border-0"
          >
            <Plus size={14} className="stroke-[3]" /> New Proposal
          </button>
        )}
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <form onSubmit={handleAddIdea} className="bg-zinc-950/40 border border-white/5 p-4 sm:p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Submit New Proposal</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase text-zinc-500 font-bold">Proposal Title</label>
                  <input type="text" name="name" required placeholder="e.g., Weekly Team Meetup"
                    className="w-full bg-zinc-950/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-yellow-500/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase text-zinc-500 font-bold">Proposal Type</label>
                  <select name="type" className="w-full bg-zinc-950/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-500/50">
                    <option value="IDEA">Idea (10pts on finish)</option>
                    <option value="ACTION">Action (Timed pts)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase text-zinc-500 font-bold">Priority</label>
                  <select name="priority" className="w-full bg-zinc-950/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-500/50">
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-zinc-500 font-bold">Details / Explanation</label>
                <textarea name="description" required rows={3} placeholder="Explain the idea..."
                  className="w-full bg-zinc-950/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-yellow-500/50 resize-none" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-4 mt-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">Idea Creator / Author (10 pts)</label>
                  <div className="flex flex-wrap gap-1.5 p-2 bg-zinc-950/60 border border-white/10 rounded-xl min-h-[38px]">
                     {members.filter(m => m.role !== 'ADMIN').map(m => (
                       <button
                         type="button"
                         key={m.id}
                         onClick={() => setSelectedCreatorId(m.id)}
                         className={`px-2 py-1 text-[9px] rounded-lg border transition-colors cursor-pointer ${
                           selectedCreatorId === m.id 
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
                    className="w-full bg-zinc-950/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-500/50 transition-all"
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
                <button type="submit" disabled={isSubmitting} className="text-xs bg-yellow-500 text-black hover:bg-yellow-400 px-4 py-2 rounded-xl font-bold disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-md shadow-yellow-500/5">
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
      <div className="space-y-0 md:space-y-4">
        {currentList.length === 0 ? (
          <div className="text-center py-12 bg-[#09090b]/10 border border-dashed border-white/5 md:rounded-3xl text-muted-foreground text-xs italic">
            {emptyMessages[activeTab]}
          </div>
        ) : (
          <div className="flex flex-col md:gap-4">{currentList.map(idea => renderIdeaCard(idea))}</div>
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
