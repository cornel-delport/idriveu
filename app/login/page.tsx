'use client'

import Link from 'next/link'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field'
import { BrandLogo } from '@/components/brand-logo'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (result?.error) {
        toast.error('Invalid email or password.')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between px-5 pt-6 pb-4">
        <Link
          href="/"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <BrandLogo size="sm" />
        <div className="h-10 w-10" aria-hidden />
      </header>

      <div className="flex flex-1 flex-col px-5 pt-6">
        <div className="mb-8">
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-foreground text-balance">
            Welcome back
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
            Sign in to manage your rides and see past trips.
          </p>
        </div>

        <form className="flex flex-1 flex-col" onSubmit={handleSubmit}>
          <FieldGroup className="gap-5">
            <Field>
              <FieldLabel htmlFor="login-email">Email or phone</FieldLabel>
              <Input
                id="login-email"
                type="text"
                inputMode="email"
                autoComplete="username"
                placeholder="you@example.com"
                className="h-12 text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="login-password">Password</FieldLabel>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-12 text-base"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FieldDescription className="flex items-center justify-between">
                <span>Use at least 8 characters.</span>
                <Link href="#" className="font-medium text-primary hover:underline">
                  Forgot?
                </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>

          <div className="mt-auto pb-8 pt-10">
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>

            <div className="mt-3 flex items-center gap-3 text-[13px] text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              <span>or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
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

            <div className="mt-4 flex items-center justify-center gap-4 text-[13px] text-muted-foreground">
              <Link href="/driver" className="hover:text-foreground">
                Driver login
              </Link>
              <span aria-hidden>·</span>
              <Link href="/admin" className="hover:text-foreground">
                Admin
              </Link>
            </div>

            <p className="mt-6 text-center text-[14px] text-muted-foreground">
              {"Don't have an account? "}
              <Link href="/signup" className="font-semibold text-primary hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  )
}
