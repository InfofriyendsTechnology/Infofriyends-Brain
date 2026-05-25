'use server'

import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { revalidatePath } from 'next/cache'
import { getSession, impersonate, login } from '@/lib/auth'

export async function impersonateMemberAction(targetUserId: string) {
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') return { success: false, error: 'Unauthorized' }

  try {
    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } })
    if (!targetUser) return { success: false, error: 'User not found' }
    
    // Save minimal data to session
    const targetUserPayload = {
      id: targetUser.id,
      role: targetUser.role,
      name: targetUser.name,
      username: targetUser.username
    }
    
    await impersonate(targetUserPayload, session.user)
    revalidatePath('/')
    revalidatePath('/members')
    revalidatePath('/works')
    revalidatePath('/proposals')
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function revertImpersonationAction() {
  const { revertImpersonation } = await import('@/lib/auth')
  const success = await revertImpersonation()
  if (success) {
    revalidatePath('/')
    revalidatePath('/members')
    revalidatePath('/works')
    revalidatePath('/proposals')
  }
  return { success }
}

export async function createMember(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const mobile = formData.get('mobile') as string
  const role = formData.get('role') as 'ADMIN' | 'MEMBER' | 'NEUTRAL'
  const customRole = formData.get('customRole') as string

  if (!name || !email || !username || !password) {
    return { success: false, error: 'Name, email, username and password are required' }
  }

  const passwordHash = await hashPassword(password)

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        mobile,
        username,
        passwordHash,
        role,
        customRole: customRole || null
      }
    })
    revalidatePath('/admin')
    revalidatePath('/members')
    return { success: true, username, defaultPassword: password }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'Email or username already exists' }
    }
    return { success: false, error: 'Failed to create member: ' + error.message }
  }
}

export async function getMembers() {
  try {
    const data = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        customRole: true,
        username: true,
        createdAt: true,
        profilePhoto: true,
        mobile: true,
        lastActive: true,
        worksCreated: {
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true
          }
        },
        worksAssigned: {
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true
          }
        },
        totalPoints: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Calculate dynamic contributionScore based on completed works and average rating
    const parsedData = JSON.parse(JSON.stringify(data)).map((user: any) => {
      const createdCompleted = user.worksCreated.filter((w: any) => w.status === 'COMPLETED' || w.status === 'ARCHIVED')
      const assignedCompleted = user.worksAssigned.filter((w: any) => w.status === 'COMPLETED' || w.status === 'ARCHIVED')
      
      const completedIds = new Set([
        ...createdCompleted.map((w: any) => w.id),
        ...assignedCompleted.map((w: any) => w.id)
      ])
      
      user.averageRating = 0
      user.completedWorksCount = completedIds.size
      user.contributionScore = user.totalPoints // Direct mapping to the new point system
      
      return user
    })

    return parsedData
  } catch (e) {
    return []
  }
}

export async function updateMember(id: string, name: string, email: string, username: string, role: 'ADMIN' | 'MEMBER' | 'NEUTRAL', customRole?: string, password?: string) {
  try {
    const updateData: any = {
      name,
      email,
      username,
      role,
      customRole: customRole || null
    }

    if (password && password.trim() !== '') {
      updateData.passwordHash = await hashPassword(password)
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    })

    const session = await getSession()
    if (session && session.user.id === id) {
      await login({
        id: updatedUser.id,
        role: updatedUser.role,
        name: updatedUser.name,
        username: updatedUser.username,
        customRole: updatedUser.customRole,
        profilePhoto: updatedUser.profilePhoto
      } as any)
    }

    revalidatePath('/admin')
    revalidatePath('/members')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: 'Failed to update member: ' + error.message }
  }
}

export async function deleteMember(id: string) {
  try {
    // Delete all posts and works created by this member first to maintain relational integrity
    await prisma.communityPost.deleteMany({
      where: { userId: id }
    })
    await prisma.work.deleteMany({
      where: { creatorId: id }
    })

    await prisma.user.delete({
      where: { id }
    })
    revalidatePath('/admin')
    revalidatePath('/members')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: 'Failed to delete member: ' + error.message }
  }
}

export async function adminEditWork(
  id: string, 
  name: string, 
  description: string, 
  priority: string, 
  status: string, 
  expectedDurationHours?: number | null, 
  actualDurationHours?: number | null, 
  blockedReason?: string | null
) {
  try {
    const work = await prisma.work.findUnique({ where: { id } })
    if (!work) return { success: false, error: 'Work not found' }

    const isOldCompleted = work.status === 'COMPLETED' || work.status === 'ARCHIVED'
    const isNewCompleted = status === 'COMPLETED' || status === 'ARCHIVED'

    const updateData: any = {
      name,
      description,
      priority,
      status,
      expectedDurationHours: expectedDurationHours !== undefined ? expectedDurationHours : null,
      actualDurationHours: actualDurationHours !== undefined ? actualDurationHours : null,
      blockedReason: (status === 'BLOCKED' || status === 'DELETED') ? (blockedReason || 'No reason provided') : null
    }

    // Revert points if soft-deleting OR changing from completed/archived to a non-completed state
    const { revertPointsForWork, awardPointsForWork } = await import('@/app/actions')
    if (status === 'DELETED') {
      await revertPointsForWork(id)
    } else if (isOldCompleted && !isNewCompleted) {
      await revertPointsForWork(id)
    }

    await prisma.work.update({
      where: { id },
      data: updateData
    })

    // Award points if status is completed/archived and it wasn't already awarded
    if (isNewCompleted) {
      const finalActualHours = actualDurationHours !== undefined ? (actualDurationHours ?? 0) : (work.actualDurationHours ?? 0)
      await awardPointsForWork(id, finalActualHours)
    }

    revalidatePath('/admin')
    revalidatePath('/works')
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: 'Failed to update work: ' + error.message }
  }
}
