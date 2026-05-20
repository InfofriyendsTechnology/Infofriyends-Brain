'use client'

import { motion } from 'framer-motion'
import { Trophy, Flame, Shield, User as UserIcon, ArrowRight } from 'lucide-react'
import SectionGuide from './SectionGuide'
import Link from 'next/link'

interface MemberLeaderboardProps {
  members: any[]
  limit?: number
}

export default function MemberLeaderboard({ members, limit }: MemberLeaderboardProps) {
  const sortedMembers = [...members].sort((a, b) => b.contributionScore - a.contributionScore)
  const displayMembers = limit ? sortedMembers.slice(0, limit) : sortedMembers
  const hasMore = limit && sortedMembers.length > limit

  return (
    <div className="bg-secondary/10 border border-border/30 rounded-3xl p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Trophy className="text-amber-400" size={20} />
          <h2 className="text-lg font-bold text-white tracking-tight">Founder Board</h2>
          <SectionGuide 
            title="Founder Board"
            content="Tracks developer points. Members earn Contribution Scores when tasks they created are completed. The score resets or grows dynamically as tasks finish."
          />
        </div>
        <div className="flex items-center gap-1 text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full font-semibold uppercase">
          <Flame size={12} /> Active Streak
        </div>
      </div>

      <div className="space-y-3">
        {displayMembers.map((member, index) => {
          const isTop = index === 0
          const isSecond = index === 1
          const isThird = index === 2

          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all duration-300 ${
                isTop 
                  ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40' 
                  : 'bg-background/40 border-border/40 hover:border-primary/30'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative shrink-0">
                  {member.profilePhoto ? (
                    <img 
                      src={member.profilePhoto} 
                      alt={member.name} 
                      className="w-9 h-9 rounded-full object-cover border border-border" 
                    />
                  ) : (
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm uppercase ${
                      isTop ? 'bg-amber-500/20 text-amber-400' : 'bg-primary/20 text-primary'
                    }`}>
                      {member.name.charAt(0)}
                    </div>
                  )}
                  {member.role === 'ADMIN' && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white p-0.5 rounded-full" title="Admin">
                      <Shield size={10} />
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-white truncate">
                    {member.name}
                  </h4>
                  <span className="text-[10px] text-muted-foreground font-mono block truncate">@{member.username}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-sm font-bold text-white block leading-none">{member.contributionScore}</span>
                  <span className="text-[8px] uppercase tracking-wider text-muted-foreground">Points</span>
                </div>
                
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isTop 
                    ? 'bg-amber-500 text-black' 
                    : isSecond 
                      ? 'bg-zinc-300 text-black' 
                      : isThird 
                        ? 'bg-amber-700 text-white' 
                        : 'bg-secondary text-muted-foreground'
                }`}>
                  {index + 1}
                </span>
              </div>
            </motion.div>
          )
        })}

        {members.length === 0 && (
          <div className="text-center py-6 text-sm text-muted-foreground flex flex-col items-center gap-2">
            <UserIcon size={24} className="text-muted-foreground/50" />
            <p>No members registered yet.</p>
          </div>
        )}
      </div>

      {/* View All Members Link */}
      {hasMore && (
        <Link 
          href="/members"
          className="flex items-center justify-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 bg-primary/5 border border-primary/10 hover:border-primary/20 px-4 py-2.5 rounded-xl transition-all group mt-5"
        >
          View All {sortedMembers.length} Members <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  )
}
