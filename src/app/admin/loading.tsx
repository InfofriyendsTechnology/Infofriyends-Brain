import { Shield } from 'lucide-react'

export default function AdminLoading() {
  return (
    <div className="space-y-8 pb-20 w-full px-4 sm:px-6 lg:px-12 pt-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-[#63BDF2]/10 via-background to-[#3188DA]/5 p-6 md:p-8 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#63BDF2]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#3188DA]/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#63BDF2]/10 border border-[#63BDF2]/20 text-xs font-semibold text-[#63BDF2] uppercase tracking-wider">
            <Shield size={12} /> Admin Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Super <span className="bg-gradient-to-r from-[#63BDF2] to-[#3188DA] bg-clip-text text-transparent">Admin Hub</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl leading-relaxed">
            Manage your organization professionally. Add new members and manage team access securely.
          </p>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="bg-[#0d0e12]/40 border border-white/10 rounded-3xl p-6">
        <div className="space-y-6 animate-pulse select-none">
          <div className="flex justify-between items-center pb-4 border-b border-white/5">
            <div className="h-6 w-48 bg-white/5 rounded-lg" />
            <div className="h-9 w-32 bg-white/5 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/5 bg-[#09090b] space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-white/5 rounded" />
                    <div className="h-3 w-16 bg-white/5 rounded" />
                  </div>
                </div>
                <div className="h-10 w-full bg-white/5 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
