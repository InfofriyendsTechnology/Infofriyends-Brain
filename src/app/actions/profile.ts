'use server'

import prisma from '@/lib/prisma'
import { getSession, login } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function updateProfileAction(formData: FormData) {
  const session = await getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }

  const name = formData.get('name') as string
  const username = formData.get('username') as string
  const profilePhoto = formData.get('profilePhoto') as string

  if (!name || !username) {
    throw new Error('Name and username are required')
  }

  try {
    // Check if username is already taken by another user
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser && existingUser.id !== session.user.id) {
      throw new Error('Username already taken')
    }

    // Update the database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        username,
        profilePhoto: profilePhoto || null
      }
    })

    // Refresh the cookie session with updated user details
    await login({
      id: updatedUser.id,
      role: updatedUser.role,
      name: updatedUser.name,
      username: updatedUser.username
    })

    revalidatePath('/profile')
    revalidatePath('/')
    revalidatePath('/works')
    revalidatePath('/admin')

    return { success: true }
  } catch (error: any) {
    console.error('Profile update error:', error)
    throw new Error(error.message || 'Failed to update profile')
  }
}
