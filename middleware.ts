// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const secret = process.env.NEXTAUTH_SECRET

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret })
  const { pathname } = req.nextUrl

  const loginUrl = new URL('/login', req.url)

  // /home — any authenticated user
  if (pathname.startsWith('/home')) {
    if (!token) return NextResponse.redirect(loginUrl)
    return NextResponse.next()
  }

  // /driver/jobs — driver + admin only
  if (pathname.startsWith('/driver/jobs')) {
    if (!token) return NextResponse.redirect(loginUrl)
    const role = token.role as string | undefined
    if (role !== 'driver' && role !== 'admin' && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/home', req.url))
    }
    return NextResponse.next()
  }

  // /admin — admin + super_admin only
  if (pathname.startsWith('/admin')) {
    if (!token) return NextResponse.redirect(loginUrl)
    const role = token.role as string | undefined
    if (role !== 'admin' && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/home', req.url))
    }
    return NextResponse.next()
  }

  // /dashboard — any authenticated user
  if (pathname.startsWith('/dashboard')) {
    if (!token) return NextResponse.redirect(loginUrl)
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/home/:path*', '/driver/jobs/:path*', '/admin/:path*', '/dashboard/:path*'],
}
