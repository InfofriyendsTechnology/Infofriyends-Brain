'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import { useStore } from '@/store/useStore'
import { Plus, HelpCircle } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import HelpGuideModal from './HelpGuideModal'

export default function AppLayout({ children, session }: { children: React.ReactNode, session: any }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'
  const isChatPage = pathname === '/chat'
  const { isNavbarHidden, setAddWorkModalOpen } = useStore()
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-background text-foreground h-[100dvh] overflow-hidden flex items-center justify-center relative">
        <main className="w-full h-full overflow-y-auto custom-scrollbar flex items-center justify-center">
          {children}
        </main>
      </div>
    )
  }

  // Compute responsive bottom padding class depending on navbar visibility and route
  let mainPaddingClass = ''
  if (isChatPage) {
    mainPaddingClass = isNavbarHidden ? 'pb-6' : 'pb-24 lg:pb-6'
  } else {
    mainPaddingClass = isNavbarHidden ? 'pb-8 lg:pb-8' : 'pb-28 sm:pb-32 lg:pb-8'
  }

  return (
    <div className="min-h-screen bg-background text-foreground h-[100dvh] overflow-hidden flex flex-col lg:flex-row">
      <Sidebar session={session} />
      <main className="flex-1 h-full lg:pl-72 overflow-hidden flex flex-col">
        <div className={`flex-1 w-full h-full min-h-0 flex flex-col ${isChatPage ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar'} ${mainPaddingClass} transition-all duration-300`}>
          {children}
        </div>
      </main>

      {/* Global Context Help Handbook Button (floating on all pages) */}
      {!isLoginPage && (
        <button
          onClick={() => setIsHelpOpen(true)}
          className="fixed top-5 right-5 z-40 bg-zinc-950/60 hover:bg-[#63BDF2]/10 border border-white/5 hover:border-[#63BDF2]/20 text-[#63BDF2] w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-md shadow-lg transition-all active:scale-95 hover:scale-105 cursor-pointer"
          title="OS Handbook (How to work)"
        >
          <HelpCircle size={16} />
        </button>
      )}

      {/* HandBook Fullscreen Modal */}
      <AnimatePresence>
        {isHelpOpen && (
          <HelpGuideModal 
            isOpen={isHelpOpen} 
            onClose={() => setIsHelpOpen(false)} 
            currentPath={pathname} 
          />
        )}
      </AnimatePresence>

      {/* Mobile Floating Action Button (FAB) to start new work */}
      {session && !isLoginPage && pathname === '/works' && (
        <button
          onClick={() => setAddWorkModalOpen(true)}
          className={`lg:hidden fixed ${isNavbarHidden ? 'bottom-6' : 'bottom-24'} right-6 z-40 bg-[#63BDF2] text-black w-12 h-12 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(99,189,242,0.45)] hover:scale-105 active:scale-95 transition-all cursor-pointer`}
          title="Add New Work"
        >
          <Plus size={20} className="stroke-[3px]" />
        </button>
      )}
    </div>
  )
}
