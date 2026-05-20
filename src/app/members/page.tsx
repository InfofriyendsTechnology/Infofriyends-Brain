import { getMembers } from '@/app/actions/admin'
import { getWorks } from '@/app/actions'
import { getSession } from '@/lib/auth'
import MemberLeaderboard from '@/components/MemberLeaderboard'
import { Users, Calendar, Briefcase, CheckCircle2, Lightbulb, Clock } from 'lucide-react'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

async function MembersFullSection() {
  let members: any[] = []
  try {
    members = await getMembers()
  } catch (e) {}

  return <MemberLeaderboard members={members} />
}

async function MemberActivitySection() {
  let members: any[] = []
  let works: any[] = []
  try {
    members = await getMembers()
    works = await getWorks()
  } catch (e) {}

  const sortedMembers = [...members].sort((a, b) => b.contributionScore - a.contributionScore)

  return (
    <div className="space-y-4">
      {sortedMembers.map((member) => {
        const createdWorks = works.filter(w => w.creatorId === member.id)
        const assignedWorks = works.filter(w => w.assigneeId === member.id)
        const activeWorks = createdWorks.filter(w => w.status === 'ACTIVE')
        const completedWorks = createdWorks.filter(w => w.status === 'COMPLETED')
        const ideaWorks = createdWorks.filter(w => w.status === 'IDEA' || w.status === 'QUEUED')
        const joinDate = new Date(member.createdAt)
        const lastActive = member.lastActive ? new Date(member.lastActive) : null

        return (
          <div key={member.id} className="bg-[#09090b]/40 border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all space-y-4">
            {/* Member Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative shrink-0">
                  {member.profilePhoto ? (
                    <img src={member.profilePhoto} alt={member.name} className="w-12 h-12 rounded-full object-cover border-2 border-border" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black text-lg uppercase">
                      {member.name.charAt(0)}
                    </div>
                  )}
                  {member.role === 'ADMIN' && (
                    <span className="absolute -bottom-0.5 -right-0.5 text-[8px] bg-primary text-white px-1 py-0 rounded font-bold uppercase">ADM</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-white capitalize truncate">{member.name}</h3>
                  <span className="text-[10px] text-muted-foreground font-mono">@{member.username}</span>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    <span className="text-[9px] text-zinc-500 flex items-center gap-1" suppressHydrationWarning>
                      <Calendar size={9} /> Joined {joinDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </span>
                    {lastActive && (
                      <span className="text-[9px] text-zinc-500 flex items-center gap-1" suppressHydrationWarning>
                        <Clock size={9} /> Last active {lastActive.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Rating Badge */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 text-center shrink-0">
                <span className="text-lg font-black text-amber-400 block leading-none">{Number(member.averageRating || 0).toFixed(1)} <span className="text-sm">⭐</span></span>
                <span className="text-[8px] uppercase tracking-wider text-amber-400/60 font-bold">Avg Rating</span>
              </div>
            </div>

            {/* Activity Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-center">
                <div className="flex items-center justify-center gap-1 text-[#63BDF2]">
                  <Briefcase size={12} />
                  <span className="text-sm font-black">{activeWorks.length}</span>
                </div>
                <span className="text-[8px] uppercase text-zinc-500 font-bold tracking-wider">Active</span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-center">
                <div className="flex items-center justify-center gap-1 text-emerald-400">
                  <CheckCircle2 size={12} />
                  <span className="text-sm font-black">{completedWorks.length}</span>
                </div>
                <span className="text-[8px] uppercase text-zinc-500 font-bold tracking-wider">Done</span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-center">
                <div className="flex items-center justify-center gap-1 text-yellow-400">
                  <Lightbulb size={12} />
                  <span className="text-sm font-black">{ideaWorks.length}</span>
                </div>
                <span className="text-[8px] uppercase text-zinc-500 font-bold tracking-wider">Ideas</span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-center">
                <div className="flex items-center justify-center gap-1 text-zinc-400">
                  <Briefcase size={12} />
                  <span className="text-sm font-black">{createdWorks.length}</span>
                </div>
                <span className="text-[8px] uppercase text-zinc-500 font-bold tracking-wider">Total</span>
              </div>
            </div>

            {/* Recent Work Items */}
            {createdWorks.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-bold text-zinc-600 tracking-wider">Recent Work</span>
                <div className="flex flex-wrap gap-1.5">
                  {createdWorks.slice(0, 5).map(w => {
                    const statusColor = 
                      w.status === 'ACTIVE' ? 'bg-[#63BDF2]/10 text-[#63BDF2] border-[#63BDF2]/20' :
                      w.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      w.status === 'BLOCKED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      w.status === 'IDEA' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                      'bg-white/5 text-zinc-400 border-white/10'
                    return (
                      <span key={w.id} className={`text-[9px] px-2 py-1 rounded-lg border font-bold truncate max-w-[200px] ${statusColor}`}>
                        {w.name}
                      </span>
                    )
                  })}
                  {createdWorks.length > 5 && (
                    <span className="text-[9px] px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-500 font-bold">
                      +{createdWorks.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Peer Reviews / Proof Analytics */}
            {completedWorks.some(w => w.reviews?.length > 0) && (
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <span className="text-[9px] uppercase font-bold text-amber-500/80 tracking-wider flex items-center gap-1">
                  <Lightbulb size={10} /> Peer Reviews & Proof
                </span>
                <div className="space-y-1">
                  {completedWorks.flatMap(w => w.reviews || []).slice(0, 3).map((r: any, idx: number) => (
                    <div key={idx} className="bg-white/5 rounded-lg px-2.5 py-2 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-muted-foreground font-semibold">Reviewer Rating:</span>
                        <div className="flex text-amber-400 text-[8px]">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={i < r.rating ? "opacity-100" : "opacity-30"}>★</span>
                          ))}
                        </div>
                      </div>
                      {r.feedback && (
                        <p className="text-white/80 italic text-[11px] leading-relaxed">"{r.feedback}"</p>
                      )}
                    </div>
                  ))}
                  {completedWorks.flatMap(w => w.reviews || []).length > 3 && (
                    <div className="text-[9px] text-muted-foreground font-semibold text-center pt-1">
                      +{completedWorks.flatMap(w => w.reviews || []).length - 3} more reviews
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}

      {members.length === 0 && (
        <div className="text-center py-16 text-muted-foreground text-sm">
          No members registered yet.
        </div>
      )}
    </div>
  )
}

function MembersSkeleton() {
  return (
    <div className="space-y-4 select-none animate-pulse">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-[#09090b]/40 border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/5" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 bg-white/5 rounded" />
              <div className="h-3 w-24 bg-white/5 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(j => (
              <div key={j} className="h-14 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function MembersPage() {
  const session = await getSession()

  return (
    <div className="space-y-8 pb-20 w-full px-4 sm:px-6 lg:px-12 pt-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-amber-500/5 via-background to-orange-500/5 p-6 md:p-8 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-orange-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <Users size={12} /> Team Directory
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Team <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Members</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl leading-relaxed">
            Full team directory with contribution scores, activity breakdowns, and recent work history for every member.
          </p>
        </div>
      </div>

      {/* Members Activity Cards */}
      <div className="bg-secondary/10 border border-border/30 rounded-3xl p-6 backdrop-blur-xl">
        <Suspense fallback={<MembersSkeleton />}>
          <MemberActivitySection />
        </Suspense>
      </div>
    </div>
  )
}
