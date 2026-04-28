"use client"

import * as React from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

type Tone = "primary" | "accent" | "muted" | "warning" | "danger" | "success"
type Surface = "card" | "secondary" | "dark" | "glass"

interface IconCardProps {
  icon: LucideIcon
  title: string
  subtitle?: string
  description?: string
  href?: string
  onClick?: () => void
  rightSlot?: React.ReactNode
  tone?: Tone
  surface?: Surface
  showChevron?: boolean
  className?: string
  children?: React.ReactNode
}

const TONE_CHIP: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/15 text-accent-foreground",
  muted: "bg-secondary text-muted-foreground",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  danger: "bg-destructive/10 text-destructive",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
}

const SURFACE: Record<Surface, string> = {
  card: "bg-card border border-border",
  secondary: "bg-secondary",
  dark: "card-dark text-white",
  glass: "glass border border-border/40",
}

/**
 * Icon-first card — leading icon chip + title/description column + optional chevron.
 * Used for service cards, profile actions, list rows, etc.
 */
export function IconCard({
  icon: Icon,
  title,
  subtitle,
  description,
  href,
  onClick,
  rightSlot,
  tone = "primary",
  surface = "card",
  showChevron = false,
  className,
  children,
}: IconCardProps) {
  const isInteractive = Boolean(href || onClick)
  const isDark = surface === "dark"

  const inner = (
    <div
      className={cn(
        "flex items-center gap-3 rounded-3xl p-4",
        SURFACE[surface],
        isInteractive && "tap transition active:scale-[0.99]",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
          isDark ? "chip-glass text-white" : TONE_CHIP[tone],
        )}
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </span>

      <div className="min-w-0 flex-1">
        {subtitle && (
          <p
            className={cn(
              "text-[11px] font-semibold uppercase tracking-wider",
              isDark ? "text-white/60" : "text-muted-foreground",
            )}
          >
            {subtitle}
          </p>
        )}
        <p
          className={cn(
            "truncate text-[15px] font-semibold",
            isDark ? "text-white" : "text-foreground",
          )}
        >
          {title}
        </p>
        {description && (
          <p
            className={cn(
              "truncate text-[12.5px]",
              isDark ? "text-white/70" : "text-muted-foreground",
            )}
          >
            {description}
          </p>
        )}
        {children}
      </div>

      {rightSlot ?? (showChevron && (
        <ChevronRight
          className={cn(
            "h-5 w-5 shrink-0",
            isDark ? "text-white/60" : "text-muted-foreground",
          )}
        />
      ))}
    </div>
  )

  if (href) {
    return <Link href={href}>{inner}</Link>
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="block w-full text-left">
        {inner}
      </button>
    )
  }
  return inner
}

/**
 * Stat card — large icon + value + label, used for dashboards.
 */
export function IconStat({
  icon: Icon,
  value,
  label,
  trend,
  tone = "primary",
  surface = "card",
  className,
}: {
  icon: LucideIcon
  value: string | number
  label: string
  trend?: string
  tone?: Tone
  surface?: Surface
  className?: string
}) {
  const isDark = surface === "dark"
  return (
    <div
      className={cn(
        "rounded-2xl p-3.5",
        SURFACE[surface],
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl",
            isDark ? "chip-glass text-white" : TONE_CHIP[tone],
          )}
        >
          <Icon className="h-4.5 w-4.5" strokeWidth={2} />
        </span>
        {trend && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold",
              isDark ? "bg-white/10 text-white" : "bg-secondary text-muted-foreground",
            )}
          >
            {trend}
          </span>
        )}
      </div>
      <p
        className={cn(
          "mt-3 text-[22px] font-bold leading-none tracking-tight",
          isDark ? "text-white" : "text-foreground",
        )}
      >
        {value}
      </p>
      <p
        className={cn(
          "mt-1 text-[11px] font-medium uppercase tracking-wider",
          isDark ? "text-white/60" : "text-muted-foreground",
        )}
      >
        {label}
      </p>
    </div>
  )
}
