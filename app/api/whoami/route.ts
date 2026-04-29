import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { auth } from "@/lib/auth"

/**
 * GET /api/whoami
 *
 * Diagnostic endpoint that reports what the server sees about the current
 * request's auth state. Use this to debug:
 *   - "I signed in but /home bounces me to /login"
 *   - "Cookie set but proxy can't read it"
 *   - Cookie / domain / secret mismatches
 *
 * Returns JSON with three perspectives:
 *   1. session  — what NextAuth's auth() helper sees (used by server pages)
 *   2. token    — what proxy.ts sees via getToken() (used by middleware)
 *   3. cookies  — raw cookie names present on the request
 *   4. host     — the host the request hit (alias mismatch detection)
 *
 * Safe to expose: returns no secrets, only presence of cookies and decoded
 * JWT claims (which the user already has in their browser anyway).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET ?? ""

  let session: unknown = null
  let sessionError: string | null = null
  try {
    session = await auth()
  } catch (err) {
    sessionError = err instanceof Error ? err.message : String(err)
  }

  let token: unknown = null
  let tokenError: string | null = null
  try {
    token = await getToken({ req, secret })
  } catch (err) {
    tokenError = err instanceof Error ? err.message : String(err)
  }

  const cookies = req.cookies.getAll().map((c) => c.name)
  const authCookies = cookies.filter(
    (n) =>
      n.includes("authjs") ||
      n.includes("next-auth") ||
      n.includes("session-token"),
  )

  return NextResponse.json({
    host: req.headers.get("host"),
    url: req.nextUrl.toString(),
    secretPresent: secret.length > 0,
    secretLength: secret.length,
    nextAuthUrl: process.env.NEXTAUTH_URL ?? null,
    authUrl: process.env.AUTH_URL ?? null,

    session: session
      ? {
          hasUser: !!(session as { user?: unknown }).user,
          userKeys: Object.keys((session as { user?: object }).user ?? {}),
          userId: (session as { user?: { id?: string } }).user?.id ?? null,
          role: (session as { user?: { role?: string } }).user?.role ?? null,
        }
      : null,
    sessionError,

    token: token
      ? {
          hasId: !!(token as { id?: string }).id,
          role: (token as { role?: string }).role ?? null,
          phone: (token as { phone?: string | null }).phone ?? null,
          tokenKeys: Object.keys(token as object),
        }
      : null,
    tokenError,

    cookies: {
      total: cookies.length,
      auth: authCookies,
    },
  })
}
