'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Calendar as CalendarIcon, Clock, X } from 'lucide-react'

interface DateTimePickerProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function DateTimePicker({ value, onChange, placeholder = 'Select Date & Time', className = '' }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const parsedDate = value ? new Date(value) : new Date()
  
  const [currentMonth, setCurrentMonth] = useState(parsedDate.getMonth())
  const [currentYear, setCurrentYear] = useState(parsedDate.getFullYear())
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? parsedDate : null)
  
  // Time state
  const initialHours = value ? parsedDate.getHours() : 12
  const [hour12, setHour12] = useState(initialHours % 12 === 0 ? 12 : initialHours % 12)
  const [minute, setMinute] = useState(value ? parsedDate.getMinutes() : 0)
  const [isPM, setIsPM] = useState(initialHours >= 12)
  const [mode, setMode] = useState<'date' | 'time'>('date')
  
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(y => y - 1)
    } else {
      setCurrentMonth(m => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(y => y + 1)
    } else {
      setCurrentMonth(m => m + 1)
    }
  }

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day)
    setSelectedDate(newDate)
    setMode('time')
  }

  const formatDisplay = () => {
    if (!value) return ''
    const d = new Date(value)
    if (isNaN(d.getTime())) return ''
    const h = d.getHours()
    const m = d.getMinutes()
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 === 0 ? 12 : h % 12
    const minStr = m.toString().padStart(2, '0')
    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const year = d.getFullYear()
    return `${day}-${month}-${year} ${h12}:${minStr} ${ampm}`
  }

  const commitValue = () => {
    if (!selectedDate) return
    const d = new Date(selectedDate)
    let finalHour = hour12
    if (isPM && finalHour !== 12) finalHour += 12
    if (!isPM && finalHour === 12) finalHour = 0
    d.setHours(finalHour, minute, 0, 0)
    
    // adjust for local timezone offset to get local ISO string correctly for the input
    const offset = d.getTimezoneOffset() * 60000; 
    const localISOTime = (new Date(d.getTime() - offset)).toISOString().slice(0,-1);
    
    onChange(localISOTime)
    setIsOpen(false)
  }

  const daysInMonth = getDaysInMonth(currentMonth, currentYear)
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
  
  const blanks = Array.from({ length: firstDay }, (_, i) => i)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="relative" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-[#0c0d12]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus-within:border-[#63BDF2]/50 cursor-pointer transition-colors ${className}`}
      >
        <span className={value ? 'text-white font-bold' : 'text-zinc-500'}>
          {value ? formatDisplay() : placeholder}
        </span>
        <div className="flex items-center gap-2 text-zinc-500">
          {value && (
            <div 
              onClick={(e) => { e.stopPropagation(); onChange(''); setSelectedDate(null); }}
              className="p-0.5 hover:text-white transition-colors hover:bg-white/10 rounded-full"
            >
              <X size={12} />
            </div>
          )}
          <CalendarIcon size={14} className={isOpen ? 'text-[#63BDF2]' : ''} />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 p-4 bg-[#12131a] border border-[#63BDF2]/20 shadow-2xl shadow-black/80 rounded-2xl w-[280px]"
          >
            {/* Tabs */}
            <div className="flex bg-[#0c0d12]/60 p-1 rounded-xl mb-4 border border-white/5">
              <button 
                onClick={() => setMode('date')}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${mode === 'date' ? 'bg-[#63BDF2] text-black shadow-md' : 'text-zinc-500 hover:text-white'}`}
              >
                Date
              </button>
              <button 
                onClick={() => setMode('time')}
                disabled={!selectedDate}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${mode === 'time' ? 'bg-[#63BDF2] text-black shadow-md' : 'text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed'}`}
              >
                Time
              </button>
            </div>

            {mode === 'date' && (
              <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <div className="flex items-center justify-between mb-4 px-1">
                  <button onClick={handlePrevMonth} className="p-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                  <div className="text-xs font-bold text-white tracking-wider">
                    {MONTHS[currentMonth]} {currentYear}
                  </div>
                  <button onClick={handleNextMonth} className="p-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                    <ChevronRight size={16} />
                  </button>
                </div>
                
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {DAYS.map(d => (
                    <div key={d} className="text-center text-[9px] font-black uppercase text-zinc-500 py-1">{d}</div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {blanks.map(b => <div key={`b-${b}`} className="w-8 h-8" />)}
                  {days.map(d => {
                    const isSelected = selectedDate?.getDate() === d && selectedDate?.getMonth() === currentMonth && selectedDate?.getFullYear() === currentYear;
                    const isToday = new Date().getDate() === d && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;
                    
                    return (
                      <button 
                        key={d} 
                        onClick={() => handleDateSelect(d)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all
                          ${isSelected 
                            ? 'bg-[#63BDF2] text-black shadow-lg shadow-[#63BDF2]/30 scale-110' 
                            : isToday 
                              ? 'bg-white/10 text-[#63BDF2] border border-[#63BDF2]/30' 
                              : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                          }
                        `}
                      >
                        {d}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {mode === 'time' && (
              <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="py-2">
                <div className="flex justify-center items-center gap-4 mb-6">
                  <div className="flex flex-col items-center gap-2">
                    <button onClick={() => setHour12(h => h === 12 ? 1 : h + 1)} className="p-1 text-zinc-400 hover:text-[#63BDF2]"><ChevronUp size={20} /></button>
                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-xl font-black text-white shadow-inner">
                      {hour12.toString().padStart(2, '0')}
                    </div>
                    <button onClick={() => setHour12(h => h === 1 ? 12 : h - 1)} className="p-1 text-zinc-400 hover:text-[#63BDF2]"><ChevronDown size={20} /></button>
                    <span className="text-[9px] font-bold uppercase text-zinc-500">Hour</span>
                  </div>
                  
                  <div className="text-xl font-black text-zinc-600 pb-5">:</div>

                  <div className="flex flex-col items-center gap-2">
                    <button onClick={() => setMinute(m => m >= 59 ? 0 : m + 1)} className="p-1 text-zinc-400 hover:text-[#63BDF2]"><ChevronUp size={20} /></button>
                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-xl font-black text-white shadow-inner">
                      {minute.toString().padStart(2, '0')}
                    </div>
                    <button onClick={() => setMinute(m => m <= 0 ? 59 : m - 1)} className="p-1 text-zinc-400 hover:text-[#63BDF2]"><ChevronDown size={20} /></button>
                    <span className="text-[9px] font-bold uppercase text-zinc-500">Minute</span>
                  </div>

                  <div className="flex flex-col gap-2 pb-5 ml-2">
                    <button 
                      onClick={() => setIsPM(false)}
                      className={`px-3 py-2 rounded-lg text-xs font-black transition-all ${!isPM ? 'bg-[#63BDF2] text-black shadow-md' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
                    >
                      AM
                    </button>
                    <button 
                      onClick={() => setIsPM(true)}
                      className={`px-3 py-2 rounded-lg text-xs font-black transition-all ${isPM ? 'bg-[#63BDF2] text-black shadow-md' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
                    >
                      PM
                    </button>
                  </div>
                </div>

                <button 
                  onClick={commitValue}
                  className="w-full bg-[#63BDF2] hover:bg-[#3188DA] text-black py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-lg shadow-[#63BDF2]/20"
                >
                  Confirm Time
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
// added ChevronUp and ChevronDown
