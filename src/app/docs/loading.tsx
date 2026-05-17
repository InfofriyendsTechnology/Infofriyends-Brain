export default function DocsLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 space-y-8 select-none animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-9 w-64 bg-white/5 rounded-xl border border-white/5" />
        <div className="h-4 w-96 bg-white/5 rounded-lg border border-white/5" />
      </div>

      {/* Docs cards list Skeleton */}
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5" />
              <div className="h-5 w-48 bg-white/5 rounded-lg" />
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-3.5 w-full bg-white/5 rounded" />
              <div className="h-3.5 w-11/12 bg-white/5 rounded" />
              <div className="h-3.5 w-5/6 bg-white/5 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
