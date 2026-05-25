'use client'

import { useState } from 'react'
import { Shield, UserPlus, CheckCircle2, ShieldAlert, Loader2, Trash2, Edit3, Lock, Database, Search, Users, Briefcase, X, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { createMember, updateMember, deleteMember, adminEditWork } from '@/app/actions/admin'
import { permanentlyDeleteWork } from '@/app/actions'
import { useStore } from '@/store/useStore'
import { useRouter } from 'next/navigation'

interface AdminDashboardClientProps {
  initialMembers: any[]
  initialWorks: any[]
}

const calculateHoursPoints = (hours: number | null) => {
  if (hours === null || hours === undefined || hours === 0) return 0
  const pointsDays = Math.floor(hours / 24)
  const pointsHours = hours % 24
  const extraPoints = pointsHours >= 4 ? 5 : pointsHours >= 2 ? 2 : pointsHours >= 1 ? 1 : 0
  return (pointsDays * 5) + extraPoints
}

export default function AdminDashboardClient({ initialMembers = [], initialWorks = [] }: AdminDashboardClientProps) {
  const router = useRouter()
  const { addToast, showConfirm } = useStore()

  const [activeTab, setActiveTab] = useState<'add' | 'members' | 'works'>('add')
  const [members, setMembers] = useState<any[]>(initialMembers)
  const [works, setWorks] = useState<any[]>(initialWorks)

  // Show/Hide password states
  const [showAddPassword, setShowAddPassword] = useState(false)
  const [showEditPassword, setShowEditPassword] = useState(false)

  // Search filter query
  const [searchQuery, setSearchQuery] = useState('')

  // Add member states
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [addSuccessData, setAddSuccessData] = useState<any | null>(null)

  // Edit member modal states
  const [editingMember, setEditingMember] = useState<any | null>(null)
  const [editMemberName, setEditMemberName] = useState('')
  const [editMemberEmail, setEditMemberEmail] = useState('')
  const [editMemberUsername, setEditMemberUsername] = useState('')
  const [editMemberRole, setEditMemberRole] = useState<'ADMIN' | 'MEMBER' | 'NEUTRAL'>('MEMBER')
  const [editMemberCustomRole, setEditMemberCustomRole] = useState('')
  const [editMemberPassword, setEditMemberPassword] = useState('')
  const [isUpdatingMember, setIsUpdatingMember] = useState(false)

  // Edit work modal states
  const [editingWork, setEditingWork] = useState<any | null>(null)
  const [editWorkName, setEditWorkName] = useState('')
  const [editWorkDescription, setEditWorkDescription] = useState('')
  const [editWorkPriority, setEditWorkPriority] = useState('MEDIUM')
  const [editWorkStatus, setEditWorkStatus] = useState('IDEA')
  const [editWorkExpectedHours, setEditWorkExpectedHours] = useState<number | ''>('')
  const [editWorkActualHours, setEditWorkActualHours] = useState<number | ''>('')
  const [editWorkBlockedReason, setEditWorkBlockedReason] = useState('')
  const [isUpdatingWork, setIsUpdatingWork] = useState(false)

  // --- ACTIONS ---

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
        // Refresh local data list dynamically
        router.refresh()
        const refreshedData = await fetch('/api/auth/session').then(() => window.location.reload())
      } else {
        setAddError(result?.error || 'Failed to create member')
      }
    } catch (err: any) {
      setAddError(err.message || 'Failed to create member')
    } finally {
      setIsSubmittingAdd(false)
    }
  }

  async function handleUpdateMemberSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingMember) return
    setIsUpdatingMember(true)

    try {
      const res = await updateMember(
        editingMember.id,
        editMemberName,
        editMemberEmail,
        editMemberUsername,
        editMemberRole,
        editMemberCustomRole,
        editMemberPassword
      )

      if (res.success) {
        addToast('Member profile updated successfully!', 'success')
        setEditingMember(null)
        router.refresh()
        setTimeout(() => window.location.reload(), 800)
      } else {
        addToast(res.error || 'Failed to update member', 'error')
      }
    } catch (err: any) {
      addToast(err.message || 'An error occurred', 'error')
    } finally {
      setIsUpdatingMember(false)
    }
  }

  async function handleDeleteMember(memberId: string, memberName: string) {
    const confirm = await showConfirm({
      title: 'Delete Member Account',
      message: `Are you absolutely sure you want to delete ${memberName}? This will delete all of their community posts and work items permanently to preserve database integrity.`,
      confirmText: 'Delete Permanently',
      cancelText: 'Cancel',
      danger: true
    })

    if (confirm) {
      try {
        const res = await deleteMember(memberId)
        if (res.success) {
          addToast('Member deleted successfully!', 'success')
          router.refresh()
          setTimeout(() => window.location.reload(), 800)
        } else {
          addToast(res.error || 'Failed to delete member', 'error')
        }
      } catch (err: any) {
        addToast(err.message || 'An error occurred', 'error')
      }
    }
  }

  async function handleUpdateWorkSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingWork) return
    setIsUpdatingWork(true)

    const expHours = editWorkExpectedHours !== '' ? Number(editWorkExpectedHours) : null
    const actHours = editWorkActualHours !== '' ? Number(editWorkActualHours) : null

    try {
      const res = await adminEditWork(
        editingWork.id,
        editWorkName,
        editWorkDescription,
        editWorkPriority,
        editWorkStatus,
        expHours,
        actHours,
        editWorkBlockedReason
      )

      if (res.success) {
        addToast('Work details updated successfully!', 'success')
        setEditingWork(null)
        router.refresh()
        setTimeout(() => window.location.reload(), 800)
      } else {
        addToast(res.error || 'Failed to update work details', 'error')
      }
    } catch (err: any) {
      addToast(err.message || 'An error occurred', 'error')
    } finally {
      setIsUpdatingWork(false)
    }
  }

  async function handleDeleteWork(workId: string, workName: string) {
    const confirm = await showConfirm({
      title: 'Delete Work Item',
      message: `Are you absolutely sure you want to permanently delete "${workName}" from the database? This action is irreversible.`,
      confirmText: 'Delete Item',
      cancelText: 'Cancel',
      danger: true
    })

    if (confirm) {
      try {
        const res = await permanentlyDeleteWork(workId)
        if (res.success) {
          addToast('Work item deleted successfully!', 'success')
          router.refresh()
          setTimeout(() => window.location.reload(), 800)
        } else {
          addToast(res.error || 'Failed to delete work item', 'error')
        }
      } catch (err: any) {
        addToast(err.message || 'An error occurred', 'error')
      }
    }
  }

  // --- FILTERS ---
  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.customRole && m.customRole.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const filteredWorks = works.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.creator?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Premium Tab Buttons */}
      <div className="flex bg-[#0c0d12]/80 p-1.5 border border-white/5 rounded-2xl w-max gap-1">
        <button
          onClick={() => { setActiveTab('add'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-300 cursor-pointer ${
            activeTab === 'add'
              ? 'bg-gradient-to-r from-[#63BDF2]/20 to-[#3188DA]/20 border border-[#63BDF2]/30 text-[#63BDF2] shadow-md'
              : 'text-zinc-400 hover:text-white border border-transparent'
          }`}
        >
          <UserPlus size={14} /> Add Member
        </button>

        <button
          onClick={() => { setActiveTab('members'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-300 cursor-pointer ${
            activeTab === 'members'
              ? 'bg-gradient-to-r from-[#63BDF2]/20 to-[#3188DA]/20 border border-[#63BDF2]/30 text-[#63BDF2] shadow-md'
              : 'text-zinc-400 hover:text-white border border-transparent'
          }`}
        >
          <Users size={14} /> Manage Members
        </button>

        <button
          onClick={() => { setActiveTab('works'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-300 cursor-pointer ${
            activeTab === 'works'
              ? 'bg-gradient-to-r from-[#63BDF2]/20 to-[#3188DA]/20 border border-[#63BDF2]/30 text-[#63BDF2] shadow-md'
              : 'text-zinc-400 hover:text-white border border-transparent'
          }`}
        >
          <Database size={14} /> Database Console (Works)
        </button>
      </div>

      {/* --- ADD NEW MEMBER TAB --- */}
      {activeTab === 'add' && (
        <div className="bg-zinc-950/50 border border-white/10 shadow-2xl rounded-3xl overflow-hidden max-w-2xl backdrop-blur-xl">
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
          
          <form onSubmit={handleAddSubmit} className="p-6 space-y-6 bg-[#0d0e12]/60">
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
                <div className="relative">
                  <input
                    name="password"
                    type={showAddPassword ? 'text' : 'password'}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-[#63BDF2]/50 focus:ring-1 focus:ring-[#63BDF2]/30 transition-all"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors p-1 cursor-pointer"
                  >
                    {showAddPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Workspace Privilege</label>
                <select
                  name="role"
                  className="w-full bg-[#0d0e12] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#63BDF2]/50 focus:ring-1 focus:ring-[#63BDF2]/30 transition-all cursor-pointer"
                >
                  <option value="MEMBER">Team Member</option>
                  <option value="NEUTRAL">Neutral (Dispute Mediator)</option>
                  <option value="ADMIN">Super Admin</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Custom Role Title (Rename Display Role)</label>
                <input
                  name="customRole"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-[#63BDF2]/50 focus:ring-1 focus:ring-[#63BDF2]/30 transition-all"
                  placeholder="e.g. Lead Developer, Community Mediator, Caste Coordinator"
                />
                <p className="text-[9px] text-zinc-500">*Privilege stays standard but this customized title will be displayed publicly.</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingAdd}
              className="w-full bg-gradient-to-r from-[#63BDF2] to-[#3188DA] hover:from-[#5BB1E4] hover:to-[#2B7BC9] text-[#09090b] font-black uppercase tracking-wider text-xs py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(99,189,242,0.2)] hover:shadow-[0_0_25px_rgba(99,189,242,0.4)] flex items-center justify-center gap-2 mt-4 active:scale-[0.98] cursor-pointer"
            >
              {isSubmittingAdd ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={16} />}
              {isSubmittingAdd ? 'Creating...' : 'Create Member'}
            </button>
          </form>
        </div>
      )}

      {/* --- MANAGE MEMBERS TAB --- */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {/* Search box */}
          <div className="relative max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#63BDF2] transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search members by name, username, email or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-zinc-950/50 border border-white/5 rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#63BDF2]/30 transition-all"
            />
          </div>

          {/* Members Table */}
          <div className="bg-zinc-950/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-wider text-zinc-400">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Username & Email</th>
                    <th className="px-6 py-4">Underlying Privilege</th>
                    <th className="px-6 py-4">Custom Role Title</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs text-white/90">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#63BDF2]/10 to-[#3188DA]/10 flex items-center justify-center font-bold text-[#63BDF2] uppercase border border-[#63BDF2]/20">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold block capitalize">{member.name}</span>
                            <span className="text-[10px] text-zinc-500">Points: {member.contributionScore || 0}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono block text-zinc-400">@{member.username}</span>
                        <span className="text-[10px] text-zinc-500">{member.email || 'No Email'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          member.role === 'ADMIN' 
                            ? 'bg-[#63BDF2]/10 text-[#63BDF2] border border-[#63BDF2]/20'
                            : member.role === 'NEUTRAL'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-zinc-300 font-medium italic">
                          {member.customRole || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingMember(member);
                              setEditMemberName(member.name);
                              setEditMemberEmail(member.email || '');
                              setEditMemberUsername(member.username);
                              setEditMemberRole(member.role);
                              setEditMemberCustomRole(member.customRole || '');
                              setEditMemberPassword('');
                            }}
                            className="p-1.5 bg-white/5 border border-white/10 hover:border-[#63BDF2]/40 rounded-lg text-zinc-400 hover:text-[#63BDF2] transition-colors cursor-pointer"
                            title="Edit Role & Details"
                          >
                            <Edit3 size={12} />
                          </button>

                          <button
                            onClick={() => handleDeleteMember(member.id, member.name)}
                            className="p-1.5 bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 rounded-lg text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete Member"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredMembers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-zinc-500 italic">No members found matching query.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- DATABASE WORKS TAB --- */}
      {activeTab === 'works' && (
        <div className="space-y-4">
          {/* Search box */}
          <div className="relative max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#63BDF2] transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search works/ideas by title, status, description or creator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-zinc-950/50 border border-white/5 rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#63BDF2]/30 transition-all"
            />
          </div>

          {/* Master Works Table */}
          <div className="bg-zinc-950/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-wider text-zinc-400">
                    <th className="px-6 py-4">Work / Title</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Status & Creator</th>
                    <th className="px-6 py-4">Expected/Actual Points</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs text-white/90">
                  {filteredWorks.map((work) => (
                    <tr key={work.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="max-w-xs md:max-w-md">
                          <span className="font-bold block truncate text-zinc-100">{work.name}</span>
                          <span className="text-[10px] text-zinc-500 line-clamp-1">{work.description || 'No Description'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                          work.type === 'IDEA' 
                            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {work.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                            work.status === 'COMPLETED' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : work.status === 'BLOCKED'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : work.status === 'ACTIVE'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {work.status}
                          </span>
                          <span className="text-[10px] text-zinc-500 block truncate">By: {work.creator?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-[10px] text-zinc-300">
                        <div>Exp: <span className="text-yellow-500">{work.expectedDurationHours ?? '—'} hrs ({calculateHoursPoints(work.expectedDurationHours)} pts)</span></div>
                        <div>Act: <span className="text-emerald-400">{work.actualDurationHours ?? '—'} hrs ({calculateHoursPoints(work.actualDurationHours)} pts)</span></div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingWork(work);
                              setEditWorkName(work.name);
                              setEditWorkDescription(work.description);
                              setEditWorkPriority(work.priority);
                              setEditWorkStatus(work.status);
                              setEditWorkExpectedHours(work.expectedDurationHours ?? '');
                              setEditWorkActualHours(work.actualDurationHours ?? '');
                              setEditWorkBlockedReason(work.blockedReason || '');
                            }}
                            className="p-1.5 bg-white/5 border border-white/10 hover:border-[#63BDF2]/40 rounded-lg text-zinc-400 hover:text-[#63BDF2] transition-colors cursor-pointer"
                            title="Edit Work Fields"
                          >
                            <Edit3 size={12} />
                          </button>

                          <button
                            onClick={() => handleDeleteWork(work.id, work.name)}
                            className="p-1.5 bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 rounded-lg text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete Permanently"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredWorks.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-zinc-500 italic">No tasks or proposals found matching query.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT MEMBER SLIDE-OVER / MODAL --- */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#0d0e12] border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setEditingMember(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#63BDF2]/10 flex items-center justify-center text-[#63BDF2] border border-[#63BDF2]/20">
                <Shield size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Edit Member & Role</h3>
                <p className="text-[10px] text-zinc-500">Modify credentials, privileges, custom display roles, or reset passwords.</p>
              </div>
            </div>

            <form onSubmit={handleUpdateMemberSubmit} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-wider">Full Name</label>
                <input
                  required
                  value={editMemberName}
                  onChange={e => setEditMemberName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#63BDF2]/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-wider">Username</label>
                <input
                  required
                  value={editMemberUsername}
                  onChange={e => setEditMemberUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#63BDF2]/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-wider">Email Address</label>
                <input
                  required
                  type="email"
                  value={editMemberEmail}
                  onChange={e => setEditMemberEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#63BDF2]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-wider">Privilege Role</label>
                  <select
                    value={editMemberRole}
                    onChange={e => setEditMemberRole(e.target.value as any)}
                    className="w-full bg-[#0d0e12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#63BDF2]/50"
                  >
                    <option value="MEMBER">MEMBER</option>
                    <option value="NEUTRAL">NEUTRAL</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-wider">Reset Password</label>
                  <div className="relative">
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      placeholder="Leave blank to keep"
                      value={editMemberPassword}
                      onChange={e => setEditMemberPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-3 pr-10 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#63BDF2]/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors p-1 cursor-pointer"
                    >
                      {showEditPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-wider">Custom Role Title (Rename Display Role)</label>
                <input
                  value={editMemberCustomRole}
                  onChange={e => setEditMemberCustomRole(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#63BDF2]/50"
                  placeholder="e.g. Caste Head, Neutral Judge, Lead Member"
                />
                <p className="text-[8px] text-zinc-500">*Renames display only. Administrative rules & privileges remain unchanged.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="text-xs bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingMember}
                  className="text-xs bg-[#63BDF2] text-[#09090b] hover:bg-[#5BB1E4] px-4 py-2 rounded-xl font-black uppercase tracking-wider disabled:opacity-50 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {isUpdatingMember ? <Loader2 size={12} className="animate-spin" /> : null} Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT WORK SLIDE-OVER / MODAL --- */}
      {editingWork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#0d0e12] border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setEditingWork(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#63BDF2]/20 to-[#3188DA]/20 flex items-center justify-center text-[#63BDF2] border border-[#63BDF2]/20">
                <Database size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Master Edit Work Item</h3>
                <p className="text-[10px] text-zinc-500">Edit any relational data fields in database directly as a Super Admin.</p>
              </div>
            </div>

            <form onSubmit={handleUpdateWorkSubmit} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-wider">Work Item Title</label>
                <input
                  required
                  value={editWorkName}
                  onChange={e => setEditWorkName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#63BDF2]/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-wider">Description</label>
                <textarea
                  required
                  rows={2}
                  value={editWorkDescription}
                  onChange={e => setEditWorkDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#63BDF2]/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-wider">Priority</label>
                  <select
                    value={editWorkPriority}
                    onChange={e => setEditWorkPriority(e.target.value)}
                    className="w-full bg-[#0d0e12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#63BDF2]/50"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-wider">Status</label>
                  <select
                    value={editWorkStatus}
                    onChange={e => setEditWorkStatus(e.target.value)}
                    className="w-full bg-[#0d0e12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#63BDF2]/50"
                  >
                    <option value="IDEA">IDEA (Pending/Proposal)</option>
                    <option value="QUEUED">QUEUED</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="BLOCKED">BLOCKED (Paused)</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                    <option value="DELETED">DELETED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-wider">Expected Duration Hours (Points)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 10"
                    value={editWorkExpectedHours}
                    onChange={e => setEditWorkExpectedHours(e.target.value !== '' ? Number(e.target.value) : '')}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-[#63BDF2]/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-wider">Actual Duration Hours (Points)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 8"
                    value={editWorkActualHours}
                    onChange={e => setEditWorkActualHours(e.target.value !== '' ? Number(e.target.value) : '')}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-[#63BDF2]/50"
                  />
                </div>
              </div>

              {(editWorkStatus === 'BLOCKED' || editWorkStatus === 'DELETED') && (
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-wider">Blocked / Deleted Reason</label>
                  <input
                    value={editWorkBlockedReason}
                    onChange={e => setEditWorkBlockedReason(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#63BDF2]/50"
                    placeholder="Reason for block or deletion..."
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingWork(null)}
                  className="text-xs bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingWork}
                  className="text-xs bg-[#63BDF2] text-[#09090b] hover:bg-[#5BB1E4] px-4 py-2 rounded-xl font-black uppercase tracking-wider disabled:opacity-50 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {isUpdatingWork ? <Loader2 size={12} className="animate-spin" /> : null} Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
