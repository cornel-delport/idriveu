import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user
  const role = session?.user?.role
  const phone = session?.user?.phone

  // Protect routes by role
  if (nextUrl.pathname.startsWith('/dashboard')) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl))
    if (role !== 'customer' && role !== 'admin')
      return NextResponse.redirect(new URL('/', nextUrl))
  }

  if (nextUrl.pathname.startsWith('/driver')) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl))
    if (role !== 'driver' && role !== 'admin')
      return NextResponse.redirect(new URL('/', nextUrl))
  }

  if (nextUrl.pathname.startsWith('/admin')) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl))
    if (role !== 'admin') return NextResponse.redirect(new URL('/', nextUrl))
  }

  if (nextUrl.pathname.startsWith('/profile')) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl))
    // Phone completion gate — redirect to /profile/complete if phone missing
    if (nextUrl.pathname !== '/profile/complete' && !phone) {
      return NextResponse.redirect(new URL('/profile/complete', nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/dashboard/:path*', '/driver/:path*', '/admin/:path*', '/profile/:path*'],
}
