'use client'

import { createCommunityPost } from '@/app/actions'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, ArrowUpRight, Lightbulb, Zap, Activity } from 'lucide-react'

export default function TodayChanged({ posts, currentUser }: { posts: any[], currentUser: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [postType, setPostType] = useState('UPDATE')

  async function handleSubmit(formData: FormData) {
    if (!currentUser) return alert('Please login to post')
    
    setIsSubmitting(true)
    formData.append('type', postType)
    try {
      await createCommunityPost(formData)
      const form = document.getElementById('community-post-form') as HTMLFormElement
      if (form) form.reset()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'UPDATE': return <ArrowUpRight size={16} className="text-blue-400" />
      case 'THOUGHT': return <Lightbulb size={16} className="text-[#63BDF2]" />
      case 'IDEA': return <Zap size={16} className="text-yellow-400" />
      case 'PROGRESS': return <Activity size={16} className="text-green-400" />
      default: return <ArrowUpRight size={16} />
    }
  }

  const getPostColor = (type: string) => {
    switch (type) {
      case 'UPDATE': return 'bg-blue-500/10 border-blue-500/20 text-blue-400'
      case 'THOUGHT': return 'bg-[#63BDF2]/10 border-[#63BDF2]/20 text-[#63BDF2]'
      case 'IDEA': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
      case 'PROGRESS': return 'bg-green-500/10 border-green-500/20 text-green-400'
      default: return 'bg-primary/10 border-primary/20 text-primary'
    }
  }

  return (
    <div className="bg-secondary/20 border border-border rounded-3xl p-6 md:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight mb-2">Today in Infofriyends</h2>
        <p className="text-muted-foreground">What's on your mind? Share updates, thoughts, ideas, or progress.</p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Form Section */}
        <div className="w-full">
          <form id="community-post-form" action={handleSubmit} className="space-y-4">
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/90">Post Type</label>
              <div className="grid grid-cols-2 gap-2">
                {['UPDATE', 'THOUGHT', 'IDEA', 'PROGRESS'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPostType(type)}
                    className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                      postType === type 
                        ? getPostColor(type) 
                        : 'bg-background border-border text-muted-foreground hover:bg-white/5'
                    }`}
                  >
                    {getPostIcon(type)} {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <textarea
                name="content"
                rows={4}
                required
                className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                placeholder="Share something with the community..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-white text-black hover:bg-white/90 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Posting...' : (
                <>
                  <Send size={18} /> Post as {currentUser?.name || 'Member'}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Timeline Section */}
        <div className="w-full space-y-6 pt-6 border-t border-border/30">
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            Community Feed
          </h3>
          
          {posts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No updates yet. Start the conversation!
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
              {posts.map(post => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={post.id} 
                  className="bg-background/40 border border-border/40 rounded-2xl p-4 flex gap-3 hover:border-primary/20 transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0 overflow-hidden text-xs">
                    {post.user?.profilePhoto ? (
                      <img src={post.user.profilePhoto} alt={post.user.name} className="w-full h-full object-cover" />
                    ) : (
                      post.user?.name ? post.user.name.charAt(0) : '?'
                    )}
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-semibold text-white text-sm truncate">{post.user?.name || 'Unknown'}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border flex items-center gap-1 shrink-0 ${getPostColor(post.type)}`}>
                          {getPostIcon(post.type)} {post.type}
                        </span>
                      </div>
                      <span suppressHydrationWarning className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-xs text-white/95 whitespace-pre-wrap leading-relaxed break-words">
                      {post.content}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
