'use client'

import { useState, useRef, useEffect } from 'react'
import { HelpCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SectionGuideProps {
  title: string
  content: string
}

export default function SectionGuide({ title, content }: SectionGuideProps) {
  const [isOpen, setIsOpen] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative inline-block ml-2 select-none z-30">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-muted-foreground hover:text-white transition-colors cursor-pointer focus:outline-none p-1 rounded-full hover:bg-white/5"
        title="Click to learn how this works"
      >
        <HelpCircle size={14} className="shrink-0" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-2 w-[280px] sm:w-72 p-4 bg-[#0d0e12]/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl z-50 text-left space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#63BDF2] flex items-center gap-1.5">
                💡 How it works
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsOpen(false)
                }}
                className="text-muted-foreground hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>
            <h4 className="text-xs font-bold text-white uppercase">{title}</h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
              {content}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
