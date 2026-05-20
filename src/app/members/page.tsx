import { getMembers } from '@/app/actions/admin'
import { getWorks } from '@/app/actions'
import { getSession } from '@/lib/auth'
import MemberActivityClient from '@/components/MemberActivityClient'
import { Users } from 'lucide-react'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

async function MemberActivitySection() {
  let members: any[] = []
  let works: any[] = []
  const session = await getSession()
  
  try {
    members = await getMembers()
    works = await getWorks()
  } catch (e) {}

  return (
    <MemberActivityClient 
      members={members} 
      works={works} 
      currentUserId={session?.user?.id} 
    />
  )
}

function MembersSkeleton() {
  return (
    <div className="space-y-6">
      {/* Controls Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pb-6 border-b border-white/5 animate-pulse">
        <div className="h-11 w-full sm:max-w-md bg-white/5 rounded-2xl" />
        <div className="h-11 w-40 bg-white/5 rounded-2xl" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 select-none animate-pulse">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-zinc-900/10 border border-white/5 rounded-3xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/5" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 bg-white/5 rounded" />
                <div className="h-3 w-24 bg-white/5 rounded" />
              </div>
              <div className="h-12 w-16 bg-white/5 rounded-2xl" />
            </div>
            <div className="h-5 bg-white/5 rounded w-full" />
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map(j => (
                <div key={j} className="h-10 bg-white/5 rounded-2xl" />
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-3 w-24 bg-white/5 rounded" />
              <div className="flex gap-1.5">
                <div className="h-6 w-16 bg-white/5 rounded-lg" />
                <div className="h-6 w-20 bg-white/5 rounded-lg" />
                <div className="h-6 w-14 bg-white/5 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function MembersPage() {
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
            Full team directory with active sprint progress, overall average rating breakdown, and recent shipped works.
          </p>
        </div>
      </div>

      {/* Members Activity Section */}
      <div className="bg-secondary/10 border border-border/30 rounded-3xl p-6 backdrop-blur-xl">
        <Suspense fallback={<MembersSkeleton />}>
          <MemberActivitySection />
        </Suspense>
      </div>
    </div>
  )
}
