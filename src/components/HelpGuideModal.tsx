'use client'

import { motion } from 'framer-motion'
import { 
  X, 
  HelpCircle, 
  LayoutDashboard, 
  Briefcase, 
  Lightbulb, 
  MessageSquare, 
  Shield, 
  User, 
  CheckCircle, 
  AlertCircle, 
  Archive, 
  Sparkles,
  BookOpen
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface HelpGuideModalProps {
  isOpen: boolean
  onClose: () => void
  currentPath: string
}

const TABS = [
  { id: 'dashboard', label: '🏠 Dashboard', icon: <LayoutDashboard size={16} /> },
  { id: 'workspace', label: '💼 Workspace Wall', icon: <Briefcase size={16} /> },
  { id: 'proposals', label: '💡 Proposals Hub', icon: <Lightbulb size={16} /> },
  { id: 'chat', label: '💬 lounge Chat', icon: <MessageSquare size={16} /> },
  { id: 'profile', label: '👤 Profile Settings', icon: <User size={16} /> },
  { id: 'admin', label: '🛡️ Admin Panel', icon: <Shield size={16} /> }
]

export default function HelpGuideModal({ isOpen, onClose, currentPath }: HelpGuideModalProps) {
  const [activeTab, setActiveTab] = useState('dashboard')

  // Auto-detect tab based on active route when modal is opened
  useEffect(() => {
    if (!isOpen) return
    
    if (currentPath === '/') setActiveTab('dashboard')
    else if (currentPath.startsWith('/works')) setActiveTab('workspace')
    else if (currentPath.startsWith('/proposals')) setActiveTab('proposals')
    else if (currentPath.startsWith('/chat')) setActiveTab('chat')
    else if (currentPath.startsWith('/profile')) setActiveTab('profile')
    else if (currentPath.startsWith('/admin')) setActiveTab('admin')
  }, [isOpen, currentPath])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-10 select-none">
      {/* Immersive Blur Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#09090b]/95 backdrop-blur-3xl"
      />

      {/* Fullscreen Document Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative w-full h-full max-w-6xl bg-zinc-950/65 border border-white/10 rounded-[32px] overflow-hidden flex flex-col md:flex-row shadow-2xl backdrop-blur-md"
      >
        {/* Left Navigation Panel */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 bg-zinc-950/30 p-5 flex flex-col gap-6 shrink-0">
          
          {/* Logo & Header */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="bg-[#63BDF2]/10 p-2 rounded-xl text-[#63BDF2] animate-pulse">
              <BookOpen size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider leading-none">OS Handbook</h3>
              <p className="text-[9px] text-[#63BDF2] font-black uppercase tracking-widest mt-1">Know-How Guide</p>
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Navigation Tabs */}
          <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-1.5 pb-2 md:pb-0 scrollbar-none">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap cursor-pointer shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-[#3188DA]/15 text-[#63BDF2] border border-[#63BDF2]/20 shadow-[0_0_15px_rgba(99,189,242,0.1)]'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Footer note */}
          <div className="hidden md:block mt-auto bg-white/5 border border-white/5 p-3 rounded-xl">
            <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider block">Asynchronous Operating System</span>
            <p className="text-[10px] text-zinc-400 mt-1 leading-normal font-medium">
              "Collaborate asynchronously, log progress, and build start-ups without pressure."
            </p>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 flex flex-col justify-between h-full bg-zinc-950/20">
          
          {/* Scrollable Document */}
          <div className="space-y-6 flex-1">
            
            {/* Context Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <span className="text-[10px] text-[#63BDF2] uppercase tracking-widest font-black">Feature Documentation</span>
                <h1 className="text-xl md:text-2xl font-black text-white mt-1 capitalize tracking-tight">
                  {TABS.find(t => t.id === activeTab)?.label.split(' ').slice(1).join(' ')} Manual
                </h1>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer shadow-lg"
                title="Close handbook"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Switcher */}
            <div className="mt-6 text-zinc-300 space-y-6 text-sm font-medium leading-relaxed">
              
              {/* --- DASHBOARD GUIDE --- */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="bg-[#63BDF2]/5 border border-[#63BDF2]/10 p-4.5 rounded-2xl flex items-start gap-3">
                    <span className="text-lg">📢</span>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Startup Operations Room</h4>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        The central control dashboard containing startup-wide live announcements, active task counters, and top active project timelines.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-white/5 p-4 rounded-xl space-y-2">
                      <h5 className="text-xs font-bold text-yellow-400">💡 Dynamic Metrics</h5>
                      <p className="text-[11px] text-zinc-400">
                        Tracks open proposals, active items, and completed milestones dynamically across the entire organization.
                      </p>
                    </div>
                    <div className="border border-white/5 p-4 rounded-xl space-y-2">
                      <h5 className="text-xs font-bold text-[#63BDF2]">🏆 Contribution Standings</h5>
                      <p className="text-[11px] text-zinc-400">
                        Highlights the contribution standings and member rankings based on approved and shipped features.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* --- WORKSPACE WALL GUIDE --- */}
              {activeTab === 'workspace' && (
                <div className="space-y-6">
                  <div className="bg-[#63BDF2]/5 border border-[#63BDF2]/10 p-4.5 rounded-2xl flex items-start gap-3">
                    <span className="text-lg">💼</span>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Active Operations Wall</h4>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        The live wall where active tasks are visible, tracked, and updated. Click on any card to view its permanent logs or write update snippets.
                      </p>
                    </div>
                  </div>

                  {/* Flowchart Representation */}
                  <div className="border border-white/5 p-5 rounded-2xl bg-zinc-950/40">
                    <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Task Status Lifecycle Flow</h5>
                    
                    {/* SVG Lifecycle representation */}
                    <div className="flex flex-col sm:flex-row items-center justify-around gap-2 text-center py-2">
                      <div className="px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black tracking-widest font-mono">
                        💡 IDEA
                      </div>
                      <span className="text-zinc-600 text-xs rotate-90 sm:rotate-0">➡️</span>
                      <div className="px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black tracking-widest font-mono">
                        ⚡ ACTIVE
                      </div>
                      <span className="text-zinc-600 text-xs rotate-90 sm:rotate-0">➡️</span>
                      <div className="px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black tracking-widest font-mono">
                        ⚠️ BLOCKED
                      </div>
                      <span className="text-zinc-600 text-xs rotate-90 sm:rotate-0">➡️</span>
                      <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black tracking-widest font-mono">
                        ✅ COMPLETED
                      </div>
                    </div>

                    <div className="text-[10px] text-zinc-500 mt-4 leading-normal">
                      * **Idea**: Proposed solution under planning. <br/>
                      * **Blocked**: Stalled task. Banners are displayed prominently to alert admins and members. <br/>
                      * **Completed**: Marked done by Admins. Automatically prompts member reviews and ratings.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-white/5 p-4 rounded-xl space-y-2">
                      <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle size={12} /> Reviews & Ratings
                      </h5>
                      <p className="text-[11px] text-zinc-400">
                        Instead of raw points, the wall showcases star ratings. If a task has no reviews yet, it pulsates with a <span className="text-emerald-400 font-bold">Zero Reviews</span> indicator.
                      </p>
                    </div>
                    <div className="border border-white/5 p-4 rounded-xl space-y-2">
                      <h5 className="text-xs font-bold text-red-400 flex items-center gap-1">
                        <AlertCircle size={12} /> Deleted Proposals Safe
                      </h5>
                      <p className="text-[11px] text-zinc-400">
                        Proposals that are deleted are marked `DELETED` and kept strictly out of the Active Workspace, preserving clean historical records safely.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* --- PROPOSALS HUB GUIDE --- */}
              {activeTab === 'proposals' && (
                <div className="space-y-6">
                  <div className="bg-[#63BDF2]/5 border border-[#63BDF2]/10 p-4.5 rounded-2xl flex items-start gap-3">
                    <span className="text-lg">💡</span>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Startup Idea Incubator</h4>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Anyone can propose startup upgrades. Team members register support rates. Once consensus is reached, the proposal automatically shifts into an approved task.
                      </p>
                    </div>
                  </div>

                  <div className="border border-white/5 p-5 rounded-2xl bg-zinc-950/40 space-y-3">
                    <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">How Proposals Advance</h5>
                    <ul className="list-disc pl-4 text-[11px] text-zinc-400 space-y-1.5 leading-normal">
                      <li>**Submit Proposal**: Fill the simple form detailing name, description, and tags.</li>
                      <li>**Vote Consensus**: Other active members support the card to increment support counts.</li>
                      <li>**Sprint Queue**: Once enough supports are gathered, it enters the official work queue.</li>
                      <li>**Active Conversion**: Admins activate approved queue proposals to make them live Workspace tasks.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* --- LOUNGE CHAT GUIDE --- */}
              {activeTab === 'chat' && (
                <div className="space-y-6">
                  <div className="bg-[#63BDF2]/5 border border-[#63BDF2]/10 p-4.5 rounded-2xl flex items-start gap-3">
                    <span className="text-lg">💬</span>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Asynchronous Team Lounge</h4>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Real-time group chat channels built for startups. Pitch proposals, alert members on blocked tasks, or chat casually.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-white/5 p-4 rounded-xl space-y-2">
                      <h5 className="text-xs font-bold text-white">⚡ Typing Indicators</h5>
                      <p className="text-[11px] text-zinc-400">
                        Tracks live typing statuses so you know exactly when others are drafting asynchronous startup updates.
                      </p>
                    </div>
                    <div className="border border-white/5 p-4 rounded-xl space-y-2">
                      <h5 className="text-xs font-bold text-[#63BDF2]">📱 Mobile Slide Drawers</h5>
                      <p className="text-[11px] text-zinc-400">
                        The sidebar collapses on mobile viewports into a sliding drawer, maximizing screen space for mobile operation.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* --- PROFILE SETTINGS GUIDE --- */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="bg-[#63BDF2]/5 border border-[#63BDF2]/10 p-4.5 rounded-2xl flex items-start gap-3">
                    <span className="text-lg">👤</span>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Personal Standing Scorecard</h4>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Your professional profiles showing overall rank, completed works count, average ratings score, and your shipped items audit log.
                      </p>
                    </div>
                  </div>

                  <div className="border border-white/5 p-4 rounded-xl space-y-2">
                    <h5 className="text-xs font-bold text-white">⚙️ Personal Credentials</h5>
                    <p className="text-[11px] text-zinc-400">
                      Configure your startup username, contact details, and update your software access password safely.
                    </p>
                  </div>
                </div>
              )}

              {/* --- ADMIN PANEL GUIDE --- */}
              {activeTab === 'admin' && (
                <div className="space-y-6">
                  <div className="bg-[#63BDF2]/5 border border-[#63BDF2]/10 p-4.5 rounded-2xl flex items-start gap-3">
                    <span className="text-lg">🛡️</span>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Administrative Command Center</h4>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Only available for accounts with `ADMIN` privileges. Enables onboarding new startup members, editing credentials, and regulating tasks.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-white/5 p-4 rounded-xl space-y-2">
                      <h5 className="text-xs font-bold text-white">👥 User Onboarding Drawer</h5>
                      <p className="text-[11px] text-zinc-400">
                        Register new colleagues with yunique credentials and assign user roles (`ADMIN` or `MEMBER`).
                      </p>
                    </div>
                    <div className="border border-white/5 p-4 rounded-xl space-y-2">
                      <h5 className="text-xs font-bold text-red-400">🗑️ Safe User Purge</h5>
                      <p className="text-[11px] text-zinc-400">
                        Allows safe member deletion by clearing dependencies first, preserving complete relational SQL database integrity.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Modal bottom disclaimer */}
          <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
            <span>Infofriyends Brain OS v1.2</span>
            <span>Made with 💡 by Antigravity AI</span>
          </div>

        </div>
      </motion.div>
    </div>
  )
}
