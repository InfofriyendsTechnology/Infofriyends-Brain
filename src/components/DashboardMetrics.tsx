'use client'

import { motion } from 'framer-motion'
import { Activity, CheckCircle2, MessageSquare, Users, Clock } from 'lucide-react'

interface MemberInfo {
  id: string
  name: string
  username: string
  lastActive: string | null
  role: string
  profilePhoto?: string | null
  contributionScore?: number
  completedWorksCount?: number
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

function getActiveMembers(members: MemberInfo[]) {
  const now = new Date()
  // A member is "active" if they were active within the last 24 hours
  return members.filter(m => {
    if (m.role === 'ADMIN') return false
    if (!m.lastActive) return false
    const diff = now.getTime() - new Date(m.lastActive).getTime()
    return diff < 24 * 60 * 60 * 1000 // 24 hours
  })
}

function getAvgActiveHours(members: MemberInfo[]) {
  const now = new Date()
  const activeMembers = members.filter(m => {
    if (m.role === 'ADMIN') return false
    if (!m.lastActive) return false
    const diff = now.getTime() - new Date(m.lastActive).getTime()
    return diff < 24 * 60 * 60 * 1000
  })
  if (activeMembers.length === 0) return 0
  const totalHours = activeMembers.reduce((sum, m) => {
    const diff = now.getTime() - new Date(m.lastActive!).getTime()
    const hours = Math.min(24, diff / (1000 * 60 * 60))
    return sum + (24 - hours) // hours they've been active (inverse of how long ago)
  }, 0)
  return Math.round(totalHours / activeMembers.length * 10) / 10
}

export default function DashboardMetrics({ 
  activeWorks, 
  completedWorks, 
  totalPosts,
  members = []
}: { 
  activeWorks: number
  completedWorks: number
  totalPosts: number
  members?: MemberInfo[]
}) {
  const activeMembers = getActiveMembers(members)
  const totalNonAdmin = members.filter(m => m.role !== 'ADMIN').length
  const avgHours = getAvgActiveHours(members)

  const sortedNonAdmins = [...members]
    .filter(m => m.role !== 'ADMIN')
    .sort((a, b) => (b.contributionScore || 0) - (a.contributionScore || 0))

  const activeMembersSorted = [...activeMembers].sort((a, b) => {
    const rankA = sortedNonAdmins.findIndex(x => x.id === a.id)
    const rankB = sortedNonAdmins.findIndex(x => x.id === b.id)
    return rankA - rankB
  })

  const metrics = [
    {
      title: 'Active Work',
      value: activeWorks,
      icon: <Activity className="text-primary" size={20} />,
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      description: 'Items in progress'
    },
    {
      title: 'Completed',
      value: completedWorks,
      icon: <CheckCircle2 className="text-emerald-400" size={20} />,
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      description: 'Successfully shipped'
    },
    {
      title: 'Brain Storms',
      value: totalPosts,
      icon: <MessageSquare className="text-blue-400" size={20} />,
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      description: 'Asynchronous momentum'
    },
    {
      title: 'Active Members',
      value: activeMembers.length,
      icon: <Users className="text-amber-400" size={20} />,
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      description: `of ${totalNonAdmin} • ~${avgHours}h avg today`,
      extra: activeMembers.length > 0 ? activeMembers : null
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {metrics.map((metric, i) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`relative overflow-hidden p-5 rounded-2xl border ${metric.borderColor} bg-secondary/15 backdrop-blur-md hover:bg-secondary/20 transition-all duration-300 group`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs md:text-sm font-semibold text-muted-foreground">{metric.title}</span>
            <div className={`p-2 rounded-xl ${metric.bgColor}`}>
              {metric.icon}
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl md:text-3xl font-black text-white">{metric.value}</h3>
            <p className="text-[10px] md:text-xs text-muted-foreground">{metric.description}</p>
          </div>

          {/* Active members list - only for the Active Members card */}
          {metric.title === 'Active Members' && activeMembersSorted.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-4 pt-3 border-t border-white/5 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
              <span className="text-[8px] font-black uppercase text-zinc-500 tracking-wider mb-1 block">Active Today</span>
              <div className="space-y-1.5">
                {activeMembersSorted.map((m) => {
                  const rank = sortedNonAdmins.findIndex(x => x.id === m.id) + 1
                  const relativeTime = m.lastActive ? getRelativeTime(m.lastActive) : 'Offline'
                  
                  return (
                    <div 
                      key={m.id} 
                      className={`flex items-center justify-between gap-2 p-1.5 rounded-xl border transition-all duration-300 ${
                        rank === 1 ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40' : 
                        rank === 2 ? 'bg-zinc-300/5 border-zinc-500/20 hover:border-zinc-500/40' : 
                        rank === 3 ? 'bg-amber-700/5 border-amber-700/20 hover:border-amber-700/40' : 
                        'bg-white/[0.02] border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-[10px] uppercase shrink-0 ${
                          rank === 1 ? 'bg-amber-500/20 text-amber-400' : 
                          rank === 2 ? 'bg-zinc-300/20 text-zinc-300' :
                          rank === 3 ? 'bg-amber-700/20 text-amber-600' :
                          'bg-primary/20 text-primary'
                        }`}>
                          {m.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[10px] font-semibold text-white truncate leading-none mb-0.5">{m.name}</h4>
                          <span className="text-[8px] text-muted-foreground font-mono block truncate">@{m.username}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[8px] font-mono text-emerald-400 font-bold text-right">{relativeTime}</span>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
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
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}
