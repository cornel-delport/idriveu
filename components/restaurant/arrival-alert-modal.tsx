"use client"

import { useEffect, useRef, useState } from "react"
import { CheckCircle2, MapPin, Phone, X, Car } from "lucide-react"
import { cn } from "@/lib/utils"
import { IconButton, CircleIconButton } from "@/components/ui-icon"

interface Props {
  open: boolean
  /** Driver display name */
  driverName?: string | null
  driverPhone?: string | null
  pickupLabel?: string
  /** "I'm on my way" — should also POST to /api/trip/[id]/arrival-alert-acknowledge */
  onAcknowledge: () => void | Promise<void>
  onClose: () => void
}

/**
 * Full-screen modal that fires the moment the driver marks `arrived`.
 *
 * Behaviour:
 *   - Subtle pulse / flash on the icon ring
 *   - Plays a short notification beep (Web Audio — no asset required)
 *   - Vibrates twice on supported devices (250ms · 150ms · 250ms)
 *   - Once the user taps "I'm on my way" we acknowledge upstream so the
 *     alert doesn't fire again for the same booking
 */
export function ArrivalAlertModal({
  open,
  driverName,
  driverPhone,
  pickupLabel,
  onAcknowledge,
  onClose,
}: Props) {
  const [acknowledging, setAcknowledging] = useState(false)
  const playedRef = useRef(false)

  // Sound + vibrate once when the modal opens
  useEffect(() => {
    if (!open || playedRef.current) return
    playedRef.current = true

    // Vibrate
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([250, 150, 250])
      } catch {
        /* noop */
      }
    }

    // Beep — Web Audio API, no MP3 needed
    try {
      const Ctx =
        (window as unknown as { AudioContext?: typeof AudioContext })
          .AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext
      if (Ctx) {
        const ctx = new Ctx()
        const beep = (freq: number, when: number, dur = 0.18) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.frequency.value = freq
          osc.type = "sine"
          osc.connect(gain)
          gain.connect(ctx.destination)
          gain.gain.setValueAtTime(0.0001, ctx.currentTime + when)
          gain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + when + 0.02)
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + when + dur)
          osc.start(ctx.currentTime + when)
          osc.stop(ctx.currentTime + when + dur + 0.05)
        }
        beep(880, 0)
        beep(660, 0.22)
        beep(880, 0.44)
        // Auto-close audio context
        setTimeout(() => ctx.close().catch(() => undefined), 1500)
      }
    } catch {
      /* noop */
    }
  }, [open])

  // Reset playedRef when modal closes so it can fire again on next open
  useEffect(() => {
    if (!open) playedRef.current = false
  }, [open])

  if (!open) return null

  async function handleAck() {
    if (acknowledging) return
    setAcknowledging(true)
    try {
      await onAcknowledge()
    } finally {
      setAcknowledging(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="arrival-alert-title"
      className="fixed inset-0 z-[200] flex items-stretch justify-center bg-[#0A0F1C]/85 px-4 backdrop-blur-md sm:items-center"
    >
      <div className="card-dark relative my-auto flex max-h-[100dvh] w-full max-w-md flex-col overflow-hidden rounded-3xl">
        {/* Glow pulses */}
        <div className="pointer-events-none absolute -top-10 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[#4FC3F7]/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-10 h-56 w-56 rounded-full bg-primary/40 blur-3xl" />

        {/* Close (subtle — main action is "I'm on my way") */}
        <CircleIconButton
          icon={X}
          variant="dark"
          ariaLabel="Dismiss"
          onClick={onClose}
          className="absolute right-3 top-3 z-10"
          size="sm"
        />

        {/* Hero icon ring */}
        <div className="relative z-10 flex flex-col items-center px-6 pt-10">
          <span className="relative flex h-24 w-24 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-[#4FC3F7]/40" />
            <span className="absolute inset-3 rounded-full bg-[#4FC3F7]/30" />
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#4FC3F7] text-[#0A0F1C] shadow-[0_0_28px_rgba(79,195,247,0.7)]">
              <Car className="h-8 w-8" strokeWidth={2.4} />
            </span>
          </span>

          <h1
            id="arrival-alert-title"
            className="mt-5 text-center text-[26px] font-semibold leading-tight tracking-tight text-white"
          >
            Your driver is outside
          </h1>
          <p className="mt-1.5 text-center text-[14px] leading-relaxed text-white/75">
            Please meet your driver at the pickup point.
          </p>
        </div>

        {/* Driver + pickup details */}
        <div className="relative z-10 mx-5 mt-6 space-y-2.5 rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
          {driverName && (
            <Row icon={CheckCircle2} label="Driver" value={driverName} />
          )}
          {pickupLabel && (
            <Row icon={MapPin} label="Pickup" value={pickupLabel} />
          )}
        </div>

        {/* Actions */}
        <div className="relative z-10 mt-auto flex flex-col gap-2.5 px-5 pb-[max(env(safe-area-inset-bottom,0px),20px)] pt-5">
          <IconButton
            icon={CheckCircle2}
            variant="glow"
            size="lg"
            fullWidth
            onClick={handleAck}
            loading={acknowledging}
            loadingLabel="Got it…"
          >
            I&apos;m on my way
          </IconButton>

          {driverPhone && (
            <a
              href={`tel:${driverPhone}`}
              className={cn(
                "tap inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white/10 text-[14px] font-semibold text-white ring-1 ring-white/15",
              )}
            >
              <Phone className="h-4 w-4" /> Call driver
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
          {label}
        </p>
        <p className="truncate text-[13px] font-semibold text-white">{value}</p>
      </div>
    </div>
  )
}
