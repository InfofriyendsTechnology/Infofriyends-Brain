'use client'

import { useState } from 'react'
import { updateProfileAction } from '@/app/actions/profile'
import { motion } from 'framer-motion'
import { Save, User, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

export default function ProfileForm({ user }: { user: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [photoPreview, setPhotoPreview] = useState(user.profilePhoto || '')

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError('')
    setSuccess(false)

    try {
      const result = await updateProfileAction(formData)
      if (result.success) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-3"
        >
          <CheckCircle2 size={20} className="shrink-0" />
          <span className="text-sm font-semibold">Profile updated successfully!</span>
        </motion.div>
      )}

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl flex items-center gap-3"
        >
          <AlertCircle size={20} className="shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </motion.div>
      )}

      {/* Avatar Preview & Upload Indicator */}
      <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border/30">
        <div className="relative">
          {photoPreview ? (
            <img 
              src={photoPreview} 
              alt={user.name} 
              className="w-24 h-24 rounded-full object-cover border-2 border-[#63BDF2] shadow-lg shadow-[#63BDF2]/25" 
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#63BDF2] to-[#3188DA] text-[#09090b] flex items-center justify-center font-black text-4xl shadow-lg shadow-[#63BDF2]/20 select-none uppercase">
              {user.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="text-center sm:text-left space-y-1">
          <h3 className="text-lg font-bold text-white">Your Avatar</h3>
          <p className="text-xs text-muted-foreground max-w-xs">
            Provide a custom image URL below to update your profile picture.
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-white/90">Display Name</label>
          <div className="relative">
            <input
              type="text"
              name="name"
              required
              defaultValue={user.name}
              className="w-full bg-background/50 border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Your full name"
            />
            <User className="absolute left-3.5 top-3.5 text-muted-foreground" size={16} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-white/90">Username / Email</label>
          <input
            type="text"
            name="username"
            required
            defaultValue={user.username}
            className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="username@infofriyendstechnology.com"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-white/90">Profile Photo URL</label>
          <input
            type="url"
            name="profilePhoto"
            value={photoPreview}
            onChange={(e) => setPhotoPreview(e.target.value)}
            className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="https://example.com/avatar.jpg"
          />
        </div>
      </div>

      {/* Action Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full md:w-auto flex items-center justify-center gap-2 bg-white text-black hover:bg-white/90 px-8 py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Saving changes...
          </>
        ) : (
          <>
            <Save size={18} />
            Save Settings
          </>
        )}
      </button>
    </form>
  )
}
