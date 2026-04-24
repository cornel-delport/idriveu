"use client"

import { useState, useEffect, useRef } from "react"
import { APIProvider } from "@vis.gl/react-google-maps"
import { supabase } from "@/lib/supabase-client"
import { RouteMap } from "@/components/booking/route-map"
import { DriverMarker } from "./driver-marker"
import { animateLatLng } from "./animate-marker"
import type { BookingStatus } from "@/lib/types"

interface LiveTripMapProps {
  bookingId: string
  status: BookingStatus
  pickupLat?: number
  pickupLng?: number
  dropoffLat?: number
  dropoffLng?: number
  pickupLabel: string
  dropoffLabel: string
}

interface DriverLocation {
  lat: number
  lng: number
  heading?: number | null
}

export function LiveTripMap({
  bookingId,
  status,
  pickupLat,
  pickupLng,
  dropoffLat,
  dropoffLng,
  pickupLabel,
  dropoffLabel,
}: LiveTripMapProps) {
  const [driverLoc, setDriverLoc] = useState<DriverLocation | null>(null)
  const cancelAnimRef = useRef<(() => void) | null>(null)
  const mountedRef = useRef(true)
  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""

  // Subscribe to realtime driver location updates
  useEffect(() => {
    const channel = supabase
      .channel(`driver-location-${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "DriverLocation",
          filter: `bookingId=eq.${bookingId}`,
        },
        (payload) => {
          const raw = payload.new as Record<string, unknown>
          if (typeof raw.lat !== "number" || typeof raw.lng !== "number") return
          const newLoc: DriverLocation = {
            lat: raw.lat,
            lng: raw.lng,
            heading: typeof raw.heading === "number" ? raw.heading : null,
          }

          setDriverLoc((prev) => {
            if (prev) {
              // Animate from previous position to new position
              cancelAnimRef.current?.()
              cancelAnimRef.current = animateLatLng(
                prev,
                newLoc,
                800, // 800ms smooth transition
                (pos) => {
                  if (mountedRef.current) {
                    setDriverLoc({ ...newLoc, ...pos })
                  }
                },
              )
              return prev // animation will update state
            }
            return newLoc
          })
        },
      )
      .subscribe()

    return () => {
      mountedRef.current = false
      supabase.removeChannel(channel)
      cancelAnimRef.current?.()
    }
  }, [bookingId])

  // Determine route: before passenger collected → driver→pickup; after → driver→dropoff
  const tripStarted = status === "in_progress" || status === "completed"
  const routeDestLat = tripStarted ? dropoffLat : pickupLat
  const routeDestLng = tripStarted ? dropoffLng : pickupLng

  return (
    <div className="relative h-full w-full">
      <APIProvider apiKey={mapsApiKey} libraries={["places", "routes"]}>
        {/*
         * RouteMap renders the <Map> internally. DriverMarker is passed as
         * children so it renders inside that same <Map> instance — required
         * by @vis.gl/react-google-maps for AdvancedMarker to work correctly.
         */}
        <RouteMap
          variant="full"
          className="h-full"
          pickupLat={pickupLat}
          pickupLng={pickupLng}
          dropoffLat={dropoffLat}
          dropoffLng={dropoffLng}
          pickupLabel={pickupLabel}
          dropoffLabel={dropoffLabel}
          // When driver is live, use driver position as route origin
          routeOriginLat={driverLoc?.lat}
          routeOriginLng={driverLoc?.lng}
          routeDestinationLat={routeDestLat}
          routeDestinationLng={routeDestLng}
          // Don't draw route polyline if no driver location yet
          noRoute={!driverLoc}
        >
          {driverLoc && (
            <DriverMarker
              lat={driverLoc.lat}
              lng={driverLoc.lng}
              heading={driverLoc.heading}
            />
          )}
        </RouteMap>
      </APIProvider>

      {/* Waiting overlay when no driver location yet */}
      {!driverLoc && (
        <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
          <div className="glass-strong rounded-full border border-border px-4 py-2 text-[13px] text-muted-foreground">
            Waiting for driver location…
          </div>
        </div>
      )}
    </div>
  )
}
