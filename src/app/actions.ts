'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'

async function logActivity(action: string, userId: string, workId?: string, details?: string) {
  if (!process.env.DATABASE_URL) return
  await prisma.activityLog.create({
    data: { action, details, workId, userId }
  })
  
  // Increment contribution score
  await prisma.user.update({
    where: { id: userId },
    data: { contributionScore: { increment: 1 } }
  })
}

// Work Actions
export async function createWork(formData: FormData) {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }
  const user = session.user

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const assigneeId = formData.get('assigneeId') as string || null
  const priority = formData.get('priority') as string || 'MEDIUM'
  const status = formData.get('status') as string || 'IDEA'
  const dueDateStr = formData.get('dueDate') as string

  if (!name || !description) return { success: false, error: 'Missing required fields' }

  let dueDate: Date | null = null
  if (dueDateStr) {
    try {
      dueDate = new Date(dueDateStr)
    } catch (e) {
      // Ignore parse errors
    }
  }

  try {
    const work = await prisma.work.create({
      data: {
        name,
        description,
        status,
        priority,
        dueDate,
        creatorId: user.id,
        assigneeId: assigneeId || null,
        points: 10
      },
    })
    
    // Log creation
    await logActivity('CREATED_WORK', user.id, work.id, `Created work: "${name}" assigned to ${assigneeId ? 'member' : 'unassigned'} (Status: ${status}, Priority: ${priority})`)
    
    revalidatePath('/')
    revalidatePath('/works')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to create work:', error)
    return { success: false, error: `Database error: ${error.message || error}` }
  }
}

export async function editWork(id: string, formData: FormData) {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }
  const user = session.user

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const assigneeId = formData.get('assigneeId') as string || null
  const priority = formData.get('priority') as string || 'MEDIUM'
  const dueDateStr = formData.get('dueDate') as string

  if (!name || !description) return { success: false, error: 'Missing required fields' }

  let dueDate: Date | null = null
  if (dueDateStr) {
    try { dueDate = new Date(dueDateStr) } catch (e) {}
  }

  try {
    const work = await prisma.work.findUnique({ where: { id } })
    if (!work) return { success: false, error: 'Work not found' }

    const isAuthorized = user.role === 'ADMIN' || work.creatorId === user.id
    if (!isAuthorized) return { success: false, error: 'Not authorized to edit' }

    await prisma.work.update({
      where: { id },
      data: {
        name,
        description,
        priority,
        dueDate,
        assigneeId: assigneeId || null,
        ...(user.role === 'ADMIN' && work.creatorId !== user.id && {
          editedByAdminId: user.id,
          editReason: 'Admin edited work details'
        })
      }
    })

    await logActivity('UPDATED_WORK', user.id, id, `Edited details of work: "${name}"`)
    
    revalidatePath('/')
    revalidatePath('/works')
    revalidatePath('/proposals')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to edit work:', error)
    return { success: false, error: `Database error: ${error.message || error}` }
  }
}

export async function updateWorkStatus(id: string, newStatus: string, customPoints?: number, blockedReason?: string) {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }
  const user = session.user

  try {
    const work = await prisma.work.findUnique({ where: { id }, include: { creator: true } })
    if (!work) return { success: false, error: 'Work not found' }

    // Admins can do anything. Members can update if they are creator or assignee.
    const isAuthorized = user.role === 'ADMIN' || work.creatorId === user.id || work.assigneeId === user.id
    if (!isAuthorized) {
      return { success: false, error: 'You are not authorized to update this work item' }
    }

    const finalPoints = customPoints !== undefined ? Math.max(0, Math.floor(Number(customPoints))) : work.points
    const isNowCompleted = newStatus === 'COMPLETED'
    const wasCompleted = work.status === 'COMPLETED'
    const isEditedByAdmin = user.role === 'ADMIN' && work.creatorId !== user.id

    // Update status, points, and blockedReason if BLOCKED
    await prisma.work.update({
      where: { id },
      data: { 
        status: newStatus,
        points: finalPoints,
        blockedReason: newStatus === 'BLOCKED' ? (blockedReason || 'No reason provided') : null,
        ...(isEditedByAdmin && {
          originalOwnerId: work.creatorId,
          editedByAdminId: user.id,
          editReason: `Status changed to ${newStatus} by admin with points = ${finalPoints}`,
        })
      },
    })

    // Score Logic: Creator gets finalPoints on completion, lost if marked back
    if (isNowCompleted && !wasCompleted) {
      await prisma.user.update({
        where: { id: work.creatorId },
        data: { contributionScore: { increment: finalPoints } }
      })
    } else if (!isNowCompleted && wasCompleted) {
      await prisma.user.update({
        where: { id: work.creatorId },
        data: { contributionScore: { decrement: work.points } }
      })
    }

    // Log the action
    let logMsg = `Status changed to ${newStatus}.`
    if (newStatus === 'BLOCKED') {
      logMsg += ` Reason: "${blockedReason || 'None'}"`
    }
    await logActivity('STATUS_CHANGE', user.id, id, logMsg)
    
    revalidatePath('/')
    revalidatePath('/works')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to update work:', error)
    return { success: false, error: `Database error: ${error.message || error}` }
  }
}

export async function addWorkUpdate(workId: string, content: string) {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }
  const user = session.user

  if (!content || !content.trim()) return { success: false, error: 'Update content is required' }

  try {
    await prisma.workUpdate.create({
      data: {
        content,
        workId,
        userId: user.id
      }
    })

    await logActivity('WORK_UPDATE', user.id, workId, `Posted update: "${content}"`)
    
    revalidatePath('/')
    revalidatePath('/works')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to add work update:', error)
    return { success: false, error: `Database error: ${error.message || error}` }
  }
}

export async function getWorks() {
  try {
    const data = await prisma.work.findMany({
      include: {
        creator: { select: { id: true, name: true, profilePhoto: true, role: true } },
        assignee: { select: { id: true, name: true, profilePhoto: true, role: true } },
        editedByAdmin: { select: { name: true } },
        workUpdates: {
          include: {
            user: { select: { name: true, profilePhoto: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        activityLogs: {
          include: {
            user: { select: { name: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' },
    })
    return JSON.parse(JSON.stringify(data))
  } catch (error) {
    console.error('Failed to fetch works:', error)
    return []
  }
}

// Community Actions
export async function createCommunityPost(formData: FormData) {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }
  
  const content = formData.get('content') as string
  const type = formData.get('type') as string

  if (!content) return { success: false, error: 'Post content is required' }

  try {
    await prisma.communityPost.create({
      data: {
        content,
        type,
        userId: session.user.id
      },
    })
    await logActivity('COMMUNITY_POST', session.user.id, undefined, `Posted a ${type}`)
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to create post:', error)
    return { success: false, error: `Database error: ${error.message || error}` }
  }
}

export async function getCommunityPosts() {
  try {
    const data = await prisma.communityPost.findMany({
      include: {
        user: { select: { name: true, role: true, profilePhoto: true } }
      },
      orderBy: { createdAt: 'desc' },
    })
    return JSON.parse(JSON.stringify(data))
  } catch (error) {
    return []
  }
}

// Idea & Proposal Agreement Actions
export async function getIdeasWithSupports() {
  try {
    const data = await prisma.work.findMany({
      where: {
        status: { in: ['IDEA', 'QUEUED', 'DECLINED', 'SHELVED'] }
      },
      include: {
        creator: { select: { id: true, name: true, profilePhoto: true, role: true } },
        assignee: { select: { id: true, name: true, profilePhoto: true, role: true } },
        supports: {
          include: {
            user: { select: { id: true, name: true, profilePhoto: true, role: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        activityLogs: {
          include: {
            user: { select: { id: true, name: true, profilePhoto: true, role: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      },
      orderBy: [
        { priority: 'asc' }, // URGENT first
        { createdAt: 'desc' }
      ],
    })
    return JSON.parse(JSON.stringify(data))
  } catch (error) {
    console.error('Failed to get ideas with supports:', error)
    return []
  }
}

export async function queueIdea(workId: string) {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }
  const user = session.user

  try {
    const work = await prisma.work.findUnique({ where: { id: workId } })
    if (!work) return { success: false, error: 'Work not found' }

    const isAuthorized = user.role === 'ADMIN' || work.creatorId === user.id
    if (!isAuthorized) return { success: false, error: 'Not authorized' }

    // Toggle between IDEA and QUEUED
    const newStatus = work.status === 'QUEUED' ? 'IDEA' : 'QUEUED'
    
    await prisma.work.update({
      where: { id: workId },
      data: { status: newStatus }
    })

    await logActivity(
      newStatus === 'QUEUED' ? 'QUEUED_IDEA' : 'UNQUEUED_IDEA',
      user.id,
      workId,
      newStatus === 'QUEUED'
        ? `Moved proposal "${work.name}" to execution queue — ready for work`
        : `Removed proposal "${work.name}" from queue — back to open ideas`
    )

    revalidatePath('/')
    revalidatePath('/works')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to queue idea:', error)
    return { success: false, error: `Database error: ${error.message || error}` }
  }
}

export async function toggleIdeaSupport(workId: string) {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }
  const userId = session.user.id

  try {
    const existing = await prisma.ideaSupport.findUnique({
      where: {
        workId_userId: { workId, userId }
      }
    })

    if (existing) {
      await prisma.ideaSupport.delete({
        where: {
          workId_userId: { workId, userId }
        }
      })
      await logActivity('REMOVE_IDEA_SUPPORT', userId, workId, `Removed agreement/support for Idea: ${workId}`)
    } else {
      await prisma.ideaSupport.create({
        data: { workId, userId }
      })
      await logActivity('ADD_IDEA_SUPPORT', userId, workId, `Voted AGREE/SUPPORT for Idea: ${workId}`)
    }

    revalidatePath('/')
    revalidatePath('/works')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to toggle idea support:', error)
    return { success: false, error: `Database error: ${error.message || error}` }
  }
}

export async function declineIdea(workId: string, reason: string) {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }
  const user = session.user

  if (!reason || !reason.trim()) return { success: false, error: 'Decline reason is required' }

  try {
    const work = await prisma.work.findUnique({ where: { id: workId } })
    if (!work) return { success: false, error: 'Work not found' }

    const isAuthorized = user.role === 'ADMIN' || work.creatorId === user.id
    if (!isAuthorized) return { success: false, error: 'Not authorized to decline' }

    await prisma.work.update({
      where: { id: workId },
      data: {
        status: 'DECLINED',
        blockedReason: reason.trim()
      }
    })

    await logActivity(
      'DECLINED_IDEA',
      user.id,
      workId,
      `Declined proposal "${work.name}" — Reason: "${reason.trim()}"`
    )

    revalidatePath('/')
    revalidatePath('/works')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to decline idea:', error)
    return { success: false, error: `Database error: ${error.message || error}` }
  }
}

export async function shelveIdea(workId: string) {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }
  const user = session.user

  try {
    const work = await prisma.work.findUnique({ where: { id: workId } })
    if (!work) return { success: false, error: 'Work not found' }

    const isAuthorized = user.role === 'ADMIN' || work.creatorId === user.id
    if (!isAuthorized) return { success: false, error: 'Not authorized' }

    await prisma.work.update({
      where: { id: workId },
      data: { status: 'SHELVED' }
    })

    await logActivity(
      'SHELVED_IDEA',
      user.id,
      workId,
      `Shelved proposal "${work.name}" — saved for future reconsideration`
    )

    revalidatePath('/')
    revalidatePath('/works')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to shelve idea:', error)
    return { success: false, error: `Database error: ${error.message || error}` }
  }
}

export async function reviveIdea(workId: string) {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }
  const user = session.user

  try {
    const work = await prisma.work.findUnique({ where: { id: workId } })
    if (!work) return { success: false, error: 'Work not found' }

    const isAuthorized = user.role === 'ADMIN' || work.creatorId === user.id
    if (!isAuthorized) return { success: false, error: 'Not authorized to revive' }

    await prisma.work.update({
      where: { id: workId },
      data: { status: 'IDEA', blockedReason: null }
    })

    await logActivity(
      'REVIVED_IDEA',
      user.id,
      workId,
      `Revived proposal "${work.name}" — reopened for team review`
    )

    revalidatePath('/')
    revalidatePath('/works')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to revive idea:', error)
    return { success: false, error: `Database error: ${error.message || error}` }
  }
}

export async function deleteIdea(workId: string) {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }
  const user = session.user

  try {
    const work = await prisma.work.findUnique({
      where: { id: workId },
      include: { supports: true }
    })
    if (!work) return { success: false, error: 'Work not found' }

    // Only creator can delete, and only if no one has voted yet
    if (work.creatorId !== user.id && user.role !== 'ADMIN') {
      return { success: false, error: 'Only the proposal creator or admin can delete' }
    }
    if (work.supports.length > 0 && user.role !== 'ADMIN') {
      return { success: false, error: 'Cannot delete — team members have already voted. Decline or shelve it instead.' }
    }

    // Delete relations first, then work
    await prisma.ideaSupport.deleteMany({ where: { workId } })
    await prisma.activityLog.deleteMany({ where: { workId } })
    await prisma.workUpdate.deleteMany({ where: { workId } })
    await prisma.work.delete({ where: { id: workId } })

    await logActivity(
      'DELETED_IDEA',
      user.id,
      undefined,
      `Permanently deleted proposal "${work.name}"`
    )

    revalidatePath('/')
    revalidatePath('/works')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to delete idea:', error)
    return { success: false, error: `Database error: ${error.message || error}` }
  }
}
