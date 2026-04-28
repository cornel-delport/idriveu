"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface IconInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  icon: LucideIcon
  label?: string
  error?: string
  hint?: string
  rightSlot?: React.ReactNode
  /** Visual variant */
  variant?: "default" | "filled" | "ghost"
  /** Tone of the icon chip */
  tone?: "primary" | "accent" | "muted"
  containerClassName?: string
}

/**
 * Icon-first input field — leading icon chip + label/value column.
 * The whole shell is wrapped in a soft surface with rounded corners.
 *
 * Used everywhere we collect a value from the user.
 */
export const IconInput = React.forwardRef<HTMLInputElement, IconInputProps>(
  function IconInput(
    {
      icon: Icon,
      label,
      error,
      hint,
      rightSlot,
      variant = "filled",
      tone = "primary",
      containerClassName,
      className,
      id,
      ...props
    },
    ref,
  ) {
    const reactId = React.useId()
    const inputId = id ?? reactId

    const surfaceClass = {
      default: "border border-border bg-card",
      filled: "bg-secondary",
      ghost: "bg-transparent border border-border/60",
    }[variant]

    const chipClass = {
      primary: "bg-primary/10 text-primary",
      accent: "bg-accent/15 text-accent-foreground",
      muted: "bg-card text-muted-foreground ring-1 ring-border",
    }[tone]

    return (
      <div className={cn("w-full", containerClassName)}>
        <label
          htmlFor={inputId}
          className={cn(
            "flex items-center gap-3 rounded-2xl p-3 transition-shadow",
            surfaceClass,
            error && "ring-2 ring-destructive/40",
            "focus-within:ring-2 focus-within:ring-primary/40",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              chipClass,
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
          </span>

          <span className="flex min-w-0 flex-1 flex-col">
            {label && (
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
              </span>
            )}
            <input
              ref={ref}
              id={inputId}
              className={cn(
                "w-full bg-transparent text-[15px] font-medium text-foreground outline-none placeholder:text-muted-foreground/60",
                className,
              )}
              {...props}
            />
          </span>

          {rightSlot && <span className="shrink-0">{rightSlot}</span>}
        </label>

        {(error || hint) && (
          <p
            className={cn(
              "ml-2 mt-1.5 text-[12px]",
              error ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {error ?? hint}
          </p>
        )}
      </div>
    )
  },
)
