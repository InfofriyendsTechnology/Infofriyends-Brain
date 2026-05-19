'use client'

import { useStore } from '@/store/useStore'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { createWork } from '@/app/actions'
import { useState } from 'react'

export default function AddWorkModal({ user }: { user: any }) {
  const { isAddWorkModalOpen, setAddWorkModalOpen } = useStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isAddWorkModalOpen) return null

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError(null)
    try {
      const res = await createWork(formData)
      if (res && !res.success) {
        setError(res.error || 'Failed to create work.')
      } else {
        setAddWorkModalOpen(false)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create work.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-border flex justify-between items-center bg-secondary/20">
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Start New Work</h2>
            <button 
              onClick={() => setAddWorkModalOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <form action={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-white/80">Work Name</label>
              <input
                id="name"
                name="name"
                required
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="e.g., Redesign Landing Page"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-white/80">Small Description</label>
              <textarea
                id="description"
                name="description"
                required
                rows={3}
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                placeholder="What is the goal of this work?"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Started by: <span className="text-primary font-medium">{user.name}</span>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-[0_0_20px_rgba(99,189,242,0.25)] hover:shadow-[0_0_30px_rgba(99,189,242,0.45)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Work'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
