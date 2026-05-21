'use client'

import { useStore } from '@/store/useStore'
import { Plus } from 'lucide-react'

export default function CreateWorkTrigger({ currentUserRole }: { currentUserRole?: string }) {
  const { setAddWorkModalOpen } = useStore()
  
  if (currentUserRole === 'ADMIN') return null

  return (
    <button
      onClick={() => setAddWorkModalOpen(true)}
      className="flex items-center gap-2 bg-gradient-to-r from-[#63BDF2] to-[#3188DA] hover:from-[#63BDF2]/90 hover:to-[#3188DA]/90 text-black px-6 py-3 rounded-full text-xs font-black transition-all shadow-[0_4px_20px_rgba(99,189,242,0.3)] shrink-0 self-start md:self-auto cursor-pointer hover:scale-[1.02] active:scale-95"
    >
      <Plus size={14} className="stroke-[3px]" /> Start Work
    </button>
  )
}
