import { User, Award, FolderGit2 } from 'lucide-react'

export default function ProfileLoading() {
  return (
    <div className="space-y-6 md:space-y-8 pb-20 w-full px-4 sm:px-6 lg:px-12 pt-4 md:pt-6 animate-pulse select-none">
      
      {/* Header Banner Skeleton */}
      <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0d0e12] p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-muted-foreground uppercase">
              <User size={12} /> Account Center
            </div>
            <div className="h-9 md:h-12 w-80 bg-white/5 rounded-2xl" />
            <div className="h-4 w-full md:w-3/4 bg-white/5 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form & Works (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Profile Form Card Skeleton */}
          <div className="bg-[#0d0e12] border border-white/5 rounded-3xl p-6 md:p-8 space-y-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/5">
              <div className="w-24 h-24 rounded-full bg-white/5 shrink-0" />
              <div className="text-center sm:text-left space-y-2 flex-1">
                <div className="h-5 w-32 bg-white/5 rounded mx-auto sm:mx-0" />
                <div className="h-3 w-64 bg-white/5 rounded mx-auto sm:mx-0" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="h-4 w-28 bg-white/5 rounded" />
                <div className="h-11 w-full bg-white/5 rounded-xl" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-28 bg-white/5 rounded" />
                <div className="h-11 w-full bg-white/5 rounded-xl" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <div className="h-4 w-32 bg-white/5 rounded" />
                <div className="h-11 w-full bg-white/5 rounded-xl" />
              </div>
            </div>

            <div className="h-11 w-32 bg-white/5 rounded-xl" />
          </div>

          {/* User's Created Works Skeleton */}
          <div className="bg-[#0d0e12] border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/5">
              <FolderGit2 className="text-muted-foreground" size={20} />
              <div className="h-5 w-44 bg-white/5 rounded-lg" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
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

        {/* Right Column: Scorecard (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-8">
          
          <div className="bg-[#0d0e12] border border-white/5 rounded-3xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/5">
              <Award className="text-muted-foreground" size={20} />
              <div className="h-5 w-48 bg-white/5 rounded-lg" />
            </div>

            <div className="p-5 rounded-2xl border border-white/5 bg-white/5 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-white/5 mx-auto" />
              <div className="space-y-2">
                <div className="h-3 w-24 bg-white/5 rounded mx-auto" />
                <div className="h-9 w-16 bg-white/5 rounded-xl mx-auto" />
                <div className="h-3 w-full bg-white/5 rounded" />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="h-3 w-32 bg-white/5 rounded" />
              <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-white/5">
                <div className="h-4 w-24 bg-white/5 rounded" />
                <div className="h-6 w-16 bg-white/5 rounded" />
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
