"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, CalendarClock, Map as MapIcon, User } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/bookings", label: "Bookings", icon: CalendarClock },
  { href: "/map", label: "Map", icon: MapIcon },
  { href: "/profile", label: "Profile", icon: User },
] as const

interface BottomNavProps {
  className?: string
}

export function BottomNav({ className }: BottomNavProps) {
  const pathname = usePathname()
  return (
    <nav
      aria-label="Primary"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border/70 glass-strong pb-safe",
        className,
      )}
    >
      <ul className="mx-auto flex max-w-xl items-stretch justify-between px-2 pt-2">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "tap relative flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-12 items-center justify-center rounded-full transition-colors",
                    active ? "bg-primary/10" : "bg-transparent",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.4 : 2} />
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/** Spacer to pad content above the fixed bottom nav. */
export function BottomNavSpacer() {
  return <div aria-hidden className="h-20 pb-safe" />
}
