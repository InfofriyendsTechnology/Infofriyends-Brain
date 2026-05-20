'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Briefcase, Shield, LogOut, Plus, User, HelpCircle, MessageSquare, MoreHorizontal, EyeOff, ChevronUp, Lightbulb, Users } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { logoutAction } from '@/app/actions/auth'
import { useState, useEffect } from 'react'

export default function Sidebar({ session }: { session: any }) {
  const pathname = usePathname()
  const router = useRouter()
  const { setAddWorkModalOpen, isNavbarHidden, setNavbarHidden } = useStore()
  const [greeting, setGreeting] = useState('Hey')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  const navItems = [
    { name: 'Dashboard', href: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Workspace', href: '/works', icon: <Briefcase size={20} /> },
    { name: 'Proposals', href: '/proposals', icon: <Lightbulb size={20} /> },
    { name: 'Team Members', href: '/members', icon: <Users size={20} /> },
    { name: 'Team Chat', href: '/chat', icon: <MessageSquare size={20} /> },
    { name: 'Profile Settings', href: '/profile', icon: <User size={20} /> },
    { name: 'How It Works', href: '/docs', icon: <HelpCircle size={20} /> },
    ...(session?.user?.role === 'ADMIN' ? [{ name: 'Admin Panel', href: '/admin', icon: <Shield size={20} /> }] : [])
  ]

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden lg:flex flex-col w-72 h-screen bg-background border-r border-border shrink-0 fixed left-0 top-0 z-40 select-none">
        {/* Logo/Branding */}
        <div className="p-6 border-b border-border/50">
          <Link href="/" className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-[#63BDF2]/10 p-2 w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            >
              <img src="/IB_LOGO.png" alt="Logo" className="max-h-full max-w-full object-contain" />
            </motion.div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-base tracking-tight leading-none bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent truncate">
                Infofriyends Brain
              </span>
              <span className="text-[9px] text-[#63BDF2]/85 uppercase font-bold tracking-wider mt-1">
                Mad Community
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-[#3188DA]/10 text-[#63BDF2] border border-[#63BDF2]/20 shadow-[0_0_15px_rgba(99,189,242,0.15)]' 
                    : 'text-muted-foreground hover:text-white hover:bg-secondary/20 border border-transparent'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            )
          })}

          {/* Quick Action Button */}
          {session && (
            <div className="pt-4 border-t border-border/30 mt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAddWorkModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 bg-white text-black py-3 rounded-xl font-bold text-sm hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                <Plus size={16} /> Add New Work
              </motion.button>
            </div>
          )}
        </nav>

        {/* Greetings & User Profile Footer */}
        <div className="p-4 border-t border-border/40 bg-secondary/5 flex items-center justify-between gap-3">
          {session ? (
            <>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#63BDF2] to-[#3188DA] text-[#09090b] flex items-center justify-center font-black text-base shadow-md select-none uppercase">
                    {session.user.name.charAt(0)}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#09090b] rounded-full animate-pulse" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-white capitalize truncate leading-none mb-1.5">
                    {session.user.name}
                  </h4>
                  <span className="text-[8px] text-muted-foreground border border-border/50 px-1.5 py-0.5 rounded font-mono uppercase font-bold tracking-wider">
                    {session.user.role}
                  </span>
                </div>
              </div>

              {/* Logout button */}
              <button 
                onClick={() => setShowLogoutConfirm(true)}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all shrink-0 cursor-pointer"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <Link 
              href="/login"
              className="w-full flex items-center justify-center gap-2 bg-secondary text-white py-3 rounded-xl font-bold text-sm hover:bg-secondary/80 transition-all border border-border"
            >
              <User size={16} /> Sign In
            </Link>
          )}
        </div>
      </aside>

      {/* ================= MOBILE BOTTOM NAVIGATION ================= */}
      {/* Floating Restore Button when navigation bar is hidden */}
      {isNavbarHidden && (
        <button
          onClick={() => setNavbarHidden(false)}
          className="lg:hidden fixed bottom-4 right-4 z-50 bg-background/90 border border-border/80 p-3 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-[#63BDF2] hover:text-white hover:bg-secondary/20 transition-all cursor-pointer flex items-center justify-center animate-bounce"
          title="Show Navigation Bar"
        >
          <ChevronUp size={20} />
        </button>
      )}

      {/* Submenu Popover for Extra Items */}
      <AnimatePresence>
        {showMoreMenu && !isNavbarHidden && (
          <>
            {/* Click-away backdrop to close popover */}
            <div 
              onClick={() => setShowMoreMenu(false)}
              className="lg:hidden fixed inset-0 z-30"
            />
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="lg:hidden fixed bottom-24 right-4 z-40 w-56 bg-background/95 border border-border/80 rounded-2xl p-2.5 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col gap-1 select-none"
            >
              {/* Extra Items for Admin vs Member */}
              {session?.user?.role === 'ADMIN' && (
                <Link
                  href="/profile"
                  onClick={() => setShowMoreMenu(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    pathname === '/profile' ? 'text-[#63BDF2] bg-[#63BDF2]/10' : 'text-muted-foreground hover:text-white hover:bg-white/5'
                  }`}
                >
                  <User size={16} />
                  <span>Profile Settings</span>
                </Link>
              )}

              <Link
                href="/docs"
                onClick={() => setShowMoreMenu(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  pathname === '/docs' ? 'text-[#63BDF2] bg-[#63BDF2]/10' : 'text-muted-foreground hover:text-white hover:bg-white/5'
                }`}
              >
                <HelpCircle size={16} />
                <span>How It Works</span>
              </Link>

              <button
                onClick={() => {
                  setShowMoreMenu(false)
                  setNavbarHidden(true)
                }}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
              >
                <EyeOff size={16} />
                <span>Hide Navigation Bar</span>
              </button>

              {session ? (
                <button
                  onClick={() => {
                    setShowMoreMenu(false)
                    setShowLogoutConfirm(true)
                  }}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-left cursor-pointer border-t border-white/5 mt-1 pt-2.5"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setShowMoreMenu(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#63BDF2] hover:text-white hover:bg-[#63BDF2]/10 transition-all border-t border-white/5 mt-1 pt-2.5"
                >
                  <User size={16} />
                  <span>Login</span>
                </Link>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className={`lg:hidden fixed bottom-4 left-2 right-2 min-[400px]:left-4 min-[400px]:right-4 z-40 bg-background/85 border border-border/80 rounded-2xl p-1.5 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.4)] flex justify-around items-center h-16 transition-all duration-300 ${
        isNavbarHidden ? 'translate-y-28 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
      }`}>
        {/* Button 1: Home */}
        <Link 
          href="/" 
          onClick={() => setShowMoreMenu(false)}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all w-14 ${
            pathname === '/' ? 'text-[#63BDF2]' : 'text-muted-foreground hover:text-white'
          }`}
        >
          <LayoutDashboard size={18} />
          <span className="text-[7.5px] min-[360px]:text-[8px] font-bold mt-1 tracking-tight truncate w-full text-center">Home</span>
        </Link>

        {/* Button 2: Workspace */}
        <Link 
          href="/works" 
          onClick={() => setShowMoreMenu(false)}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all w-14 ${
            pathname === '/works' ? 'text-[#63BDF2]' : 'text-muted-foreground hover:text-white'
          }`}
        >
          <Briefcase size={18} />
          <span className="text-[7.5px] min-[360px]:text-[8px] font-bold mt-1 tracking-tight truncate w-full text-center">Work</span>
        </Link>

        {/* Button 3: Proposals */}
        <Link 
          href="/proposals" 
          onClick={() => setShowMoreMenu(false)}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all w-14 ${
            pathname === '/proposals' ? 'text-yellow-400' : 'text-muted-foreground hover:text-white'
          }`}
        >
          <Lightbulb size={18} />
          <span className="text-[7.5px] min-[360px]:text-[8px] font-bold mt-1 tracking-tight truncate w-full text-center">Ideas</span>
        </Link>

        {/* Button 4: Chat */}
        <Link 
          href="/chat" 
          onClick={() => setShowMoreMenu(false)}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all w-14 ${
            pathname === '/chat' ? 'text-[#63BDF2]' : 'text-muted-foreground hover:text-white'
          }`}
        >
          <MessageSquare size={18} />
          <span className="text-[7.5px] min-[360px]:text-[8px] font-bold mt-1 tracking-tight truncate w-full text-center">Chat</span>
        </Link>

        {/* Button 4: Admin Panel (if Admin) or Profile Settings (if Member) */}
        {session?.user?.role === 'ADMIN' ? (
          <Link 
            href="/admin" 
            onClick={() => setShowMoreMenu(false)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all w-14 ${
              pathname === '/admin' ? 'text-[#63BDF2]' : 'text-muted-foreground hover:text-white'
            }`}
          >
            <Shield size={18} />
            <span className="text-[7.5px] min-[360px]:text-[8px] font-bold mt-1 tracking-tight truncate w-full text-center">Admin</span>
          </Link>
        ) : (
          <Link 
            href="/profile" 
            onClick={() => setShowMoreMenu(false)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all w-14 ${
              pathname === '/profile' ? 'text-[#63BDF2]' : 'text-muted-foreground hover:text-white'
            }`}
          >
            <User size={18} />
            <span className="text-[7.5px] min-[360px]:text-[8px] font-bold mt-1 tracking-tight truncate w-full text-center">Profile</span>
          </Link>
        )}

        {/* Button 5: More (Submenu toggle) */}
        <button 
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer w-14 ${
            showMoreMenu ? 'text-[#63BDF2]' : 'text-muted-foreground hover:text-white'
          }`}
        >
          <MoreHorizontal size={18} />
          <span className="text-[7.5px] min-[360px]:text-[8px] font-bold mt-1 tracking-tight truncate w-full text-center">More</span>
        </button>
      </nav>

      {/* Premium Custom Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-[#09090b]/80 backdrop-blur-md"
            />
            
            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-[#0d0e12] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl select-none"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl">
                  <LogOut size={28} />
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Confirm Sign Out</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Are you sure you want to disconnect from Infofriyends Brain? You will need to log back in.
                  </p>
                </div>

                <div className="flex gap-3 w-full pt-4">
                  <button 
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={async () => {
                      setShowLogoutConfirm(false)
                      const res = await logoutAction()
                      if (res?.success) {
                        router.push('/login')
                        router.refresh()
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-500/90 hover:to-red-600/90 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-red-500/10"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
