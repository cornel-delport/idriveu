"use client"

import Link from "next/link"
import { ArrowLeft, Bell, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { BrandLogo } from "@/components/brand-logo"
import { cn } from "@/lib/utils"

interface AppTopBarProps {
  title?: string
  /** If provided, the back button links to this href. Takes precedence over showBack. */
  backHref?: string
  /** If true (and no backHref), the back button calls router.back(). */
  showBack?: boolean
  rightSlot?: React.ReactNode
  transparent?: boolean
  tone?: "dark" | "light"
  className?: string
}

export function AppTopBar({
  title,
  backHref,
  showBack = false,
  rightSlot,
  transparent = false,
  tone = "dark",
  className,
}: AppTopBarProps) {
  const router = useRouter()
  const showsBackButton = Boolean(backHref) || showBack

  const circleClass = cn(
    "tap flex h-9 w-9 items-center justify-center rounded-full transition active:scale-[0.95]",
    tone === "light"
      ? "bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25"
      : "bg-secondary text-foreground hover:bg-secondary/80",
  )

  return (
    <header
      className={cn(
        "sticky top-0 z-40",
        transparent ? "bg-transparent" : "glass border-b border-border/60",
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {showsBackButton ? (
            backHref ? (
              <Link href={backHref} aria-label="Go back" className={circleClass}>
                <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => router.back()}
                aria-label="Go back"
                className={circleClass}
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
              </button>
            )
          ) : (
            <Link href="/" aria-label="IDriveU home" className="tap">
              <BrandLogo tone={tone} />
            </Link>
          )}
          {title && (
            <span
              className={cn(
                "ml-1 text-[15px] font-semibold tracking-tight",
                tone === "light" ? "text-primary-foreground" : "text-foreground",
              )}
            >
              {title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {rightSlot ?? (
            <>
              <Link href="#" aria-label="Notifications" className={circleClass}>
                <Bell className="h-4 w-4" strokeWidth={2.2} />
              </Link>
              <Link href="/profile" aria-label="Profile" className={circleClass}>
                <User className="h-4 w-4" strokeWidth={2.2} />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
