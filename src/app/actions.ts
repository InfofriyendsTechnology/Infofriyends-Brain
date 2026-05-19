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
  if (!session) throw new Error('Unauthorized')
  const user = session.user

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  if (!name || !description) throw new Error('Missing required fields')

  // Standard member works start as Pending. Admin works start as Active.
  const defaultStatus = user.role === 'ADMIN' ? 'Active' : 'Pending'

  try {
    const work = await prisma.work.create({
      data: {
        name,
        description,
        status: defaultStatus,
        creatorId: user.id,
      },
    })
    await logActivity('CREATED_WORK', user.id, work.id, `Created work: ${name} (Status: ${defaultStatus})`)
    revalidatePath('/')
  } catch (error) {
    throw new Error('Database not connected.')
  }
}

export async function updateWorkStatus(id: string, newStatus: string, customPoints?: number) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  const user = session.user

  try {
    const work = await prisma.work.findUnique({ where: { id }, include: { creator: true } })
    if (!work) throw new Error('Work not found')

    // ONLY Admins can change status!
    if (user.role !== 'ADMIN') {
      throw new Error('Only Admins can moderate work requests and change statuses')
    }

    const finalPoints = customPoints !== undefined ? Math.max(0, Math.floor(Number(customPoints))) : work.points
    const isNowCompleted = newStatus === 'Completed'
    const wasCompleted = work.status === 'Completed'
    const isEditedByAdmin = user.role === 'ADMIN' && work.creatorId !== user.id

    await prisma.work.update({
      where: { id },
      data: { 
        status: newStatus,
        points: finalPoints,
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

    await logActivity('STATUS_CHANGE', user.id, id, `Status changed to ${newStatus}. Points value set to ${finalPoints}.`)
    revalidatePath('/')
  } catch (error) {
    console.error('Failed to update work:', error)
  }
}

export async function getWorks() {
  try {
    const data = await prisma.work.findMany({
      include: {
        creator: { select: { name: true, profilePhoto: true } },
        editedByAdmin: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
    })
    return JSON.parse(JSON.stringify(data))
  } catch (error) {
    return []
  }
}

// Community Actions
export async function createCommunityPost(formData: FormData) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  
  const content = formData.get('content') as string
  const type = formData.get('type') as string

  if (!content) throw new Error('Post content is required')

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
  } catch (error) {
    throw new Error('Database error')
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

