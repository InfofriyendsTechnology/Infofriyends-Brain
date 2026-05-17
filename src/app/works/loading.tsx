import { FolderGit2 } from 'lucide-react'

export default function WorksLoading() {
  return (
    <div className="space-y-8 pb-20 max-w-[1960px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 select-none animate-pulse">
      {/* Header Banner Skeleton */}
      <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0d0e12] p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-muted-foreground uppercase">
              <FolderGit2 size={12} /> Work Board
            </div>
            <div className="h-9 md:h-12 w-80 bg-white/5 rounded-2xl" />
            <div className="h-4 w-full md:w-3/4 bg-white/5 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Outer Content Wall Container */}
      <div className="bg-[#0d0e12]/40 border border-white/10 rounded-3xl p-6">
        <div className="space-y-8">
          
          {/* Top HUD Header Control Panel Skeleton */}
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
      </div>
    </div>
  )
}
