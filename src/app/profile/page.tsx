import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import ProfileForm from '@/components/ProfileForm'
import WorkCard from '@/components/WorkCard'
import EnvironmentLinks from '@/components/EnvironmentLinks'
import { User, Award, Flame, FolderGit2 } from 'lucide-react'
import { Suspense } from 'react'

export const revalidate = 30

// --- 1. PROFILE FORM STREAMING SECTION ---
async function ProfileFormSection({ session }: { session: any }) {
  let dbUser: any = null
  try {
    if (process.env.DATABASE_URL) {
      dbUser = await prisma.user.findUnique({
        where: { id: session.user.id }
      })
    }
  } catch (e) {}

  const user = dbUser || {
    name: session.user.name,
    username: session.user.username,
    role: session.user.role,
    contributionScore: 0,
    profilePhoto: null
  }

  return <ProfileForm user={user} />
}

function ProfileFormSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8 animate-pulse select-none">
      <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 pb-4 md:pb-6 border-b border-white/5">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/[0.06] shrink-0" />
        <div className="text-center sm:text-left space-y-2 flex-1">
          <div className="h-5 w-32 bg-white/[0.06] rounded mx-auto sm:mx-0" />
          <div className="h-3 w-48 md:w-64 bg-white/[0.06] rounded mx-auto sm:mx-0" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-2">
          <div className="h-4 w-28 bg-white/[0.06] rounded" />
          <div className="h-11 w-full bg-white/[0.06] rounded-xl" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-28 bg-white/[0.06] rounded" />
          <div className="h-11 w-full bg-white/[0.06] rounded-xl" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <div className="h-4 w-32 bg-white/[0.06] rounded" />
          <div className="h-11 w-full bg-white/[0.06] rounded-xl" />
        </div>
      </div>

      <div className="h-11 w-32 bg-white/[0.06] rounded-xl" />
    </div>
  )
}

// --- 2. USER WORKS STREAMING SECTION ---
async function UserWorksSection({ session }: { session: any }) {
  let userWorks: any[] = []
  try {
    if (process.env.DATABASE_URL) {
      userWorks = await prisma.work.findMany({
        where: { creatorId: session.user.id },
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: { id: true, name: true, profilePhoto: true }
          }
        }
      })
    }
  } catch (e) {}

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {userWorks.map(work => (
          <WorkCard key={work.id} work={work} currentUser={session.user} />
        ))}
      </div>

      {userWorks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          You haven't posted any works yet. Shipped works will appear here!
        </div>
      )}
    </>
  )
}

function UserWorksSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 animate-pulse select-none">
      {[1, 2].map((i) => (
        <div key={i} className="relative group p-4 md:p-6 rounded-xl md:rounded-3xl border border-white/5 flex flex-col h-52 bg-white/[0.02]">
          <div className="space-y-3 flex-1">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="h-4 w-2/3 bg-white/[0.06] rounded-lg" />
                <div className="h-5 w-16 bg-white/[0.06] rounded-full" />
              </div>
            </div>
            <div className="space-y-1.5 mt-2">
              <div className="h-3.5 w-full bg-white/[0.06] rounded" />
              <div className="h-3.5 w-11/12 bg-white/[0.06] rounded" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 mt-4 md:mt-6 border-t border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/[0.06]" />
              <div className="h-3 w-16 bg-white/[0.06] rounded" />
            </div>
            <div className="w-12 h-4 bg-white/[0.06] rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

// --- 3. SCORECARD STREAMING SECTION ---
async function ScorecardSection({ session }: { session: any }) {
  let dbUser: any = null
  try {
    if (process.env.DATABASE_URL) {
      dbUser = await prisma.user.findUnique({
        where: { id: session.user.id }
      })
    }
  } catch (e) {}

  const user = dbUser || {
    role: session.user.role,
    contributionScore: 0
  }

  return (
    <>
      <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-center space-y-4">
        <div className="inline-flex p-3 rounded-full bg-amber-500/10 text-amber-400">
          <Flame size={32} className="animate-pulse" />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400/80">Current Score</span>
          <h3 className="text-4xl font-black text-white">{user.contributionScore}</h3>
          <p className="text-xs text-muted-foreground">Points earned from shipped updates and community actions.</p>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Rank Standing</h4>
        <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/50 text-sm">
          <span className="text-muted-foreground font-semibold">Workspace Role</span>
          <span className="text-primary font-bold font-mono uppercase bg-primary/10 px-2 py-0.5 rounded text-xs">
            {user.role}
          </span>
        </div>
      </div>
    </>
  )
}

function ScorecardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse select-none">
      <div className="p-4 sm:p-5 rounded-xl md:rounded-2xl border border-white/5 bg-white/[0.02] text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-white/[0.06] mx-auto" />
        <div className="space-y-2">
          <div className="h-3 w-24 bg-white/[0.06] rounded mx-auto" />
          <div className="h-9 w-16 bg-white/[0.06] rounded-xl mx-auto" />
          <div className="h-3 w-full bg-white/[0.06] rounded" />
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div className="h-3 w-32 bg-white/[0.06] rounded" />
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="h-4 w-24 bg-white/[0.06] rounded" />
          <div className="h-6 w-16 bg-white/[0.06] rounded" />
        </div>
      </div>
    </div>
  )
}

// --- MAIN DYNAMIC PAGE ---
export default async function ProfilePage() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-20 w-full px-4 sm:px-6 lg:px-12 pt-4 md:pt-6">
      {/* Header Banner (Instant Render) */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-border/40 bg-gradient-to-br from-secondary/15 via-background to-secondary/10 p-4 sm:p-5 md:p-8 backdrop-blur-xl">
        {/* Subtle Ambient Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#63BDF2]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#3188DA]/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#63BDF2]/10 border border-[#63BDF2]/20 text-xs font-semibold text-[#63BDF2] uppercase tracking-wider">
              <User size={12} /> Account Center
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Profile <span className="bg-gradient-to-r from-[#63BDF2] to-[#3188DA] bg-clip-text text-transparent">Settings</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl">
              Manage your display identity, view your asynchronous contribution ranks, and monitor your shipped works.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Profile Settings Form & Shipped Works */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Profile Form Card */}
          <div className="bg-secondary/10 border border-border/30 rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 backdrop-blur-xl">
            <Suspense fallback={<ProfileFormSkeleton />}>
              <ProfileFormSection session={session} />
            </Suspense>
          </div>

          {/* User's Created Works */}
          <div className="bg-secondary/10 border border-border/30 rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 backdrop-blur-xl space-y-4 md:space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-border/30">
              <FolderGit2 className="text-primary" size={20} />
              <h2 className="text-lg font-bold text-white tracking-tight">Your Shipped Works</h2>
            </div>
            
            <Suspense fallback={<UserWorksSkeleton />}>
              <UserWorksSection session={session} />
            </Suspense>
          </div>
        </div>

        {/* Right Side: Achievements & Contribution Scorecard */}
        <div className="lg:col-span-4 space-y-6 md:space-y-8">
          <div className="bg-secondary/10 border border-border/30 rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 backdrop-blur-xl space-y-4 md:space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-border/30">
              <Award className="text-amber-400" size={20} />
              <h2 className="text-lg font-bold text-white tracking-tight">Contribution Scorecard</h2>
            </div>

            <Suspense fallback={<ScorecardSkeleton />}>
              <ScorecardSection session={session} />
            </Suspense>
          </div>

          <EnvironmentLinks />
        </div>
      </div>
    </div>
  )
}
