'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FolderGit2, SlidersHorizontal, Info, Calendar, Sparkles, Grid, List, CheckCircle2, Circle, Archive } from 'lucide-react'
import WorkCard from './WorkCard'
import { updateWorkStatus } from '@/app/actions'

// Helper component for Table Row Actions (Supports Dynamic Point Allocation!)
function TableRowAdminActions({ work }: { work: any }) {
  const [points, setPoints] = useState(work.points || 10)
  const [isUpdating, setIsUpdating] = useState(false)

  const isCompleted = work.status === 'Completed'
  const isArchived = work.status === 'Archived'
  const isPending = work.status === 'Pending'

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      await updateWorkStatus(work.id, newStatus, points)
    } catch (e) {
      console.error(e)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex items-center justify-end gap-3 flex-wrap">
      {/* Points setting next to action */}
      {(isPending || (!isCompleted && !isArchived)) && (
        <div className="flex items-center gap-1.5 bg-[#63BDF2]/5 border border-[#63BDF2]/15 px-2 py-0.5 rounded-lg">
          <span className="text-[9px] font-bold text-muted-foreground">PTS:</span>
          <input
            type="number"
            min="0"
            value={points}
            onChange={(e) => setPoints(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-10 bg-transparent border-none text-center text-xs font-bold font-mono text-[#63BDF2] focus:outline-none"
          />
        </div>
      )}

      <div className="flex items-center gap-1.5">
        {isPending && (
          <button 
            onClick={() => handleStatusChange('Active')}
            disabled={isUpdating}
            className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 size={10} /> Approve
          </button>
        )}
        {!isCompleted && !isArchived && !isPending && (
          <button 
            onClick={() => handleStatusChange('Completed')}
            disabled={isUpdating}
            className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 size={10} /> Complete
          </button>
        )}
        {!isArchived && !isPending && (
          <button 
            onClick={() => handleStatusChange('Archived')}
            disabled={isUpdating}
            className="bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/25 text-orange-400 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <Archive size={10} /> Archive
          </button>
        )}
        {(isCompleted || isArchived) && (
          <button 
            onClick={() => handleStatusChange('Active')}
            disabled={isUpdating}
            className="bg-[#63BDF2]/10 hover:bg-[#63BDF2]/20 border border-[#63BDF2]/25 text-[#63BDF2] px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <Circle size={10} /> Activate
          </button>
        )}
      </div>
    </div>
  )
}

export default function WorkWall({ works, currentUser }: { works: any[], currentUser: any }) {
  const [filter, setFilter] = useState('Active')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  // Secure visibility logic: 
  // - Active, Completed, and Archived works are visible to everyone.
  // - Pending works are ONLY visible to Admins OR the member who created the request.
  const visibleWorks = works.filter(w => {
    if (w.status !== 'Pending') return true
    return currentUser?.role === 'ADMIN' || w.creatorId === currentUser?.id
  })

  const hasPending = works.some(w => w.status === 'Pending' && (currentUser?.role === 'ADMIN' || w.creatorId === currentUser?.id))

  const filterTabs = [
    'Active',
    'Completed',
    'Archived',
    ...(hasPending ? ['Pending'] : []),
    'All'
  ]

  // Filter works by state and search keyword
  const filteredWorks = visibleWorks.filter(w => {
    const matchesFilter = filter === 'All' ? true : w.status === filter
    const matchesSearch = 
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.creator?.name && w.creator.name.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesFilter && matchesSearch
  })

  return (
    <div className="space-y-8">
      {/* Top HUD Header Control Panel */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#63BDF2]/10 border border-[#63BDF2]/20 text-[#63BDF2] rounded-2xl shadow-inner">
            <FolderGit2 size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Work Pipeline <span className="text-[10px] uppercase font-bold tracking-wider text-[#63BDF2] bg-[#63BDF2]/10 border border-[#63BDF2]/20 px-2 py-0.5 rounded">Realtime</span>
            </h2>
            <p className="text-xs text-muted-foreground">Showing {filteredWorks.length} async projects currently indexed.</p>
          </div>
        </div>

        {/* Dynamic Filters & Search Desk */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search works or creators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#09090b]/80 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-[#63BDF2]/60 focus:ring-1 focus:ring-[#63BDF2]/20 transition-all font-medium"
            />
            <Search className="absolute left-3 top-3 text-muted-foreground" size={14} />
          </div>

          {/* Styled Segmented Selector Tabs */}
          <div className="flex bg-[#09090b]/60 p-1 rounded-xl border border-white/10 overflow-x-auto custom-scrollbar shrink-0 max-w-full">
            {filterTabs.map(f => {
              const isActive = filter === f
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`relative px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer select-none uppercase tracking-wider ${
                    isActive ? 'text-black z-10' : 'text-muted-foreground hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeFilterTab"
                      className="absolute inset-0 bg-white rounded-lg shadow-md"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{f}</span>
                </button>
              )
            })}
          </div>

          {/* View Toggles (Grid vs Table) - Hidden on Mobile */}
          <div className="hidden md:flex bg-[#09090b]/60 p-1 rounded-xl border border-white/10 shrink-0 select-none">
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

      {/* Grid vs Table layouts */}
      {filteredWorks.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-64 rounded-3xl border border-dashed border-white/10 bg-secondary/5 flex flex-col items-center justify-center text-center p-8 space-y-3"
        >
          <div className="p-3 bg-white/5 border border-white/5 rounded-full text-muted-foreground">
            <SlidersHorizontal size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">No work requests found</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">Try refining your keyword search or select a different status filter tab.</p>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Grid View (Visible on Mobile, or when viewMode is 'grid' on Desktop) */}
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

          {/* Table View (Desktop Only when viewMode is 'table') */}
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
                      <th className="px-6 py-4">Task / Project</th>
                      <th className="px-6 py-4">Creator</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Value</th>
                      {currentUser?.role === 'ADMIN' && <th className="px-6 py-4 text-right">Admin Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {filteredWorks.map((work) => (
                      <tr key={work.id} className="hover:bg-secondary/15 transition-all">
                        {/* Task details */}
                        <td className="px-6 py-4 max-w-sm">
                          <p className={`font-bold text-white mb-1 ${work.status === 'Completed' || work.status === 'Archived' ? 'line-through text-muted-foreground' : ''}`}>{work.name}</p>
                          <p className="text-[10px] text-muted-foreground line-clamp-1">{work.description}</p>
                        </td>

                        {/* Creator */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {work.creator?.profilePhoto ? (
                              <img src={work.creator.profilePhoto} alt={work.creator.name} className="w-6 h-6 rounded-full object-cover border border-white/10" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-[#63BDF2]/20 text-[#63BDF2] flex items-center justify-center font-bold text-[9px] uppercase">
                                {work.creator?.name ? work.creator.name.charAt(0) : '?'}
                              </div>
                            )}
                            <span className="font-semibold text-white/95">{work.creator?.name || 'Unknown'}</span>
                          </div>
                        </td>

                        {/* Status badge */}
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            work.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            work.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' :
                            work.status === 'Archived' ? 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20' :
                            'bg-[#63BDF2]/10 text-[#63BDF2] border border-[#63BDF2]/20'
                          }`}>
                            {work.status}
                          </span>
                        </td>

                        {/* Rewards value */}
                        <td className="px-6 py-4 text-right font-bold text-[#63BDF2] font-mono">
                          +{work.points || 10} PTS
                        </td>

                        {/* Admin Actions */}
                        {currentUser?.role === 'ADMIN' && (
                          <td className="px-6 py-4 text-right">
                            <TableRowAdminActions work={work} />
                          </td>
                        )}
                      </tr>
                    ))}
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
