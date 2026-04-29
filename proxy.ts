/**
 * Next.js 16 proxy (replaces middleware.ts).
 * Uses lightweight getToken from next-auth/jwt to stay within
 * Vercel's 1 MB Edge Function size limit.
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET ?? ''

  let token: { role?: string; phone?: string } | null = null
  try {
    token = (await getToken({ req, secret })) as { role?: string; phone?: string } | null
  } catch {
    // Invalid / expired token — treat as unauthenticated
  }

  const isLoggedIn = !!token
  const role = token?.role
  const phone = token?.phone

  const isAdminRole = role === 'admin' || role === 'super_admin'

  // /home — any authenticated user (customers and admins land here post-login)
  if (pathname.startsWith('/home')) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login', req.url))
  }

  if (pathname.startsWith('/dashboard')) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login', req.url))
    if (role !== 'customer' && !isAdminRole)
      return NextResponse.redirect(new URL('/home', req.url))
  }

  if (pathname.startsWith('/customer')) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login', req.url))
    if (role !== 'customer' && !isAdminRole)
      return NextResponse.redirect(new URL('/home', req.url))
  }

  if (pathname.startsWith('/driver')) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login', req.url))
    if (role !== 'driver' && !isAdminRole)
      return NextResponse.redirect(new URL('/home', req.url))
  }

  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login', req.url))
    if (!isAdminRole) return NextResponse.redirect(new URL('/home', req.url))
  }

  if (pathname.startsWith('/profile')) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login', req.url))
    if (pathname !== '/profile/complete' && !phone) {
      return NextResponse.redirect(new URL('/profile/complete', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/home/:path*',
    '/dashboard/:path*',
    '/customer/:path*',
    '/driver/:path*',
    '/admin/:path*',
    '/profile/:path*',
  ],
}
