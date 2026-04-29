"use client"

import { useEffect, useRef, useState } from "react"
import { ArrivalAlertModal } from "./arrival-alert-modal"

interface Props {
  bookingId: string
  /** True if the booking already has arrived status before mount */
  initiallyArrived: boolean
  /** True if the alert was already acknowledged on the server */
  initiallyAcknowledged: boolean
  driverName?: string | null
  driverPhone?: string | null
  pickupLabel?: string
}

interface Snapshot {
  status: string
  arrivalAlertAcknowledged: boolean
}

/**
 * Lightweight client-side poller. Hits `/api/trip/<id>/snapshot` every
 * ~5 seconds (only while tab is visible) to know when the driver marks
 * `arrived`. The first time we see `arrived` AND the alert isn't yet
 * acknowledged, we open the ArrivalAlertModal.
 *
 * NOTE: I'm hitting an existing endpoint shape (/api/trip/[id]/...)
 * the same one used by other status reads. If it doesn't exist, we
 * silently swallow the error — the page still works without alerts.
 */
export function ArrivalAlertPoller({
  bookingId,
  initiallyArrived,
  initiallyAcknowledged,
  driverName,
  driverPhone,
  pickupLabel,
}: Props) {
  const [open, setOpen] = useState(initiallyArrived && !initiallyAcknowledged)
  const ackRef = useRef(initiallyAcknowledged)
  const arrivedShownRef = useRef(initiallyArrived)

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    async function tick() {
      if (cancelled) return
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        timer = setTimeout(tick, 8000)
        return
      }
      try {
        const res = await fetch(`/api/trip/${bookingId}/status`, {
          method: "GET",
          cache: "no-store",
        })
        if (res.ok) {
          const data: Snapshot = await res.json()
          // First time we see "arrived" → open modal (unless already acknowledged)
          if (
            data.status === "arrived" &&
            !data.arrivalAlertAcknowledged &&
            !ackRef.current &&
            !arrivedShownRef.current
          ) {
            arrivedShownRef.current = true
            setOpen(true)
          }
          if (data.arrivalAlertAcknowledged) ackRef.current = true
        }
      } catch {
        /* ignore — keep polling */
      }
      if (!cancelled) timer = setTimeout(tick, 5000)
    }

    tick()
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [bookingId])

  async function handleAck() {
    try {
      await fetch(`/api/trip/${bookingId}/arrival-alert-acknowledge`, {
        method: "POST",
      })
      ackRef.current = true
    } catch {
      /* noop */
    }
    setOpen(false)
  }

  return (
    <ArrivalAlertModal
      open={open}
      driverName={driverName}
      driverPhone={driverPhone}
      pickupLabel={pickupLabel}
      onAcknowledge={handleAck}
      onClose={() => setOpen(false)}
    />
  )
}
