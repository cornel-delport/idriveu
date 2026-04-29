import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

type AuthUser = {
  id: string
  email: string
  name: string | null
  image: string | null
  role: string
  phone: string | null
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  // Explicit secret resolution — proxy.ts reads NEXTAUTH_SECRET first too,
  // so making them match prevents JWT signing/verification mismatches when
  // the cookie is created by NextAuth but read by the proxy.
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  // Required on Vercel when serving the same project from multiple domain
  // aliases (v0-idriveu.vercel.app, v0-private-driver-app.vercel.app, etc).
  // Without this NextAuth v5 may refuse to set cookies on aliases it doesn't
  // recognise as trusted, silently dropping the session after Google OAuth.
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Safe to enable: Google verifies email ownership before issuing the
      // ID token, so an attacker can't claim someone else's email via Google
      // OAuth. Without this, signing in with Google as an email that was
      // first registered via credentials throws OAuthAccountNotLinked and
      // silently bounces the user back to /login.
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = z
          .object({
            email: z.string().email(),
            password: z.string().min(8),
          })
          .safeParse(credentials)

        if (!parsed.success) return null

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        })

        if (!user || !user.passwordHash) return null

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash)
        if (!valid) return null

        const authUser: AuthUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          role: user.role,
          phone: user.phone,
        }
        return authUser as any
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        // Always read fresh role + phone from DB on every sign-in. The
        // PrismaAdapter `user` object passed by Google OAuth doesn't include
        // our custom fields (role, phone), so we must look them up. Without
        // this, OAuth users always end up with role = 'customer' regardless
        // of their actual role in the database.
        const dbUser = await db.user.findUnique({
          where: { id: user.id as string },
          select: { role: true, phone: true },
        })
        token.role = dbUser?.role ?? (user as AuthUser).role ?? 'customer'
        token.phone = dbUser?.phone ?? (user as AuthUser).phone ?? null
      }
      // Handle session updates (e.g. after phone completion or role change)
      if (trigger === 'update' && session) {
        token.phone = session.phone ?? token.phone
        token.name = session.name ?? token.name
        if (session.role) token.role = session.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.phone = token.phone as string | null
      }
      return session
    },
  },
})
