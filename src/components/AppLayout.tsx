'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

export default function AppLayout({ children, session }: { children: React.ReactNode, session: any }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  const isChatPage = pathname === '/chat'

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-background text-foreground h-[100dvh] overflow-hidden flex items-center justify-center relative">
        <main className="w-full h-full overflow-y-auto custom-scrollbar flex items-center justify-center">
          {children}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground h-[100dvh] overflow-hidden flex flex-col lg:flex-row">
      <Sidebar session={session} />
      <main className={`flex-1 h-full lg:pl-72 ${isChatPage ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar pb-28 sm:pb-32'}`}>
        {children}
      </main>
    </div>
  )
}
