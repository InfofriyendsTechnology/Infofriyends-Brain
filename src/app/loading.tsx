import { Terminal } from 'lucide-react'

export default function Loading() {
  return (
    <div className="space-y-8 pb-20 max-w-[1960px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 select-none animate-pulse">
      {/* Header Banner Skeleton */}
      <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0d0e12] p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-muted-foreground uppercase">
              <Terminal size={12} /> Live Workspace
            </div>
            <div className="h-9 md:h-12 w-80 bg-white/5 rounded-2xl" />
            <div className="h-4 w-full md:w-3/4 bg-white/5 rounded-lg" />
          </div>
          <div className="flex flex-col md:items-end gap-2.5 shrink-0">
            <div className="h-6 w-36 bg-white/5 rounded-full" />
            <div className="space-y-1.5 mt-1">
              <div className="h-9 w-32 bg-white/5 rounded-xl" />
              <div className="h-3 w-40 bg-white/5 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Bar Skeleton (Exact replica of DashboardMetrics!) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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

      {/* Main SaaS Layout Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Active Projects Overview (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-[#0d0e12] border border-white/5 rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <div className="h-6 w-48 bg-white/5 rounded-lg" />
              <div className="h-4 w-28 bg-white/5 rounded-md" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          </div>
        </div>

        {/* Right Column: Leaderboard & Community Feed (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Founder Board (Leaderboard) Skeleton */}
          <div className="bg-[#0d0e12] border border-white/5 rounded-3xl p-6 space-y-6">
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

          {/* Today in Infofriyends (TodayChanged) Skeleton */}
          <div className="bg-[#0d0e12] border border-white/5 rounded-3xl p-6 md:p-8 space-y-8">
            <div className="space-y-2">
              <div className="h-6 w-48 bg-white/5 rounded-lg" />
              <div className="h-3.5 w-full bg-white/5 rounded" />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 w-20 bg-white/5 rounded" />
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-9 bg-white/5 rounded-xl" />
                  ))}
                </div>
              </div>
              <div className="h-20 w-full bg-white/5 rounded-xl" />
              <div className="h-11 w-full bg-white/5 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
