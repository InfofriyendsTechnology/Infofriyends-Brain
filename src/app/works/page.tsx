import { getWorks } from '@/app/actions'
import { getSession } from '@/lib/auth'
import WorkWall from '@/components/WorkWall'
import AddWorkModal from '@/components/AddWorkModal'
import CreateWorkTrigger from '@/components/CreateWorkTrigger'
import { FolderGit2 } from 'lucide-react'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

// --- WORK WALL STREAMING SECTION ---
async function WorkWallSection({ session }: { session: any }) {
  let works: any[] = []
  try {
    works = await getWorks()
  } catch (error) {}

  return <WorkWall works={works} currentUser={session?.user} />
}

function WorkWallSkeleton() {
  return (
    <div className="space-y-8 select-none animate-pulse">
      {/* Top HUD Control Panel Skeleton */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/5 border border-white/5 text-muted-foreground rounded-2xl">
            <FolderGit2 size={24} />
          </div>
          <div className="space-y-2">
            <div className="h-5 w-40 bg-white/5 rounded-lg" />
            <div className="h-3 w-48 bg-white/5 rounded" />
          </div>
        </div>

        {/* Filters Controls Skeleton */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="h-9 w-64 bg-white/5 rounded-xl border border-white/5" />
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-9 w-20 bg-white/5 rounded-xl border border-white/5" />
            ))}
          </div>
        </div>
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="relative group p-6 rounded-3xl border border-white/10 flex flex-col h-52 bg-[#09090b]">
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
    </div>
  )
}

// --- MAIN DYNAMIC PAGE ---
export default async function WorksPage() {
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
              <FolderGit2 size={12} /> Work Board
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Work <span className="bg-gradient-to-r from-[#63BDF2] to-[#3188DA] bg-clip-text text-transparent">Wall</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl leading-relaxed">
              Track and grow active products, archive completed tasks, and maintain team audit visibility.
            </p>
          </div>
          {session && <CreateWorkTrigger />}
        </div>
      </div>

      {/* Dedicated Work Wall panel */}
      <div className="bg-secondary/10 border border-border/30 rounded-3xl p-6 backdrop-blur-xl">
        <Suspense fallback={<WorkWallSkeleton />}>
          <WorkWallSection session={session} />
        </Suspense>
      </div>
    </div>
  )
}
