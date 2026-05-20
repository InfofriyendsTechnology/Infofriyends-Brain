'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Lightbulb, Check, Plus, AlertCircle, 
  ThumbsUp, CheckCircle2, Info, Loader2, Play 
} from 'lucide-react'
import { createWork, updateWorkStatus, toggleIdeaSupport } from '@/app/actions'
import SectionGuide from './SectionGuide'

interface Idea {
  id: string
  name: string
  description: string
  priority: string
  points: number
  status: string
  createdAt: string
  creator: {
    id: string
    name: string
    profilePhoto: string | null
    role: string
  }
  supports: {
    userId: string
    user: {
      id: string
      name: string
      profilePhoto: string | null
      role: string
    }
  }[]
}

interface IdeaAgreementHubProps {
  ideas: Idea[]
  currentUser: any
  membersCount: number
}

export default function IdeaAgreementHub({ ideas, currentUser, membersCount }: IdeaAgreementHubProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [votingId, setVotingId] = useState<string | null>(null)
  const [resolvingId, setResolvingId] = useState<string | null>(null)

  async function handleAddIdea(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    formData.append('status', 'IDEA') // Enforce IDEA status
    try {
      const res = await createWork(formData)
      if (res.success) {
        setShowAddForm(false)
      } else {
        alert(res.error || 'Failed to submit proposal')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleVote(id: string) {
    if (!currentUser) return alert('Please login to vote')
    setVotingId(id)
    try {
      await toggleIdeaSupport(id)
    } catch (err) {
      console.error(err)
    } finally {
      setVotingId(null)
    }
  }

  async function handleStartWork(id: string) {
    setResolvingId(id)
    try {
      const res = await updateWorkStatus(id, 'ACTIVE')
      if (!res.success) {
        alert(res.error || 'Failed to start work')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setResolvingId(null)
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-400 bg-red-500/10 border-red-500/20'
      case 'HIGH': return 'text-orange-400 bg-orange-500/10 border-orange-500/20'
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    }
  }

  return (
    <div className="bg-secondary/20 border border-border rounded-3xl p-6 md:p-8 space-y-6">
      {/* Title Header with Help Guide */}
      <div className="flex items-center justify-between pb-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Lightbulb className="text-yellow-400" size={20} />
          <h2 className="text-lg font-bold text-white tracking-tight">Proposals & Ideas Alignment</h2>
          <SectionGuide 
            title="Proposals & Ideas Board" 
            content="Got an idea for the company or a new workspace project? Post it here as a Proposal! All team members can vote 'Agree' to show support. Once the team aligns and consensus is built, admins can approve the proposal and move it to Active Projects to start working."
          />
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs bg-white text-black hover:bg-white/90 px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none"
        >
          <Plus size={14} /> New Proposal
        </button>
      </div>

      {/* Add Idea Proposal Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAddIdea} className="bg-[#09090b]/30 border border-white/5 p-4 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-white uppercase">Submit New Proposal</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-muted-foreground font-bold">Proposal Title</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g., Weekly Team Meetup or Client Dashboard Redesign"
                    className="w-full bg-[#0c0d12]/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-muted-foreground font-bold">Priority</label>
                  <select
                    name="priority"
                    className="w-full bg-[#0c0d12]/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-muted-foreground font-bold">Details / Explanation</label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  placeholder="Explain the idea, benefits, or workflow in detail..."
                  className="w-full bg-[#0c0d12]/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl text-muted-foreground hover:text-white cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="text-xs bg-primary text-black hover:bg-primary/90 px-4 py-2 rounded-xl font-bold disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : 'Submit Proposal'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Idea Proposal Cards Listing */}
      <div className="space-y-4">
        {ideas.length === 0 ? (
          <div className="text-center py-12 bg-[#09090b]/10 border border-dashed border-white/5 rounded-3xl text-muted-foreground text-xs italic">
            No proposals pending reviews. Start sharing your ideas!
          </div>
        ) : (
          <div className="space-y-4">
            {ideas.map(idea => {
              const userVoted = currentUser && idea.supports.some(v => v.userId === currentUser.id)
              const approvalRate = membersCount > 0 ? Math.round((idea.supports.length / membersCount) * 100) : 0
              
              return (
                <div 
                  key={idea.id}
                  className="bg-[#09090b]/40 border border-white/5 hover:border-white/10 p-5 rounded-2xl space-y-4 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white tracking-tight">{idea.name}</h4>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md border font-black uppercase tracking-wider ${getPriorityBadge(idea.priority)}`}>
                          {idea.priority} Priority
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{idea.description}</p>
                      
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 pt-1">
                        <span>Proposed by:</span>
                        <strong className="text-zinc-300 font-bold">{idea.creator?.name || 'Unknown'}</strong>
                      </div>
                    </div>

                    {/* Vote & Approve Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                      <button
                        onClick={() => handleVote(idea.id)}
                        disabled={votingId === idea.id}
                        className={`text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none ${
                          userVoted 
                            ? 'bg-[#63BDF2]/20 border border-[#63BDF2]/40 text-[#63BDF2] hover:bg-[#63BDF2]/30' 
                            : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                        }`}
                      >
                        {votingId === idea.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <ThumbsUp size={12} className={userVoted ? 'fill-[#63BDF2]' : ''} />
                        )}
                        <span>Agree</span>
                      </button>

                      {(currentUser?.role === 'ADMIN' || currentUser?.id === idea.creator?.id) && (
                        <button
                          onClick={() => handleStartWork(idea.id)}
                          disabled={resolvingId === idea.id}
                          className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none"
                        >
                          {resolvingId === idea.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Play size={10} className="fill-emerald-400 text-emerald-400" />
                          )}
                          <span>Start Work</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Support Progress Bar */}
                  <div className="pt-3 space-y-1.5 border-t border-white/5">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white/95">Team Support:</span>
                        <span>{idea.supports.length} of {membersCount} agreed ({approvalRate}%)</span>
                      </div>
                      {approvalRate === 100 && (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Check size={12} /> Complete Consensus
                        </span>
                      )}
                    </div>
                    
                    {/* Bar */}
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-[#63BDF2] to-blue-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, approvalRate)}%` }}
                      />
                    </div>

                    {/* Supporters Avatars */}
                    {idea.supports.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1.5">
                        <span className="text-[9px] uppercase font-bold text-muted-foreground">Supported by:</span>
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {idea.supports.map(v => (
                            <div key={v.userId} className="inline-block relative">
                              {v.user.profilePhoto ? (
                                <img 
                                  src={v.user.profilePhoto} 
                                  alt={v.user.name} 
                                  className="w-5 h-5 rounded-full object-cover border border-zinc-950" 
                                  title={v.user.name}
                                />
                              ) : (
                                <div 
                                  className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[8px] border border-zinc-950 uppercase" 
                                  title={v.user.name}
                                >
                                  {v.user.name.charAt(0)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
