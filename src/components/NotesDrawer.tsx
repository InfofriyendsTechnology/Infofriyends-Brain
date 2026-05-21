'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  BookOpen, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  BellRing,
  Save,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { 
  getNotesAction, 
  createNoteAction, 
  updateNoteAction, 
  deleteNoteAction 
} from '@/app/actions/notes'
import { createNotificationAction } from '@/app/actions/notifications'

interface NoteItem {
  id: string
  title: string
  content: string
  color: string
  reminderAt: Date | null
  createdAt: Date
}

// Preset color nodes for quick customization

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS_SHORT = ['Su','Mo','Tu','We','Th','Fr','Sa']

// Web Audio API Synthesizer to render a futuristic alert chime
const playCyberChime = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    // First note
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(880, ctx.currentTime) // A5
    osc1.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1) // E6
    gain1.gain.setValueAtTime(0.15, ctx.currentTime)
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start()
    osc1.stop(ctx.currentTime + 0.4)

    // Second note delayed slightly for harmonic cyber arpeggio
    setTimeout(() => {
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(1320, ctx.currentTime) // E6
      osc2.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15) // A6
      gain2.gain.setValueAtTime(0.15, ctx.currentTime)
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start()
      osc2.stop(ctx.currentTime + 0.5)
    }, 100)

  } catch (err) {
    console.error('Synthesized chime failure:', err)
  }
}

// ==================== Custom Calendar + Time Picker ====================
function ReminderPicker({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const now = new Date()
  
  // Parse existing value or default to now
  const parsed = value ? new Date(value) : null
  const [viewYear, setViewYear] = useState(parsed ? parsed.getFullYear() : now.getFullYear())
  const [viewMonth, setViewMonth] = useState(parsed ? parsed.getMonth() : now.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(parsed ? parsed.getDate() : null)
  const [hour, setHour] = useState(parsed ? (parsed.getHours() % 12 || 12) : 9)
  const [minute, setMinute] = useState(parsed ? parsed.getMinutes() : 0)
  const [period, setPeriod] = useState<'AM' | 'PM'>(parsed ? (parsed.getHours() >= 12 ? 'PM' : 'AM') : 'AM')

  // Rebuild the ISO string whenever selection changes
  useEffect(() => {
    if (selectedDay === null) {
      onChange('')
      return
    }
    let h24 = hour % 12
    if (period === 'PM') h24 += 12
    const d = new Date(viewYear, viewMonth, selectedDay, h24, minute)
    // Format as YYYY-MM-DDTHH:mm for datetime-local compatibility
    const pad = (n: number) => n.toString().padStart(2, '0')
    onChange(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`)
  }, [selectedDay, hour, minute, period, viewYear, viewMonth])

  // Calendar grid data
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay()
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate()
    
    const cells: { day: number; currentMonth: boolean; isToday: boolean; isPast: boolean }[] = []
    
    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ day: daysInPrevMonth - i, currentMonth: false, isToday: false, isPast: true })
    }
    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d)
      const today = new Date()
      const isToday = d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
      cells.push({ day: d, currentMonth: true, isToday, isPast })
    }
    // Next month leading days to complete the last row
    const remaining = 7 - (cells.length % 7)
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        cells.push({ day: d, currentMonth: false, isToday: false, isPast: false })
      }
    }
    return cells
  }, [viewYear, viewMonth])

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(y => y - 1)
    } else {
      setViewMonth(m => m - 1)
    }
  }

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(y => y + 1)
    } else {
      setViewMonth(m => m + 1)
    }
  }

  const clearReminder = () => {
    setSelectedDay(null)
    onChange('')
  }

  const hourOptions = Array.from({ length: 12 }, (_, i) => i + 1)
  const minuteOptions = Array.from({ length: 12 }, (_, i) => i * 5)

  return (
    <div className="space-y-3">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-1">
        <button
          type="button"
          onClick={goToPrevMonth}
          className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-all cursor-pointer"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-[10px] font-black uppercase tracking-wider text-white">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={goToNextMonth}
          className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-all cursor-pointer"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-0.5">
        {DAYS_SHORT.map(d => (
          <div key={d} className="text-center text-[8px] font-black uppercase text-zinc-500 tracking-wider py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day Grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {calendarDays.map((cell, idx) => {
          const isSelected = cell.currentMonth && cell.day === selectedDay
          const isDisabled = !cell.currentMonth || cell.isPast
          return (
            <button
              key={idx}
              type="button"
              disabled={isDisabled}
              onClick={() => setSelectedDay(cell.day)}
              className={`
                relative w-full aspect-square flex items-center justify-center rounded-lg text-[10px] font-bold transition-all cursor-pointer
                ${isDisabled ? 'text-zinc-700 cursor-not-allowed' : 'hover:bg-white/10 text-zinc-300'}
                ${cell.isToday && !isSelected ? 'text-[#63BDF2] ring-1 ring-[#63BDF2]/30' : ''}
                ${isSelected ? 'bg-[#63BDF2] text-black font-black shadow-[0_0_12px_rgba(99,189,242,0.4)] ring-0' : ''}
              `}
            >
              {cell.day}
            </button>
          )
        })}
      </div>

      {/* Time Selector - appears after selecting a day */}
      <AnimatePresence>
        {selectedDay !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 border-t border-white/5 space-y-2.5">
              <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider flex items-center gap-1">
                <Clock size={10} className="text-[#63BDF2]" /> Set Time
              </label>
              <div className="flex items-center gap-2">
                {/* Hour */}
                <div className="flex-1 relative">
                  <select
                    value={hour}
                    onChange={e => setHour(Number(e.target.value))}
                    className="w-full bg-zinc-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white font-bold appearance-none cursor-pointer focus:outline-none focus:border-[#63BDF2]/40 text-center"
                  >
                    {hourOptions.map(h => (
                      <option key={h} value={h}>{h.toString().padStart(2, '0')}</option>
                    ))}
                  </select>
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[7px] text-zinc-600 font-bold pointer-events-none">HR</span>
                </div>

                <span className="text-zinc-500 font-black text-sm">:</span>

                {/* Minute */}
                <div className="flex-1 relative">
                  <select
                    value={minute}
                    onChange={e => setMinute(Number(e.target.value))}
                    className="w-full bg-zinc-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white font-bold appearance-none cursor-pointer focus:outline-none focus:border-[#63BDF2]/40 text-center"
                  >
                    {minuteOptions.map(m => (
                      <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                    ))}
                  </select>
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[7px] text-zinc-600 font-bold pointer-events-none">MIN</span>
                </div>

                {/* AM/PM Toggle */}
                <div className="flex bg-zinc-950/80 border border-white/10 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setPeriod('AM')}
                    className={`px-3 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      period === 'AM' 
                        ? 'bg-[#63BDF2] text-black' 
                        : 'text-zinc-500 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriod('PM')}
                    className={`px-3 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      period === 'PM' 
                        ? 'bg-[#63BDF2] text-black' 
                        : 'text-zinc-500 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>

              {/* Selected datetime preview + clear */}
              <div className="flex items-center justify-between bg-zinc-950/60 border border-white/5 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2">
                  <BellRing size={10} className="text-yellow-400" />
                  <span className="text-[10px] text-zinc-300 font-bold">
                    {MONTHS[viewMonth].slice(0, 3)} {selectedDay}, {viewYear} — {hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')} {period}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={clearReminder}
                  className="text-[8px] font-black uppercase text-red-400 hover:text-red-300 tracking-wider cursor-pointer hover:bg-red-500/10 px-2 py-1 rounded-md transition-all"
                >
                  Clear
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== Main Component ====================

interface NotesDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotesDrawer({ isOpen, onClose }: NotesDrawerProps) {
  const [notes, setNotes] = useState<NoteItem[]>([])
  const [activeForm, setActiveForm] = useState<'LIST' | 'CREATE' | 'EDIT'>('LIST')
  const [currentNote, setCurrentNote] = useState<Partial<NoteItem>>({})
  
  // Input fields state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [color, setColor] = useState('#63BDF2')
  const [reminderAt, setReminderAt] = useState('')
  
  // Alert banner states
  const [activeAlarm, setActiveAlarm] = useState<string | null>(null)

  const fetchNotes = async () => {
    try {
      const res = await getNotesAction()
      if (res.success && res.notes) {
        const mapped = res.notes.map((n: any) => ({
          ...n,
          reminderAt: n.reminderAt ? new Date(n.reminderAt) : null,
          createdAt: new Date(n.createdAt)
        }))
        setNotes(mapped)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Initial Fetch & Active Alarm Scan Engine
  useEffect(() => {
    fetchNotes()
  }, [])

  useEffect(() => {
    if (!isOpen) return
    fetchNotes()
  }, [isOpen])

  // Reminder Engine: checks notes every 15 seconds
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date()
      notes.forEach(async (note) => {
        if (note.reminderAt && now >= note.reminderAt) {
          // Alarm matches! Show visual banner & chime
          setActiveAlarm(note.title || 'Personal Reminder')
          playCyberChime()
          
          // Clear reminder in db to avoid infinite triggers
          await updateNoteAction(note.id, { reminderAt: null })
          
          // Push notification into the global Inbox Alerts
          await createNotificationAction({
            title: 'Alarm Triggered',
            message: `Reminder for note: "${note.title || 'Untitled Note'}"`,
            type: 'REMINDER'
          })

          // Update local state to clear reminder flag
          setNotes(prev => 
            prev.map(n => n.id === note.id ? { ...n, reminderAt: null } : n)
          )
        }
      })
    }

    const interval = setInterval(checkReminders, 15000)
    return () => clearInterval(interval)
  }, [notes])

  const handleOpenCreate = () => {
    setTitle('')
    setContent('')
    setColor('#63BDF2')
    setReminderAt('')
    setActiveForm('CREATE')
  }

  const handleOpenEdit = (note: NoteItem) => {
    setCurrentNote(note)
    setTitle(note.title)
    setContent(note.content)
    setColor(note.color)
    setReminderAt(note.reminderAt ? note.reminderAt.toISOString().slice(0, 16) : '')
    setActiveForm('EDIT')
  }

  const handleSaveCreate = async () => {
    if (!title.trim() && !content.trim()) return
    try {
      const res = await createNoteAction({
        title: title || 'Untitled Note',
        content,
        color,
        reminderAt: reminderAt ? new Date(reminderAt).toISOString() : null
      })
      if (res.success) {
        fetchNotes()
        setActiveForm('LIST')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSaveEdit = async () => {
    if (!currentNote.id) return
    try {
      const res = await updateNoteAction(currentNote.id, {
        title: title || 'Untitled Note',
        content,
        color,
        reminderAt: reminderAt ? new Date(reminderAt).toISOString() : null
      })
      if (res.success) {
        fetchNotes()
        setActiveForm('LIST')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const res = await deleteNoteAction(id)
      if (res.success) {
        setNotes(prev => prev.filter(n => n.id !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      {/* Visual Alarm Alert Popdown Banner */}
      <AnimatePresence>
        {activeAlarm && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 20, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            className="fixed top-0 inset-x-0 mx-auto z-[200] max-w-sm bg-zinc-950/90 border border-yellow-500/20 shadow-[0_4px_25px_rgba(245,158,11,0.2)] p-4 rounded-2xl backdrop-blur-xl flex items-center justify-between gap-3 text-white"
          >
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500/20 p-2.5 rounded-xl text-yellow-400 animate-bounce">
                <BellRing size={16} />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-yellow-400 tracking-wider">Alarm Reminder</span>
                <p className="text-xs font-bold truncate max-w-[200px] mt-0.5">{activeAlarm}</p>
              </div>
            </div>
            <button
              onClick={() => setActiveAlarm(null)}
              className="p-1.5 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Slide Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dark glass backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-[#070709] z-[120] backdrop-blur-sm"
            />

            {/* Slide Sheet */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-zinc-950/80 border-l border-white/10 backdrop-blur-xl z-[130] flex flex-col shadow-2xl relative"
            >
              {/* Dynamic Glow Sphere in Drawer */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#63BDF2]/5 rounded-full blur-[80px] pointer-events-none -z-10" />

              {/* Header */}
              <div className="p-5 border-b border-white/5 flex items-center justify-between bg-zinc-950/40 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="bg-[#63BDF2]/10 p-2 rounded-xl text-[#63BDF2]">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">Personal Notes</h3>
                    <p className="text-[9px] text-[#63BDF2] font-black uppercase tracking-widest mt-0.5">Workspace Assistant</p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 relative z-10">
                
                {/* --- LIST MODE --- */}
                {activeForm === 'LIST' && (
                  <div className="space-y-4">
                    {/* Add note button */}
                    <button
                      onClick={handleOpenCreate}
                      className="w-full flex items-center justify-center gap-2 bg-[#63BDF2]/10 hover:bg-[#63BDF2]/15 border border-[#63BDF2]/20 hover:border-[#63BDF2]/40 text-[#63BDF2] py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer active:scale-98 shadow-sm"
                    >
                      <Plus size={14} className="stroke-[3px]" /> Create Quick Note
                    </button>

                    {/* Notes canvas list */}
                    {notes.length === 0 ? (
                      <div className="py-24 text-center flex flex-col items-center justify-center text-zinc-500 gap-3">
                        <div className="bg-white/5 p-4 rounded-3xl border border-white/5 text-zinc-400">
                          <BookOpen size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-zinc-400">Empty Notepad</p>
                          <p className="text-[10px] text-zinc-500 mt-1 max-w-[200px] leading-normal">
                            Write reminders, thoughts, or startup-compliant code snippets here.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3.5">
                        {notes.map((note) => (
                          <motion.div
                            key={note.id}
                            onClick={() => handleOpenEdit(note)}
                            whileHover={{ y: -2 }}
                            className="p-4 rounded-2xl border border-white/5 bg-zinc-950/40 hover:bg-white/5 transition-all cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden group shadow-md"
                          >
                            {/* Color Bar Highlight */}
                            <div 
                              className="absolute top-0 left-0 w-1.5 h-full opacity-80" 
                              style={{ backgroundColor: note.color }}
                            />

                            <div>
                              <div className="flex items-start justify-between gap-2 pl-2">
                                <h4 className="text-xs font-black text-white leading-tight capitalize truncate max-w-[200px]">
                                  {note.title}
                                </h4>
                                
                                <button
                                  onClick={(e) => handleDeleteNote(note.id, e)}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer shrink-0"
                                  title="Delete Note"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                              <p className="text-[11px] text-zinc-400 mt-2 pl-2 leading-relaxed break-words line-clamp-3">
                                {note.content}
                              </p>
                            </div>

                            {/* Note Bottom Details */}
                            <div className="flex items-center justify-between pt-2 border-t border-white/5 pl-2 text-[8px] text-zinc-500 font-bold uppercase tracking-wider">
                              <span>
                                {note.createdAt.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </span>
                              {note.reminderAt && (
                                <span className="flex items-center gap-1 text-yellow-400 bg-yellow-500/5 px-2 py-0.5 rounded-md border border-yellow-500/10 animate-pulse">
                                  <Clock size={8} /> 
                                  {note.reminderAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* --- CREATE / EDIT FORM MODE --- */}
                {(activeForm === 'CREATE' || activeForm === 'EDIT') && (
                  <div className="space-y-5">
                    {/* Inputs */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Note Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Server Migration Steps"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-zinc-950/60 border border-white/5 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#63BDF2]/40 transition-colors font-semibold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Note Content</label>
                      <textarea
                        rows={7}
                        placeholder="Write quick snippets, tasks, or code ideas here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full bg-zinc-950/60 border border-white/5 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-[#63BDF2]/40 transition-colors font-semibold resize-none custom-scrollbar leading-relaxed"
                      />
                    </div>


                    {/* Reminder Calendar + Time Picker */}
                    <div className="space-y-2.5">
                      <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider flex items-center gap-1">
                        <Calendar size={10} className="text-[#63BDF2]" /> Optional Reminder
                      </label>
                      <div className="bg-zinc-950/60 border border-white/5 rounded-2xl p-4">
                        <ReminderPicker value={reminderAt} onChange={setReminderAt} />
                      </div>
                      <p className="text-[8px] text-zinc-500 leading-normal">
                        Select a date and time. A chiptone chime will play when the reminder triggers.
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-white/5">
                      <button
                        onClick={() => setActiveForm('LIST')}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white py-3 rounded-2xl text-xs font-bold border border-white/5 transition-all cursor-pointer text-center"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={activeForm === 'CREATE' ? handleSaveCreate : handleSaveEdit}
                        className="flex-1 bg-[#63BDF2] text-black py-3 rounded-2xl text-xs font-black transition-all cursor-pointer hover:shadow-[0_4px_15px_rgba(99,189,242,0.35)] active:scale-98 flex items-center justify-center gap-1.5 uppercase"
                      >
                        <Save size={12} className="stroke-[3px]" /> Save Note
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
