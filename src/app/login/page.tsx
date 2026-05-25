import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LoginClient from './login-client'

export default async function LoginPage() {
  const session = await getSession()
  if (session) {
    redirect('/')
  }

  return <LoginClient />
}
