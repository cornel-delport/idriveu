"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

// formatZAR not yet in @/lib/utils — define inline
function formatZAR(cents: number): string {
  return `R ${(cents / 100).toFixed(2)}`
}

interface TipSelectorProps {
  onSelect: (amountCents: number) => void
  selectedCents: number
  loading?: boolean
  className?: string
}

const PRESETS = [
  { label: "R20", cents: 2000 },
  { label: "R30", cents: 3000 },
  { label: "R50", cents: 5000 },
  { label: "R100", cents: 10000 },
]

export function TipSelector({
  onSelect,
  selectedCents,
  loading = false,
  className,
}: TipSelectorProps) {
  const [customValue, setCustomValue] = useState("")

  const isCustomActive =
    selectedCents > 0 && !PRESETS.some((p) => p.cents === selectedCents)

  function handleCustomCommit() {
    const parsed = Math.round(parseFloat(customValue) * 100)
    if (!isNaN(parsed) && parsed > 0) {
      onSelect(parsed)
    }
  }

  function handleCustomChange(raw: string) {
    // allow digits and one decimal
    if (/^\d*\.?\d{0,2}$/.test(raw)) {
      setCustomValue(raw)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Preset pills */}
      <div className="grid grid-cols-4 gap-2">
        {PRESETS.map((preset) => {
          const selected = selectedCents === preset.cents
          return (
            <button
              key={preset.cents}
              type="button"
              disabled={loading}
              onClick={() => {
                setCustomValue("")
                onSelect(selected ? 0 : preset.cents)
              }}
              className={cn(
                "tap rounded-2xl px-3 py-3 text-[14px] font-semibold transition-colors",
                "min-h-[44px] border",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-secondary",
                loading && "cursor-not-allowed opacity-50",
              )}
            >
              {preset.label}
            </button>
          )
        })}
      </div>

      {/* Custom amount */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex flex-1 items-center gap-2 rounded-2xl border bg-card px-4 py-3 transition-colors",
            isCustomActive ? "border-primary" : "border-border",
          )}
        >
          <span className="text-[14px] font-medium text-muted-foreground">R</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="Custom amount"
            value={customValue}
            onChange={(e) => handleCustomChange(e.target.value)}
            onBlur={handleCustomCommit}
            onKeyDown={(e) => e.key === "Enter" && handleCustomCommit()}
            disabled={loading}
            className="min-w-0 flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
            aria-label="Custom tip amount in ZAR"
          />
        </div>
      </div>

      {/* No tip */}
      <button
        type="button"
        disabled={loading}
        onClick={() => {
          setCustomValue("")
          onSelect(0)
        }}
        className={cn(
          "tap w-full rounded-2xl border py-3 text-[13px] font-medium transition-colors",
          selectedCents === 0
            ? "border-border bg-secondary text-muted-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground",
          loading && "cursor-not-allowed opacity-50",
        )}
      >
        No tip
      </button>

      {/* Total display */}
      {selectedCents > 0 && (
        <p className="text-center text-[13px] text-muted-foreground">
          Tip total:{" "}
          <span className="font-semibold text-foreground">{formatZAR(selectedCents)}</span>
        </p>
      )}
    </div>
  )
}
