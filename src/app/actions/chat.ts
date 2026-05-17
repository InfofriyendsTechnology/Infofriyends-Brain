'use server'

import prisma from '@/lib/prisma'
import { getSession, logout } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// Ensure at least one default channel exists (self-healing seed)
async function seedDefaultChannelIfNeeded() {
  try {
    const count = await prisma.chatChannel.count()
    if (count === 0) {
      await prisma.chatChannel.create({
        data: {
          name: 'General HQ 💬',
          description: 'Primary team collaboration channel for all announcements and discussions.',
          isProject: false
        }
      })
    }
  } catch (error) {
    console.error("Failed to seed default channel:", error)
  }
}

// Fetch all available chat channels/groups
export async function getChatChannels() {
  try {
    await seedDefaultChannelIfNeeded()
    return await prisma.chatChannel.findMany({
      orderBy: { createdAt: 'asc' }
    })
  } catch (e) {
    console.error("Failed to fetch chat channels:", e)
    return []
  }
}

// Create new custom chat group / project room
export async function createChatChannel(name: string, description?: string, isProject = false) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  const userExists = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!userExists) {
    await logout()
    throw new Error('Unauthorized')
  }

  if (!name || name.trim() === '') {
    throw new Error('Group name is required')
  }

  try {
    const channel = await prisma.chatChannel.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        isProject
      }
    })
    revalidatePath('/chat')
    return channel
  } catch (e: any) {
    throw new Error('Failed to create channel: ' + e.message)
  }
}

// Send message to a specific channel
export async function sendChatMessage(channelId: string, message: string) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  const userExists = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!userExists) {
    await logout()
    throw new Error('Unauthorized')
  }

  if (!message || message.trim() === '') {
    throw new Error('Message content is required')
  }

  try {
    const chatMessage = await prisma.chatMessage.create({
      data: {
        message: message.trim(),
        userId: session.user.id,
        channelId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
            profilePhoto: true
          }
        }
      }
    })

    // Update user's active heartbeat on send
    await prisma.user.update({
      where: { id: session.user.id },
      data: { lastActive: new Date() }
    })
    
    revalidatePath('/chat')
    return chatMessage
  } catch (e: any) {
    throw new Error('Failed to send message: ' + e.message)
  }
}

// Fetch messages for a specific channel
export async function getChannelMessages(channelId: string) {
  try {
    return await prisma.chatMessage.findMany({
      where: { channelId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
            profilePhoto: true,
          }
        }
      },
      orderBy: { createdAt: 'asc' },
      take: 100, // Grab last 100 messages for rich history
    })
  } catch (e) {
    return []
  }
}

// Set user typing indicator state
export async function setUserTyping(channelId: string) {
  const session = await getSession()
  if (!session) return

  const userExists = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!userExists) {
    await logout()
    return
  }

  try {
    await prisma.typingState.upsert({
      where: { userId: session.user.id },
      update: { channelId, updatedAt: new Date() },
      create: { userId: session.user.id, channelId }
    })
  } catch (e) {
    console.error('Typing indicator update failed:', e)
  }
}

// High-fidelity read-only consolidated real-time chat sync engine
export async function syncChatroom(channelId: string) {
  const session = await getSession()
  if (!session) return null

  const userId = session.user.id
  const userExists = await prisma.user.findUnique({ 
    where: { id: userId },
    select: { id: true }
  })
  if (!userExists) {
    await logout()
    return null
  }

  try {
    // Parallelize all database queries for ultra-low latency reads!
    const [messages, typingStates, members] = await Promise.all([
      // 1. Fetch channel messages
      prisma.chatMessage.findMany({
        where: { channelId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
              profilePhoto: true,
            }
          }
        },
        orderBy: { createdAt: 'asc' },
        take: 100,
      }),

      // 2. Fetch active typing indicators
      prisma.typingState.findMany({
        where: {
          channelId,
          updatedAt: { gte: new Date(Date.now() - 4000) },
          userId: { not: userId }
        },
        include: {
          user: {
            select: { id: true, name: true }
          }
        }
      }),

      // 3. Fetch all team members and their timestamps
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          role: true,
          profilePhoto: true,
          lastActive: true
        },
        orderBy: { name: 'asc' }
      })
    ])

    return {
      messages,
      typingUsers: typingStates.map(ts => ts.user.name),
      members: members.map(m => {
        // Mark online if active within last 45 seconds
        const isOnline = m.lastActive ? (Date.now() - new Date(m.lastActive).getTime() < 45000) : false
        return {
          id: m.id,
          name: m.name,
          role: m.role,
          profilePhoto: m.profilePhoto,
          isOnline,
          lastActive: m.lastActive
        }
      })
    }
  } catch (e) {
    console.error('Consolidated chatroom sync error:', e)
    return null
  }
}

// Heartbeat writer triggered slowly by the client (Once every 25 seconds)
export async function touchUserHeartbeat() {
  const session = await getSession()
  if (!session) return

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { lastActive: new Date() }
    })
  } catch (e) {
    // Suppress silent
  }
}
