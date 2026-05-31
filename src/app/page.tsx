import { getWorks, getCommunityPosts, getIdeasWithSupports, getWorksLite } from '@/app/actions'
import { getMembers } from '@/app/actions/admin'
import { getSession } from '@/lib/auth'
import MemberLeaderboard from '@/components/MemberLeaderboard'
import DashboardMetrics from '@/components/DashboardMetrics'
import WorkCard from '@/components/WorkCard'
import SectionGuide from '@/components/SectionGuide'
import { Terminal, ArrowRight, Briefcase, Lightbulb, ListOrdered, XCircle, ThumbsUp, Clock } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import LiveClock from '@/components/LiveClock'
import AdminHomeClient from '@/components/AdminHomeClient'

export const revalidate = 30

// ─── SINGLE async data loader ────────────────────────────────────────────────
// Fetches everything in ONE parallel Promise.all and renders all sections.
// Wrapped in Suspense so the static shell above renders instantly.
async function DashboardData({ currentUser }: { currentUser: any }) {
  const [works, members, posts, ideas] = await Promise.all([
    getWorksLite(),
    getMembers(),
    getCommunityPosts(),
    getIdeasWithSupports(),
  ])

  const activeWorks = works.filter((w: any) => w.status === 'Active' || w.status === 'ACTIVE')
  const completedWorksCount = works.filter((w: any) => w.status === 'Completed' || w.status === 'COMPLETED').length
  const membersCount = members.filter((m: any) => m.role !== 'ADMIN').length
  const activeWorksPreview = activeWorks.slice(0, 3)
  const openIdeas = ideas.filter((f: any) => f.status === 'IDEA')
  const queuedIdeas = ideas.filter((f: any) => f.status === 'QUEUED')
  const declinedIdeas = ideas.filter((f: any) => f.status === 'DECLINED')
  const topIdeas = openIdeas.slice(0, 3)

  return (
    <>
      {/* Metrics Bar */}
      <DashboardMetrics
        activeWorks={activeWorks.length}
        completedWorks={completedWorksCount}
        totalPosts={posts.length}
        members={members.map((m: any) => ({
          id: m.id,
          name: m.name,
          username: m.username,
          lastActive: m.lastActive,
          role: m.role,
          profilePhoto: m.profilePhoto,
          contributionScore: m.contributionScore || m.totalPoints || 0,
          completedWorksCount: m.completedWorksCount || 0
        }))}
      />

      {/* Active Workspace */}
      <div className="bg-secondary/10 border border-border/30 rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 backdrop-blur-xl space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 md:pb-4 border-b border-border/30">
          <div className="flex items-center gap-2">
            <Briefcase className="text-primary" size={20} />
            <h2 className="text-lg font-bold text-white tracking-tight">Active Workspace</h2>
            <SectionGuide
              title="Active Workspace"
              content="Shows the currently active tasks. These are work items converted from approved proposals after full team consensus. Click a card to see its full timeline."
            />
          </div>
          <Link href="/works" className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline group shrink-0">
            Open Full Workspace <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeWorksPreview.map((work: any) => (
            <WorkCard key={work.id} work={work} currentUser={currentUser} />
          ))}
        </div>
        {activeWorksPreview.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No active tasks. Approved proposals will appear here as active work.
          </div>
        )}
      </div>

      {/* Proposals + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 items-start">
        {/* Proposals Compact Preview */}
        <div className="bg-secondary/20 border border-yellow-400/10 rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/30">
            <div className="flex items-center gap-2">
              <Lightbulb className="text-yellow-400" size={18} />
              <h3 className="text-sm font-bold text-white tracking-tight">Proposals</h3>
              <SectionGuide
                title="Proposals Overview"
                content="Read-only snapshot of current proposals. See how many ideas are open, queued, or declined. Click 'Open Proposals Hub' to vote, add new proposals, or manage the full lifecycle."
              />
            </div>
          </div>
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#0c0d12]/60 border border-yellow-400/10 rounded-xl p-3 text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-yellow-400">
                  <Lightbulb size={14} />
                  <span className="text-lg font-black">{openIdeas.length}</span>
                </div>
                <p className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Open Ideas</p>
              </div>
              <div className="bg-[#0c0d12]/60 border border-purple-400/10 rounded-xl p-3 text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-purple-400">
                  <ListOrdered size={14} />
                  <span className="text-lg font-black">{queuedIdeas.length}</span>
                </div>
                <p className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">In Queue</p>
              </div>
              <div className="bg-[#0c0d12]/60 border border-red-400/10 rounded-xl p-3 text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-red-400">
                  <XCircle size={14} />
                  <span className="text-lg font-black">{declinedIdeas.length}</span>
                </div>
                <p className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Declined</p>
              </div>
            </div>
            {topIdeas.length > 0 ? (
              <div className="space-y-2.5">
                {topIdeas.map((idea: any) => {
                  const approvalRate = membersCount > 0 ? Math.round((idea.supports.length / membersCount) * 100) : 0
                  return (
                    <div key={idea.id} className="bg-[#0c0d12]/40 border border-white/5 rounded-xl p-3.5 space-y-2 hover:border-white/10 transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{idea.name}</h4>
                          <div className="flex items-center gap-2 text-[9px] text-zinc-500">
                            <span suppressHydrationWarning>
                              <Clock size={9} className="inline mr-0.5" />
                              {new Date(idea.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                            <span>by {idea.creator?.name}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-[#63BDF2] font-bold shrink-0">
                          <ThumbsUp size={10} className="fill-[#63BDF2]" />
                          {idea.supports.length}/{membersCount}
                        </div>
                      </div>
                      <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-[#63BDF2] to-blue-500 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, approvalRate)}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground text-[11px] italic">No open proposals right now.</div>
            )}
            <Link
              href="/proposals"
              className="flex items-center justify-center gap-1.5 text-xs font-bold text-yellow-400 hover:text-yellow-300 bg-yellow-400/5 border border-yellow-400/10 hover:border-yellow-400/20 px-4 py-2.5 rounded-xl transition-all group"
            >
              Open Proposals Hub <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Leaderboard */}
        <MemberLeaderboard members={members} limit={3} />
      </div>
    </>
  )
}

// ─── SKELETON for the data sections ──────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8 animate-pulse select-none">
      {/* Metrics skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 sm:p-5 rounded-xl md:rounded-2xl border border-white/5 bg-zinc-950/40">
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 w-16 md:w-20 bg-white/[0.06] rounded" />
              <div className="w-8 h-8 rounded-xl bg-white/[0.06]" />
            </div>
            <div className="space-y-2">
              <div className="h-6 md:h-7 w-12 bg-white/[0.06] rounded-lg" />
              <div className="h-3 w-20 md:w-24 bg-white/[0.06] rounded" />
            </div>
          </div>
        ))}
      </div>
      {/* Active workspace skeleton */}
      <div className="bg-secondary/10 border border-border/30 rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6">
        <div className="flex justify-between items-center pb-3 md:pb-4 border-b border-border/30 mb-4 md:mb-6">
          <div className="h-5 w-36 bg-white/[0.06] rounded-lg" />
          <div className="h-4 w-28 bg-white/[0.06] rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 md:p-6 rounded-xl md:rounded-3xl border border-white/5 flex flex-col h-40 bg-white/[0.02]">
              <div className="space-y-3 flex-1">
                <div className="h-4 w-2/3 bg-white/[0.06] rounded-lg" />
                <div className="h-3.5 w-full bg-white/[0.06] rounded" />
                <div className="h-3.5 w-11/12 bg-white/[0.06] rounded" />
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                <div className="w-6 h-6 rounded-full bg-white/[0.06]" />
                <div className="h-3 w-16 bg-white/[0.06] rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Bottom grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        <div className="bg-secondary/20 border border-yellow-400/10 rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 space-y-4">
          <div className="h-5 w-24 bg-white/[0.06] rounded-lg pb-3" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 space-y-2">
                <div className="h-5 w-6 mx-auto bg-white/[0.06] rounded" />
                <div className="h-2.5 w-12 mx-auto bg-white/[0.06] rounded" />
              </div>
            ))}
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 bg-white/[0.02] border border-white/5 rounded-xl" />
          ))}
        </div>
        <div className="bg-zinc-950/40 border border-white/5 rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 space-y-4">
          <div className="h-5 w-28 bg-white/[0.06] rounded-lg" />
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
              <div className="w-9 h-9 rounded-full bg-white/[0.06]" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 w-24 bg-white/[0.06] rounded" />
                <div className="h-3 w-16 bg-white/[0.06] rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default async function Home() {
  // Only session is needed before rendering the shell — fast (cached)
  const session = await getSession()

  if (session?.user?.role === 'ADMIN') {
    const [members, works] = await Promise.all([getMembers(), getWorks()])
    return <AdminHomeClient session={session} members={members} works={works} />
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-20 w-full px-4 sm:px-6 lg:px-12 pt-4 md:pt-6">
      {/* ── SHELL: renders instantly, no data needed ── */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-border/40 bg-gradient-to-br from-secondary/15 via-background to-secondary/10 p-4 sm:p-5 md:p-8 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#63BDF2]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#3188DA]/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#63BDF2]/10 border border-[#63BDF2]/20 text-xs font-semibold text-[#63BDF2] uppercase tracking-wider">
              <Terminal size={12} /> Live Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Infofriyends <span className="bg-gradient-to-r from-[#63BDF2] to-[#3188DA] bg-clip-text text-transparent">Brain OS</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl leading-relaxed">
              Collaborate asynchronously, record updates instantly, and push community products forward without pressure.
            </p>
          </div>
          <div className="flex flex-col md:items-end gap-2.5 select-none shrink-0">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Systems Operational
            </div>
            <LiveClock />
          </div>
        </div>
      </div>

      {/* ── DATA: streams in via Suspense (single parallel fetch) ── */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardData currentUser={session?.user} />
      </Suspense>
    </div>
  )
}
