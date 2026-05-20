'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, Calendar, Briefcase, CheckCircle2, Lightbulb, Clock, 
  Star, MessageSquare, Award, Shield, Search, LayoutGrid, Table, 
  MessageSquareQuote, TrendingUp, Sparkles
} from 'lucide-react'

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

interface MemberActivityClientProps {
  members: Member[]
  works: Work[]
  currentUserId?: string
}

export default function MemberActivityClient({ members, works, currentUserId }: MemberActivityClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Sort members by contribution score (descending)
  const sortedMembers = [...filteredMembers].sort((a, b) => b.contributionScore - a.contributionScore)

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

        <div className="flex bg-zinc-950/80 p-1 border border-white/5 rounded-2xl shrink-0 self-stretch sm:self-auto justify-center">
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
                  className="group relative bg-zinc-900/10 backdrop-blur-xl border border-white/5 hover:border-amber-500/20 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between hover:shadow-[0_0_30px_-10px_rgba(245,158,11,0.06)]"
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
                              className="w-14 h-14 rounded-2xl object-cover border border-white/10 group-hover:border-amber-500/30 transition-colors" 
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-white/5 text-amber-400 flex items-center justify-center font-black text-xl uppercase group-hover:border-amber-500/30 transition-colors">
                              {member.name.charAt(0)}
                            </div>
                          )}
                          {member.role === 'ADMIN' && (
                            <span className="absolute -bottom-1 -right-1 text-[8px] bg-gradient-to-r from-amber-500 to-orange-600 text-black px-1.5 py-0.5 rounded font-black tracking-wide uppercase shadow-sm">
                              ADM
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors capitalize truncate">{member.name}</h3>
                          <span className="text-xs text-zinc-500 font-mono">@{member.username}</span>
                        </div>
                      </div>

                      {/* Professional Rating Badge */}
                      <div className="bg-zinc-950/80 border border-white/5 rounded-2xl px-3 py-2 flex flex-col items-center justify-center min-w-[70px] shadow-inner shrink-0">
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-black text-amber-400 leading-none">
                            {Number(member.averageRating || 0).toFixed(1)}
                          </span>
                          <Star className="text-amber-400 fill-amber-400 shrink-0" size={14} />
                        </div>
                        <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-extrabold mt-1">Rating</span>
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
                        <div className="flex items-center gap-1.5">
                          <TrendingUp size={11} className="text-zinc-500" />
                          <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Recent Shipped</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {createdWorks.slice(0, 3).map(w => {
                            const statusColor = 
                              w.status === 'ACTIVE' ? 'bg-[#63BDF2]/10 text-[#63BDF2] border-[#63BDF2]/10' :
                              w.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' :
                              w.status === 'BLOCKED' ? 'bg-red-500/10 text-red-400 border-red-500/10' :
                              w.status === 'IDEA' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/10' :
                              'bg-white/5 text-zinc-400 border-white/10'
                            return (
                              <span key={w.id} className={`text-[9px] px-2.5 py-1 rounded-lg border font-bold truncate max-w-[130px] ${statusColor}`}>
                                {w.name}
                              </span>
                            )
                          })}
                          {createdWorks.length > 3 && (
                            <span className="text-[9px] px-2 py-1 rounded-lg bg-zinc-950/50 border border-white/5 text-zinc-500 font-semibold">
                              +{createdWorks.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Peer Reviews / Testimony Block */}
                  {completedWorks.some(w => w.reviews?.length > 0) && (
                    <div className="mt-5 pt-4 border-t border-white/5 space-y-3">
                      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold text-amber-500/80">
                        <MessageSquareQuote size={12} />
                        <span>Peer Feedback Proof</span>
                      </div>
                      
                      <div className="space-y-2">
                        {completedWorks.flatMap(w => w.reviews || []).slice(0, 2).map((r: any, idx: number) => (
                          <div key={idx} className="bg-zinc-950/50 border border-white/5 rounded-2xl p-3 space-y-1.5 hover:border-white/10 transition-colors">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] text-zinc-500 font-bold capitalize">
                                {r.reviewer?.name || 'Anonymous Reviewer'}
                              </span>
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star 
                                    key={i} 
                                    size={9} 
                                    className={i < r.rating 
                                      ? "text-amber-400 fill-amber-400" 
                                      : "text-zinc-700 fill-zinc-800"
                                    } 
                                  />
                                ))}
                              </div>
                            </div>
                            {r.feedback && (
                              <p className="text-[11px] text-zinc-300 leading-relaxed italic pr-2 font-medium">
                                "{r.feedback}"
                              </p>
                            )}
                          </div>
                        ))}
                        {completedWorks.flatMap(w => w.reviews || []).length > 2 && (
                          <div className="text-[9px] text-zinc-500 font-semibold text-right pr-1">
                            +{completedWorks.flatMap(w => w.reviews || []).length - 2} more testimonies
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        ) : (
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
                  <th className="px-6 py-4 text-center">Avg Rating</th>
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
                    <tr key={member.id} className="hover:bg-white/[0.01] transition-colors">
                      {/* Member Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {member.profilePhoto ? (
                            <img src={member.profilePhoto} alt={member.name} className="w-9 h-9 rounded-xl object-cover border border-white/10" />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-white/5 text-amber-400 flex items-center justify-center font-bold text-xs uppercase">
                              {member.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white capitalize leading-tight">{member.name}</span>
                              {member.role === 'ADMIN' && (
                                <span className="text-[7px] bg-amber-500/20 text-amber-400 border border-amber-500/20 px-1 rounded font-black tracking-wide uppercase">
                                  ADM
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-500 font-mono block">@{member.username}</span>
                          </div>
                        </div>
                      </td>

                      {/* Rating column */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5 bg-zinc-900 border border-white/5 px-2.5 py-1 rounded-xl shadow-inner">
                          <span className="font-black text-amber-400">{Number(member.averageRating || 0).toFixed(1)}</span>
                          <Star className="text-amber-400 fill-amber-400" size={12} />
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
        )}
      </AnimatePresence>

      {sortedMembers.length === 0 && (
        <div className="text-center py-16 text-zinc-500 text-sm">
          No members found matching your search.
        </div>
      )}
    </div>
  )
}
