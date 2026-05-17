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
      
      // Time string: "09:16 PM"
      const formattedTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
      
      // Date string: "SUN, MAY 17"
      const formattedDate = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }).toUpperCase()

      setTimeStr(formattedTime)
      setDateStr(formattedDate)
    }

    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [])

  if (!mounted) {
    return (
      <div className="md:text-right space-y-1 mt-1 opacity-50">
        <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight block leading-none font-mono">
          --:-- --
        </span>
        <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest block mt-1.5">
          LOADING...
        </span>
      </div>
    )
  }

  return (
    <div className="md:text-right space-y-1 mt-1 select-none">
      <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight block leading-none font-mono">
        {timeStr}
      </span>
      <span className="text-[10px] text-[#63BDF2] font-mono uppercase tracking-widest block mt-1.5">
        {dateStr}
      </span>
    </div>
  )
}
