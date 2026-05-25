import { getIdeasWithSupports, getWorks } from '@/app/actions'
import { getMembers } from '@/app/actions/admin'
import { getSession } from '@/lib/auth'
import IdeaAgreementHub from '@/components/IdeaAgreementHub'
import { Lightbulb } from 'lucide-react'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

// --- PROPOSALS STREAMING SECTION ---
async function ProposalsSection({ session }: { session: any }) {
  let ideas: any[] = []
  let members: any[] = []
  let works: any[] = []
  let membersCount = 0
  try {
    ideas = await getIdeasWithSupports()
    members = await getMembers()
    works = await getWorks()
    membersCount = members.filter((m: any) => m.role !== 'ADMIN').length
  } catch (error) {}

  return (
    <IdeaAgreementHub 
      ideas={ideas} 
      currentUser={session?.user} 
      membersCount={membersCount} 
      members={members}
      works={works}
    />
  )
}

function ProposalsSkeleton() {
  return (
    <div className="space-y-6 select-none animate-pulse">
      <div className="flex justify-between items-center pb-4 border-b border-white/5">
        <div className="h-6 w-48 md:w-56 bg-white/[0.06] rounded-lg" />
        <div className="h-9 w-28 md:w-32 bg-white/[0.06] rounded-xl" />
      </div>
      <div className="overflow-x-auto scrollbar-none -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0">
        <div className="flex bg-white/[0.02] p-1 rounded-2xl border border-white/5 gap-1.5 w-max min-w-full md:w-full md:grid md:grid-cols-5">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex-1 flex-shrink-0 h-9 sm:h-11 bg-white/[0.06] rounded-xl" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-36 bg-white/[0.06] rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

import { redirect } from 'next/navigation'

// --- MAIN PAGE ---
export default async function ProposalsPage() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-20 w-full px-4 sm:px-6 lg:px-12 pt-4 md:pt-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-border/40 bg-gradient-to-br from-yellow-500/5 via-background to-amber-500/5 p-4 sm:p-5 md:p-8 backdrop-blur-xl">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-400/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-xs font-semibold text-yellow-400 uppercase tracking-wider">
            <Lightbulb size={12} /> Decision Hub
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Proposals & <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">Decisions</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl leading-relaxed">
            Company ideas start here. Team members propose, vote to agree, queue for execution, or decline with documented reasoning. 
            Once the team aligns, proposals convert to active workspace tasks with full audit trail.
          </p>

          {/* How It Works — Inline Flow Diagram */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {[
              { label: 'Propose', color: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' },
              { label: '→', color: 'text-zinc-600' },
              { label: 'Team Votes', color: 'bg-[#63BDF2]/10 text-[#63BDF2] border-[#63BDF2]/20' },
              { label: '→', color: 'text-zinc-600' },
              { label: 'Queue / Decline', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
              { label: '→', color: 'text-zinc-600' },
              { label: 'Start Work', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
            ].map((step, i) => (
              step.label === '→' ? (
                <span key={i} className={`text-sm font-bold hidden sm:inline-block ${step.color}`}>{step.label}</span>
              ) : (
                <span key={i} className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold uppercase tracking-wider ${step.color}`}>
                  {step.label}
                </span>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Full Proposals Management Hub */}
      <div className="bg-secondary/10 border border-border/30 rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 backdrop-blur-xl">
        <Suspense fallback={<ProposalsSkeleton />}>
          <ProposalsSection session={session} />
        </Suspense>
      </div>
    </div>
  )
}
