'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import { useStore } from '@/store/useStore'
import { Plus, HelpCircle, Notebook, LogOut, Loader2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import HelpGuideModal from './HelpGuideModal'
import NotificationsDropdown from './NotificationsDropdown'
import NotesDrawer from './NotesDrawer'
import { revertImpersonationAction } from '@/app/actions/admin'
import ToastContainer from './ToastContainer'
import ConfirmModal from './ConfirmModal'

export default function AppLayout({ children, session }: { children: React.ReactNode, session: any }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'
  const isChatPage = pathname === '/chat'
  const { isNavbarHidden, setAddWorkModalOpen } = useStore()
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [isNotesOpen, setIsNotesOpen] = useState(false)
  const [isReverting, setIsReverting] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  // Detect route change start via link clicks
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      let target = e.target as HTMLElement | null
      while (target && target.tagName !== 'A') {
        target = target.parentElement
      }

      if (target && target.tagName === 'A') {
        const href = target.getAttribute('href')
        const targetAttr = target.getAttribute('target')
        
        if (
          href && 
          href.startsWith('/') && 
          !href.startsWith('/#') && 
          targetAttr !== '_blank' && 
          !e.defaultPrevented &&
          e.button === 0 &&
          !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey
        ) {
          // Verify that we're actually going to a different route
          const currentPath = window.location.pathname
          if (href !== currentPath) {
            setIsNavigating(true)
          }
        }
      }
    }

    document.addEventListener('click', handleLinkClick, { capture: true })
    return () => {
      document.removeEventListener('click', handleLinkClick, { capture: true })
    }
  }, [])

  // Terminate loading state on pathname change
  useEffect(() => {
    setIsNavigating(false)
  }, [pathname])

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
      {/* Route Change Loading Bar */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            initial={{ width: '0%', opacity: 1 }}
            animate={{ 
              width: ['0%', '30%', '70%', '90%'],
              transition: { 
                times: [0, 0.2, 0.6, 1],
                duration: 8, 
                ease: 'easeOut' 
              } 
            }}
            exit={{ 
              width: '100%', 
              opacity: 0,
              transition: { duration: 0.25, ease: 'easeOut' }
            }}
            className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-[#63BDF2] via-[#3188DA] to-emerald-400 z-50 shadow-[0_0_10px_rgba(99,189,242,0.5)]"
          />
        )}
      </AnimatePresence>

      <Sidebar session={session} />
      <main className="flex-1 h-full lg:pl-72 overflow-hidden flex flex-col relative">
        <div className={`flex-1 w-full h-full min-h-0 flex flex-col ${isChatPage ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar'} ${mainPaddingClass} transition-all duration-300`}>
          {children}
        </div>

        {/* Impersonation Banner */}
        {session?.impersonator && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-red-500/20 border border-red-500/50 backdrop-blur-md px-4 py-2.5 rounded-full shadow-2xl">
            <span className="text-xs font-bold text-red-200">
              Impersonating: <span className="text-white">{session.user.name}</span>
            </span>
            <button
              onClick={async () => {
                setIsReverting(true)
                await revertImpersonationAction()
                window.location.href = '/' // Force full reload to reset state
              }}
              disabled={isReverting}
              className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-full font-bold hover:bg-red-600 transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isReverting ? <Loader2 size={12} className="animate-spin" /> : <LogOut size={12} />}
              Back to Admin
            </button>
          </div>
        )}
      </main>

      {/* Global Utilities Toolbar (floating on all pages) */}
      {!isLoginPage && (
        <div className="fixed top-5 right-5 z-40 flex items-center gap-2">
          {/* Notifications Dropdown */}
          <NotificationsDropdown />

          {/* Personal Notes Drawer Trigger */}
          <button
            onClick={() => setIsNotesOpen(true)}
            className="bg-zinc-950/60 border border-white/5 hover:border-white/10 text-zinc-400 hover:text-white w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-md shadow-lg transition-all active:scale-95 hover:scale-105 cursor-pointer"
            title="Personal Notes & Reminders"
          >
            <Notebook size={15} />
          </button>

          {/* Context Help Handbook Button */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="bg-zinc-950/60 border border-white/5 hover:border-[#63BDF2]/20 text-[#63BDF2] w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-md shadow-lg transition-all active:scale-95 hover:scale-105 cursor-pointer"
            title="OS Handbook (How to work)"
          >
            <HelpCircle size={16} />
          </button>
        </div>
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

      {/* Personal Notes Drawer */}
      <NotesDrawer isOpen={isNotesOpen} onClose={() => setIsNotesOpen(false)} />

      {/* Mobile Floating Action Button (FAB) to start new work */}
      {session && session.user?.role !== 'ADMIN' && !isLoginPage && pathname === '/works' && (
        <button
          onClick={() => setAddWorkModalOpen(true)}
          className={`lg:hidden fixed ${isNavbarHidden ? 'bottom-6' : 'bottom-24'} right-6 z-40 bg-[#63BDF2] text-black w-12 h-12 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(99,189,242,0.45)] hover:scale-105 active:scale-95 transition-all cursor-pointer`}
          title="Add New Work"
        >
          <Plus size={20} className="stroke-[3px]" />
        </button>
      )}

      {/* Global Overlays */}
      <ToastContainer />
      <ConfirmModal />
    </div>
  )
}
