"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export interface DashboardNavItem {
  href: string
  label: string
  icon: LucideIcon
}

interface DashboardShellProps {
  role: "customer" | "driver" | "admin"
  nav: DashboardNavItem[]
  user: { name: string; email: string }
  title: string
  description?: string
  children: React.ReactNode
}

const roleLabel: Record<DashboardShellProps["role"], string> = {
  customer: "Customer",
  driver: "Driver",
  admin: "Admin",
}

export function DashboardShell({
  role,
  nav,
  user,
  title,
  description,
  children,
}: DashboardShellProps) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-dvh bg-secondary/30">
      <aside className="sticky top-0 hidden h-dvh w-64 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <BrandLogo />
        </div>
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <div className="flex size-9 flex-none items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {initials(user.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {roleLabel[role]} · {user.email}
            </p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          {nav.map((item) => {
            const active =
              item.href === pathname ||
              (item.href !== "/" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-border p-3">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
          >
            <Link href="/">
              <LogOut className="size-4" />
              Sign out
            </Link>
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3 md:hidden">
            <BrandLogo />
          </div>
          <div className="hidden flex-col md:flex">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
              {roleLabel[role]} dashboard
            </p>
            <h1 className="font-serif text-lg font-semibold leading-tight">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="rounded-full">
              <Link href="/book">New booking</Link>
            </Button>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-10">
          <div className="md:hidden mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
              {roleLabel[role]} dashboard
            </p>
            <h1 className="mt-1 font-serif text-2xl font-semibold">{title}</h1>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {description && (
            <p className="mb-6 hidden text-sm text-muted-foreground md:block">
              {description}
            </p>
          )}
          {/* Mobile nav tabs */}
          <nav className="mb-6 flex gap-1 overflow-x-auto rounded-full border border-border bg-card p-1 md:hidden">
            {nav.map((item) => {
              const active =
                item.href === pathname ||
                (item.href !== "/" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex flex-none items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  <item.icon className="size-3.5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
          {children}
        </main>
      </div>
    </div>
  )
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}
