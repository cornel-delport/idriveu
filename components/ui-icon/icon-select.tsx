"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface IconSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  icon: LucideIcon
  label?: string
  hint?: string
  error?: string
  variant?: "default" | "filled" | "ghost"
  tone?: "primary" | "accent" | "muted"
  containerClassName?: string
}

/**
 * Icon-first <select> — same shell as IconInput.
 */
export const IconSelect = React.forwardRef<HTMLSelectElement, IconSelectProps>(
  function IconSelect(
    {
      icon: Icon,
      label,
      hint,
      error,
      variant = "filled",
      tone = "primary",
      containerClassName,
      className,
      id,
      children,
      ...props
    },
    ref,
  ) {
    const reactId = React.useId()
    const selectId = id ?? reactId

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
          htmlFor={selectId}
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
            <select
              ref={ref}
              id={selectId}
              className={cn(
                "w-full appearance-none bg-transparent pr-2 text-[15px] font-medium text-foreground outline-none",
                className,
              )}
              {...props}
            >
              {children}
            </select>
          </span>

          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
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

interface IconTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  icon: LucideIcon
  label?: string
  hint?: string
  error?: string
  variant?: "default" | "filled" | "ghost"
  tone?: "primary" | "accent" | "muted"
  containerClassName?: string
}

/**
 * Icon-first <textarea> — same shell, vertically aligned icon.
 */
export const IconTextarea = React.forwardRef<HTMLTextAreaElement, IconTextareaProps>(
  function IconTextarea(
    {
      icon: Icon,
      label,
      hint,
      error,
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
    const textareaId = id ?? reactId

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
          htmlFor={textareaId}
          className={cn(
            "flex items-start gap-3 rounded-2xl p-3 transition-shadow",
            surfaceClass,
            error && "ring-2 ring-destructive/40",
            "focus-within:ring-2 focus-within:ring-primary/40",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
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
            <textarea
              ref={ref}
              id={textareaId}
              className={cn(
                "w-full resize-none bg-transparent text-[15px] font-medium text-foreground outline-none placeholder:text-muted-foreground/60",
                className,
              )}
              {...props}
            />
          </span>
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
