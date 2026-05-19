'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, UserPlus, Edit3, Trash2, Shield, User, Award, Mail, Phone, X, ShieldAlert, CheckCircle2, ShieldCheck, HelpCircle, Eye, Sparkles, Loader2 } from 'lucide-react'
import { createMember, updateMember, deleteMember } from '@/app/actions/admin'

export default function AdminDashboardClient({ initialMembers }: { initialMembers: any[] }) {
  const [members, setMembers] = useState(initialMembers)
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'N/A'
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<any | null>(null)
  const [deletingMember, setDeletingMember] = useState<any | null>(null)
  const [inspectingMember, setInspectingMember] = useState<any | null>(null)

  // Add Member form state
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [addSuccessData, setAddSuccessData] = useState<any | null>(null)

  // Edit Member form state
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Delete Member state
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Search filter
  const [searchTerm, setSearchTerm] = useState('')

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle Add Member Submission
  async function handleAddSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmittingAdd(true)
    setAddError(null)
    setAddSuccessData(null)

    const formData = new FormData(e.currentTarget)
    try {
      const result = await createMember(formData)
      if (result) {
        setAddSuccessData(result)
        // Refresh local member list
        const newMember = {
          id: Math.random().toString(), // temp ID for UI list
          name: formData.get('name') as string,
          email: formData.get('email') as string,
          username: result.username,
          role: formData.get('role') as string,
          contributionScore: 0,
          createdAt: new Date().toISOString()
        }
        setMembers([newMember, ...members])
        e.currentTarget.reset()
      }
    } catch (err: any) {
      setAddError(err.message || 'Failed to create member')
    } finally {
      setIsSubmittingAdd(false)
    }
  }

  // Handle Edit Member Submission
  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingMember) return
    setIsSubmittingEdit(true)
    setEditError(null)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const username = formData.get('username') as string
    const role = formData.get('role') as 'ADMIN' | 'MEMBER'
    const score = parseInt(formData.get('contributionScore') as string) || 0

    try {
      await updateMember(editingMember.id, name, email, username, role, score)
      setMembers(members.map(m => m.id === editingMember.id ? { ...m, name, email, username, role, contributionScore: score } : m))
      setEditingMember(null)
    } catch (err: any) {
      setEditError(err.message || 'Failed to update member')
    } finally {
      setIsSubmittingEdit(false)
    }
  }

  // Handle Delete Member Submission
  async function handleDeleteConfirm() {
    if (!deletingMember) return
    setIsSubmittingDelete(true)
    setDeleteError(null)

    try {
      await deleteMember(deletingMember.id)
      setMembers(members.filter(m => m.id !== deletingMember.id))
      setDeletingMember(null)
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete member')
    } finally {
      setIsSubmittingDelete(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Top HUD Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white leading-tight">
            Admin <span className="bg-gradient-to-r from-[#63BDF2] to-[#3188DA] bg-clip-text text-transparent">Dashboard</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage team members, roles, permissions, and async standings.</p>
        </div>

        <button
          onClick={() => {
            setAddError(null)
            setAddSuccessData(null)
            setIsAddOpen(true)
          }}
          className="flex items-center gap-2 bg-white text-black hover:bg-white/90 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)] cursor-pointer shrink-0"
        >
          <UserPlus size={16} /> Add New Member
        </button>
      </div>

      {/* Main Panel grid */}
      <div className="bg-secondary/10 border border-border/30 rounded-3xl p-6 backdrop-blur-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/30">
          <h2 className="text-lg font-bold text-white tracking-tight">Active Team Roster</h2>
          
          <input
            type="text"
            placeholder="Search members by name, email or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-[#63BDF2]/70 focus:ring-1 focus:ring-[#63BDF2]/30 transition-all font-medium"
          />
        </div>

        {/* Member Table View */}
        <div className="border border-border/50 rounded-2xl overflow-hidden bg-background/30">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-secondary/40 text-muted-foreground border-b border-border/50 text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Username / Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 text-center">Score</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-xs">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-secondary/15 transition-all">
                    {/* Name column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#63BDF2] to-[#3188DA] text-[#09090b] flex items-center justify-center font-black uppercase text-xs">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white leading-none mb-1">{member.name}</p>
                          <p className="text-[10px] text-muted-foreground">Joined {formatDate(member.createdAt)}</p>
                        </div>
                      </div>
                    </td>

                    {/* Username & Email column */}
                    <td className="px-6 py-4">
                      <p className="font-mono text-white/90">{member.username}</p>
                      <p className="text-[10px] text-muted-foreground">{member.email}</p>
                    </td>

                    {/* Role column */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        member.role === 'ADMIN' 
                          ? 'bg-[#3188DA]/10 border border-[#3188DA]/20 text-[#3188DA]' 
                          : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      }`}>
                        {member.role === 'ADMIN' ? <ShieldCheck size={10} /> : <User size={10} />}
                        {member.role}
                      </span>
                    </td>

                    {/* Contribution Score column */}
                    <td className="px-6 py-4 text-center font-bold text-white text-sm">
                      <div className="inline-flex items-center gap-1 bg-[#63BDF2]/5 border border-[#63BDF2]/15 px-2.5 py-1 rounded-lg">
                        <Award size={12} className="text-[#63BDF2]" />
                        <span>{member.contributionScore}</span>
                      </div>
                    </td>

                    {/* Actions column */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => setInspectingMember(member)}
                          className="p-2 text-muted-foreground hover:text-[#63BDF2] hover:bg-[#63BDF2]/10 rounded-xl transition-all cursor-pointer"
                          title="View Profile"
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          onClick={() => {
                            setEditError(null)
                            setEditingMember(member)
                          }}
                          className="p-2 text-muted-foreground hover:text-[#63BDF2] hover:bg-[#63BDF2]/10 rounded-xl transition-all cursor-pointer"
                          title="Edit Member"
                        >
                          <Edit3 size={15} />
                        </button>
                        
                        <button
                          onClick={() => {
                            setDeleteError(null)
                            setDeletingMember(member)
                          }}
                          className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                          title="Delete Member"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No matching team members found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= MODAL: ADD MEMBER ================= */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-[#0d0e12] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-secondary/10">
                <h2 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Add New Member</h2>
                <button 
                  onClick={() => setIsAddOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted-foreground hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
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

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Full Name</label>
                  <input
                    name="name"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-[#63BDF2] focus:ring-1 focus:ring-[#63BDF2]/30"
                    placeholder="Alex Rivera"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-[#63BDF2]"
                    placeholder="alex@infofriyends.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Username</label>
                  <input
                    name="username"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-[#63BDF2]"
                    placeholder="alex123"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Password</label>
                  <input
                    name="password"
                    type="password"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-[#63BDF2]"
                    placeholder="••••••••••••"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Mobile Number (Optional)</label>
                  <input
                    name="mobile"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-[#63BDF2]"
                    placeholder="+1 234 567 890"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Workspace Role</label>
                  <select
                    name="role"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#63BDF2]"
                  >
                    <option value="MEMBER" className="bg-[#0d0e12]">Team Member</option>
                    <option value="ADMIN" className="bg-[#0d0e12]">Admin</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="w-full bg-gradient-to-r from-[#63BDF2] to-[#3188DA] text-black py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6 cursor-pointer shadow-lg shadow-[#63BDF2]/10 flex items-center justify-center gap-2"
                >
                  {isSubmittingAdd ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: EDIT MEMBER ================= */}
      <AnimatePresence>
        {editingMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-[#0d0e12] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-secondary/10">
                <h2 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Edit Member Settings</h2>
                <button 
                  onClick={() => setEditingMember(null)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted-foreground hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                {editError && (
                  <div className="p-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl text-xs flex items-center gap-2">
                    <ShieldAlert size={14} />
                    <span>{editError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Full Name</label>
                  <input
                    name="name"
                    required
                    defaultValue={editingMember.name}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-[#63BDF2]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    required
                    defaultValue={editingMember.email}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-[#63BDF2]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Username</label>
                  <input
                    name="username"
                    required
                    defaultValue={editingMember.username}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-[#63BDF2]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Contribution Points</label>
                  <input
                    name="contributionScore"
                    type="number"
                    required
                    defaultValue={editingMember.contributionScore}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-[#63BDF2]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Workspace Role</label>
                  <select
                    name="role"
                    defaultValue={editingMember.role}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#63BDF2]"
                  >
                    <option value="MEMBER" className="bg-[#0d0e12]">Team Member</option>
                    <option value="ADMIN" className="bg-[#0d0e12]">Admin</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="w-full bg-gradient-to-r from-[#63BDF2] to-[#3188DA] text-black py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6 cursor-pointer shadow-lg shadow-[#63BDF2]/10 flex items-center justify-center gap-2"
                >
                  {isSubmittingEdit ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Member Details'
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      <AnimatePresence>
        {deletingMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-sm bg-[#0d0e12] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl">
                  <Trash2 size={28} />
                </div>

                {deleteError && (
                  <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs w-full">
                    {deleteError}
                  </div>
                )}
                
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Delete Member</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Are you sure you want to delete <span className="text-white font-bold">{deletingMember.name}</span>? All posts and pending works associated with this user will also be removed.
                  </p>
                </div>

                <div className="flex gap-3 w-full pt-4">
                  <button 
                    onClick={() => setDeletingMember(null)}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDeleteConfirm}
                    disabled={isSubmittingDelete}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-500/90 hover:to-red-600/90 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    {isSubmittingDelete ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete User'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: VIEW MEMBER PROFILE ================= */}
      <AnimatePresence>
        {inspectingMember && (() => {
          const works = inspectingMember.worksCreated || []
          const completedCount = works.filter((w: any) => w.status === 'Completed').length
          const activeCount = works.filter((w: any) => w.status === 'Active').length
          const pendingCount = works.filter((w: any) => w.status === 'Pending').length
          const archivedCount = works.filter((w: any) => w.status === 'Archived').length

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="w-full max-w-2xl bg-[#0d0e12] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative"
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#11131c]">
                  <div className="flex items-center gap-2 text-white">
                    <Sparkles className="text-[#63BDF2]" size={18} />
                    <h2 className="text-sm font-bold uppercase tracking-wider">Team Member Profile Inspector</h2>
                  </div>
                  <button 
                    onClick={() => setInspectingMember(null)}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted-foreground hover:text-white cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                  {/* Profile Summary */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-white/5 border border-white/5 rounded-2xl">
                    {inspectingMember.profilePhoto ? (
                      <img 
                        src={inspectingMember.profilePhoto} 
                        alt={inspectingMember.name} 
                        className="w-20 h-20 rounded-full object-cover border-2 border-[#63BDF2]" 
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#63BDF2] to-[#3188DA] text-[#09090b] flex items-center justify-center font-black text-3xl select-none uppercase shadow-lg shadow-[#63BDF2]/10 shrink-0">
                        {inspectingMember.name.charAt(0)}
                      </div>
                    )}

                    <div className="text-center sm:text-left space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                        <h3 className="text-xl font-bold text-white truncate">{inspectingMember.name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider w-max mx-auto sm:mx-0 ${
                          inspectingMember.role === 'ADMIN' 
                            ? 'bg-[#3188DA]/10 border border-[#3188DA]/25 text-[#63BDF2]' 
                            : 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400'
                        }`}>
                          {inspectingMember.role === 'ADMIN' ? <ShieldCheck size={9} /> : <User size={9} />}
                          {inspectingMember.role}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-muted-foreground">@{inspectingMember.username}</p>
                      
                      <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1.5 pt-1.5 text-xs text-muted-foreground">
                        {inspectingMember.email && (
                          <span className="flex items-center gap-1.5">
                            <Mail size={12} className="text-[#63BDF2]" /> {inspectingMember.email}
                          </span>
                        )}
                        {inspectingMember.mobile && (
                          <span className="flex items-center gap-1.5">
                            <Phone size={12} className="text-[#63BDF2]" /> {inspectingMember.mobile}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats Counters Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center space-y-1">
                      <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Total Works</span>
                      <span className="text-base font-black text-white">{works.length}</span>
                    </div>
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center space-y-1">
                      <span className="text-[9px] uppercase font-bold text-emerald-400 tracking-wider block">Completed</span>
                      <span className="text-base font-black text-emerald-400">{completedCount}</span>
                    </div>
                    <div className="p-3 bg-[#63BDF2]/10 border border-[#63BDF2]/20 rounded-xl text-center space-y-1">
                      <span className="text-[9px] uppercase font-bold text-[#63BDF2] tracking-wider block">Active</span>
                      <span className="text-base font-black text-[#63BDF2]">{activeCount}</span>
                    </div>
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center space-y-1">
                      <span className="text-[9px] uppercase font-bold text-amber-400 tracking-wider block">Pending</span>
                      <span className="text-base font-black text-amber-400">{pendingCount}</span>
                    </div>
                    <div className="p-3 bg-zinc-500/10 border border-zinc-500/20 rounded-xl text-center space-y-1 col-span-2 sm:col-span-1">
                      <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider block">Archived</span>
                      <span className="text-base font-black text-zinc-400">{archivedCount}</span>
                    </div>
                  </div>

                  {/* Works List inspect table */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">Work Ledger & Task Statuses</h4>
                    <div className="border border-white/10 rounded-2xl overflow-hidden bg-background/50">
                      <div className="overflow-x-auto max-h-48 overflow-y-auto custom-scrollbar">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead>
                            <tr className="bg-secondary/40 text-muted-foreground border-b border-white/5 text-[9px] font-bold uppercase tracking-wider">
                              <th className="px-4 py-3">Work Request</th>
                              <th className="px-4 py-3 text-center">Status</th>
                              <th className="px-4 py-3 text-right">Value</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {works.map((w: any) => (
                              <tr key={w.id} className="hover:bg-secondary/15 transition-all">
                                <td className="px-4 py-3 font-semibold text-white truncate max-w-[200px]">{w.name}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                    w.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                    w.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' :
                                    w.status === 'Archived' ? 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20' :
                                    'bg-[#63BDF2]/10 text-[#63BDF2] border border-[#63BDF2]/20'
                                  }`}>
                                    {w.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-[#63BDF2] font-mono">+{w.points || 10} PTS</td>
                              </tr>
                            ))}
                            {works.length === 0 && (
                              <tr>
                                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                                  This member has not logged any work requests yet.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )
        })()}
      </AnimatePresence>
    </div>
  )
}
