import { Terminal } from 'lucide-react'

export default function Loading() {
  return (
    <div className="space-y-6 md:space-y-8 pb-20 w-full px-4 sm:px-6 lg:px-12 pt-4 md:pt-6 animate-pulse select-none">
      {/* ── SHELL SKELETON ── */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-border/40 bg-gradient-to-br from-secondary/15 via-background to-secondary/10 p-4 sm:p-5 md:p-8 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#63BDF2]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#3188DA]/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#63BDF2]/10 border border-[#63BDF2]/20 text-xs font-semibold text-[#63BDF2] uppercase tracking-wider">
              <Terminal size={12} /> Live Workspace
            </div>
            <div className="h-8 md:h-12 w-64 md:w-96 bg-white/[0.06] rounded-2xl" />
            <div className="h-4 w-full md:w-3/4 bg-white/[0.06] rounded-lg max-w-xl" />
          </div>
          <div className="flex flex-col md:items-end gap-2.5 shrink-0">
            <div className="h-8 w-36 bg-white/[0.06] rounded-full" />
            <div className="h-4 w-24 bg-white/[0.06] rounded mt-2" />
          </div>
        </div>
      </div>

      {/* ── SKELETON for the data sections ── */}
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
