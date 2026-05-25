'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface Option {
  value: string | number
  label: string
}

interface CustomSelectProps {
  value: string | number
  onChange: (val: any) => void
  options: Option[]
  placeholder?: string
  className?: string
  borderColorClass?: string
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select option',
  className = '',
  borderColorClass = 'border-white/10 focus:border-[#63BDF2]/50'
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Find currently selected option
  const selectedOption = options.find(opt => opt.value === value)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full select-none shrink-0 z-20">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-zinc-950/60 border rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none transition-all duration-200 cursor-pointer hover:bg-zinc-950/80 ${borderColorClass} ${
          isOpen ? 'ring-1 ring-[#63BDF2]/20' : ''
        } ${className}`}
      >
        <span className={selectedOption ? 'text-white font-medium' : 'text-zinc-500 font-normal'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="text-zinc-500 shrink-0 ml-1.5"
        >
          <ChevronDown size={14} />
        </motion.div>
      </button>

      {/* Dropdown Options Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 max-h-56 overflow-y-auto custom-scrollbar bg-zinc-950/95 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl py-1.5 z-50 mt-1"
          >
            {options.length === 0 ? (
              <div className="px-3 py-2 text-xs text-zinc-500 italic text-center">No options available</div>
            ) : (
              options.map((opt) => {
                const isSelected = opt.value === value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value)
                      setIsOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors duration-150 flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#63BDF2]/15 text-[#63BDF2] font-black'
                        : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#63BDF2]" />
                    )}
                  </button>
                )
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
