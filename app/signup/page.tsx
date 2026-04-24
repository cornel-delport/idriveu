import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { BrandLogo } from "@/components/brand-logo"
import { ArrowLeft } from "lucide-react"

export default function SignupPage() {
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
            Create your account
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
            Book a trusted Plett driver in under a minute.
          </p>
        </div>

        <form className="flex flex-1 flex-col">
          <FieldGroup className="gap-5">
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="firstname">First name</FieldLabel>
                <Input id="firstname" placeholder="Thandi" className="h-12 text-base" />
              </Field>
              <Field>
                <FieldLabel htmlFor="lastname">Last name</FieldLabel>
                <Input id="lastname" placeholder="Mokoena" className="h-12 text-base" />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="su-email">Email</FieldLabel>
              <Input
                id="su-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="h-12 text-base"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="su-phone">Mobile number</FieldLabel>
              <Input
                id="su-phone"
                type="tel"
                inputMode="tel"
                placeholder="+27 82 123 4567"
                className="h-12 text-base"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="su-password">Password</FieldLabel>
              <Input
                id="su-password"
                type="password"
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
                className="h-12 text-base"
              />
              <FieldDescription>
                By signing up you agree to our{" "}
                <Link href="/terms" className="font-medium text-primary hover:underline">
                  terms & safety
                </Link>
                .
              </FieldDescription>
            </Field>
          </FieldGroup>

          <div className="mt-auto pb-8 pt-10">
            <Button
              asChild
              size="lg"
              className="h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Link href="/dashboard">Create account</Link>
            </Button>
            <p className="mt-6 text-center text-[14px] text-muted-foreground">
              Already have an account?{" "}
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
