import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { roleRedirectUrl } from '@/lib/auth-redirect'
import { LoginForm } from './login-form'

export const dynamic = 'force-dynamic'

/**
 * Server-side wrapper around <LoginForm/>.
 *
 * If the visitor already has a valid session, we route them to their role
 * dashboard immediately — same logic as `/`. This prevents the "I keep
 * landing on /login after Google OAuth" loop that happens when:
 *   - The OAuth round-trip succeeds and sets the cookie
 *   - NextAuth's callbackUrl ('/') redirects them somewhere
 *   - Something subsequently lands them back on /login (browser back, manual
 *     URL entry, redirect chain quirk) and they assume they're "stuck"
 *     because the form is still showing.
 *
 * If we redirect server-side here, an authed visitor on /login is forwarded
 * to /home (or /driver/jobs) before the form ever renders.
 */
export default async function LoginPage() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (role) redirect(roleRedirectUrl(role))

  return <LoginForm />
}
