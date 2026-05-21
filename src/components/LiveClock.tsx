'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Clock } from 'lucide-react'

// Timezone definitions with country flag and label
const TIMEZONES = [
  { id: 'IST', label: 'India (IST)', flag: '🇮🇳', tz: 'Asia/Kolkata' },
  { id: 'EST', label: 'USA (EST)', flag: '🇺🇸', tz: 'America/New_York' },
  { id: 'GMT', label: 'UK (GMT)', flag: '🇬🇧', tz: 'Europe/London' },
  { id: 'JST', label: 'Japan (JST)', flag: '🇯🇵', tz: 'Asia/Tokyo' },
]

export default function LiveClock() {
  const [mounted, setMounted] = useState(false)
  const [selectedTz, setSelectedTz] = useState(TIMEZONES[0]) // Default is India (IST)
  const [timeStr, setTimeStr] = useState('')
  const [dateStr, setDateStr] = useState('')
  const [dayProgress, setDayProgress] = useState(0)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const updateClock = () => {
      const now = new Date()
      
      try {
        // Time string with running seconds: e.g. "09:16:34 PM"
        const formattedTime = now.toLocaleTimeString('en-US', {
          timeZone: selectedTz.tz,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })

        // Date string: e.g. "SUN, MAY 17"
        const formattedDate = now.toLocaleDateString('en-US', {
          timeZone: selectedTz.tz,
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        }).toUpperCase()

        // Calculate day progress in the selected timezone
        // Convert local parts of selected timezone
        const formatterParts = new Intl.DateTimeFormat('en-US', {
          timeZone: selectedTz.tz,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
        const parts = formatterParts.formatToParts(now)
        
        const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10)
        const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10)
        const second = parseInt(parts.find(p => p.type === 'second')?.value || '0', 10)

        const totalSecondsInDay = 24 * 60 * 60
        const elapsedSeconds = (hour * 3600) + (minute * 60) + second
        const progress = (elapsedSeconds / totalSecondsInDay) * 100

        setTimeStr(formattedTime)
        setDateStr(formattedDate)
        setDayProgress(progress)
      } catch (e) {
        console.error('Failed to format timezone clock:', e)
      }
    }

    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [selectedTz])

  if (!mounted) {
    return (
      <div className="md:text-right space-y-1 mt-1 opacity-50 select-none">
        <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight block leading-none font-mono">
          --:--:-- --
        </span>
        <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest block mt-1.5">
          LOADING SYSTEMS...
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1.5 select-none relative z-30">
      {/* Timezone switcher with country flags (છબીઓ) */}
      <div className="flex items-center gap-1 bg-white/5 border border-white/5 p-0.5 rounded-lg">
        {TIMEZONES.map(tz => (
          <button
            key={tz.id}
            onClick={() => setSelectedTz(tz)}
            title={tz.label}
            className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold tracking-wider transition-all flex items-center gap-1 ${
              selectedTz.id === tz.id
                ? 'bg-[#63BDF2]/20 text-[#63BDF2] border border-[#63BDF2]/20 shadow-lg'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent'
            }`}
          >
            <span className="text-xs leading-none">{tz.flag}</span>
            <span className="font-mono">{tz.id}</span>
          </button>
        ))}
      </div>

      {/* Main Glassmorphic Clock Card */}
      <div 
        className="bg-zinc-950/45 border border-white/5 hover:border-[#63BDF2]/20 p-3 rounded-2xl transition-all cursor-help relative shadow-xl backdrop-blur-md"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Time with Running Seconds and AM/PM */}
        <div className="flex items-baseline justify-end gap-1 font-mono">
          <span className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none">
            {timeStr.split(' ')[0]}
          </span>
          <span className="text-xs font-bold text-[#63BDF2] uppercase tracking-wide leading-none">
            {timeStr.split(' ')[1]}
          </span>
        </div>

        {/* Date & Circular Progress Shell (જીવન શેલકેક) */}
        <div className="flex items-center justify-end gap-2 mt-2">
          {/* Date */}
          <span className="text-[9px] text-zinc-500 font-mono tracking-wider">
            {dateStr}
          </span>
          
          <div className="h-2.5 w-px bg-white/10" />

          {/* SVG Circular Day Progress ring (જીવન શેલકેક) */}
          <div 
            className="flex items-center gap-1"
            title={`Day Progress: ${dayProgress.toFixed(2)}% elapsed`}
          >
            <svg className="w-3.5 h-3.5 transform -rotate-90">
              <circle 
                cx="7" 
                cy="7" 
                r="5" 
                className="stroke-white/5" 
                strokeWidth="1.5" 
                fill="transparent" 
              />
              <circle 
                cx="7" 
                cy="7" 
                r="5" 
                className="stroke-emerald-500" 
                strokeWidth="1.5" 
                fill="transparent"
                strokeDasharray={2 * Math.PI * 5}
                strokeDashoffset={2 * Math.PI * 5 * (1 - dayProgress / 100)} 
              />
            </svg>
            <span className="text-[9px] text-emerald-400 font-mono font-bold">
              {dayProgress.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Ultra-Premium Gujarati Humorous Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute right-0 bottom-full mb-3 w-64 bg-zinc-950/95 border border-amber-500/20 p-3.5 rounded-2xl shadow-2xl backdrop-blur-lg z-50 text-left"
            >
              <div className="flex gap-2">
                <span className="text-amber-400 text-lg select-none">💡</span>
                <p className="text-[11px] text-zinc-300 font-bold leading-normal font-sans">
                  "કોઈપણ એક વિચાર ઉમેરવો તો જ કામનું છે. નકર કંપનીને તમારાથી બેસવાથી કંઈ ફાયદો થવાનો નથી."
                </p>
              </div>
              <div className="absolute right-6 top-full w-2.5 h-2.5 bg-zinc-950 border-r border-b border-amber-500/20 transform rotate-45 -translate-y-1.5" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
