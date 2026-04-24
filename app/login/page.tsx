import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { BrandLogo } from "@/components/brand-logo"
import { ArrowLeft } from "lucide-react"

export default function LoginPage() {
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

        <form className="flex flex-1 flex-col">
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
              asChild
              size="lg"
              className="h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Link href="/dashboard">Sign in</Link>
            </Button>

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
