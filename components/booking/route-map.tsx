"use client"

import { cn } from "@/lib/utils"
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps"

// Plettenberg Bay — fallback centre when no locations are set
const PLETT_CENTRE = { lat: -34.0527, lng: 23.3716 }

interface RouteMapProps {
  pickupLabel?: string
  dropoffLabel?: string
  pickupLat?: number
  pickupLng?: number
  dropoffLat?: number
  dropoffLng?: number
  className?: string
  /** Display in a tall "uber-like" full screen style */
  variant?: "compact" | "full"
}

/**
 * Real Google Maps embed in satellite mode.
 * Shows pickup (blue dot) and dropoff (red pin) markers when co-ordinates
 * are available. Falls back to a Plett-centred view otherwise.
 *
 * Must be rendered inside an <APIProvider> — the BookingWizard handles that.
 */
export function RouteMap({
  pickupLabel = "Pickup location",
  dropoffLabel = "Drop off location",
  pickupLat,
  pickupLng,
  dropoffLat,
  dropoffLng,
  className,
  variant = "compact",
}: RouteMapProps) {
  const h = variant === "full" ? "h-[50vh] min-h-[340px]" : "h-44"

  const hasPickup = pickupLat !== undefined && pickupLng !== undefined
  const hasDropoff = dropoffLat !== undefined && dropoffLng !== undefined

  // Centre on pickup if we have it, else Plett
  const centre = hasPickup
    ? { lat: pickupLat!, lng: pickupLng! }
    : PLETT_CENTRE

  const zoom = hasDropoff ? 13 : hasPickup ? 15 : 13

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-3xl",
        h,
        className,
      )}
    >
      <Map
        defaultCenter={centre}
        defaultZoom={zoom}
        mapTypeId="satellite"
        disableDefaultUI
        gestureHandling="none"
        style={{ width: "100%", height: "100%" }}
      >
        {/* Pickup marker — glowing blue dot */}
        {hasPickup && (
          <AdvancedMarker position={{ lat: pickupLat!, lng: pickupLng! }}>
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#2196F3",
                border: "3px solid #fff",
                boxShadow: "0 0 0 4px rgba(33,150,243,0.35), 0 4px 12px rgba(0,0,0,0.4)",
              }}
            />
          </AdvancedMarker>
        )}

        {/* Dropoff marker — red teardrop */}
        {hasDropoff && (
          <AdvancedMarker position={{ lat: dropoffLat!, lng: dropoffLng! }}>
            <div style={{ textAlign: "center", position: "relative" }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50% 50% 50% 0",
                  transform: "rotate(-45deg)",
                  background: "#F44336",
                  border: "3px solid #fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                  margin: "0 auto",
                }}
              />
            </div>
          </AdvancedMarker>
        )}
      </Map>

      {/* Labels overlay */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3">
        <div className="glass-strong rounded-2xl border border-border p-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
            <span className="truncate text-[12px] font-medium text-foreground">
              {pickupLabel}
            </span>
          </div>
          <div className="my-1 ml-[5px] h-3 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
            <span className="truncate text-[12px] font-medium text-foreground">
              {dropoffLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
