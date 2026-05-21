'use client'

import { useStore } from '@/store/useStore'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Calendar, User, Shield, AlertTriangle, Plus } from 'lucide-react'
import { createWork, getWorks } from '@/app/actions'
import { getMembers } from '@/app/actions/admin'
import { useState, useEffect } from 'react'

export default function AddWorkModal({ user }: { user: any }) {
  const { isAddWorkModalOpen, setAddWorkModalOpen } = useStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [members, setMembers] = useState<any[]>([])
  const [works, setWorks] = useState<any[]>([])
  const [selectedPersonMentions, setSelectedPersonMentions] = useState<string[]>([])

  useEffect(() => {
    if (!isAddWorkModalOpen) return
    async function loadData() {
      try {
        const [memberList, workList] = await Promise.all([getMembers(), getWorks()])
        setMembers(memberList)
        setWorks(workList.filter((w: any) => w.status !== 'DELETED' && w.status !== 'ARCHIVED'))
      } catch (err) {
        console.error('Failed to load data:', err)
      }
    }
    loadData()
  }, [isAddWorkModalOpen])

  if (!isAddWorkModalOpen) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const formData = new FormData(e.currentTarget)
      if (selectedPersonMentions.length > 0) {
        formData.append('personMentions', JSON.stringify(selectedPersonMentions))
      }

      const res = await createWork(formData)
      if (res && !res.success) {
        setError(res.error || 'Failed to create work.')
      } else {
        setAddWorkModalOpen(false)
        setSelectedPersonMentions([])
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create work.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090b]/80 backdrop-blur-md">
        <div className="absolute inset-0 cursor-default" onClick={() => setAddWorkModalOpen(false)} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-[#0d0e12]/90 border border-white/10 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#63BDF2] to-[#3188DA] flex items-center justify-center text-black shadow-lg shrink-0">
                <Plus size={20} className="stroke-[3.5px]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Initiate Startup Work</h2>
                <p className="text-[11px] text-muted-foreground">Assign workflows across startup channels</p>
              </div>
            </div>
            <button 
              onClick={() => setAddWorkModalOpen(false)}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted-foreground hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
            {error && (
              <div className="p-4 bg-red-500/10 text-red-400 border border-red-500/10 rounded-2xl text-xs flex items-center gap-2 shrink-0">
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}
            
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Work Title</label>
              <input
                id="name"
                name="name"
                required
                className="w-full bg-[#0c0d12]/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-[#63BDF2]/50 focus:ring-1 focus:ring-[#63BDF2]/50 transition-all"
                placeholder="e.g. Design dynamic cards layout"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="description" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Short Description</label>
              <textarea
                id="description"
                name="description"
                required
                rows={3}
                className="w-full bg-[#0c0d12]/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-[#63BDF2]/50 focus:ring-1 focus:ring-[#63BDF2]/50 transition-all resize-none"
                placeholder="Detail the sprint expectations and context..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="assigneeIds" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Assign To Member(s)</label>
                <select
                  multiple
                  id="assigneeIds"
                  name="assigneeIds"
                  className="w-full bg-[#0d0e12] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#63BDF2]/50 transition-all custom-scrollbar min-h-[60px]"
                >
                  {members.filter(m => m.role !== 'ADMIN').map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="priority" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Priority Level</label>
                <select
                  id="priority"
                  name="priority"
                  defaultValue="MEDIUM"
                  className="w-full bg-[#0d0e12] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#63BDF2]/50 transition-all"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="status" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Initial Status</label>
                <select
                  id="status"
                  name="status"
                  defaultValue="IDEA"
                  className="w-full bg-[#0d0e12] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#63BDF2]/50 transition-all"
                >
                  <option value="IDEA">IDEA</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="BLOCKED">BLOCKED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="dueDate" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Optional Due Date</label>
                <div className="relative">
                  <input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    className="w-full bg-[#0c0d12]/50 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#63BDF2]/50 transition-all scheme-dark"
                  />
                  <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row: Mentions System */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-4 mt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#63BDF2] uppercase tracking-wider">Idea Creators (10 pts)</label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-[#0c0d12]/50 border border-[#63BDF2]/20 rounded-xl min-h-[42px]">
                   {members.filter(m => m.role !== 'ADMIN').map(m => (
                     <button
                       type="button"
                       key={m.id}
                       onClick={() => {
                         if (selectedPersonMentions.includes(m.id)) {
                           setSelectedPersonMentions(prev => prev.filter(id => id !== m.id))
                         } else {
                           setSelectedPersonMentions(prev => [...prev, m.id])
                         }
                       }}
                       className={`px-2 py-1 text-[10px] rounded-lg border transition-colors ${
                         selectedPersonMentions.includes(m.id) 
                         ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' 
                         : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                       }`}
                     >
                       {m.name}
                     </button>
                   ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="parentWorkId" className="text-xs font-bold text-[#63BDF2] uppercase tracking-wider">Parent Work (10 pts)</label>
                <select
                  id="parentWorkId"
                  name="parentWorkId"
                  className="w-full bg-[#0d0e12] border border-[#63BDF2]/20 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#63BDF2]/50 transition-all"
                >
                  <option value="">None (Standalone)</option>
                  {works.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-white/5 shrink-0 pb-2">
              <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#63BDF2]" />
                <span>Creating as <strong className="text-white font-bold">{user.name}</strong></span>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-gradient-to-r from-[#63BDF2] to-[#3188DA] hover:from-[#63BDF2]/90 hover:to-[#3188DA]/90 text-black px-6 py-2.5 rounded-full text-xs font-black transition-all shadow-[0_4px_20px_rgba(99,189,242,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    <span>Initiating...</span>
                  </>
                ) : (
                  <span>Publish Work</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
