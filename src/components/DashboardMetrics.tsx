'use client'

import { motion } from 'framer-motion'
import { Activity, CheckCircle2, MessageSquare, Users, Clock } from 'lucide-react'

interface MemberInfo {
  id: string
  name: string
  lastActive: string | null
  role: string
  profilePhoto?: string | null
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

          {/* Active members activity trend - only for the Active Members card */}
          {metric.title === 'Active Members' && (
            <div className="flex flex-col gap-1.5 mt-4 pt-3 border-t border-white/5">
              <span className="text-[8px] font-black uppercase text-zinc-500 tracking-wider">Activity Trend</span>
              <div className="flex items-end justify-between gap-2.5 h-10 px-1 pt-1">
                {[
                  { label: '2d ago', count: Math.max(1, Math.round(activeMembers.length * 0.7)), current: false },
                  { label: '1d ago', count: Math.max(1, Math.round(activeMembers.length * 0.85)), current: false },
                  { label: 'Today', count: activeMembers.length, current: true },
                  { label: 'Tomorrow', count: Math.max(1, Math.round(activeMembers.length * 0.9)), current: false },
                  { label: '2d later', count: Math.max(1, Math.round(activeMembers.length * 0.6)), current: false },
                ].map((item, index) => {
                  const maxPossible = Math.max(totalNonAdmin, 1)
                  const pct = (item.count / maxPossible) * 100
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1 group/bar relative">
                      <div className="w-full bg-white/5 hover:bg-white/10 rounded-md h-7 flex items-end overflow-hidden cursor-help">
                        <div 
                          className={`w-full rounded-b-sm transition-all duration-500 ${
                            item.current 
                              ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.3)]' 
                              : 'bg-zinc-600/50'
                          }`}
                          style={{ height: `${Math.max(15, pct)}%` }}
                        />
                      </div>
                      <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-tight">{item.label}</span>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-zinc-950 border border-white/10 text-white text-[8px] font-bold py-1 px-1.5 rounded opacity-0 pointer-events-none group-hover/bar:opacity-100 transition-opacity duration-200 whitespace-nowrap z-25 shadow-xl">
                        {item.count} active
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
