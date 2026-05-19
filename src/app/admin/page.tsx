import { getMembers } from '@/app/actions/admin'
import AdminDashboardClient from '@/components/AdminDashboardClient'
import { Suspense } from 'react'
import { UserPlus } from 'lucide-react'

export const dynamic = 'force-dynamic'

// --- ADMIN MEMBERS STREAMING SECTION ---
async function AdminSection() {
  let members: any[] = []
  try {
    members = await getMembers()
  } catch (e) {}

  return <AdminDashboardClient initialMembers={members} />
}

function AdminSkeleton() {
  return (
    <div className="space-y-8 select-none animate-pulse">
      {/* Top HUD Row Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="h-9 w-64 bg-white/5 rounded-xl border border-white/5" />
          <div className="h-4 w-96 bg-white/5 rounded-lg border border-white/5" />
        </div>
        <button className="flex items-center gap-2 bg-white/5 text-transparent px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-white/5 cursor-pointer shrink-0">
          <UserPlus size={16} /> Add New Member
        </button>
      </div>

      {/* Main Table Container Skeleton */}
      <div className="bg-secondary/10 border border-border/30 rounded-3xl p-6 backdrop-blur-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/30">
          <div className="h-6 w-48 bg-white/5 rounded-lg" />
          <div className="h-10 w-80 bg-white/5 rounded-xl border border-white/5" />
        </div>

        {/* Table Body Skeleton */}
        <div className="border border-border/50 rounded-2xl overflow-hidden bg-background/30">
          <div className="overflow-x-auto">
            <div className="divide-y divide-border/50">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5" />
                    <div className="space-y-1">
                      <div className="h-3 w-32 bg-white/5 rounded" />
                      <div className="h-2.5 w-24 bg-white/5 rounded" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 w-28 bg-white/5 rounded" />
                    <div className="h-2.5 w-36 bg-white/5 rounded" />
                  </div>
                  <div className="h-6 w-20 bg-white/5 rounded-full" />
                  <div className="h-6 w-16 bg-white/5 rounded-lg" />
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-white/5 rounded-lg" />
                    <div className="w-8 h-8 bg-white/5 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- MAIN DYNAMIC PAGE ---
export default async function AdminPage() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 pt-6 pb-24">
      <Suspense fallback={<AdminSkeleton />}>
        <AdminSection />
      </Suspense>
    </div>
  )
}
