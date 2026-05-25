'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  Check, 
  Trash2, 
  Info, 
  AlertTriangle, 
  Clock, 
  Inbox,
  Sparkles,
  Loader2
} from 'lucide-react'
import { 
  getNotificationsAction, 
  markNotificationReadAction, 
  markAllNotificationsReadAction, 
  deleteNotificationAction 
} from '@/app/actions/notifications'
import { useStore } from '@/store/useStore'

interface NotificationItem {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: Date
}

export default function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)

  const [readingId, setReadingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isClearingAll, setIsClearingAll] = useState(false)
  const { addToast, showConfirm } = useStore()

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await getNotificationsAction()
      if (res.success && res.notifications) {
        // Map Prisma Date objects if necessary
        const mapped = res.notifications.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt)
        }))
        setNotifications(mapped)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Poll for notifications every 10 seconds to support realtime alerts
  useEffect(() => {
    fetchNotifications()
    const timer = setInterval(() => {
      fetchNotifications()
    }, 10000)
    return () => clearInterval(timer)
  }, [])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setReadingId(id)
    try {
      const res = await markNotificationReadAction(id)
      if (res.success) {
        addToast('Notification marked as read', 'success')
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        )
      } else {
        addToast(res.error || 'Failed to mark read', 'error')
      }
    } catch (err: any) {
      console.error(err)
      addToast(err.message || 'An error occurred', 'error')
    } finally {
      setReadingId(null)
    }
  }

  const handleMarkAllRead = async () => {
    setIsClearingAll(true)
    try {
      const res = await markAllNotificationsReadAction()
      if (res.success) {
        addToast('All notifications marked as read', 'success')
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      } else {
        addToast(res.error || 'Failed to clear notifications', 'error')
      }
    } catch (err: any) {
      console.error(err)
      addToast(err.message || 'An error occurred', 'error')
    } finally {
      setIsClearingAll(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const item = notifications.find(n => n.id === id)
    const titleText = item?.title || 'this alert'
    const confirmed = await showConfirm({
      title: 'Delete Notification',
      message: `Are you sure you want to delete "${titleText}"?`,
      confirmText: 'Delete Alert',
      danger: true
    })
    if (!confirmed) return

    setDeletingId(id)
    try {
      const res = await deleteNotificationAction(id)
      if (res.success) {
        addToast('Notification deleted', 'success')
        setNotifications(prev => prev.filter(n => n.id !== id))
      } else {
        addToast(res.error || 'Failed to delete notification', 'error')
      }
    } catch (err: any) {
      console.error(err)
      addToast(err.message || 'An error occurred', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="relative">
      {/* Bell Trigger Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative bg-zinc-950/60 border text-zinc-400 w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-md shadow-lg transition-all active:scale-95 hover:scale-105 cursor-pointer ${
          isOpen 
            ? 'border-[#63BDF2]/40 text-[#63BDF2] bg-[#63BDF2]/5 shadow-[0_0_15px_rgba(99,189,242,0.1)]' 
            : 'border-white/5 hover:border-white/10 hover:text-white'
        }`}
        title="Notifications"
      >
        <Bell size={16} className={unreadCount > 0 ? 'animate-swing origin-top' : ''} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white font-mono font-black text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(239,68,68,0.4)] animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Click-away backdrop */}
            <div 
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 cursor-default"
            />
            
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="absolute right-0 mt-3 w-80 sm:w-96 bg-zinc-950/90 border border-white/10 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl z-50 overflow-hidden flex flex-col max-h-[480px]"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-zinc-950/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-white tracking-wider">Inbox Alerts</span>
                  {unreadCount > 0 && (
                    <span className="bg-[#63BDF2]/15 text-[#63BDF2] font-mono text-[9px] font-black px-1.5 py-0.5 rounded-md">
                      {unreadCount} NEW
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    disabled={isClearingAll}
                    className="text-[10px] text-[#63BDF2] hover:text-[#3188DA] font-bold cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    {isClearingAll && <Loader2 size={10} className="animate-spin" />}
                    Clear Unread
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1 bg-zinc-950/10">
                {loading && notifications.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-zinc-500 gap-3">
                    <Loader2 size={20} className="animate-spin text-[#63BDF2]" />
                    <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Checking Inbox...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-zinc-500 gap-2.5">
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-zinc-400">
                      <Inbox size={20} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-black uppercase tracking-wider text-zinc-400">Pristine Workspace</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">No notifications or updates logged.</p>
                    </div>
                  </div>
                ) : (
                  notifications.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`group p-3 rounded-xl border transition-all flex gap-3 relative overflow-hidden ${
                        item.isRead 
                          ? 'bg-transparent border-transparent text-zinc-400' 
                          : 'bg-[#3188DA]/5 border-[#3188DA]/10 hover:border-[#63BDF2]/20 text-white'
                      }`}
                    >
                      {/* Left Icon depending on type */}
                      <div className="shrink-0 mt-0.5">
                        {item.type === 'WARNING' || item.type === 'BLOCKER' ? (
                          <div className="bg-red-500/10 p-1.5 rounded-lg text-red-400">
                            <AlertTriangle size={14} />
                          </div>
                        ) : item.type === 'REMINDER' ? (
                          <div className="bg-yellow-500/10 p-1.5 rounded-lg text-yellow-400">
                            <Clock size={14} />
                          </div>
                        ) : (
                          <div className="bg-[#63BDF2]/10 p-1.5 rounded-lg text-[#63BDF2]">
                            <Info size={14} />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-[11px] font-black tracking-wide uppercase leading-tight truncate">
                            {item.title}
                          </h4>
                          {!item.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#63BDF2] shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-1 leading-normal break-words">
                          {item.message}
                        </p>
                        <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-wider block mt-1.5">
                          {item.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Hover Actions */}
                      <div className={`absolute right-2 top-2 flex items-center gap-1 transition-opacity ${readingId === item.id || deletingId === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        {!item.isRead && (
                          <button
                            onClick={(e) => handleMarkRead(item.id, e)}
                            disabled={readingId === item.id}
                            className="p-1 bg-[#63BDF2]/15 text-[#63BDF2] hover:bg-[#63BDF2]/25 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                            title="Mark as read"
                          >
                            {readingId === item.id ? <Loader2 size={10} className="animate-spin text-[#63BDF2]" /> : <Check size={10} className="stroke-[3px]" />}
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(item.id, e)}
                          disabled={deletingId === item.id}
                          className="p-1 bg-red-500/15 text-red-400 hover:bg-red-500/25 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === item.id ? <Loader2 size={10} className="animate-spin text-red-400" /> : <Trash2 size={10} />}
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
