"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { submitTip } from "@/actions/posttrip"
import { TipSelector } from "@/components/trip/tip-selector"
import { Heart, ArrowRight, ChevronRight } from "lucide-react"
import { IconButton } from "@/components/ui-icon"

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
      {/* Hero — premium dark gradient */}
      <div className="card-dark flex flex-col items-center gap-3 rounded-3xl px-6 py-8 text-center">
        <div className="chip-glass flex h-16 w-16 items-center justify-center rounded-full">
          <Heart className="h-7 w-7 text-glow" />
        </div>
        <h1 className="text-[20px] font-semibold tracking-tight text-white">
          Show {driverName} some love
        </h1>
        <p className="text-[13px] text-white/75">
          Tips go directly to your driver. 100%.
        </p>
        <p className="text-[10px] text-white/50">Ref: {reference}</p>
      </div>

      {/* Tip selector */}
      <TipSelector
        selectedCents={selectedCents}
        onSelect={setSelectedCents}
        loading={isPending}
      />

      {/* Submit */}
      <IconButton
        icon={Heart}
        iconRight={ArrowRight}
        variant="glow"
        size="lg"
        fullWidth
        onClick={() => handleSubmit(false)}
        disabled={selectedCents === 0}
        loading={isPending}
        loadingLabel="Processing…"
      >
        {selectedCents > 0
          ? `Send R${(selectedCents / 100).toFixed(2)} tip`
          : "Select a tip amount"}
      </IconButton>

      <IconButton
        icon={ChevronRight}
        variant="ghost"
        size="sm"
        onClick={() => handleSubmit(true)}
        disabled={isPending}
        className="self-center"
      >
        Skip — no tip this time
      </IconButton>
    </div>
  )
}
