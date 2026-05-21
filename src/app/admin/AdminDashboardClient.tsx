'use client'

import { useState } from 'react'
import { Shield, UserPlus, CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react'
import { createMember } from '@/app/actions/admin'

export default function AdminDashboardClient() {
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [addSuccessData, setAddSuccessData] = useState<any | null>(null)

  async function handleAddSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmittingAdd(true)
    setAddError(null)
    setAddSuccessData(null)

    const formData = new FormData(e.currentTarget)
    try {
      const result = await createMember(formData)
      if (result?.success) {
        setAddSuccessData(result)
        e.currentTarget.reset()
      } else {
        setAddError(result?.error || 'Failed to create member')
      }
    } catch (err: any) {
      setAddError(err.message || 'Failed to create member')
    } finally {
      setIsSubmittingAdd(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-zinc-950/50 border border-white/10 shadow-2xl rounded-3xl overflow-hidden max-w-2xl">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#63BDF2] to-[#3188DA] flex items-center justify-center text-black shadow-lg">
              <Shield size={20} className="stroke-[2.5px]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Add New Member</h2>
              <p className="text-[11px] text-muted-foreground">Create credentials for a new team member to join the workspace.</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleAddSubmit} className="p-6 space-y-6 bg-[#0d0e12]">
          {addSuccessData && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs space-y-2">
              <p className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Member created successfully!
              </p>
              <p className="text-white/80">Share credentials securely:</p>
              <div className="p-2.5 bg-background/50 rounded-xl font-mono text-white space-y-1">
                <p>Username: <span className="text-[#63BDF2]">{addSuccessData.username}</span></p>
                <p>Password: <span className="text-[#63BDF2]">{addSuccessData.defaultPassword}</span></p>
              </div>
            </div>
          )}

          {addError && (
            <div className="p-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl text-xs flex items-center gap-2">
              <ShieldAlert size={14} />
              <span>{addError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Full Name</label>
              <input
                name="name"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-[#63BDF2]/50 focus:ring-1 focus:ring-[#63BDF2]/30 transition-all"
                placeholder="Alex Rivera"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Username</label>
              <input
                name="username"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-[#63BDF2]/50 focus:ring-1 focus:ring-[#63BDF2]/30 transition-all"
                placeholder="alex123"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Email Address</label>
              <input
                name="email"
                type="email"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-[#63BDF2]/50 focus:ring-1 focus:ring-[#63BDF2]/30 transition-all"
                placeholder="alex@infofriyends.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Mobile Number (Optional)</label>
              <input
                name="mobile"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-[#63BDF2]/50 focus:ring-1 focus:ring-[#63BDF2]/30 transition-all"
                placeholder="+1 234 567 890"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Password</label>
              <input
                name="password"
                type="password"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-[#63BDF2]/50 focus:ring-1 focus:ring-[#63BDF2]/30 transition-all"
                placeholder="••••••••••••"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Workspace Role</label>
              <select
                name="role"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#63BDF2]/50 focus:ring-1 focus:ring-[#63BDF2]/30 transition-all appearance-none cursor-pointer"
              >
                <option value="MEMBER" className="bg-[#0d0e12]">Team Member</option>
                <option value="NEUTRAL" className="bg-[#0d0e12]">Neutral (Anonymous)</option>
                <option value="ADMIN" className="bg-[#0d0e12]">Super Admin</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmittingAdd}
            className="w-full bg-gradient-to-r from-[#63BDF2] to-[#3188DA] hover:from-[#5BB1E4] hover:to-[#2B7BC9] text-[#09090b] font-black uppercase tracking-wider text-xs py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(99,189,242,0.2)] hover:shadow-[0_0_25px_rgba(99,189,242,0.4)] flex items-center justify-center gap-2 mt-4 active:scale-[0.98]"
          >
            {isSubmittingAdd ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={16} />}
            {isSubmittingAdd ? 'Creating...' : 'Create Member'}
          </button>
        </form>
      </div>
    </div>
  )
}
