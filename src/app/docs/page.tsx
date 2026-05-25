'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { HelpCircle, Terminal, Cpu, Award, Zap } from 'lucide-react'

export default function HowItWorksDocs() {
  const [activeTab, setActiveTab] = useState('Overview')

  const tabs = ['Overview', 'Built Features', 'Point System', 'System Flow']

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Cpu className="text-[#63BDF2]" size={20} /> Software Tech Stack
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              <strong>Infofriyends Brain OS</strong> is designed as a high-fidelity, lightning-fast asynchronous team operating system. It features modern design aesthetics, dark-mode gradients, and real-time point allocation.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-background/50 border border-border/50 rounded-2xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#63BDF2] tracking-wider block">Frontend Framework</span>
                <h4 className="text-sm font-bold text-white">Next.js 15+ & React 19</h4>
                <p className="text-xs text-muted-foreground">Powers SSR, server components, and responsive dynamic states.</p>
              </div>

              <div className="p-4 bg-background/50 border border-border/50 rounded-2xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#63BDF2] tracking-wider block">Database & Schema</span>
                <h4 className="text-sm font-bold text-white">Prisma ORM & SQLite</h4>
                <p className="text-xs text-muted-foreground">Ensures strict type-safe relational database management.</p>
              </div>

              <div className="p-4 bg-background/50 border border-border/50 rounded-2xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#63BDF2] tracking-wider block">Styling System</span>
                <h4 className="text-sm font-bold text-white">TailwindCSS & Custom CSS</h4>
                <p className="text-xs text-muted-foreground">Premium design with variable colors (strictly cyan & ocean blue).</p>
              </div>

              <div className="p-4 bg-background/50 border border-border/50 rounded-2xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#63BDF2] tracking-wider block">Animation Core</span>
                <h4 className="text-sm font-bold text-white">Framer Motion</h4>
                <p className="text-xs text-muted-foreground">Smooth glassmorphic transitions and custom alert dialog overlays.</p>
              </div>
            </div>
          </div>
        )

      case 'Built Features':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="text-[#63BDF2]" size={20} /> Shipped Capabilities
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-4 p-4 bg-background/30 border border-border/40 rounded-2xl hover:border-[#63BDF2]/30 transition-all">
                <div className="p-2.5 bg-[#63BDF2]/10 text-[#63BDF2] rounded-xl shrink-0 h-10 w-10 flex items-center justify-center font-bold">1</div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Isolated Login Dashboard</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Completely strips away sidebars and layouts for pure immersion. Overrides browser autofill style with dark glassmorphic input transparent backgrounds.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-background/30 border border-border/40 rounded-2xl hover:border-[#63BDF2]/30 transition-all">
                <div className="p-2.5 bg-[#63BDF2]/10 text-[#63BDF2] rounded-xl shrink-0 h-10 w-10 flex items-center justify-center font-bold">2</div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Interactive Admin Panel</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Enables Super Admins to create new members with custom credentials (username, email, passwords), edit point parameters, and delete members via premium animated confirmation overlays.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-background/30 border border-border/40 rounded-2xl hover:border-[#63BDF2]/30 transition-all">
                <div className="p-2.5 bg-[#63BDF2]/10 text-[#63BDF2] rounded-xl shrink-0 h-10 w-10 flex items-center justify-center font-bold">3</div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Glassmorphic Action Modals</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Custom overlay confirmation boxes replace legacy browser `confirm()` pop-ups for high security, beauty, and strict mobile responsiveness.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'Point System':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="text-[#63BDF2]" size={20} /> Gamified Contributions
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Brain OS incentivizes real contribution without pressure using our automated scoring logic.
            </p>

            <div className="p-5 bg-gradient-to-br from-[#63BDF2]/10 to-[#3188DA]/5 border border-[#63BDF2]/20 rounded-2xl space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#63BDF2]/15">
                <span className="text-xs font-bold text-white/90">Action Type</span>
                <span className="text-xs font-bold text-[#63BDF2]">Reward Points</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/80 font-medium">Create Work Request (by standard Member)</span>
                <span className="text-muted-foreground font-mono">0 (Pending State)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/80 font-medium">Admin Approves Work to Active</span>
                <span className="text-muted-foreground font-mono">0 (In Development)</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-white">Admin Marks Work as COMPLETED</span>
                <span className="text-[#63BDF2] font-mono">+10 Points</span>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              💡 <strong>System Integrity</strong>: If an Admin reverts a Completed task back to Active, the +10 points are safely subtracted to protect standing board statistics automatically.
            </p>
          </div>
        )

      case 'System Flow':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Terminal className="text-[#63BDF2]" size={20} /> Workflow Pipeline
            </h3>
            
            <div className="relative border-l border-border/80 ml-3.5 pl-6 space-y-6">
              <div className="relative">
                <span className="absolute -left-[30px] top-0.5 w-3 h-3 rounded-full bg-[#63BDF2] ring-4 ring-[#63BDF2]/20" />
                <h4 className="text-sm font-bold text-white">1. Member submits a Work Request</h4>
                <p className="text-xs text-muted-foreground mt-1">Status defaults to 'Pending' (hidden from other team members, only visible to Admins and the creator).</p>
              </div>

              <div className="relative">
                <span className="absolute -left-[30px] top-0.5 w-3 h-3 rounded-full bg-[#63BDF2] ring-4 ring-[#63BDF2]/20" />
                <h4 className="text-sm font-bold text-white">2. Admin approves and activates the request</h4>
                <p className="text-xs text-muted-foreground mt-1">Status transitions to 'Active'. The work item is published on the global public Work Wall.</p>
              </div>

              <div className="relative">
                <span className="absolute -left-[30px] top-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                <h4 className="text-sm font-bold text-white">3. Admin completes the task</h4>
                <p className="text-xs text-muted-foreground mt-1">Creator earns +10 points instantly, updating the dynamic dashboard metrics.</p>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-8 pb-20 w-full px-4 sm:px-6 lg:px-12 pt-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-secondary/15 via-background to-secondary/10 p-6 md:p-8 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#63BDF2]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#3188DA]/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#63BDF2]/10 border border-[#63BDF2]/20 text-xs font-semibold text-[#63BDF2] uppercase tracking-wider">
              <HelpCircle size={12} /> System Documentation
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
              How It <span className="bg-gradient-to-r from-[#63BDF2] to-[#3188DA] bg-clip-text text-transparent">Works</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl leading-relaxed">
              Explore the advanced features, gamified point structures, role permissions, and modernization pipeline of Brain OS.
            </p>
          </div>
        </div>
      </div>

      {/* Docs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 bg-secondary/10 border border-border/30 rounded-3xl p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-[#63BDF2] to-[#3188DA] text-black shadow-lg shadow-[#63BDF2]/10' 
                  : 'text-muted-foreground hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-9 bg-secondary/10 border border-border/30 rounded-3xl p-6 md:p-8 backdrop-blur-xl min-h-[400px]">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
