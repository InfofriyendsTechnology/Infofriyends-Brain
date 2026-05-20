import { getWorks, getCommunityPosts, getIdeasWithSupports } from '@/app/actions'
import { getMembers } from '@/app/actions/admin'
import { getSession } from '@/lib/auth'
import AddWorkModal from '@/components/AddWorkModal'
import MemberLeaderboard from '@/components/MemberLeaderboard'
import DashboardMetrics from '@/components/DashboardMetrics'
import WorkCard from '@/components/WorkCard'
import IdeaAgreementHub from '@/components/IdeaAgreementHub'
import SectionGuide from '@/components/SectionGuide'
import { Terminal, ArrowRight, FolderGit2 } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import LiveClock from '@/components/LiveClock'

export const dynamic = 'force-dynamic'

// --- 1. METRICS STREAMING SECTION ---
async function MetricsSection() {
  let works: any[] = []
  let posts: any[] = []
  try {
    works = await getWorks()
    posts = await getCommunityPosts()
  } catch (e) {}

  const activeWorksCount = works.filter(w => w.status === 'Active' || w.status === 'ACTIVE').length
  const completedWorksCount = works.filter(w => w.status === 'Completed' || w.status === 'COMPLETED').length
  const totalPostsCount = posts.length

  return (
    <DashboardMetrics 
      activeWorks={activeWorksCount} 
      completedWorks={completedWorksCount} 
      totalPosts={totalPostsCount} 
    />
  )
}

function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 select-none animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="relative overflow-hidden p-5 rounded-2xl border border-white/5 bg-[#0d0e12]">
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 w-20 bg-white/5 rounded" />
            <div className="w-8 h-8 rounded-xl bg-white/5" />
          </div>
          <div className="space-y-2">
            <div className="h-7 w-12 bg-white/5 rounded-lg" />
            <div className="h-3.5 w-24 bg-white/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

// --- 2. ACTIVE PROJECTS STREAMING SECTION ---
async function ActiveProjectsSection({ currentUser }: { currentUser: any }) {
  let works: any[] = []
  try {
    works = await getWorks()
  } catch (e) {}

  const activeWorks = works.filter(w => w.status === 'Active' || w.status === 'ACTIVE')
  const activeWorksPreview = activeWorks.slice(0, 3)

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activeWorksPreview.map(work => (
          <WorkCard key={work.id} work={work} currentUser={currentUser} />
        ))}
      </div>

      {activeWorksPreview.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No active projects found. Let's create some new works on the Work Wall!
        </div>
      )}
    </>
  )
}

function ActiveProjectsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="relative group p-6 rounded-3xl border border-white/10 flex flex-col h-full bg-[#09090b]">
          <div className="space-y-3 flex-1">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="h-4 w-2/3 bg-white/5 rounded-lg" />
                <div className="h-5.5 w-16 bg-white/5 rounded-full" />
              </div>
            </div>
            <div className="space-y-1.5 mt-2">
              <div className="h-3.5 w-full bg-white/5 rounded" />
              <div className="h-3.5 w-11/12 bg-white/5 rounded" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 mt-6 border-t border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/5" />
              <div className="h-3 w-16 bg-white/5 rounded" />
            </div>
            <div className="w-12 h-4 bg-white/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

// --- 3. LEADERBOARD STREAMING SECTION ---
async function LeaderboardSection() {
  let members: any[] = []
  try {
    members = await getMembers()
  } catch (e) {}

  return <MemberLeaderboard members={members} />
}

function LeaderboardSkeleton() {
  return (
    <div className="bg-[#0d0e12] border border-white/5 rounded-3xl p-6 space-y-6 select-none animate-pulse">
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div className="h-6 w-32 bg-white/5 rounded-lg" />
        <div className="h-5 w-24 bg-white/5 rounded-full" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between gap-4 p-3 rounded-2xl border border-white/5 bg-background/40">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-full bg-white/5" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="h-3.5 w-24 bg-white/5 rounded" />
                <div className="h-3 w-16 bg-white/5 rounded" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="space-y-1">
                <div className="h-3.5 w-10 bg-white/5 rounded" />
                <div className="h-2 w-8 bg-white/5 rounded" />
              </div>
              <div className="w-6 h-6 rounded-full bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- 4. IDEA AGREEMENT STREAMING SECTION ---
async function IdeaAgreementSection({ currentUser }: { currentUser: any }) {
  let ideas: any[] = []
  let membersCount = 0
  try {
    ideas = await getIdeasWithSupports()
    const members = await getMembers()
    membersCount = members.length
  } catch (e) {}

  return (
    <IdeaAgreementHub 
      ideas={ideas} 
      currentUser={currentUser} 
      membersCount={membersCount} 
    />
  )
}

function IdeaAgreementSkeleton() {
  return (
    <div className="bg-[#0d0e12] border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 animate-pulse select-none">
      <div className="flex justify-between items-center pb-4 border-b border-white/5">
        <div className="h-6 w-48 bg-white/5 rounded-lg" />
        <div className="h-8 w-24 bg-white/5 rounded-xl" />
      </div>
      <div className="space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="h-28 bg-white/5 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

function WorkspaceGuideCard() {
  return (
    <div className="bg-secondary/20 border border-[#63BDF2]/10 rounded-3xl p-6 space-y-5 backdrop-blur-xl relative overflow-hidden group">
      {/* Decorative glow */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#63BDF2]/10 rounded-full blur-2xl group-hover:bg-[#63BDF2]/15 transition-all duration-300" />
      
      <div className="flex items-center gap-2 pb-3 border-b border-border/30">
        <span className="text-lg">💡</span>
        <h3 className="font-bold text-sm uppercase tracking-wider text-white">Workspace Guide</h3>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Global Workspace Wall
          </h4>
          <p className="text-[11px] text-zinc-400 leading-relaxed pl-3 font-medium">
            Central repository tracking all feature requests. Members move items across Idea, Active, Blocked, and Completed columns.
          </p>
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            My Focus Area
          </h4>
          <p className="text-[11px] text-zinc-400 leading-relaxed pl-3 font-medium">
            Your personalized sandbox. Automatically filters and highlights tasks explicitly assigned to your focus.
          </p>
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-[#63BDF2] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#63BDF2]" />
            Proposals & Ideas Board
          </h4>
          <p className="text-[11px] text-zinc-400 leading-relaxed pl-3 font-medium">
            Company-wide idea sharing. Vote 'Agree' to show consensus on company proposals and decisions before starting action.
          </p>
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            Founder Board
          </h4>
          <p className="text-[11px] text-zinc-400 leading-relaxed pl-3 font-medium">
            Weekly team momentum tracker. Members earn developer points for task completion based on complexity.
          </p>
        </div>
      </div>
    </div>
  )
}

// --- MAIN DYNAMIC COMPONENT ---
export default async function Home() {
  const session = await getSession()

  return (
    <div className="space-y-8 pb-20 w-full px-4 sm:px-6 lg:px-12 pt-6">
      {session && <AddWorkModal user={session.user} />}

      {/* Header Banner (Instant Render) */}
      <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-secondary/15 via-background to-secondary/10 p-6 md:p-8 backdrop-blur-xl">
        {/* Subtle Ambient Glows */}
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
          
          {/* Elegant Flat System Monitoring */}
          <div className="flex flex-col md:items-end gap-2.5 select-none shrink-0">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Systems Operational
            </div>
            <LiveClock />
          </div>
        </div>
      </div>

      {/* Metrics Bar - Progressive Hydration */}
      <Suspense fallback={<MetricsSkeleton />}>
        <MetricsSection />
      </Suspense>

      {/* Main SaaS Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left main section: Active Works Summary & Previews */}
        {/* Left main section: Active Works & Ideas Hub */}
        <div className="lg:col-span-8 space-y-8">
          {/* Active Projects Overview */}
          <div className="bg-secondary/10 border border-border/30 rounded-3xl p-6 backdrop-blur-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/30">
              <div className="flex items-center gap-2">
                <FolderGit2 className="text-primary" size={20} />
                <h2 className="text-lg font-bold text-white tracking-tight">Active Projects Overview</h2>
                <SectionGuide 
                  title="Active Projects"
                  content="This grid showcases works that are currently in the ACTIVE development stage. Tap on a project to open its timeline checklist or record new activity updates."
                />
              </div>
              <Link 
                href="/works"
                className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline group shrink-0"
              >
                Go to Work Wall <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Top 3 Active Works Preview - Progressive Hydration */}
            <Suspense fallback={<ActiveProjectsSkeleton />}>
              <ActiveProjectsSection currentUser={session?.user} />
            </Suspense>
          </div>

          {/* Ideas Alignment & Consensus Hub */}
          <Suspense fallback={<IdeaAgreementSkeleton />}>
            <IdeaAgreementSection currentUser={session?.user} />
          </Suspense>
        </div>

        {/* Right sidebar section: Leaderboard & Workspace Guide */}
        <div className="lg:col-span-4 space-y-8">
          {/* Leaderboard - Progressive Hydration */}
          <Suspense fallback={<LeaderboardSkeleton />}>
            <LeaderboardSection />
          </Suspense>

          {/* Workspace Guide Card */}
          <WorkspaceGuideCard />
        </div>
      </div>
    </div>
  )
}
