'use server'

import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { revalidatePath } from 'next/cache'

export async function createMember(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const mobile = formData.get('mobile') as string
  const role = formData.get('role') as 'ADMIN' | 'MEMBER'

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
        role
      }
    })
    revalidatePath('/admin')
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
        username: true,
        createdAt: true,
        profilePhoto: true,
        mobile: true,
        contributionScore: true,
        worksCreated: {
          select: {
            id: true,
            name: true,
            status: true,
            points: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return JSON.parse(JSON.stringify(data))
  } catch (e) {
    return []
  }
}

export async function updateMember(id: string, name: string, email: string, username: string, role: 'ADMIN' | 'MEMBER', score: number) {
  try {
    await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        username,
        role,
        contributionScore: score
      }
    })
    revalidatePath('/admin')
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
    return { success: true }
  } catch (error: any) {
    return { success: false, error: 'Failed to delete member: ' + error.message }
  }
}
