import Image from "next/image"
import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"

interface AuthShellProps {
  title: string
  subtitle: string
  children: React.ReactNode
  footer: React.ReactNode
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image
          src="/images/plett-coast-evening.jpg"
          alt="Plettenberg Bay coastline"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-between p-10 text-primary-foreground">
          <BrandLogo mono href="/" />
          <div className="max-w-md">
            <p className="font-serif text-3xl font-semibold leading-tight">
              &ldquo;Your car. Your plans. John gets you home safely.&rdquo;
            </p>
            <p className="mt-4 text-sm text-primary-foreground/80">
              Trusted private driver service in Plettenberg Bay since 2017.
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 py-12 md:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <BrandLogo href="/" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {subtitle}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold">{title}</h1>
          <div className="mt-7">{children}</div>
          <div className="mt-6 text-sm text-muted-foreground">{footer}</div>
          <p className="mt-10 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              &larr; Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
