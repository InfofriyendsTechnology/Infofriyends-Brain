'use client'

import { motion, AnimatePresence } from 'framer-motion'
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
  BookOpen,
  Megaphone,
  TrendingUp,
  Zap,
  AlertTriangle,
  Trash2,
  Settings,
  ArrowRight,
  Vote,
  MessageCircle,
  Key,
  Award,
  Info
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface HelpGuideModalProps {
  isOpen: boolean
  onClose: () => void
  currentPath: string
}

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { id: 'workspace', label: 'Workspace Wall', icon: <Briefcase size={16} /> },
  { id: 'proposals', label: 'Proposals Hub', icon: <Lightbulb size={16} /> },
  { id: 'chat', label: 'Lounge Chat', icon: <MessageSquare size={16} /> },
  { id: 'profile', label: 'Profile Settings', icon: <User size={16} /> },
  { id: 'admin', label: 'Admin Panel', icon: <Shield size={16} /> }
]

// Framer Motion Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: 'spring' as const, 
      stiffness: 260, 
      damping: 25 
    } 
  }
}

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
        className="absolute inset-0 bg-[#070709]/95 backdrop-blur-3xl"
      />

      {/* Fullscreen Document Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 25 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 25 }}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        className="relative w-full h-full max-w-6xl bg-zinc-950/45 border border-white/10 rounded-[32px] overflow-hidden flex flex-col md:flex-row shadow-2xl backdrop-blur-md"
      >
        {/* Dynamic Background Glows */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#63BDF2]/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse duration-[6000ms]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#3188DA]/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse duration-[8000ms]" />

        {/* Left Navigation Panel */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 bg-zinc-950/20 p-5 flex flex-col gap-6 shrink-0 relative z-10">
          
          {/* Logo & Header */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="bg-[#63BDF2]/10 p-2 rounded-xl text-[#63BDF2] shadow-[0_0_15px_rgba(99,189,242,0.15)]">
              <BookOpen size={18} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider leading-none">OS Handbook</h3>
              <p className="text-[9px] text-[#63BDF2] font-black uppercase tracking-widest mt-1">Know-How Guide</p>
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Navigation Tabs */}
          <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-1.5 pb-2 md:pb-0 scrollbar-none relative">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2.5 px-4 py-3.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap cursor-pointer shrink-0 ${
                  activeTab === tab.id
                    ? 'text-[#63BDF2]'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent'
                }`}
              >
                {/* Framer Motion Sliding Backlight */}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute inset-0 bg-[#3188DA]/10 border border-[#63BDF2]/20 rounded-xl -z-10 shadow-[0_0_15px_rgba(99,189,242,0.05)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className={`${activeTab === tab.id ? 'text-[#63BDF2]' : 'text-zinc-500'}`}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Footer note */}
          <div className="hidden md:block mt-auto bg-white/5 border border-white/5 p-4 rounded-2xl relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#63BDF2]/5 rounded-full blur-xl group-hover:bg-[#63BDF2]/10 transition-all duration-500" />
            <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider flex items-center gap-1">
              <Info size={10} className="text-[#63BDF2]" /> Asynchronous OS
            </span>
            <p className="text-[10px] text-zinc-400 mt-1.5 leading-relaxed font-medium">
              Collaborate asynchronously, log progress, and build start-ups without pressure.
            </p>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 flex flex-col justify-between h-full bg-zinc-950/10 relative z-10">
          
          {/* Scrollable Document */}
          <div className="space-y-6 flex-1">
            
            {/* Context Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <span className="text-[10px] text-[#63BDF2] uppercase tracking-widest font-black flex items-center gap-1.5">
                  <Sparkles size={10} className="animate-spin" /> Feature Documentation
                </span>
                <h1 className="text-xl md:text-2xl font-black text-white mt-1 capitalize tracking-tight">
                  {TABS.find(t => t.id === activeTab)?.label} Manual
                </h1>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer shadow-lg hover:rotate-90 duration-300"
                title="Close handbook"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Switcher */}
            <div className="mt-6 text-zinc-300 space-y-6 text-sm font-medium leading-relaxed">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  className="space-y-6"
                >
                  {/* --- DASHBOARD GUIDE --- */}
                  {activeTab === 'dashboard' && (
                    <>
                      <motion.div variants={itemVariants} className="bg-[#63BDF2]/5 border border-[#63BDF2]/10 p-5 rounded-2xl flex items-start gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                        <div className="bg-[#63BDF2]/10 p-2.5 rounded-xl text-[#63BDF2] shrink-0">
                          <Megaphone size={20} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Startup Operations Room</h4>
                          <p className="text-[11px] text-zinc-400 mt-1">
                            The central control dashboard containing startup-wide live announcements, active task counters, and top active project timelines.
                          </p>
                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-white/5 hover:border-[#3188DA]/30 bg-zinc-950/40 p-5 rounded-2xl space-y-2 transition-all hover:bg-white/5 group">
                          <div className="flex items-center gap-2">
                            <div className="bg-yellow-500/10 p-1.5 rounded-lg text-yellow-400 group-hover:scale-110 transition-transform">
                              <TrendingUp size={14} />
                            </div>
                            <h5 className="text-xs font-bold text-yellow-400">Dynamic Metrics</h5>
                          </div>
                          <p className="text-[11px] text-zinc-400">
                            Tracks open proposals, active items, and completed milestones dynamically across the entire organization.
                          </p>
                        </div>
                        <div className="border border-white/5 hover:border-[#63BDF2]/30 bg-zinc-950/40 p-5 rounded-2xl space-y-2 transition-all hover:bg-white/5 group">
                          <div className="flex items-center gap-2">
                            <div className="bg-[#63BDF2]/10 p-1.5 rounded-lg text-[#63BDF2] group-hover:scale-110 transition-transform">
                              <Award size={14} />
                            </div>
                            <h5 className="text-xs font-bold text-[#63BDF2]">Contribution Standings</h5>
                          </div>
                          <p className="text-[11px] text-zinc-400">
                            Highlights the contribution standings and member rankings based on approved and shipped features.
                          </p>
                        </div>
                      </motion.div>
                    </>
                  )}

                  {/* --- WORKSPACE WALL GUIDE --- */}
                  {activeTab === 'workspace' && (
                    <>
                      <motion.div variants={itemVariants} className="bg-[#63BDF2]/5 border border-[#63BDF2]/10 p-5 rounded-2xl flex items-start gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                        <div className="bg-[#63BDF2]/10 p-2.5 rounded-xl text-[#63BDF2] shrink-0">
                          <Briefcase size={20} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Active Operations Wall</h4>
                          <p className="text-[11px] text-zinc-400 mt-1">
                            The live wall where active tasks are visible, tracked, and updated. Click on any card to view its permanent logs or write update snippets.
                          </p>
                        </div>
                      </motion.div>

                      {/* Flowchart Representation */}
                      <motion.div variants={itemVariants} className="border border-white/5 p-6 rounded-2xl bg-zinc-950/40 space-y-5 shadow-inner">
                        <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                          <Zap size={12} className="text-[#63BDF2]" /> Task Status Lifecycle Flow
                        </h5>
                        
                        {/* SVG/CSS Lifecycle representation with layout adjustments */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center relative py-2">
                          
                          {/* Step 1 */}
                          <div className="flex flex-col items-center bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/40 p-3 rounded-2xl text-center transition-all group">
                            <Lightbulb size={16} className="text-purple-400 mb-1 group-hover:animate-bounce" />
                            <span className="text-white text-[10px] font-black tracking-widest font-mono">IDEA</span>
                            <span className="text-[8px] text-zinc-500 mt-1 uppercase">Under Planning</span>
                          </div>

                          {/* Arrow 1 */}
                          <div className="hidden sm:flex justify-center text-zinc-600">
                            <ArrowRight size={16} className="text-[#3188DA]/40" />
                          </div>

                          {/* Step 2 */}
                          <div className="flex flex-col items-center bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 p-3 rounded-2xl text-center transition-all group">
                            <Zap size={16} className="text-blue-400 mb-1 group-hover:animate-pulse" />
                            <span className="text-white text-[10px] font-black tracking-widest font-mono">ACTIVE</span>
                            <span className="text-[8px] text-zinc-500 mt-1 uppercase">In Progress</span>
                          </div>

                          {/* Arrow 2 */}
                          <div className="hidden sm:flex justify-center text-zinc-600">
                            <ArrowRight size={16} className="text-[#3188DA]/40" />
                          </div>

                          {/* Step 3 */}
                          <div className="flex flex-col items-center bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 p-3 rounded-2xl text-center transition-all group">
                            <AlertTriangle size={16} className="text-red-400 mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-white text-[10px] font-black tracking-widest font-mono">BLOCKED</span>
                            <span className="text-[8px] text-zinc-500 mt-1 uppercase">Stalled Issue</span>
                          </div>

                          {/* Arrow 3 */}
                          <div className="hidden sm:flex justify-center text-zinc-600">
                            <ArrowRight size={16} className="text-[#3188DA]/40" />
                          </div>

                          {/* Step 4 */}
                          <div className="flex flex-col items-center bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 p-3 rounded-2xl text-center transition-all group">
                            <CheckCircle size={16} className="text-emerald-400 mb-1 group-hover:scale-120 transition-transform" />
                            <span className="text-white text-[10px] font-black tracking-widest font-mono">COMPLETED</span>
                            <span className="text-[8px] text-zinc-500 mt-1 uppercase">Shipped Score</span>
                          </div>

                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-white/5 bg-zinc-950/40 p-5 rounded-2xl space-y-2 hover:border-[#63BDF2]/30 hover:bg-white/5 transition-all">
                          <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle size={14} /> Reviews & Ratings
                          </h5>
                          <p className="text-[11px] text-zinc-400">
                            Instead of raw points, the wall showcases star ratings. If a task has no reviews yet, it pulsates with a <span className="text-emerald-400 font-bold">Zero Reviews</span> indicator.
                          </p>
                        </div>
                        <div className="border border-white/5 bg-zinc-950/40 p-5 rounded-2xl space-y-2 hover:border-red-400/30 hover:bg-white/5 transition-all">
                          <h5 className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                            <AlertCircle size={14} /> Deleted Proposals Safe
                          </h5>
                          <p className="text-[11px] text-zinc-400">
                            Proposals that are deleted are marked DELETED and kept strictly out of the Active Workspace, preserving clean historical records safely.
                          </p>
                        </div>
                      </motion.div>
                    </>
                  )}

                  {/* --- PROPOSALS HUB GUIDE --- */}
                  {activeTab === 'proposals' && (
                    <>
                      <motion.div variants={itemVariants} className="bg-[#63BDF2]/5 border border-[#63BDF2]/10 p-5 rounded-2xl flex items-start gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                        <div className="bg-[#63BDF2]/10 p-2.5 rounded-xl text-[#63BDF2] shrink-0">
                          <Lightbulb size={20} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Startup Idea Incubator</h4>
                          <p className="text-[11px] text-zinc-400 mt-1">
                            Anyone can propose startup upgrades. Team members register support rates. Once consensus is reached, the proposal automatically shifts into an approved task.
                          </p>
                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants} className="border border-white/5 p-6 rounded-2xl bg-zinc-950/40 space-y-4 shadow-inner">
                        <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                          <Vote size={12} className="text-[#63BDF2]" /> Proposal Pipeline Journey
                        </h5>
                        
                        <div className="space-y-3.5">
                          <div className="flex items-start gap-3 border-l-2 border-[#63BDF2]/20 hover:border-[#63BDF2]/50 pl-4 py-1 transition-all">
                            <span className="text-[10px] font-black text-[#63BDF2] uppercase bg-[#63BDF2]/10 px-2 py-0.5 rounded-md mt-0.5">Step 1</span>
                            <div>
                              <h6 className="text-xs font-bold text-white">Submit Proposal</h6>
                              <p className="text-[10px] text-zinc-400 mt-0.5">Fill the simple form detailing name, description, and startup-compliant tags.</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3 border-l-2 border-[#3188DA]/20 hover:border-[#3188DA]/50 pl-4 py-1 transition-all">
                            <span className="text-[10px] font-black text-[#3188DA] uppercase bg-[#3188DA]/10 px-2 py-0.5 rounded-md mt-0.5">Step 2</span>
                            <div>
                              <h6 className="text-xs font-bold text-white">Vote Consensus</h6>
                              <p className="text-[10px] text-zinc-400 mt-0.5">Other active members support the card to increment support counts asynchronously.</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 border-l-2 border-purple-500/20 hover:border-purple-500/50 pl-4 py-1 transition-all">
                            <span className="text-[10px] font-black text-purple-400 uppercase bg-purple-500/10 px-2 py-0.5 rounded-md mt-0.5">Step 3</span>
                            <div>
                              <h6 className="text-xs font-bold text-white">Sprint Queue</h6>
                              <p className="text-[10px] text-zinc-400 mt-0.5">Once enough supports are gathered, it automatically enters the official work queue.</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 border-l-2 border-emerald-500/20 hover:border-emerald-500/50 pl-4 py-1 transition-all">
                            <span className="text-[10px] font-black text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-md mt-0.5">Step 4</span>
                            <div>
                              <h6 className="text-xs font-bold text-white">Active Conversion</h6>
                              <p className="text-[10px] text-zinc-400 mt-0.5">Admins activate approved queue proposals to make them live Workspace tasks.</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}

                  {/* --- LOUNGE CHAT GUIDE --- */}
                  {activeTab === 'chat' && (
                    <>
                      <motion.div variants={itemVariants} className="bg-[#63BDF2]/5 border border-[#63BDF2]/10 p-5 rounded-2xl flex items-start gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                        <div className="bg-[#63BDF2]/10 p-2.5 rounded-xl text-[#63BDF2] shrink-0">
                          <MessageSquare size={20} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Asynchronous Team Lounge</h4>
                          <p className="text-[11px] text-zinc-400 mt-1">
                            Real-time group chat channels built for startups. Pitch proposals, alert members on blocked tasks, or chat casually.
                          </p>
                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-white/5 bg-zinc-950/40 p-5 rounded-2xl space-y-2 hover:border-[#3188DA]/30 hover:bg-white/5 transition-all">
                          <div className="flex items-center gap-2">
                            <MessageCircle size={14} className="text-[#3188DA]" />
                            <h5 className="text-xs font-bold text-white">Typing Indicators</h5>
                          </div>
                          <p className="text-[11px] text-zinc-400">
                            Tracks live typing statuses so you know exactly when others are drafting asynchronous startup updates.
                          </p>
                        </div>
                        <div className="border border-white/5 bg-zinc-950/40 p-5 rounded-2xl space-y-2 hover:border-[#63BDF2]/30 hover:bg-white/5 transition-all">
                          <div className="flex items-center gap-2">
                            <Sparkles size={14} className="text-[#63BDF2]" />
                            <h5 className="text-xs font-bold text-[#63BDF2]">Mobile Slide Drawers</h5>
                          </div>
                          <p className="text-[11px] text-zinc-400">
                            The sidebar collapses on mobile viewports into a sliding drawer, maximizing screen space for mobile operation.
                          </p>
                        </div>
                      </motion.div>
                    </>
                  )}

                  {/* --- PROFILE SETTINGS GUIDE --- */}
                  {activeTab === 'profile' && (
                    <>
                      <motion.div variants={itemVariants} className="bg-[#63BDF2]/5 border border-[#63BDF2]/10 p-5 rounded-2xl flex items-start gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                        <div className="bg-[#63BDF2]/10 p-2.5 rounded-xl text-[#63BDF2] shrink-0">
                          <User size={20} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Personal Standing Scorecard</h4>
                          <p className="text-[11px] text-zinc-400 mt-1">
                            Your professional profiles showing overall rank, completed works count, average ratings score, and your shipped items audit log.
                          </p>
                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants} className="border border-white/5 bg-zinc-950/40 p-5 rounded-2xl space-y-2 hover:border-[#63BDF2]/30 hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-2">
                          <Settings size={14} className="text-white" />
                          <h5 className="text-xs font-bold text-white">Personal Credentials</h5>
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          Configure your startup username, contact details, and update your software access password safely.
                        </p>
                      </motion.div>
                    </>
                  )}

                  {/* --- ADMIN PANEL GUIDE --- */}
                  {activeTab === 'admin' && (
                    <>
                      <motion.div variants={itemVariants} className="bg-[#63BDF2]/5 border border-[#63BDF2]/10 p-5 rounded-2xl flex items-start gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                        <div className="bg-[#63BDF2]/10 p-2.5 rounded-xl text-[#63BDF2] shrink-0">
                          <Shield size={20} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Administrative Command Center</h4>
                          <p className="text-[11px] text-zinc-400 mt-1">
                            Only available for accounts with ADMIN privileges. Enables onboarding new startup members, editing credentials, and regulating tasks.
                          </p>
                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-white/5 bg-zinc-950/40 p-5 rounded-2xl space-y-2 hover:border-white/20 hover:bg-white/5 transition-all">
                          <div className="flex items-center gap-2">
                            <Key size={14} className="text-white" />
                            <h5 className="text-xs font-bold text-white">User Onboarding Drawer</h5>
                          </div>
                          <p className="text-[11px] text-zinc-400">
                            Register new colleagues with unique credentials and assign user roles (ADMIN or MEMBER).
                          </p>
                        </div>
                        <div className="border border-white/5 bg-zinc-950/40 p-5 rounded-2xl space-y-2 hover:border-red-400/30 hover:bg-white/5 transition-all">
                          <div className="flex items-center gap-2">
                            <Trash2 size={14} className="text-red-400" />
                            <h5 className="text-xs font-bold text-red-400">Safe User Purge</h5>
                          </div>
                          <p className="text-[11px] text-zinc-400">
                            Allows safe member deletion by clearing dependencies first, preserving complete relational SQL database integrity.
                          </p>
                        </div>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Modal bottom disclaimer */}
          <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[9px] text-zinc-500 font-bold uppercase tracking-wider relative z-10">
            <span>Infofriyends Brain OS v1.2</span>
            <span>Made with 💡 by Infofriyends Technology</span>
          </div>

        </div>
      </motion.div>
    </div>
  )
}
