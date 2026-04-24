"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, Phone, X } from "lucide-react"
import { BrandLogo } from "./brand-logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/services", label: "Services" },
  { href: "/book", label: "Book" },
  { href: "/dashboard", label: "My Trips" },
  { href: "/contact", label: "Contact" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <BrandLogo />
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="rounded-full text-muted-foreground"
          >
            <a href="tel:+27821234567" aria-label="Call John">
              <Phone className="size-4" />
              <span className="tabular-nums">082 123 4567</span>
            </a>
          </Button>
          <Button asChild size="sm" className="rounded-full">
            <Link href="/book">Book a driver</Link>
          </Button>
        </div>
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-3">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium",
                  pathname.startsWith(item.href)
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/70",
                )}
              >
                {item.label}
              </Link>
            ))}
            <Button asChild className="mt-2 rounded-full">
              <Link href="/book" onClick={() => setOpen(false)}>
                Book a driver
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
