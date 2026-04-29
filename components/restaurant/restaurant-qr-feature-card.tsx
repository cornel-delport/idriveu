"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { QrCode, Camera, Hash, ArrowRight, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { IconInput, IconButton } from "@/components/ui-icon"

/**
 * Big, premium "Scan QR" feature card — sits on the home page.
 *
 * Two ways to start a restaurant booking:
 *   1. Scan QR Code → /qr/scan (camera scanner)
 *   2. Enter restaurant code manually → /qr/restaurant/<CODE>
 */
export function RestaurantQrFeatureCard({ className }: { className?: string }) {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [showManual, setShowManual] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function submitManual(e: React.FormEvent) {
    e.preventDefault()
    const upper = code.trim().toUpperCase()
    if (upper.length < 3) {
      setError("Enter at least 3 characters")
      return
    }
    if (!/^[A-Z0-9-]+$/.test(upper)) {
      setError("Only letters, digits and hyphens")
      return
    }
    setError(null)
    router.push(`/qr/restaurant/${upper}`)
  }

  return (
    <section className={cn("px-4 pt-6", className)}>
      <div className="card-dark relative overflow-hidden rounded-3xl p-5">
        {/* Glow accents */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#4FC3F7]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-52 w-52 rounded-full bg-white/5 blur-3xl" />

        {/* Header */}
        <div className="relative flex items-start gap-3">
          <span className="chip-glass flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
            <QrCode className="h-6 w-6 text-glow" strokeWidth={2.2} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-glow">
              Out for dinner or drinks?
            </p>
            <h2 className="mt-1 text-[20px] font-semibold leading-tight tracking-tight text-white">
              Scan QR at your table
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-white/75">
              Had drinks? Scan the restaurant QR code and a private driver will
              get you and your car home safely.
            </p>
          </div>
        </div>

        {/* Safety note */}
        <div className="relative mt-4 flex items-start gap-2 rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          <p className="text-[12px] leading-snug text-white/80">
            Don&apos;t risk driving over the legal alcohol limit. Book a private
            driver in seconds.
          </p>
        </div>

        {/* CTAs */}
        <div className="relative mt-4 flex flex-col gap-2.5">
          <IconButton
            icon={Camera}
            iconRight={ArrowRight}
            variant="glow"
            size="lg"
            href="/qr/scan"
            fullWidth
          >
            Scan QR Code
          </IconButton>

          {showManual ? (
            <form onSubmit={submitManual} className="flex flex-col gap-2">
              <IconInput
                icon={Hash}
                label="Restaurant code"
                placeholder="e.g. PLETT-001"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                error={error ?? undefined}
                hint={error ? undefined : "Find this code on your table tent"}
                tone="accent"
                autoFocus
              />
              <IconButton
                type="submit"
                icon={Hash}
                iconRight={ArrowRight}
                variant="primary"
                size="md"
                fullWidth
              >
                Continue
              </IconButton>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowManual(true)}
              className="tap inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white/10 text-[13px] font-semibold text-white ring-1 ring-white/15"
            >
              <Hash className="h-4 w-4" />
              Enter restaurant code manually
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
