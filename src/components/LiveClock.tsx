'use client'

import { useState, useEffect } from 'react'

export default function LiveClock() {
  const [mounted, setMounted] = useState(false)
  const [timeStr, setTimeStr] = useState('')
  const [dateStr, setDateStr] = useState('')

  useEffect(() => {
    setMounted(true)

    const updateClock = () => {
      const now = new Date()

      const time = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })

      const date = now.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })

      setTimeStr(time.toUpperCase())
      setDateStr(date)
    }

    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [])

  if (!mounted) {
    return (
      <div className="select-none opacity-40">
        <span className="text-2xl font-black text-white font-mono tracking-tight">--:--:-- --</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end select-none">
      {/* Time */}
      <div className="flex items-baseline gap-1.5 font-mono">
        <span className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none">
          {timeStr.slice(0, -3)}
        </span>
        <span className="text-xs font-bold text-[#63BDF2] uppercase tracking-wide leading-none">
          {timeStr.slice(-2)}
        </span>
      </div>
      {/* Date */}
      <span className="text-[10px] text-zinc-500 font-mono tracking-wider mt-1">
        {dateStr}
      </span>
    </div>
  )
}
