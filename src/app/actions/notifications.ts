'use server'

import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getNotificationsAction() {
  const session = await getSession()
  if (!session || !session.user) {
    throw new Error('Not authenticated')
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })
    return { success: true, notifications }
  } catch (error: any) {
    console.error('Fetch notifications error:', error)
    return { success: false, error: error.message || 'Failed to fetch notifications' }
  }
}

export async function createNotificationAction(data: {
  title: string
  message: string
  type?: string
  userId?: string // If triggered for another user
}) {
  const session = await getSession()
  const targetUserId = data.userId || session?.user?.id

  if (!targetUserId) {
    throw new Error('User context required')
  }

  try {
    const notification = await prisma.notification.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type || 'INFO',
        userId: targetUserId
      }
    })
    revalidatePath('/')
    return { success: true, notification }
  } catch (error: any) {
    console.error('Create notification error:', error)
    return { success: false, error: error.message || 'Failed to create notification' }
  }
}

export async function markNotificationReadAction(id: string) {
  const session = await getSession()
  if (!session || !session.user) {
    throw new Error('Not authenticated')
  }

  try {
    const notification = await prisma.notification.findUnique({ where: { id } })
    if (!notification || notification.userId !== session.user.id) {
      throw new Error('Notification not found or unauthorized')
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    })
    revalidatePath('/')
    return { success: true, notification: updated }
  } catch (error: any) {
    console.error('Mark notification read error:', error)
    return { success: false, error: error.message || 'Failed to update notification' }
  }
}

export async function markAllNotificationsReadAction() {
  const session = await getSession()
  if (!session || !session.user) {
    throw new Error('Not authenticated')
  }

  try {
    await prisma.notification.updateMany({
      where: { 
        userId: session.user.id,
        isRead: false
      },
      data: { isRead: true }
    })
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error('Mark all read error:', error)
    return { success: false, error: error.message || 'Failed to mark all as read' }
  }
}

export async function deleteNotificationAction(id: string) {
  const session = await getSession()
  if (!session || !session.user) {
    throw new Error('Not authenticated')
  }

  try {
    const notification = await prisma.notification.findUnique({ where: { id } })
    if (!notification || notification.userId !== session.user.id) {
      throw new Error('Notification not found or unauthorized')
    }

    await prisma.notification.delete({ where: { id } })
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error('Delete notification error:', error)
    return { success: false, error: error.message || 'Failed to delete notification' }
  }
}
