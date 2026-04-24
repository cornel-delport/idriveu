"use client"

import Link from "next/link"
import { ArrowLeft, Menu } from "lucide-react"
import { useRouter } from "next/navigation"
import { BrandLogo } from "@/components/brand-logo"
import { cn } from "@/lib/utils"

interface AppTopBarProps {
  title?: string
  showBack?: boolean
  rightSlot?: React.ReactNode
  transparent?: boolean
  tone?: "dark" | "light"
  className?: string
}

export function AppTopBar({
  title,
  showBack = false,
  rightSlot,
  transparent = false,
  tone = "dark",
  className,
}: AppTopBarProps) {
  const router = useRouter()
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
          {showBack ? (
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className={cn(
                "tap flex h-9 w-9 items-center justify-center rounded-full",
                tone === "light"
                  ? "bg-primary-foreground/15 text-primary-foreground"
                  : "bg-secondary text-foreground",
              )}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
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
            <Link
              href="/profile"
              aria-label="Menu"
              className={cn(
                "tap flex h-9 w-9 items-center justify-center rounded-full",
                tone === "light"
                  ? "bg-primary-foreground/15 text-primary-foreground"
                  : "bg-secondary text-foreground",
              )}
            >
              <Menu className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
