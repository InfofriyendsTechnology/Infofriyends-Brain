'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Calendar, 
  Clock, 
  BellRing,
  Sparkles,
  Archive,
  Save
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
const COLORS = [
  { hex: '#63BDF2', label: 'Cyan' },
  { hex: '#10B981', label: 'Emerald' },
  { hex: '#F59E0B', label: 'Gold' },
  { hex: '#EF4444', label: 'Crimson' },
  { hex: '#EC4899', label: 'Rose' },
  { hex: '#71717A', label: 'Carbon' }
]

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

                    {/* Color Presets */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider block">Visual Label Tag</label>
                      <div className="flex gap-2">
                        {COLORS.map((c) => (
                          <button
                            key={c.hex}
                            onClick={() => setColor(c.hex)}
                            className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-transform duration-200 border border-white/10 active:scale-90"
                            style={{ backgroundColor: c.hex }}
                            title={c.label}
                          >
                            {color === c.hex && (
                              <Check size={10} className="text-black stroke-[4px]" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Scheduler alarm */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider flex items-center gap-1">
                        <Calendar size={10} className="text-[#63BDF2]" /> Optional Reminder
                      </label>
                      <div className="relative">
                        <input
                          type="datetime-local"
                          value={reminderAt}
                          onChange={(e) => setReminderAt(e.target.value)}
                          className="w-full bg-zinc-950/60 border border-white/5 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#63BDF2]/40 transition-colors font-semibold appearance-none"
                        />
                      </div>
                      <p className="text-[8px] text-zinc-500 leading-normal">
                        Systems automatically play a chiptone chime when the scheduled timer triggers.
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
