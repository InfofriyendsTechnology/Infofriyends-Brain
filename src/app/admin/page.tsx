import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminDashboardClient from './AdminDashboardClient'
import { Shield } from 'lucide-react'
import { getMembers } from '@/app/actions/admin'
import { getWorks } from '@/app/actions'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const session = await getSession()
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const members = await getMembers()
  const works = await getWorks()

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

      {/* Main Content */}
      <AdminDashboardClient initialMembers={members} initialWorks={works} />
    </div>
  )
}
