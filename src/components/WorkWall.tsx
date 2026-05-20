'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, FolderGit2, SlidersHorizontal, Grid, List, CheckCircle2, 
  Circle, Archive, AlertTriangle, User, ShieldAlert, Sparkles, Filter, Loader2, Plus 
} from 'lucide-react'
import WorkCard from './WorkCard'
import { updateWorkStatus } from '@/app/actions'
import { getMembers } from '@/app/actions/admin'
import { useStore } from '@/store/useStore'

function CustomDropdown({ 
  label, 
  value, 
  onChange, 
  options,
  chevronColor = 'text-muted-foreground'
}: { 
  label: string, 
  value: string, 
  onChange: (val: string) => void, 
  options: { value: string, label: string }[],
  chevronColor?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null)
  const activeOption = options.find(o => o.value === value) || options[0]

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setTriggerRect(rect)
    setIsOpen(!isOpen)
  }

  const getDropdownStyle = () => {
    if (!triggerRect) return {}
    const dropdownWidth = 208 // w-52 is 13rem = 208px
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 360
    
    // Position left aligned with trigger button, bounded by viewport edges (min 8px gap)
    const left = Math.max(8, Math.min(triggerRect.left, viewportWidth - dropdownWidth - 8))
    
    return {
      position: 'fixed' as const,
      top: triggerRect.bottom + 6,
      left,
      zIndex: 999,
    }
  }

  return (
    <div className="relative select-none">
      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center justify-between gap-2 bg-[#0c0d12]/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white hover:border-white/20 transition-all cursor-pointer min-w-[140px]"
      >
        <div className="flex items-center gap-1 text-left">
          <span className="text-[10px] text-muted-foreground uppercase">{label}:</span>
          <span className="uppercase truncate max-w-[80px]">{activeOption.label}</span>
        </div>
        <span className={`text-[9px] ${chevronColor} transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      <AnimatePresence>
        {isOpen && triggerRect && (
          <>
            {/* Full-screen click-away backdrop — z-[998] so below panel */}
            <div
              className="fixed inset-0 z-[998]"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown panel — fixed positioned, always on top of EVERYTHING */}
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              style={getDropdownStyle()}
              className="w-52 bg-[#0d0e12] border border-white/15 rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.7)] overflow-hidden backdrop-blur-xl"
            >
              <div className="py-1 max-h-64 overflow-y-auto custom-scrollbar">
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value)
                      setIsOpen(false)
                    }}
                    className={`w-full text-left px-4 py-3 text-xs transition-colors hover:bg-white/5 cursor-pointer uppercase font-semibold tracking-wide ${
                      opt.value === value ? 'text-[#63BDF2] bg-[#63BDF2]/8 font-black' : 'text-white/80'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function WorkWall({ works, currentUser }: { works: any[], currentUser: any }) {
  const [activeScope, setActiveScope] = useState<'all' | 'focus'>('all')
  const [statusFilter, setStatusFilter] = useState('ALL') // ALL, IDEA, ACTIVE, BLOCKED, COMPLETED, ARCHIVED
  const [priorityFilter, setPriorityFilter] = useState('ALL') // ALL, LOW, MEDIUM, HIGH, URGENT
  const [memberFilter, setMemberFilter] = useState('ALL') // ALL, or user ID
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [members, setMembers] = useState<any[]>([])
  const [isUpdatingRow, setIsUpdatingRow] = useState<string | null>(null)
  const { setAddWorkModalOpen } = useStore()

  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'IDEA', label: 'Idea' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'BLOCKED', label: 'Blocked' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'ARCHIVED', label: 'Archived' },
  ]

  const priorityOptions = [
    { value: 'ALL', label: 'All Priorities' },
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
  ]

  const memberOptions = [
    { value: 'ALL', label: 'All Members' },
    ...members.map(m => ({ value: m.id, label: m.name }))
  ]

  useEffect(() => {
    async function loadMembers() {
      try {
        const list = await getMembers()
        setMembers(list)
      } catch (e) {
        console.error(e)
      }
    }
    loadMembers()
  }, [])

  // Filter logic: Scope selection (Global Wall vs My Daily Focus)
  const scopedWorks = works.filter(w => {
    if (activeScope === 'focus') {
      if (!currentUser) return false
      // My focus area shows works assigned to me OR blocked/idea/active works I created
      const isAssignedToMe = w.assigneeId === currentUser.id
      const isCreatedByMeAndUnresolved = w.creatorId === currentUser.id && ['BLOCKED', 'IDEA', 'ACTIVE'].includes(w.status)
      return isAssignedToMe || isCreatedByMeAndUnresolved
    }
    return true
  })

  // Filter works by user selections (status, priority, member, search keyword)
  const filteredWorks = scopedWorks.filter(w => {
    // Status
    const matchesStatus = statusFilter === 'ALL' ? true : w.status === statusFilter
    
    // Priority
    const matchesPriority = priorityFilter === 'ALL' ? true : w.priority === priorityFilter
    
    // Member
    const matchesMember = memberFilter === 'ALL' 
      ? true 
      : (w.assigneeId === memberFilter || w.creatorId === memberFilter)

    // Search Keyword
    const matchesSearch = 
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.creator?.name && w.creator.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (w.assignee?.name && w.assignee.name.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesStatus && matchesPriority && matchesMember && matchesSearch
  })

  const handleTableRowStatusChange = async (id: string, newStatus: string) => {
    setIsUpdatingRow(id)
    try {
      await updateWorkStatus(id, newStatus)
    } catch (e) {
      console.error(e)
    } finally {
      setIsUpdatingRow(null)
    }
  }

  // Count metrics for quick HUD display
  const blockedCount = works.filter(w => w.status === 'BLOCKED').length
  const myWorkCount = currentUser 
    ? works.filter(w => w.assigneeId === currentUser.id).length 
    : 0

  return (
    <div className="space-y-6">
      {/* Top Scope Selector (Daily Focus Tab vs Global Pipeline Tab) */}
      <div className="flex w-full sm:w-fit bg-[#09090b]/60 p-1.5 rounded-2xl border border-white/10 select-none">
        <button
          onClick={() => {
            setActiveScope('all')
            setStatusFilter('ALL')
          }}
          className={`relative flex-1 sm:flex-initial px-2 sm:px-4 py-2 text-xs font-black rounded-xl transition-all whitespace-nowrap cursor-pointer uppercase tracking-wider ${
            activeScope === 'all' ? 'text-black z-10' : 'text-muted-foreground hover:text-white'
          }`}
        >
          {activeScope === 'all' && (
            <motion.span
              layoutId="activeScopeTab"
              className="absolute inset-0 bg-gradient-to-r from-[#63BDF2] to-[#3188DA] rounded-xl shadow-lg"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center justify-center gap-1.5">
            <FolderGit2 size={13} />
            <span><span className="hidden sm:inline">Global </span>Workspace Wall</span>
          </span>
        </button>

        <button
          onClick={() => {
            setActiveScope('focus')
            setStatusFilter('ALL')
          }}
          className={`relative flex-1 sm:flex-initial px-2 sm:px-4 py-2 text-xs font-black rounded-xl transition-all whitespace-nowrap cursor-pointer uppercase tracking-wider ${
            activeScope === 'focus' ? 'text-black z-10' : 'text-muted-foreground hover:text-white'
          }`}
        >
          {activeScope === 'focus' && (
            <motion.span
              layoutId="activeScopeTab"
              className="absolute inset-0 bg-gradient-to-r from-[#63BDF2] to-[#3188DA] rounded-xl shadow-lg"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center justify-center gap-1.5">
            <User size={13} />
            <span>My Focus <span className="hidden sm:inline">Area</span> ({myWorkCount})</span>
          </span>
        </button>
      </div>

      {/* Control Bar: Search & Select Dropdown Filters */}
      <div className="bg-[#09090b]/40 border border-white/5 p-4 rounded-3xl backdrop-blur-xl flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
        
        {/* Left: Search Box */}
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            placeholder="Search works, creators, assignees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0c0d12]/60 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-[#63BDF2]/60 focus:ring-1 focus:ring-[#63BDF2]/20 transition-all font-medium"
          />
          <Search className="absolute left-3 top-3 text-muted-foreground" size={14} />
        </div>

        {/* Right: Select Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter Custom Dropdown */}
          <CustomDropdown
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
          />

          {/* Priority Filter Custom Dropdown */}
          <CustomDropdown
            label="Priority"
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={priorityOptions}
          />

          {/* Member Filter Custom Dropdown */}
          <CustomDropdown
            label="Member"
            value={memberFilter}
            onChange={setMemberFilter}
            options={memberOptions}
          />

          {/* Grid vs Table Layout selection (Hidden on Mobile) */}
          <div className="hidden md:flex bg-[#0c0d12]/60 p-1 rounded-xl border border-white/10 shrink-0 select-none">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-black' : 'text-muted-foreground hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid size={14} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-black' : 'text-muted-foreground hover:text-white'
              }`}
              title="Table View"
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Blocked Works Header Alert (Warns when active projects are blocked) */}
      {blockedCount > 0 && activeScope === 'all' && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-3xl flex items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="animate-pulse" />
            <span>There are currently <strong className="font-black text-white">{blockedCount} works marked as BLOCKED</strong>. Admins and team members should review and help resolve blocker issues.</span>
          </div>
          <button 
            onClick={() => {
              setStatusFilter('BLOCKED')
              setPriorityFilter('ALL')
              setMemberFilter('ALL')
            }}
            className="bg-red-500 hover:bg-red-600 text-black px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] tracking-wider cursor-pointer"
          >
            Review Blocks
          </button>
        </div>
      )}

      {/* Grid or Table listing display */}
      {filteredWorks.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-64 rounded-3xl border border-dashed border-white/10 bg-[#09090b]/40 flex flex-col items-center justify-center text-center p-8 space-y-3"
        >
          <div className="p-3 bg-white/5 border border-white/5 rounded-full text-muted-foreground">
            <SlidersHorizontal size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">No matching work files found</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">Try refining your keyword search, removing dropdown filters, or checking your status settings.</p>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Grid Layout View (Fallback for small mobile screens) */}
          <div className={viewMode === 'grid' ? 'block' : 'block md:hidden'}>
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredWorks.map(work => (
                  <WorkCard key={work.id} work={work} currentUser={currentUser} />
                ))}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Table Layout View (For large desktop viewports) */}
          {viewMode === 'table' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="hidden md:block border border-white/10 rounded-3xl overflow-hidden bg-background/30 backdrop-blur-xl"
            >
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary/40 text-muted-foreground border-b border-white/5 text-[10px] font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Task Details</th>
                      <th className="px-6 py-4">Team Assignees</th>
                      <th className="px-6 py-4 text-center">Priority</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Sprint Value</th>
                      <th className="px-6 py-4 text-right">Interactive Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {filteredWorks.map((work) => {
                      const isRowCompleted = work.status === 'COMPLETED'
                      const isRowArchived = work.status === 'ARCHIVED'
                      const isRowBlocked = work.status === 'BLOCKED'

                      // User permissions check
                      const isRowCreatorOrAssignee = currentUser && (work.creatorId === currentUser.id || work.assigneeId === currentUser.id)
                      const isAuthorizedRow = currentUser?.role === 'ADMIN' || isRowCreatorOrAssignee

                      return (
                        <tr key={work.id} className="hover:bg-secondary/15 transition-all">
                          {/* Title & description details */}
                          <td className="px-6 py-4 max-w-xs">
                            <div className="space-y-1">
                              <p className={`font-bold text-white mb-1 ${isRowCompleted || isRowArchived ? 'line-through text-muted-foreground' : ''}`}>{work.name}</p>
                              <p className="text-[10px] text-muted-foreground line-clamp-1">{work.description}</p>
                              {work.dueDate && (
                                <p className="text-[9px] text-orange-400/90 font-semibold" suppressHydrationWarning>Due: {new Date(work.dueDate).toLocaleDateString()}</p>
                              )}
                              {isRowBlocked && work.blockedReason && (
                                <p className="text-[10px] text-red-400 font-bold italic line-clamp-1">Blocked: {work.blockedReason}</p>
                              )}
                            </div>
                          </td>

                          {/* Creator & Assignee */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1.5 text-[10px]">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] text-muted-foreground w-11 uppercase">Creator:</span>
                                {work.creator?.profilePhoto ? (
                                  <img src={work.creator.profilePhoto} alt={work.creator.name} className="w-4 h-4 rounded-full object-cover" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full bg-[#3188DA]/20 text-[#3188DA] flex items-center justify-center font-bold text-[8px]">
                                    {work.creator?.name ? work.creator.name.charAt(0) : '?'}
                                  </div>
                                )}
                                <span className="text-white font-medium truncate max-w-[90px]">{work.creator?.name || 'System'}</span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] text-muted-foreground w-11 uppercase">Assignee:</span>
                                {work.assignee ? (
                                  <>
                                    {work.assignee.profilePhoto ? (
                                      <img src={work.assignee.profilePhoto} alt={work.assignee.name} className="w-4 h-4 rounded-full object-cover" />
                                    ) : (
                                      <div className="w-4 h-4 rounded-full bg-[#63BDF2]/20 text-[#63BDF2] flex items-center justify-center font-bold text-[8px]">
                                        {work.assignee.name.charAt(0)}
                                      </div>
                                    )}
                                    <span className="text-white font-medium truncate max-w-[90px]">{work.assignee.name}</span>
                                  </>
                                ) : (
                                  <span className="text-zinc-500 italic">Unassigned</span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Priority */}
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              work.priority === 'URGENT' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              work.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                              work.priority === 'LOW' ? 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20' :
                              'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                              {work.priority}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              isRowCompleted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              isRowBlocked ? 'bg-red-500/15 text-red-400 border border-red-500/25 animate-pulse font-black' :
                              work.status === 'IDEA' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                              isRowArchived ? 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20' :
                              'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                              {work.status}
                            </span>
                          </td>

                          {/* Sprint points */}
                          <td className="px-6 py-4 text-right font-bold text-[#63BDF2] font-mono">
                            +{work.points || 10} PTS
                          </td>

                          {/* Interactive Row Actions */}
                          <td className="px-6 py-4 text-right">
                            {isAuthorizedRow ? (
                              <div className="flex items-center justify-end gap-1.5">
                                {isUpdatingRow === work.id ? (
                                  <Loader2 size={12} className="animate-spin text-muted-foreground" />
                                ) : (
                                  <>
                                    {work.status !== 'ACTIVE' && !isRowCompleted && !isRowArchived && (
                                      <button 
                                        onClick={() => handleTableRowStatusChange(work.id, 'ACTIVE')}
                                        className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/25 px-2 py-0.5 rounded text-[9px] font-bold uppercase"
                                      >
                                        Start
                                      </button>
                                    )}
                                    {!isRowCompleted && !isRowArchived && (
                                      <button 
                                        onClick={() => handleTableRowStatusChange(work.id, 'COMPLETED')}
                                        className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded text-[9px] font-bold uppercase"
                                      >
                                        Complete
                                      </button>
                                    )}
                                    {!isRowArchived && (
                                      <button 
                                        onClick={() => handleTableRowStatusChange(work.id, 'ARCHIVED')}
                                        className="bg-zinc-500/10 hover:bg-zinc-500/20 text-zinc-400 border border-zinc-500/25 px-2 py-0.5 rounded text-[9px] font-bold uppercase"
                                      >
                                        Archive
                                      </button>
                                    )}
                                    {(isRowCompleted || isRowArchived || isRowBlocked) && (
                                      <button 
                                        onClick={() => handleTableRowStatusChange(work.id, 'IDEA')}
                                        className="bg-[#63BDF2]/10 hover:bg-[#63BDF2]/20 text-[#63BDF2] border border-[#63BDF2]/25 px-2 py-0.5 rounded text-[9px] font-bold uppercase"
                                      >
                                        Move to Idea
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-zinc-600 italic">No permissions</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
