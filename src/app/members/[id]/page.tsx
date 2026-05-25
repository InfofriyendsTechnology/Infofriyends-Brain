import { getMembers } from '@/app/actions/admin'
import { getWorks } from '@/app/actions'
import { getSession } from '@/lib/auth'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Briefcase } from 'lucide-react'
import ImpersonateButton from '@/components/ImpersonateButton'
import WorkCard from '@/components/WorkCard'

import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  
  const members = await getMembers()
  const works = await getWorks()
  
  const member = members.find((m: any) => m.id === id)
  
  if (!member) {
    notFound()
  }

  const memberWorks = works.filter((w: any) => w.creatorId === member.id && w.status !== 'DELETED')
  const activeWorks = memberWorks.filter((w: any) => w.status === 'ACTIVE')
  
  return (
    <div className="space-y-8 pb-20 w-full px-4 sm:px-6 lg:px-12 pt-6 max-w-4xl mx-auto">
      {/* Back Navigation */}
      <Link href="/members" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-bold">
        <ArrowLeft size={16} /> Back to Members
      </Link>

      <div className="bg-secondary/10 border border-border/30 rounded-3xl p-8 backdrop-blur-xl space-y-8">
        
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center">
          {member.profilePhoto ? (
            <img 
              src={member.profilePhoto} 
              alt={member.name} 
              className="w-32 h-32 rounded-[2rem] object-cover border-4 border-white/10 shadow-2xl mb-6" 
            />
          ) : (
            <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-4 border-amber-500/20 text-amber-400 flex items-center justify-center font-black text-6xl uppercase mb-6 shadow-2xl shadow-amber-500/10">
              {member.name.charAt(0)}
            </div>
          )}
          
          <h1 className="text-3xl font-black text-white capitalize">{member.name}</h1>
          <p className="text-base text-zinc-400 font-mono mt-1">@{member.username}</p>
          
          {/* Sub-stats */}
          <div className="flex gap-6 mt-8">
            <div className="flex flex-col items-center px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
              <span className="text-2xl font-black text-emerald-400">{member.contributionScore}</span>
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mt-1">Points</span>
            </div>
            <div className="flex flex-col items-center px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
              <span className="text-2xl font-black text-[#63BDF2]">{activeWorks.length}</span>
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mt-1">Active Works</span>
            </div>
            <div className="flex flex-col items-center px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
              <span className="text-2xl font-black text-white">{memberWorks.length}</span>
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mt-1">Total Works</span>
            </div>
          </div>
        </div>

        {/* Impersonate Button for Admin */}
        {session?.user?.role === 'ADMIN' && session?.user?.id !== member.id && (
          <div className="max-w-xs mx-auto">
            <ImpersonateButton memberId={member.id} memberName={member.name} />
          </div>
        )}

        <div className="border-t border-white/10 pt-8 mt-8">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Briefcase size={20} className="text-amber-400" />
            Recent Activity & Works
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {memberWorks.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10).map((work: any) => (
              <WorkCard key={work.id} work={work} currentUser={session?.user} />
            ))}
          </div>
          
          {memberWorks.length === 0 && (
            <div className="p-8 text-center text-zinc-500 text-sm border border-dashed border-white/10 rounded-2xl">
              No activity found for this member yet.
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
