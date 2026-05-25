'use client'

import { useStore, Toast } from '@/store/useStore'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react'

const ICON_MAP = {
  success: <CheckCircle2 size={16} className="text-emerald-400" />,
  error: <AlertCircle size={16} className="text-rose-400" />,
  warning: <AlertTriangle size={16} className="text-amber-400" />,
  info: <Info size={16} className="text-sky-400" />,
}

const BG_BORDER_CLASSES = {
  success: 'bg-emerald-950/80 border-emerald-500/20 text-emerald-100 shadow-[0_4px_20px_rgba(16,185,129,0.15)]',
  error: 'bg-rose-950/80 border-rose-500/20 text-rose-100 shadow-[0_4px_20px_rgba(244,63,94,0.15)]',
  warning: 'bg-amber-950/80 border-amber-500/20 text-amber-100 shadow-[0_4px_20px_rgba(245,158,11,0.15)]',
  info: 'bg-sky-950/80 border-sky-500/20 text-sky-100 shadow-[0_4px_20px_rgba(14,165,233,0.15)]',
}

export default function ToastContainer() {
  const { toasts, removeToast } = useStore()

  return (
    <div className="fixed bottom-5 right-5 z-[999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
            className={`pointer-events-auto border backdrop-blur-xl px-4 py-3 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold transition-all relative overflow-hidden`}
            style={{
              background: 'rgba(10, 11, 16, 0.85)',
            }}
          >
            {/* Color Accent Indicator Strip */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 ${
                toast.type === 'success' ? 'bg-emerald-500' :
                toast.type === 'error' ? 'bg-rose-500' :
                toast.type === 'warning' ? 'bg-amber-500' : 'bg-sky-500'
              }`}
            />

            <div className="flex items-center gap-2.5 pl-1.5 flex-1 min-w-0">
              <div className="shrink-0">{ICON_MAP[toast.type]}</div>
              <p className="leading-snug break-words flex-1 text-zinc-200">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-all active:scale-90"
            >
              <X size={13} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
