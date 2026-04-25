"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { submitTip } from "@/actions/posttrip"
import { TipSelector } from "@/components/trip/tip-selector"
import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"

interface TipFormProps {
  bookingId: string
  driverName: string
  reference: string
}

export function TipForm({ bookingId, driverName, reference }: TipFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedCents, setSelectedCents] = useState(0)
  const [done, setDone] = useState(false)

  function handleSubmit(skipTip = false) {
    if (skipTip || selectedCents === 0) {
      router.push(`/trip/${bookingId}/receipt`)
      return
    }
    startTransition(async () => {
      const result = await submitTip(bookingId, selectedCents)
      if ("error" in result) {
        alert(result.error)
        return
      }
      setDone(true)
      setTimeout(() => router.push(`/trip/${bookingId}/receipt`), 1200)
    })
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Heart className="h-10 w-10 text-primary" fill="currentColor" />
        </div>
        <h2 className="text-[22px] font-semibold tracking-tight">Tip sent! 🎉</h2>
        <p className="text-[14px] text-muted-foreground">
          R{(selectedCents / 100).toFixed(2)} has been sent to {driverName}
        </p>
        <p className="text-[12px] text-muted-foreground">Redirecting to receipt…</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-card px-6 py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Heart className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-[20px] font-semibold tracking-tight text-foreground">
          Show {driverName} some love
        </h1>
        <p className="text-[13px] text-muted-foreground">
          Tips go directly to your driver. 100%.
        </p>
        <p className="text-[11px] text-muted-foreground/60">Ref: {reference}</p>
      </div>

      {/* Tip selector */}
      <TipSelector
        selectedCents={selectedCents}
        onSelect={setSelectedCents}
        loading={isPending}
      />

      {/* Submit */}
      <button
        type="button"
        onClick={() => handleSubmit(false)}
        disabled={selectedCents === 0 || isPending}
        className={cn(
          "tap flex h-14 w-full items-center justify-center rounded-2xl text-[15px] font-semibold transition-opacity",
          selectedCents > 0
            ? "bg-primary text-primary-foreground"
            : "cursor-not-allowed bg-muted text-muted-foreground opacity-50",
          isPending && "opacity-60",
        )}
      >
        {isPending
          ? "Processing…"
          : selectedCents > 0
            ? `Send R${(selectedCents / 100).toFixed(2)} tip`
            : "Select a tip amount"}
      </button>

      <button
        type="button"
        onClick={() => handleSubmit(true)}
        disabled={isPending}
        className="text-center text-[13px] text-muted-foreground underline-offset-4 hover:underline disabled:opacity-40"
      >
        Skip — no tip this time
      </button>
    </div>
  )
}
