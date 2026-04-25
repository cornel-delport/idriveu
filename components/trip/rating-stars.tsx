"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface RatingStarsProps {
  value: number
  onChange?: (v: number) => void
  size?: "sm" | "md" | "lg"
  className?: string
}

const SIZE_MAP = {
  sm: 16,
  md: 24,
  lg: 32,
} as const

export function RatingStars({
  value,
  onChange,
  size = "md",
  className,
}: RatingStarsProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const isInteractive = typeof onChange === "function"
  const px = SIZE_MAP[size]

  function starFill(index: number): "full" | "half" | "empty" {
    const display = hovered !== null ? hovered : value
    if (display >= index + 1) return "full"
    if (display >= index + 0.5) return "half"
    return "empty"
  }

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role={isInteractive ? "group" : undefined}
      aria-label={isInteractive ? "Rating" : `Rating: ${value} out of 5`}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const fill = starFill(i)
        const label = `${i + 1} star${i + 1 !== 1 ? "s" : ""}`

        if (isInteractive) {
          return (
            <button
              key={i}
              type="button"
              aria-label={label}
              onClick={() => onChange(i + 1)}
              onMouseEnter={() => setHovered(i + 1)}
              onMouseLeave={() => setHovered(null)}
              className="tap flex items-center justify-center rounded transition-transform active:scale-90"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              <Star
                style={{ width: px, height: px }}
                className={cn(
                  "transition-colors",
                  fill === "full"
                    ? "fill-amber-400 text-amber-400"
                    : "fill-transparent text-muted-foreground/30",
                )}
              />
            </button>
          )
        }

        // Read-only display with half-star support via clip
        return (
          <span
            key={i}
            aria-hidden="true"
            className="relative inline-flex items-center justify-center"
            style={{ width: px, height: px }}
          >
            {/* Empty star base */}
            <Star
              style={{ width: px, height: px }}
              className="absolute inset-0 fill-transparent text-muted-foreground/30"
            />
            {/* Filled overlay clipped to fill amount */}
            {fill !== "empty" && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: fill === "half" ? "50%" : "100%" }}
              >
                <Star
                  style={{ width: px, height: px }}
                  className="fill-amber-400 text-amber-400"
                />
              </span>
            )}
          </span>
        )
      })}
    </div>
  )
}
