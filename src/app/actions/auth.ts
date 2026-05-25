'use server'

import prisma from '@/lib/prisma'
import { login, logout } from '@/lib/auth'
import { hashPassword, verifyPassword } from '@/lib/password'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username || !password) {
    return { success: false, error: 'Please enter both username and password' }
  }

  // Handle mock fallback when db fails or is not connected
  if (!process.env.DATABASE_URL) {
    // Fake login if db isn't there just for demonstration of UI
    if (username === 'admin') {
      await login({ id: 'fake-admin-id', role: 'ADMIN', name: 'Admin', username: 'admin' })
      return { success: true }
    } else {
      await login({ id: 'fake-member-id', role: 'MEMBER', name: 'Demo Member', username: 'member' })
      return { success: true }
    }
  }

  try {
    // Auto-seed admin if the database has 0 users
    const userCount = await prisma.user.count()
    if (userCount === 0) {
      const hash = await hashPassword('Info@9325Brain')
      await prisma.user.create({
        data: {
          name: 'Super Admin',
          username: 'admin@infofriyendstechnology.com',
          email: 'admin@infofriyendstechnology.com',
          passwordHash: hash,
          role: 'ADMIN'
        }
      })
    }

    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) {
      return { success: false, error: 'Invalid credentials' }
    }

    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      return { success: false, error: 'Invalid credentials' }
    }

    await login({ 
      id: user.id, 
      role: user.role, 
      name: user.name, 
      username: user.username,
      customRole: user.customRole,
      profilePhoto: user.profilePhoto
    })
    return { success: true }
  } catch (error: any) {
    console.error('Login error:', error)
    return { success: false, error: `Database error: ${error.message || error}` }
  }
}

export async function logoutAction() {
  await logout()
  return { success: true }
}


