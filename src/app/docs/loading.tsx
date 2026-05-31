import { HelpCircle } from 'lucide-react'

export default function DocsLoading() {
  return (
    <div className="space-y-6 md:space-y-8 pb-20 w-full px-4 sm:px-6 lg:px-12 pt-4 md:pt-6 animate-pulse select-none">
      
      {/* Header Banner Skeleton */}
      <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0d0e12] p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-muted-foreground uppercase">
              <HelpCircle size={12} /> System Documentation
            </div>
            <div className="h-9 md:h-12 w-80 bg-white/5 rounded-2xl" />
            <div className="h-4 w-full md:w-3/4 bg-white/5 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Docs Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar Skeleton (lg:col-span-3) */}
        <div className="lg:col-span-3 bg-[#0d0e12] border border-white/5 rounded-3xl p-4 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-full bg-white/5 rounded-xl border border-white/5" />
          ))}
        </div>

        {/* Content Panel Skeleton (lg:col-span-9) */}
        <div className="lg:col-span-9 bg-[#0d0e12] border border-white/5 rounded-3xl p-6 md:p-8 min-h-[400px] space-y-6">
          {/* Section title */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/5 rounded-md" />
            <div className="h-5 w-48 bg-white/5 rounded-lg" />
          </div>

          {/* Description line */}
          <div className="h-4 w-5/6 bg-white/5 rounded" />

          {/* Grid of tech stack cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 border border-white/5 rounded-2xl space-y-3 bg-[#09090b]">
                <div className="h-3 w-28 bg-white/5 rounded" />
                <div className="h-4.5 w-44 bg-white/5 rounded-md" />
                <div className="h-3.5 w-full bg-white/5 rounded" />
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}
