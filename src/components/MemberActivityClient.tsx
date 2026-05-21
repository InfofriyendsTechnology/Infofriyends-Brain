'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Calendar, Briefcase, CheckCircle2, Lightbulb, Clock, 
  MessageSquareQuote, TrendingUp, Sparkles, Plus, X, ShieldAlert,
  UserPlus, Loader2, Shield, Search, LayoutGrid, Table
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import ImpersonateButton from './ImpersonateButton'

interface Work {
  id: string
  name: string
  creatorId: string
  assigneeId: string | null
  status: string
  priority: string
  createdAt: string
  reviews: any[]
}

interface Member {
  id: string
  name: string
  username: string
  role: string
  profilePhoto: string | null
  createdAt: string
  lastActive: string | null
  contributionScore: number
  averageRating?: number
}

function getRelativeTime(dateStr: string) {
  const diff = new Date().getTime() - new Date(dateStr).getTime()
  const mins = Math.round(diff / (1000 * 60))
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

function getActiveMembers(members: Member[]) {
  const now = new Date()
  return members.filter(m => {
    if (m.role === 'ADMIN') return false
    if (!m.lastActive) return false
    const diff = now.getTime() - new Date(m.lastActive).getTime()
    return diff < 24 * 60 * 60 * 1000
  })
}

import { impersonateMemberAction } from '@/app/actions/admin'

interface MemberActivityClientProps {
  members: Member[]
  works: Work[]
  currentUserId?: string
  currentUserRole?: string
}

export default function MemberActivityClient({ members, works, currentUserId, currentUserRole }: MemberActivityClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'active'>('grid')

  const filteredMembers = members.filter(member => 
    member.role !== 'ADMIN' &&
    (member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.username.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Sort members by contribution score (descending)
  const sortedMembers = [...filteredMembers].sort((a, b) => b.contributionScore - a.contributionScore)

  const activeMembersSorted = getActiveMembers(members).sort((a, b) => {
    const rankA = sortedMembers.findIndex(x => x.id === a.id)
    const rankB = sortedMembers.findIndex(x => x.id === b.id)
    return rankA - rankB
  })

  return (
    <div className="space-y-6">
      {/* Search & View Toggle controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pb-6 border-b border-white/5">
        <div className="relative w-full sm:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-400 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search members by name or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-950/50 border border-white/5 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20 focus:bg-zinc-950 transition-all duration-300"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex bg-zinc-950/80 p-1 border border-white/5 rounded-2xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
              viewMode === 'grid' 
                ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 shadow-md shadow-amber-500/5' 
                : 'text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            <LayoutGrid size={14} /> Grid
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
              viewMode === 'table' 
                ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 shadow-md shadow-amber-500/5' 
                : 'text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            <Table size={14} /> Table
          </button>
          <button
            onClick={() => setViewMode('active')}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
              viewMode === 'active' 
                ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 shadow-md shadow-amber-500/5' 
                : 'text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            <Clock size={14} /> Active
          </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {sortedMembers.map((member, index) => {
              const createdWorks = works.filter(w => w.creatorId === member.id)
              const activeWorks = createdWorks.filter(w => w.status === 'ACTIVE')
              const completedWorks = createdWorks.filter(w => w.status === 'COMPLETED')
              const ideaWorks = createdWorks.filter(w => w.status === 'IDEA' || w.status === 'QUEUED')
              const joinDate = new Date(member.createdAt)
              const lastActive = member.lastActive ? new Date(member.lastActive) : null

              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.05, 0.4) }}
                  onClick={() => router.push(`/members/${member.id}`)}
                  className={`group relative backdrop-blur-xl border rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                    member.role === 'ADMIN'
                      ? 'bg-gradient-to-b from-[#3188DA]/10 to-[#09090b]/40 border-[#63BDF2]/30 hover:border-[#63BDF2]/60 hover:shadow-[0_0_30px_-10px_rgba(99,189,242,0.2)]'
                      : 'bg-zinc-900/10 border-white/5 hover:border-amber-500/20 hover:shadow-[0_0_30px_-10px_rgba(245,158,11,0.06)]'
                  }`}
                >
                  <div className="space-y-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          {member.profilePhoto ? (
                            <img 
                              src={member.profilePhoto} 
                              alt={member.name} 
                              className={`w-14 h-14 rounded-2xl object-cover border transition-colors ${
                                member.role === 'ADMIN' ? 'border-[#63BDF2]/40 group-hover:border-[#63BDF2]' : 'border-white/10 group-hover:border-amber-500/30'
                              }`} 
                            />
                          ) : (
                            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center font-black text-xl uppercase transition-colors ${
                              member.role === 'ADMIN' ? 'bg-gradient-to-br from-[#63BDF2]/10 to-[#3188DA]/10 border-[#63BDF2]/30 text-[#63BDF2] group-hover:border-[#63BDF2]' : 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-white/5 text-amber-400 group-hover:border-amber-500/30'
                            }`}>
                              {member.name.charAt(0)}
                            </div>
                          )}
                          {member.role === 'ADMIN' && (
                            <span className="absolute -bottom-2 -right-2 text-[8px] bg-gradient-to-r from-[#63BDF2] to-[#3188DA] text-black px-1.5 py-0.5 rounded font-black tracking-wide uppercase shadow-sm border border-[#09090b]">
                              ADM
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className={`text-base font-bold transition-colors capitalize truncate ${member.role === 'ADMIN' ? 'text-white group-hover:text-[#63BDF2]' : 'text-white group-hover:text-amber-400'}`}>{member.name}</h3>
                          <span className="text-xs text-zinc-500 font-mono">@{member.username}</span>
                        </div>
                      </div>

                      {/* Contribution Score Badge */}
                      <div className="bg-zinc-950/80 border border-white/5 rounded-2xl px-3 py-2 flex flex-col items-center justify-center min-w-[70px] shadow-inner shrink-0">
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-black text-emerald-400 leading-none">
                            {member.contributionScore || 0}
                          </span>
                        </div>
                        <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-extrabold mt-1">Points</span>
                      </div>
                    </div>

                    {/* Meta Timestamps */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 py-1 text-[10px] text-zinc-500 border-y border-white/5 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={11} className="text-zinc-600" /> 
                        Joined {joinDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                      </span>
                      {lastActive && (
                        <span className="flex items-center gap-1.5">
                          <Clock size={11} className="text-zinc-600" />
                          Active {lastActive.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>

                    {/* Modern Numeric Compartments */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-zinc-950/30 border border-white/5 hover:border-amber-500/10 rounded-2xl p-2 text-center transition-colors">
                        <span className="block text-sm font-black text-[#63BDF2]">{activeWorks.length}</span>
                        <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold block mt-0.5">Active</span>
                      </div>
                      <div className="bg-zinc-950/30 border border-white/5 hover:border-emerald-500/10 rounded-2xl p-2 text-center transition-colors">
                        <span className="block text-sm font-black text-emerald-400">{completedWorks.length}</span>
                        <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold block mt-0.5">Done</span>
                      </div>
                      <div className="bg-zinc-950/30 border border-white/5 hover:border-yellow-500/10 rounded-2xl p-2 text-center transition-colors">
                        <span className="block text-sm font-black text-yellow-400">{ideaWorks.length}</span>
                        <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold block mt-0.5">Ideas</span>
                      </div>
                      <div className="bg-zinc-950/30 border border-white/5 hover:border-zinc-500/10 rounded-2xl p-2 text-center transition-colors">
                        <span className="block text-sm font-black text-zinc-400">{createdWorks.length}</span>
                        <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold block mt-0.5">Total</span>
                      </div>
                    </div>

                    {/* Recent Works Badges */}
                    {createdWorks.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <TrendingUp size={11} className="text-zinc-500" />
                            <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Recent Shipped</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {createdWorks.slice(0, 3).map(w => {
                            const statusColor = 
                              w.status === 'COMPLETED' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
                              w.status === 'ACTIVE' ? 'text-[#63BDF2] bg-[#63BDF2]/10 border-[#63BDF2]/20' :
                              w.status === 'IDEA' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' :
                              'text-zinc-400 bg-zinc-400/10 border-zinc-400/20'
                              
                            return (
                              <span key={w.id} className={`text-[9px] px-2 py-0.5 rounded border font-bold truncate max-w-[120px] ${statusColor}`}>
                                {w.name}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Subtle Login As Member Action */}
                  {currentUserRole === 'ADMIN' && member.id !== currentUserId && member.role !== 'ADMIN' && (
                    <div className="pt-4 mt-4 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
                      <ImpersonateButton memberId={member.id} memberName={member.name} />
                    </div>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        ) : viewMode === 'table' ? (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="overflow-x-auto bg-zinc-950/40 border border-white/5 rounded-3xl backdrop-blur-xl"
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-zinc-950 text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                  <th className="px-6 py-4">Member</th>
                  <th className="px-6 py-4 text-center">Points</th>
                  <th className="px-6 py-4 text-center">Active</th>
                  <th className="px-6 py-4 text-center">Completed</th>
                  <th className="px-6 py-4 text-center">Ideas</th>
                  <th className="px-6 py-4 text-center">Total Works</th>
                  <th className="px-6 py-4">Recent Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-zinc-300 font-medium">
                {sortedMembers.map((member) => {
                  const createdWorks = works.filter(w => w.creatorId === member.id)
                  const activeWorks = createdWorks.filter(w => w.status === 'ACTIVE')
                  const completedWorks = createdWorks.filter(w => w.status === 'COMPLETED')
                  const ideaWorks = createdWorks.filter(w => w.status === 'IDEA' || w.status === 'QUEUED')
                  const latestWork = createdWorks[0]

                  return (
                      <tr 
                      key={member.id} 
                      onClick={() => router.push(`/members/${member.id}`)}
                      className={`transition-colors cursor-pointer ${member.role === 'ADMIN' ? 'bg-[#63BDF2]/5 hover:bg-[#63BDF2]/10 border-b border-[#63BDF2]/20' : 'hover:bg-white/[0.01] border-b border-white/5'}`}
                    >
                      {/* Member Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            {member.profilePhoto ? (
                              <img src={member.profilePhoto} alt={member.name} className={`w-9 h-9 rounded-xl object-cover border ${member.role === 'ADMIN' ? 'border-[#63BDF2]/40' : 'border-white/10'}`} />
                            ) : (
                              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-xs uppercase ${member.role === 'ADMIN' ? 'bg-gradient-to-br from-[#63BDF2]/10 to-[#3188DA]/10 border-[#63BDF2]/30 text-[#63BDF2]' : 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-white/5 text-amber-400'}`}>
                                {member.name.charAt(0)}
                              </div>
                            )}
                            {member.role === 'ADMIN' && (
                              <span className="absolute -bottom-1 -right-1 text-[6px] bg-gradient-to-r from-[#63BDF2] to-[#3188DA] text-black px-1 py-0.5 rounded font-black tracking-wide uppercase shadow-sm">
                                ADM
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className={`font-bold capitalize leading-tight ${member.role === 'ADMIN' ? 'text-white' : 'text-white'}`}>{member.name}</span>
                            </div>
                            <span className="text-[10px] text-zinc-500 font-mono block">@{member.username}</span>
                            {currentUserRole === 'ADMIN' && member.id !== currentUserId && member.role !== 'ADMIN' && (
                              <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                                <ImpersonateButton memberId={member.id} memberName={member.name} />
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Rating column */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5 bg-zinc-900 border border-white/5 px-2.5 py-1 rounded-xl shadow-inner">
                          <span className="font-black text-emerald-400">{member.contributionScore || 0}</span>
                        </div>
                      </td>

                      {/* Stats columns */}
                      <td className="px-6 py-4 text-center text-[#63BDF2] font-black">{activeWorks.length}</td>
                      <td className="px-6 py-4 text-center text-emerald-400 font-black">{completedWorks.length}</td>
                      <td className="px-6 py-4 text-center text-yellow-400 font-black">{ideaWorks.length}</td>
                      <td className="px-6 py-4 text-center text-zinc-400 font-black">{createdWorks.length}</td>

                      {/* Latest Work */}
                      <td className="px-6 py-4">
                        {latestWork ? (
                          <div className="max-w-[200px] truncate">
                            <span className="text-xs text-white block truncate font-bold">{latestWork.name}</span>
                            <span className="text-[9px] text-zinc-500 block">
                              {latestWork.status} • {new Date(latestWork.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-600 text-xs italic">No activity yet</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </motion.div>
        ) : viewMode === 'active' ? (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-2xl mx-auto space-y-4"
          >
            <div className="flex flex-col gap-2">
              <span className="text-xs font-black uppercase text-zinc-500 tracking-wider mb-2 block px-2">Active Today ({activeMembersSorted.length})</span>
              <div className="space-y-2">
                {activeMembersSorted.map((m) => {
                  const rank = sortedMembers.findIndex(x => x.id === m.id) + 1
                  const relativeTime = m.lastActive ? getRelativeTime(m.lastActive) : 'Offline'
                  
                  return (
                    <div 
                      key={m.id} 
                      onClick={() => router.push(`/members/${m.id}`)}
                      className={`flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all duration-300 cursor-pointer ${
                        rank === 1 ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/10' : 
                        rank === 2 ? 'bg-zinc-300/5 border-zinc-500/20 hover:border-zinc-500/40 hover:bg-zinc-300/10' : 
                        rank === 3 ? 'bg-amber-700/5 border-amber-700/20 hover:border-amber-700/40 hover:bg-amber-700/10' : 
                        'bg-zinc-900/40 border-white/5 hover:border-white/10 hover:bg-zinc-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm uppercase shrink-0 ${
                          rank === 1 ? 'bg-amber-500/20 text-amber-400' : 
                          rank === 2 ? 'bg-zinc-300/20 text-zinc-300' :
                          rank === 3 ? 'bg-amber-700/20 text-amber-600' :
                          'bg-primary/20 text-primary'
                        }`}>
                          {m.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-white truncate mb-0.5">{m.name}</h4>
                          <span className="text-xs text-muted-foreground font-mono block truncate">@{m.username}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-mono text-emerald-400 font-bold text-right">{relativeTime}</span>
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          rank === 1 ? 'bg-amber-500 text-black' : 
                          rank === 2 ? 'bg-zinc-300 text-black' : 
                          rank === 3 ? 'bg-amber-700 text-white' : 
                          'bg-secondary text-muted-foreground'
                        }`}>
                          {rank}
                        </span>
                      </div>
                    </div>
                  )
                })}
                {activeMembersSorted.length === 0 && (
                  <div className="p-8 text-center bg-zinc-900/30 rounded-2xl border border-white/5 text-muted-foreground text-sm">
                    No members active today.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>



      {sortedMembers.length === 0 && (
        <div className="text-center py-16 text-zinc-500 text-sm">
          No members found matching your search.
        </div>
      )}
    </div>
  )
}
