'use client'

import Link from 'next/link'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { BrandLogo } from '@/components/brand-logo'
import {
  ArrowLeft,
  ArrowRight,
  User,
  UserPlus,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react'
import { toast } from 'sonner'
import { registerUser } from '@/actions/auth'
import {
  IconInput,
  IconButton,
  CircleIconButton,
} from '@/components/ui-icon'

export default function SignupPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await registerUser({ firstName, lastName, email, phone, password })
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (signInResult?.error) {
        toast.error('Account created but sign-in failed. Please log in.')
        router.push('/login')
      } else {
        // Role-aware redirect — read the JWT-set role then route accordingly
        const { getSession } = await import('next-auth/react')
        const { roleRedirectUrl } = await import('@/lib/auth-redirect')
        const session = await getSession()
        const role = (session?.user as { role?: string } | undefined)?.role
        router.push(roleRedirectUrl(role))
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between px-5 pb-4 pt-6">
        <CircleIconButton
          icon={ArrowLeft}
          variant="secondary"
          ariaLabel="Back"
          onClick={() => router.back()}
        />
        <BrandLogo size="sm" />
        <div className="h-10 w-10" aria-hidden />
      </header>

      <div className="flex flex-1 flex-col px-5 pt-6">
        <div className="mb-6">
          <h1 className="text-balance text-[28px] font-semibold leading-tight tracking-tight text-foreground">
            Create your account
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
            Book a trusted Plett driver in under a minute.
          </p>
        </div>

        <form className="flex flex-1 flex-col gap-3.5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <IconInput
              icon={User}
              label="First name"
              placeholder="Thandi"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              autoComplete="given-name"
            />
            <IconInput
              icon={User}
              label="Last name"
              placeholder="Mokoena"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              autoComplete="family-name"
            />
          </div>

          <IconInput
            icon={Mail}
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <IconInput
            icon={Phone}
            label="Mobile number"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+27 82 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <IconInput
            icon={Lock}
            label="Password"
            type={showPwd ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            hint="By signing up you agree to our terms & safety."
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? 'Hide password' : 'Show password'}
                className="tap flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-card"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          <div className="mt-auto pb-8 pt-6">
            <IconButton
              type="submit"
              icon={UserPlus}
              iconRight={ArrowRight}
              variant="glow"
              size="lg"
              fullWidth
              loading={loading}
              loadingLabel="Creating account…"
            >
              Create account
            </IconButton>

            <div className="mt-4 flex items-center gap-3 text-[13px] text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              <span>or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="tap mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border bg-card text-[14px] font-semibold"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>

            <p className="mt-6 text-center text-[14px] text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  )
}
