// lib/auth-redirect.ts
const ROLE_ROUTES: Record<string, string> = {
  driver: '/driver/jobs',
  admin: '/home',
  super_admin: '/home',
  customer: '/home',
}

/**
 * Returns the canonical post-login URL for a given role.
 * Defaults to /home for any unknown or missing role value.
 */
export function roleRedirectUrl(role: string | null | undefined): string {
  return ROLE_ROUTES[role ?? ''] ?? '/home'
}
