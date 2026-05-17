'use server'

import prisma from '@/lib/prisma'
import { hashPassword, verifyPassword, login, logout } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username || !password) {
    throw new Error('Please enter both username and password')
  }

  // Handle mock fallback when db fails or is not connected
  if (!process.env.DATABASE_URL) {
    // Fake login if db isn't there just for demonstration of UI
    if (username === 'admin') {
      await login({ id: 'fake-admin-id', role: 'ADMIN', name: 'Admin', username: 'admin' })
      redirect('/')
    } else {
      await login({ id: 'fake-member-id', role: 'MEMBER', name: 'Demo Member', username: 'member' })
      redirect('/')
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
      throw new Error('Invalid credentials')
    }

    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      throw new Error('Invalid credentials')
    }

    await login({ id: user.id, role: user.role, name: user.name, username: user.username })
  } catch (error: any) {
    if (error.message === 'Invalid credentials' || error.message.includes('Please enter')) {
      throw error
    }
    console.error('Login error:', error)
    throw new Error('Database error. Ensure Supabase is connected.')
  }

  redirect('/')
}

export async function logoutAction() {
  await logout()
  redirect('/login')
}


