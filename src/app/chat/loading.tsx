export default function ChatLoading() {
  return (
    <div className="h-full w-full max-w-[1960px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col overflow-hidden select-none animate-pulse">
      <div className="flex-1 flex bg-[#0c0d12]/40 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl h-full shadow-2xl relative">
        
        {/* Sidebar Skeleton */}
        <div className="hidden md:flex w-80 border-r border-white/10 bg-[#09090b]/80 flex-col shrink-0">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/5" />
              <div className="space-y-1">
                <div className="h-3 w-20 bg-white/5 rounded" />
                <div className="h-2 w-24 bg-white/5 rounded" />
              </div>
            </div>
          </div>
          <div className="flex-1 p-4 space-y-6 overflow-hidden">
            <div className="space-y-2">
              <div className="h-2.5 w-24 bg-white/5 rounded px-2" />
              <div className="space-y-1.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 w-full bg-white/5 rounded-xl" />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-2.5 w-24 bg-white/5 rounded px-2" />
              <div className="space-y-1.5">
                {[1, 2].map((i) => (
                  <div key={i} className="h-8 w-full bg-white/5 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Pane Skeleton */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-6 py-4 border-b border-white/10 bg-[#0d0e12]/60 flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-4 w-36 bg-white/5 rounded-lg" />
              <div className="h-2.5 w-64 bg-white/5 rounded" />
            </div>
            <div className="w-24 h-6 bg-white/5 rounded-full" />
          </div>
          <div className="flex-1 p-6 space-y-6 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex gap-3 max-w-[70%] ${i % 2 === 0 ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-white/5 shrink-0" />
                <div className="space-y-1">
                  <div className="h-3 w-16 bg-white/5 rounded" />
                  <div className="h-16 w-64 bg-white/5 rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-white/10 bg-[#0d0e12]/60">
            <div className="h-10 w-full bg-white/5 rounded-xl" />
          </div>
        </div>

      </div>
    </div>
  )
}
