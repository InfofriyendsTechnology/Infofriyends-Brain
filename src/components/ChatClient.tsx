'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, MessageSquare, ShieldCheck, User, Users, Clock, Sparkles, Plus, Hash, FolderGit2, X, AlertCircle } from 'lucide-react'
import { sendChatMessage, createChatChannel, setUserTyping, syncChatroom, touchUserHeartbeat } from '@/app/actions/chat'

interface Channel {
  id: string
  name: string
  description: string | null
  isProject: boolean
}

interface Message {
  id: string
  message: string
  userId: string
  createdAt: string | Date
  user: {
    id: string
    name: string
    role: string
    profilePhoto: string | null
  }
}

interface TeamMember {
  id: string
  name: string
  role: string
  profilePhoto: string | null
  isOnline: boolean
  lastActive: string | Date | null
}

export default function ChatClient({ 
  initialChannels, 
  initialMessages, 
  currentUser 
}: { 
  initialChannels: Channel[], 
  initialMessages: Message[], 
  currentUser: any 
}) {
  const [channels, setChannels] = useState<Channel[]>(initialChannels)
  const [activeChannel, setActiveChannel] = useState<Channel>(initialChannels[0])
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputText, setInputText] = useState('')
  const [isSending, setIsSending] = useState(false)
  
  // Live Sync Status
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  
  // Create Group Modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDesc, setNewGroupDesc] = useState('')
  const [newGroupIsProj, setNewGroupIsProj] = useState(false)
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastTypingTriggerRef = useRef<number>(0)

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load messages and sync status when channel changes
  useEffect(() => {
    const loadChannelData = async () => {
      if (!activeChannel) return
      try {
        const data = await syncChatroom(activeChannel.id)
        if (data) {
          setMessages(data.messages)
          setTypingUsers(data.typingUsers)
          setMembers(data.members)
          scrollToBottom()
        }
      } catch (e) {
        console.error(e)
      }
    }
    loadChannelData()
  }, [activeChannel])

  // Typing state update (Debounced to once every 2.5s to keep things ultra fast!)
  const handleInputChange = (text: string) => {
    setInputText(text)
    
    const now = Date.now()
    if (now - lastTypingTriggerRef.current > 2500) {
      lastTypingTriggerRef.current = now
      if (activeChannel) {
        setUserTyping(activeChannel.id)
      }
    }
  }

  // Unified Read-Only Polling Engine: Syncs messages, typing status, and member lists every 3.5s with zero write lock latency!
  useEffect(() => {
    if (!activeChannel) return

    const runSync = async () => {
      try {
        const data = await syncChatroom(activeChannel.id)
        if (data) {
          // Only update messages if count or last ID changed to prevent React rendering jerks
          if (
            data.messages.length !== messages.length ||
            (data.messages.length > 0 && data.messages[data.messages.length - 1].id !== messages[messages.length - 1]?.id)
          ) {
            setMessages(data.messages)
          }
          setTypingUsers(data.typingUsers)
          setMembers(data.members)
        }
      } catch (err) {
        // Suppress polling disconnections silently to keep the browser console perfectly clean!
      }
    }

    const interval = setInterval(runSync, 3500)
    return () => clearInterval(interval)
  }, [activeChannel, messages])

  // Infrequent Heartbeat Engine: Updates the database that the user is online once every 25 seconds (removes database write load!)
  useEffect(() => {
    // Beat heartbeat immediately on mount/load
    touchUserHeartbeat()

    const heartbeatInterval = setInterval(() => {
      touchUserHeartbeat()
    }, 25000)

    return () => clearInterval(heartbeatInterval)
  }, [])

  // Send Message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || isSending || !activeChannel) return

    const messageText = inputText.trim()
    setInputText('')
    setIsSending(true)

    // Optimistic UI insert for zero-latency feel
    const optimisticMsg: Message = {
      id: Math.random().toString(),
      message: messageText,
      userId: currentUser.id,
      createdAt: new Date(),
      user: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        profilePhoto: currentUser.profilePhoto || null
      }
    }
    setMessages(prev => [...prev, optimisticMsg])

    try {
      await sendChatMessage(activeChannel.id, messageText)
    } catch (err) {
      console.error(err)
      // Remove optimistic message if send failed
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id))
    } finally {
      setIsSending(false)
    }
  }

  // Create Custom Group Channel
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGroupName.trim() || isCreatingGroup) return

    setIsCreatingGroup(true)
    setCreateError(null)

    try {
      const channel = await createChatChannel(
        newGroupName.trim(),
        newGroupDesc.trim() || undefined,
        newGroupIsProj
      )
      
      // Update local channel list and join the new group immediately!
      setChannels(prev => [...prev, channel])
      setActiveChannel(channel)
      
      // Reset Modal Form
      setNewGroupName('')
      setNewGroupDesc('')
      setNewGroupIsProj(false)
      setShowCreateModal(false)
    } catch (err: any) {
      setCreateError(err.message)
    } finally {
      setIsCreatingGroup(false)
    }
  }

  // WhatsApp-style Relative Time formatter
  const formatLastSeen = (m: TeamMember) => {
    if (m.isOnline) return 'Online'
    if (!m.lastActive) return 'Offline'
    
    const diffMs = Date.now() - new Date(m.lastActive).getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Active just now'
    if (diffMins < 60) return `Active ${diffMins}m ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `Active ${diffHours}h ago`
    
    return `Active ${new Date(m.lastActive).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
  }

  return (
    <div className="flex-1 flex bg-[#0c0d12]/40 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl h-full shadow-2xl relative select-none">
      
      {/* ================= SIDEBAR: CHANNELS & MEMBERS ================= */}
      <div className="w-80 border-r border-white/10 bg-[#09090b]/80 flex flex-col shrink-0">
        
        {/* Workspace Brand Hub */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#63BDF2] to-[#3188DA] flex items-center justify-center text-black font-black text-xs">
              HQ
            </div>
            <div>
              <h2 className="text-xs font-black text-white uppercase tracking-wider">Chat Channels</h2>
              <p className="text-[9px] text-muted-foreground font-semibold">Brain OS Collaboration</p>
            </div>
          </div>

          <button 
            onClick={() => setShowCreateModal(true)}
            className="p-1.5 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-white rounded-lg transition-all cursor-pointer"
            title="Create Group Chat"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Channels List Pane */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          
          {/* Section: Primary Lounge Channels */}
          <div className="space-y-2">
            <span className="text-[9px] uppercase font-black tracking-widest text-[#63BDF2]/70 px-2 block">
              💬 Primary Lounges
            </span>
            <div className="space-y-1">
              {channels.filter(c => !c.isProject).map(channel => {
                const isActive = activeChannel?.id === channel.id
                return (
                  <button
                    key={channel.id}
                    onClick={() => setActiveChannel(channel)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-bold transition-all border cursor-pointer select-none ${
                      isActive 
                        ? 'bg-[#63BDF2]/10 border-[#63BDF2]/20 text-[#63BDF2]' 
                        : 'bg-transparent border-transparent text-muted-foreground hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Hash size={14} className={isActive ? 'text-[#63BDF2]' : 'text-muted-foreground'} />
                    <span className="truncate">{channel.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Section: Project Channels */}
          <div className="space-y-2">
            <span className="text-[9px] uppercase font-black tracking-widest text-[#63BDF2]/70 px-2 block">
              📁 Project Groups
            </span>
            <div className="space-y-1">
              {channels.filter(c => c.isProject).map(channel => {
                const isActive = activeChannel?.id === channel.id
                return (
                  <button
                    key={channel.id}
                    onClick={() => setActiveChannel(channel)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-bold transition-all border cursor-pointer select-none ${
                      isActive 
                        ? 'bg-[#63BDF2]/10 border-[#63BDF2]/20 text-[#63BDF2]' 
                        : 'bg-transparent border-transparent text-muted-foreground hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <FolderGit2 size={14} className={isActive ? 'text-[#63BDF2]' : 'text-muted-foreground'} />
                    <span className="truncate">{channel.name}</span>
                  </button>
                )
              })}
              {channels.filter(c => c.isProject).length === 0 && (
                <span className="text-[9px] text-muted-foreground italic px-3 block">No project channels created yet.</span>
              )}
            </div>
          </div>

          {/* Section: WhatsApp-style Members Live Status list */}
          <div className="space-y-2 pt-4 border-t border-white/5">
            <span className="text-[9px] uppercase font-black tracking-widest text-[#63BDF2]/70 px-2 block">
              🟢 Live Members Status
            </span>
            <div className="space-y-2">
              {members.map(m => (
                <div key={m.id} className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0 select-none">
                      {m.profilePhoto ? (
                        <img src={m.profilePhoto} alt={m.name} className="w-7 h-7 rounded-full object-cover border border-white/10" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[#63BDF2]/20 text-[#63BDF2] flex items-center justify-center font-bold text-[10px] uppercase">
                          {m.name.charAt(0)}
                        </div>
                      )}
                      <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-[#09090b] ${
                        m.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'
                      }`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-white truncate leading-none capitalize mb-1">{m.name}</p>
                      <p className={`text-[8px] font-bold ${m.isOnline ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                        {formatLastSeen(m)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ================= MAIN CHAT PANE ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header HUD */}
        {activeChannel && (
          <div className="px-6 py-4 border-b border-white/10 bg-[#0d0e12]/60 flex items-center justify-between gap-4 relative z-10 shrink-0">
            <div>
              <h1 className="text-sm font-bold text-white flex items-center gap-2">
                {activeChannel.isProject ? <FolderGit2 size={14} className="text-[#63BDF2]" /> : <Hash size={14} className="text-[#63BDF2]" />}
                {activeChannel.name}
              </h1>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-md">
                {activeChannel.description || 'Welcome to this workspace conversation lounge.'}
              </p>
            </div>
            
            {/* Live Indicator pill */}
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full text-[8px] font-bold text-emerald-400 uppercase tracking-wider animate-pulse">
              ● Active Sync
            </div>
          </div>
        )}

        {/* Message Feed Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar relative z-10 select-text">
          <AnimatePresence initial={false}>
            {messages.map((m) => {
              const isOwnMessage = m.userId === currentUser.id
              const isAdmin = m.user.role === 'ADMIN'

              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className={`flex gap-3 max-w-[85%] sm:max-w-[70%] ${
                    isOwnMessage ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  {/* User Profile photo */}
                  {m.user.profilePhoto ? (
                    <img src={m.user.profilePhoto} alt={m.user.name} className="w-8 h-8 rounded-full object-cover border border-white/10 mt-1 shrink-0 select-none" />
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[11px] uppercase mt-1 shrink-0 select-none ${
                      isOwnMessage ? 'bg-white text-black' : 'bg-[#63BDF2]/20 text-[#63BDF2]'
                    }`}>
                      {m.user.name.charAt(0)}
                    </div>
                  )}

                  {/* Bubble content */}
                  <div className="space-y-1 min-w-0">
                    {!isOwnMessage && (
                      <div className="flex items-center gap-1.5 px-1 select-none">
                        <span className="text-[10px] font-bold text-white/90 truncate capitalize">{m.user.name}</span>
                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[7px] font-bold uppercase tracking-wider ${
                          isAdmin ? 'bg-[#3188DA]/10 border border-[#3188DA]/25 text-[#63BDF2]' : 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400'
                        }`}>
                          {isAdmin ? <ShieldCheck size={7} /> : <User size={7} />}
                          {m.user.role}
                        </span>
                      </div>
                    )}

                    <div className={`p-3.5 rounded-2xl text-xs leading-relaxed break-words shadow-md font-medium ${
                      isOwnMessage
                        ? 'bg-gradient-to-br from-[#63BDF2] to-[#3188DA] text-black rounded-tr-none'
                        : 'bg-white/5 border border-white/5 text-white rounded-tl-none'
                    }`}>
                      {m.message}
                    </div>

                    <div className={`flex items-center gap-1 text-[8px] text-muted-foreground px-1.5 select-none ${
                      isOwnMessage ? 'justify-end' : 'justify-start'
                    }`}>
                      <Clock size={8} />
                      <span suppressHydrationWarning>{new Date(m.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {/* Typing Indicator Bubble */}
          {typingUsers.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-[10px] font-bold text-[#63BDF2] bg-[#63BDF2]/10 border border-[#63BDF2]/15 px-3 py-1.5 rounded-xl w-fit animate-pulse"
            >
              <span>✍️ {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Console */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#0d0e12]/60 backdrop-blur-xl relative z-10 shrink-0">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={activeChannel ? `Message ${activeChannel.name}...` : 'Select a group to start...'}
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                disabled={!activeChannel}
                className="w-full bg-[#09090b]/80 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-[#63BDF2]/60 focus:ring-1 focus:ring-[#63BDF2]/20 transition-all font-medium"
              />
              <Sparkles className="absolute right-4 top-3.5 text-[#63BDF2]/40 pointer-events-none" size={14} />
            </div>

            <button
              type="submit"
              disabled={!inputText.trim() || isSending || !activeChannel}
              className="p-3 bg-white text-black hover:bg-white/90 rounded-xl transition-all cursor-pointer shadow-lg shadow-white/5 shrink-0 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={14} className="shrink-0" />
            </button>
          </form>
        </div>

      </div>

      {/* ================= MODAL: CREATE NEW GROUP CHANNEL ================= */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-[#09090b]/80 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0d0e12] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl select-none"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Plus size={16} className="text-[#63BDF2]" /> Create New Chat Group
                </h3>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-white transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-4">
                {createError && (
                  <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{createError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/70 uppercase tracking-wider block">Group Name</label>
                  <input
                    type="text"
                    required
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g. Nand Utsav Prep"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-[#63BDF2] focus:ring-1 focus:ring-[#63BDF2]/30 transition-all font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/70 uppercase tracking-wider block">Group Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewGroupIsProj(false)}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        !newGroupIsProj 
                          ? 'bg-[#63BDF2]/10 border-[#63BDF2]/20 text-[#63BDF2]' 
                          : 'bg-white/5 border-transparent text-muted-foreground hover:text-white'
                      }`}
                    >
                      💬 General Lounge
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewGroupIsProj(true)}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        newGroupIsProj 
                          ? 'bg-[#63BDF2]/10 border-[#63BDF2]/20 text-[#63BDF2]' 
                          : 'bg-white/5 border-transparent text-muted-foreground hover:text-white'
                      }`}
                    >
                      📁 Project Room
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/70 uppercase tracking-wider block">Description (Optional)</label>
                  <textarea
                    rows={3}
                    value={newGroupDesc}
                    onChange={(e) => setNewGroupDesc(e.target.value)}
                    placeholder="Describe the purpose of this conversation group..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-[#63BDF2] focus:ring-1 focus:ring-[#63BDF2]/30 transition-all font-semibold resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!newGroupName.trim() || isCreatingGroup}
                  className="w-full bg-gradient-to-r from-[#63BDF2] to-[#3188DA] text-black hover:opacity-95 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 mt-4 cursor-pointer"
                >
                  {isCreatingGroup ? 'Creating Group...' : 'Create Chat Group'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
