'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, Edit2, Trash2, Clock, CheckCircle2, 
  AlertTriangle, Lightbulb, Zap, Archive, Sparkles, MessageSquare, Plus, Activity
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { 
  updateWorkStatus, editWork, 
  addWorkUpdate, permanentlyDeleteWork, logWorkTime
} from '@/app/actions'
import DateTimePicker from '@/components/DateTimePicker'

export default function WorkDetailClient({ work, currentUser, allUsers }: any) {
  const router = useRouter()
  const { addToast, showConfirm } = useStore()

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(work.name)
  const [editDesc, setEditDesc] = useState(work.description || '')
  const [editPriority, setEditPriority] = useState(work.priority)
  const [editAssigneeIds, setEditAssigneeIds] = useState<string[]>(work.assignees?.map((a: any) => a.id) || [])
  const [editDeadline, setEditDeadline] = useState<Date | null>(work.dueDate ? new Date(work.dueDate) : null)
  const [isUpdating, setIsUpdating] = useState(false)

  const [updateText, setUpdateText] = useState('')
  const [isPostingUpdate, setIsPostingUpdate] = useState(false)

  const isAdmin = currentUser.role === 'ADMIN'
  const isCreator = currentUser.id === work.creatorId
  const canManage = isAdmin || isCreator
  
  const isCompleted = work.status === 'COMPLETED'
  const isArchived = work.status === 'ARCHIVED'
  const isDeleted = work.status === 'DELETED'
  const isBlocked = work.status === 'BLOCKED'

  const totalPoints = work.timeLogs?.reduce((acc: number, log: any) => acc + log.points, 0) || 0

  const getPriorityBadge = () => {
    switch (work.priority) {
      case 'URGENT':
        return <span className="text-[10px] font-black uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md animate-pulse">Urgent</span>
      case 'HIGH':
        return <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-md">High</span>
      case 'LOW':
        return <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-500/10 border border-zinc-500/20 px-2 py-0.5 rounded-md">Low</span>
      default:
        return <span className="text-[10px] font-bold uppercase tracking-wider text-[#63BDF2] bg-[#63BDF2]/10 border border-[#63BDF2]/20 px-2 py-0.5 rounded-md">Medium</span>
    }
  }

  const getTypeBadge = () => {
    return (
      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
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
        return <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full"><Lightbulb size={12} /> Idea</span>
      case 'ACTIVE':
        return <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full"><Zap size={12} /> Active</span>
      case 'BLOCKED':
        return <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-red-400 bg-red-500/20 border border-red-500/30 px-2.5 py-1 rounded-full"><AlertTriangle size={12} /> Blocked</span>
      case 'COMPLETED':
        return <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full"><CheckCircle2 size={12} /> Completed</span>
      case 'ARCHIVED':
        return <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-500/10 border border-zinc-500/20 px-2.5 py-1 rounded-full"><Archive size={12} /> Archived</span>
      case 'DELETED':
        return <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-900/40 border border-red-500/30 px-2.5 py-1 rounded-full"><Trash2 size={12} /> Deleted</span>
      default:
        return <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white bg-white/10 border border-white/20 px-2.5 py-1 rounded-full">{work.status}</span>
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editName.trim()) return
    setIsUpdating(true)
    try {
      const formData = new FormData()
      formData.append('name', editName)
      formData.append('description', editDesc)
      formData.append('priority', editPriority)
      editAssigneeIds.forEach(id => formData.append('assigneeIds', id))
      if (editDeadline) formData.append('dueDate', editDeadline.toISOString())
      
      const res = await editWork(work.id, formData)
      if (res.success) {
        addToast('Details updated successfully', 'success')
        setIsEditing(false)
        router.refresh()
      } else {
        addToast(res.error || 'Failed to update', 'error')
      }
    } catch (e: any) {
      addToast(e.message, 'error')
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!updateText.trim()) return
    setIsPostingUpdate(true)
    try {
      const res = await addWorkUpdate(work.id, updateText)
      if (res.success) {
        setUpdateText('')
        addToast('Update posted', 'success')
        router.refresh()
      } else {
        addToast(res.error || 'Failed to post', 'error')
      }
    } catch (e: any) {
      addToast(e.message, 'error')
    } finally {
      setIsPostingUpdate(false)
    }
  }

  const handleComplete = async () => {
    const confirmed = await showConfirm({
      title: 'Complete Work',
      message: 'Are you sure you want to mark this as completed?',
      confirmText: 'Yes, Complete',
      cancelText: 'Cancel'
    })
    if (confirmed) {
      setIsUpdating(true)
      try {
        const res = await updateWorkStatus(work.id, 'COMPLETED')
        if (res.success) {
          addToast('Work marked as completed!', 'success')
          router.refresh()
        } else {
          addToast(res.error || 'Failed to complete', 'error')
        }
      } catch (e: any) {
        addToast(e.message, 'error')
      } finally {
        setIsUpdating(false)
      }
    }
  }

  const handleDelete = async () => {
    const confirmed = await showConfirm({
      title: 'Delete Work',
      message: 'Are you sure you want to permanently delete this? It will be removed completely.',
      confirmText: 'Yes, Delete Permanently',
      cancelText: 'Cancel',
      danger: true
    })
    if (confirmed) {
      setIsUpdating(true)
      try {
        const res = await permanentlyDeleteWork(work.id)
        if (res.success) {
          addToast('Deleted permanently', 'success')
          router.push('/works')
        } else {
          addToast(res.error || 'Failed to delete', 'error')
        }
      } catch (e: any) {
        addToast(e.message, 'error')
      } finally {
        setIsUpdating(false)
      }
    }
  }

  const timeline = [...(work.workUpdates || []), ...(work.activityLogs || [])].sort(
    (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="min-h-full w-full bg-[#0c0d12] relative overflow-hidden flex flex-col">
      {/* Dynamic Background Glow based on status */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] rounded-full blur-[120px] pointer-events-none opacity-20 ${
        isCompleted ? 'bg-emerald-500' : isBlocked ? 'bg-red-500' : 'bg-[#63BDF2]'
      }`} />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0c0d12]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-3">
          {canManage && !isCompleted && !isDeleted && (
            <>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 rounded-xl bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={handleComplete}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-black text-xs uppercase tracking-wider hover:bg-emerald-400 transition-colors cursor-pointer"
              >
                Mark Complete
              </button>
            </>
          )}
          {isAdmin && (
            <button 
              onClick={handleDelete}
              className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors cursor-pointer"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Top Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 bg-white/[0.02] border border-white/5 rounded-3xl p-8 relative overflow-hidden"
          >
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <input 
                  autoFocus
                  type="text" 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-[#09090b]/80 border border-[#63BDF2]/40 rounded-xl px-4 py-3 text-xl font-black text-white focus:outline-none"
                  placeholder="Work Title"
                />
                <textarea 
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  rows={4}
                  className="w-full bg-[#09090b]/80 border border-[#63BDF2]/40 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none resize-none"
                  placeholder="Description..."
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Priority</label>
                    <select 
                      value={editPriority}
                      onChange={e => setEditPriority(e.target.value)}
                      className="w-full bg-[#09090b]/80 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#63BDF2]/50"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="URGENT">URGENT</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Deadline</label>
                    <DateTimePicker 
                      value={editDeadline ? editDeadline.toISOString() : ''}
                      onChange={(val: string) => setEditDeadline(val ? new Date(val) : null)}
                      placeholder="Select Deadline"
                      className="border-white/10 focus-within:border-[#63BDF2]/50"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsEditing(false)} className="text-xs text-zinc-400 hover:text-white px-3 py-2 cursor-pointer">Cancel</button>
                  <button type="submit" disabled={isUpdating} className="bg-gradient-to-r from-[#63BDF2] to-[#3188DA] text-black px-6 py-2 text-xs font-black uppercase tracking-wider rounded-xl hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  {getStatusBadge()}
                  {getTypeBadge()}
                  {getPriorityBadge()}
                  {totalPoints > 0 && (
                    <div className="flex items-center gap-1.5 bg-[#63BDF2]/10 border border-[#63BDF2]/20 px-3 py-1 rounded-full text-[10px] font-bold text-[#63BDF2]">
                      <Sparkles size={12} />
                      <span>{totalPoints} pts total</span>
                    </div>
                  )}
                </div>

                <h1 className={`text-3xl md:text-4xl font-black tracking-tight text-white ${
                  isCompleted || isArchived || isDeleted ? 'line-through text-muted-foreground' : ''
                }`}>
                  {work.name}
                </h1>
                
                <p className="text-base text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {work.description}
                </p>

                {work.dueDate && (
                  <div className="flex items-center gap-2 text-xs text-orange-400/90 font-bold bg-orange-500/5 border border-orange-500/10 px-3 py-1.5 rounded-xl w-fit">
                    <Clock size={14} />
                    <span>Deadline: <span suppressHydrationWarning>{new Date(work.dueDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span></span>
                  </div>
                )}
              </div>
            )}

            {/* People Section */}
            <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Created By</h4>
                <div className="flex items-center gap-3">
                  {work.creator?.profilePhoto ? (
                    <img src={work.creator.profilePhoto} alt={work.creator.name} className="w-8 h-8 rounded-full object-cover border-2 border-white/10" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#3188DA]/20 text-[#3188DA] flex items-center justify-center font-bold text-xs uppercase border-2 border-[#3188DA]/30">
                      {work.creator?.name ? work.creator.name.charAt(0) : '?'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-white leading-none mb-1">{work.creator?.name || 'System'}</p>
                    {work.creator && (
                      <span className="text-[9px] text-muted-foreground border border-white/10 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest bg-white/5">
                        {work.creator.customRole || work.creator.role}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Assigned To</h4>
                {work.assignees && work.assignees.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {work.assignees.map((assignee: any) => (
                      <div key={assignee.id} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full pr-3 p-1">
                        {assignee.profilePhoto ? (
                          <img src={assignee.profilePhoto} alt={assignee.name} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-[#63BDF2]/20 text-[#63BDF2] flex items-center justify-center font-bold text-[9px] uppercase">
                            {assignee.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-white leading-none">{assignee.name}</span>
                          <span className="text-[8px] text-muted-foreground">{assignee.customRole || assignee.role}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic py-2">No assignees yet</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Deep Details split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Quick Updates Form */}
            <div className="lg:col-span-1 space-y-6">
              {!isCompleted && !isDeleted && (
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4 flex items-center gap-2">
                    <Plus size={14} className="text-[#63BDF2]" /> Post Update
                  </h3>
                  <form onSubmit={handlePostUpdate} className="space-y-3">
                    <textarea
                      value={updateText}
                      onChange={e => setUpdateText(e.target.value)}
                      placeholder="What's the latest progress?"
                      rows={3}
                      className="w-full bg-[#09090b]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#63BDF2]/50 resize-none"
                    />
                    <button
                      type="submit"
                      disabled={isPostingUpdate || !updateText.trim()}
                      className="w-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-3 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Post Quick Update
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Right: Timeline */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-white mb-8 flex items-center gap-2">
                  <Activity size={14} className="text-[#63BDF2]" /> Activity Timeline
                </h3>
                
                {timeline.length > 0 ? (
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                    {timeline.map((item: any) => {
                      const isUpdate = !!item.update
                      const user = item.user
                      return (
                        <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                          {/* Marker */}
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0c0d12] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_1px_rgba(255,255,255,0.05)] z-10 ${
                            isUpdate ? 'bg-[#3188DA]' : 'bg-zinc-800'
                          }`}>
                            {isUpdate ? <MessageSquare size={14} className="text-white" /> : <Activity size={14} className="text-zinc-400" />}
                          </div>
                          
                          {/* Card */}
                          <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                              {user?.profilePhoto ? (
                                <img src={user.profilePhoto} alt={user.name} className="w-5 h-5 rounded-full object-cover" />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-[#63BDF2]/20 text-[#63BDF2] flex items-center justify-center font-bold text-[9px] uppercase">
                                  {user?.name ? user.name.charAt(0) : '?'}
                                </div>
                              )}
                              <span className="text-xs font-bold text-white">{user?.name || 'System'}</span>
                              <span className="text-[9px] text-zinc-500" suppressHydrationWarning>
                                {new Date(item.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                              </span>
                            </div>
                            
                            <p className={`text-sm leading-relaxed ${isUpdate ? 'text-zinc-300 whitespace-pre-wrap' : 'text-zinc-500 italic'}`}>
                              {item.update || item.action}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-center text-sm text-zinc-500 py-12">No activity recorded yet.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
