'use client'

import { useState } from 'react'
import { impersonateMemberAction } from '@/app/actions/admin'
import { Loader2, Shield } from 'lucide-react'

export default function ImpersonateButton({ memberId, memberName }: { memberId: string, memberName: string }) {
  const [isImpersonating, setIsImpersonating] = useState(false)

  return (
    <button
      onClick={async () => {
        setIsImpersonating(true)
        const res = await impersonateMemberAction(memberId)
        if (res.success) {
          window.location.href = '/'
        } else {
          setIsImpersonating(false)
          alert(res.error)
        }
      }}
      disabled={isImpersonating}
      className="w-full bg-[#63BDF2]/10 hover:bg-[#63BDF2]/20 text-[#63BDF2] border border-[#63BDF2]/20 hover:border-[#63BDF2]/40 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all text-xs font-black uppercase tracking-wider shadow-lg active:scale-[0.98]"
    >
      {isImpersonating ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
      Login as {memberName.split(' ')[0]}
    </button>
  )
}
