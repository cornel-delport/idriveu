"use client"

import * as React from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type Variant = "primary" | "secondary" | "ghost" | "destructive" | "glow" | "dark"
type Size = "sm" | "md" | "lg"

interface BaseProps {
  icon?: LucideIcon
  iconRight?: LucideIcon
  variant?: Variant
  size?: Size
  loading?: boolean
  loadingLabel?: string
  fullWidth?: boolean
  className?: string
  children?: React.ReactNode
}

interface ButtonProps
  extends BaseProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> {
  href?: undefined
}

interface AnchorProps extends BaseProps {
  href: string
  prefetch?: boolean
  target?: string
  rel?: string
}

type IconButtonProps = ButtonProps | AnchorProps

const SIZE: Record<Size, string> = {
  sm: "h-10 px-4 text-[13px] gap-2",
  md: "h-12 px-5 text-[14px] gap-2",
  lg: "h-14 px-6 text-[15px] gap-2.5",
}

const ICON_SIZE: Record<Size, string> = {
  sm: "h-4 w-4",
  md: "h-4.5 w-4.5",
  lg: "h-5 w-5",
}

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-[0_8px_22px_-10px_rgba(13,71,161,0.55)] hover:bg-primary/95 active:scale-[0.98]",
  secondary:
    "bg-secondary text-foreground border border-border hover:bg-secondary/70 active:scale-[0.98]",
  ghost:
    "bg-transparent text-foreground hover:bg-secondary/60 active:scale-[0.98]",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.98]",
  glow: "btn-glow active:scale-[0.98]",
  dark:
    "bg-[#0A0F1C] text-white hover:bg-[#0A0F1C]/90 active:scale-[0.98] border border-white/10",
}

/**
 * Icon-first button — leading icon (or trailing) + label.
 * Supports `href` to render as a `Link`.
 */
export function IconButton(props: IconButtonProps) {
  const {
    icon: Icon,
    iconRight: IconRight,
    variant = "primary",
    size = "md",
    loading = false,
    loadingLabel,
    fullWidth = false,
    className,
    children,
  } = props

  const cls = cn(
    "tap inline-flex items-center justify-center rounded-full font-semibold transition-colors",
    SIZE[size],
    VARIANT[variant],
    fullWidth && "w-full",
    loading && "cursor-wait opacity-70",
    className,
  )

  const content = (
    <>
      {Icon && !loading && <Icon className={cn(ICON_SIZE[size], "shrink-0")} strokeWidth={2.2} />}
      {loading && (
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className={cn(ICON_SIZE[size], "animate-spin")}
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.25"
            strokeWidth="3"
          />
          <path
            d="M21 12a9 9 0 0 0-9-9"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      )}
      <span className="truncate">
        {loading && loadingLabel ? loadingLabel : children}
      </span>
      {IconRight && !loading && (
        <IconRight className={cn(ICON_SIZE[size], "shrink-0")} strokeWidth={2.2} />
      )}
    </>
  )

  if ("href" in props && props.href) {
    return (
      <Link
        href={props.href}
        prefetch={props.prefetch}
        target={props.target}
        rel={props.rel}
        className={cls}
      >
        {content}
      </Link>
    )
  }

  const { icon: _i, iconRight: _ir, variant: _v, size: _s, loading: _l, loadingLabel: _ll, fullWidth: _fw, className: _c, children: _ch, ...rest } = props as ButtonProps
  return (
    <button {...rest} disabled={loading || rest.disabled} className={cls}>
      {content}
    </button>
  )
}

/**
 * Compact circular icon-only button (e.g. close, settings, plus).
 */
export function CircleIconButton({
  icon: Icon,
  variant = "secondary",
  size = "md",
  className,
  ariaLabel,
  ...rest
}: {
  icon: LucideIcon
  variant?: "primary" | "secondary" | "ghost" | "glow" | "dark"
  size?: "sm" | "md" | "lg"
  className?: string
  ariaLabel: string
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "size">) {
  const dim =
    size === "sm" ? "h-9 w-9" : size === "lg" ? "h-12 w-12" : "h-10 w-10"
  const iconCls =
    size === "sm" ? "h-4 w-4" : size === "lg" ? "h-5 w-5" : "h-4.5 w-4.5"

  const variantCls = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-foreground hover:bg-secondary/80 ring-1 ring-border",
    ghost: "bg-transparent text-foreground hover:bg-secondary/60",
    glow: "btn-glow",
    dark: "bg-black/50 text-white backdrop-blur hover:bg-black/60",
  }[variant]

  return (
    <button
      aria-label={ariaLabel}
      {...rest}
      className={cn(
        "tap flex shrink-0 items-center justify-center rounded-full transition-colors active:scale-[0.95]",
        dim,
        variantCls,
        className,
      )}
    >
      <Icon className={iconCls} strokeWidth={2.2} />
    </button>
  )
}

/**
 * Floating action button — large, glowing, fixed-position friendly.
 */
export function FloatingIconButton({
  icon: Icon,
  ariaLabel,
  href,
  onClick,
  className,
}: {
  icon: LucideIcon
  ariaLabel: string
  href?: string
  onClick?: () => void
  className?: string
}) {
  const inner = (
    <span
      className={cn(
        "tap btn-glow-strong inline-flex h-14 w-14 items-center justify-center rounded-full transition-transform active:scale-[0.92]",
        className,
      )}
      aria-label={ariaLabel}
    >
      <Icon className="h-6 w-6" strokeWidth={2.4} />
    </span>
  )

  if (href) {
    return (
      <Link href={href} aria-label={ariaLabel}>
        {inner}
      </Link>
    )
  }

  return (
    <button type="button" aria-label={ariaLabel} onClick={onClick}>
      {inner}
    </button>
  )
}
