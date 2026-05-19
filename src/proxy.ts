import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/auth'

export default async function proxy(request: NextRequest) {
  const session = request.cookies.get('session')?.value
  
  // Public paths
  if (request.nextUrl.pathname.startsWith('/login')) {
    if (session) {
      try {
        await decrypt(session)
        return NextResponse.redirect(new URL('/', request.url))
      } catch (e) {}
    }
    return NextResponse.next()
  }

  // Protect all other routes
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const parsed = await decrypt(session)
    const user = parsed.user

    // Admin routes protection
    if (request.nextUrl.pathname.startsWith('/admin') && user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }

  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest\\.json|sw\\.js|.*\\.png$|.*\\.svg$).*)'],
}
