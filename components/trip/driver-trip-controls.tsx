"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { APIProvider } from "@vis.gl/react-google-maps"
import { RouteMap } from "@/components/booking/route-map"
import { updateTripStatus } from "@/actions/trip"
import { toast } from "sonner"
import { Navigation, Phone, CheckCircle2, Car, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BookingStatus } from "@/lib/types"

interface DriverTripControlsProps {
  bookingId: string
  status: BookingStatus
  pickupAddress: string
  pickupLat?: number
  pickupLng?: number
  dropoffAddress: string
  dropoffLat?: number
  dropoffLng?: number
  customerName?: string
  customerPhone?: string
}

const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""

// Status transition map: current status → { label, nextStatus }
const STATUS_TRANSITIONS: Partial<
  Record<BookingStatus, { label: string; icon: React.ElementType; nextStatus: BookingStatus }>
> = {
  driver_assigned: {
    label: "Start journey to pickup",
    icon: Navigation,
    nextStatus: "driver_on_the_way",
  },
  driver_on_the_way: {
    label: "I've arrived at pickup",
    icon: MapPin,
    nextStatus: "arrived",
  },
  arrived: {
    label: "Start trip",
    icon: Car,
    nextStatus: "in_progress",
  },
  in_progress: {
    label: "Complete trip",
    icon: CheckCircle2,
    nextStatus: "completed",
  },
}

export function DriverTripControls({
  bookingId,
  status: initialStatus,
  pickupAddress,
  pickupLat,
  pickupLng,
  dropoffAddress,
  dropoffLat,
  dropoffLng,
  customerName,
  customerPhone,
}: DriverTripControlsProps) {
  const router = useRouter()
  const [status, setStatus] = useState<BookingStatus>(initialStatus)
  const [driverPos, setDriverPos] = useState<{ lat: number; lng: number } | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [advancing, setAdvancing] = useState(false)
  const watchIdRef = useRef<number | null>(null)
  const lastSentRef = useRef<number>(0)

  // Track while trip is active; stop when completed/cancelled
  const shouldTrack = !["completed", "cancelled", "refunded", "refund_requested"].includes(status)

  useEffect(() => {
    if (!shouldTrack || !navigator.geolocation) return

    setIsTracking(true)
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, heading, speed, accuracy } = pos.coords
        setDriverPos({ lat, lng })

        // Throttle POST to every 4 seconds
        const now = Date.now()
        if (now - lastSentRef.current < 4000) return
        lastSentRef.current = now

        fetch("/api/driver-location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId, lat, lng, heading, speed, accuracy }),
        }).catch(() => {
          // Silent — GPS updates are best-effort
        })
      },
      (err) => {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[DriverTripControls] GPS error:", err.message)
        }
        setIsTracking(false)
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10_000 },
    )

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      setIsTracking(false)
    }
  }, [bookingId, shouldTrack])

  async function handleAdvanceStatus() {
    const transition = STATUS_TRANSITIONS[status]
    if (!transition) return

    setAdvancing(true)
    const result = await updateTripStatus(bookingId, transition.nextStatus)
    setAdvancing(false)

    if ("error" in result) {
      toast.error(result.error)
      return
    }

    setStatus(transition.nextStatus)
    toast.success(`Status updated: ${transition.nextStatus.replace(/_/g, " ")}`)

    if (transition.nextStatus === "completed") {
      // Stop GPS tracking on completion
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      setIsTracking(false)
      router.push("/driver")
    }
  }

  // Route: before in_progress → driver→pickup; after → driver→dropoff
  const tripStarted = status === "in_progress" || status === "completed"
  const routeDestLat = tripStarted ? dropoffLat : pickupLat
  const routeDestLng = tripStarted ? dropoffLng : pickupLng

  const transition = STATUS_TRANSITIONS[status]

  return (
    <div className="relative flex h-dvh flex-col bg-background">
      {/* Full-screen map */}
      <div className="flex-1">
        <APIProvider apiKey={mapsApiKey} libraries={["places", "routes"]}>
          {/*
           * RouteMap renders the <Map> internally.
           * We pass driver position as routeOrigin so the polyline starts
           * from the driver rather than the fixed pickup marker.
           */}
          <RouteMap
            variant="full"
            className="h-full"
            pickupLat={pickupLat}
            pickupLng={pickupLng}
            dropoffLat={dropoffLat}
            dropoffLng={dropoffLng}
            pickupLabel={pickupAddress}
            dropoffLabel={dropoffAddress}
            routeOriginLat={driverPos?.lat}
            routeOriginLng={driverPos?.lng}
            routeDestinationLat={routeDestLat}
            routeDestinationLng={routeDestLng}
            noRoute={!driverPos}
          />
        </APIProvider>
      </div>

      {/* GPS status indicator */}
      <div className="absolute left-4 top-4 z-30">
        <div
          className={cn(
            "flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium backdrop-blur",
            isTracking
              ? "border border-green-500/30 bg-green-500/20 text-green-400"
              : "border border-border/50 bg-muted/50 text-muted-foreground",
          )}
        >
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              isTracking ? "animate-pulse bg-green-400" : "bg-muted-foreground",
            )}
          />
          {isTracking ? "Sharing location" : "Location off"}
        </div>
      </div>

      {/* Bottom controls sheet */}
      <div className="absolute inset-x-0 bottom-0 z-30">
        <div className="glass-strong rounded-t-3xl border-t border-border p-5 pb-safe">
          {/* Customer info */}
          {customerName && (
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Passenger
                </p>
                <p className="mt-0.5 text-[15px] font-semibold text-foreground">{customerName}</p>
              </div>
              {customerPhone && (
                <a
                  href={`tel:${customerPhone}`}
                  className="tap flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground"
                  aria-label={`Call ${customerName}`}
                >
                  <Phone className="h-4 w-4" />
                </a>
              )}
            </div>
          )}

          {/* Status action button */}
          {transition ? (
            <button
              type="button"
              onClick={handleAdvanceStatus}
              disabled={advancing}
              className={cn(
                "tap inline-flex w-full items-center justify-between rounded-2xl px-5 py-3.5 text-[15px] font-semibold",
                advancing ? "bg-secondary text-muted-foreground" : "btn-glow-strong",
              )}
            >
              <span>{advancing ? "Updating…" : transition.label}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                {(() => {
                  const Icon = transition.icon
                  return <Icon className="h-4 w-4" />
                })()}
              </span>
            </button>
          ) : (
            <div className="rounded-2xl bg-secondary px-5 py-3.5 text-center text-[14px] text-muted-foreground">
              {status === "completed" ? "Trip complete" : "No actions available"}
            </div>
          )}

          <p className="mt-3 text-center text-[11px] text-muted-foreground/60">
            You are booking a private driver who drives your own car.
          </p>
        </div>
      </div>
    </div>
  )
}
