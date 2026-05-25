import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

const secretKey = process.env.JWT_SECRET || 'super-secret-infofriyends-key-123'
const key = new TextEncoder().encode(secretKey)

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key)
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  })
  return payload
}

export async function login(user: { id: string; role: string; name: string; username: string; customRole?: string | null; profilePhoto?: string | null }) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const session = await encrypt({ user, expires })

  const cookieStore = await cookies()
  cookieStore.set('session', session, { expires, httpOnly: true, path: '/' })
}

export async function impersonate(targetUser: any, impersonatorUser: any) {
  const expires = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // 1 day impersonation
  const session = await encrypt({ user: targetUser, impersonator: impersonatorUser, expires })
  
  const cookieStore = await cookies()
  cookieStore.set('session', session, { expires, httpOnly: true, path: '/' })
}

export async function revertImpersonation() {
  const currentSession = await getSession()
  if (!currentSession || !currentSession.impersonator) return false
  
  await login(currentSession.impersonator)
  return true
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.set('session', '', { expires: new Date(0), path: '/' })
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value
  if (!session) return null
  try {
    const decrypted = await decrypt(session)
    if (decrypted && decrypted.user && process.env.DATABASE_URL) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: decrypted.user.id },
          select: { customRole: true, profilePhoto: true }
        })
        if (dbUser) {
          decrypted.user.customRole = dbUser.customRole
          decrypted.user.profilePhoto = dbUser.profilePhoto
        }
      } catch (dbError) {
        console.error('Error fetching user for session:', dbError)
      }
    }
    return decrypted
  } catch (error) {
    return null
  }
}
