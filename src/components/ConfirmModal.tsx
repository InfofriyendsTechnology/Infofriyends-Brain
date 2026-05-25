'use client'

import { useStore } from '@/store/useStore'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, AlertTriangle, X } from 'lucide-react'

export default function ConfirmModal() {
  const { confirmState, closeConfirm } = useStore()
  const { isOpen, title, message, confirmText, cancelText, danger } = confirmState

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Glassy backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={() => closeConfirm(false)}
            className="fixed inset-0 bg-[#070709] z-[990] backdrop-blur-sm"
          />

          {/* Modal box */}
          <div className="fixed inset-0 z-[995] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="pointer-events-auto w-full max-w-sm bg-zinc-950/90 border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl p-5 relative overflow-hidden"
            >
              {/* Optional dynamic top glow based on danger level */}
              <div
                className={`absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-[60px] pointer-events-none -z-10 ${
                  danger ? 'bg-red-500/10' : 'bg-sky-500/10'
                }`}
              />

              {/* Close button */}
              <button
                onClick={() => closeConfirm(false)}
                className="absolute top-4 right-4 p-1.5 bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-400 hover:text-white rounded-xl transition-all active:scale-95"
              >
                <X size={14} />
              </button>

              {/* Icon & Title */}
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-2xl shrink-0 ${
                    danger ? 'bg-red-500/10 text-red-400' : 'bg-[#63BDF2]/10 text-[#63BDF2]'
                  }`}
                >
                  {danger ? <AlertTriangle size={18} /> : <HelpCircle size={18} />}
                </div>
                <div className="space-y-1.5 min-w-0 pr-6">
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">
                    {title}
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-medium leading-relaxed break-words">
                    {message}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-white/5">
                <button
                  onClick={() => closeConfirm(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider border border-white/5 transition-all cursor-pointer text-center"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => closeConfirm(true)}
                  className={`flex-1 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                    danger
                      ? 'bg-red-500 hover:bg-red-600 text-black hover:shadow-[0_4px_15px_rgba(239,68,68,0.35)]'
                      : 'bg-[#63BDF2] hover:bg-[#52acd8] text-black hover:shadow-[0_4px_15px_rgba(99,189,242,0.35)]'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
