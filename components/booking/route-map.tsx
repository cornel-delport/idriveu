"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Map, Marker, useMap, useMapsLibrary } from "@vis.gl/react-google-maps"

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
  /** Override route origin (e.g. driver's live position) instead of pickup */
  routeOriginLat?: number
  routeOriginLng?: number
  /** Override route destination instead of dropoff */
  routeDestinationLat?: number
  routeDestinationLng?: number
  /** When true, skip DirectionsService and show only markers */
  noRoute?: boolean
  /** Allow the user to pan/zoom the map (default: locked) */
  interactive?: boolean
  /** Children rendered inside the <Map> component (e.g. DriverMarker) */
  children?: ReactNode
}

// ---------------------------------------------------------------------------
// CameraController — imperatively pans/zooms the map when coordinates change.
// Must be rendered inside <Map> so that useMap() resolves correctly.
// ---------------------------------------------------------------------------
interface CameraControllerProps {
  pickupLat?: number
  pickupLng?: number
  dropoffLat?: number
  dropoffLng?: number
}

function CameraController({
  pickupLat,
  pickupLng,
  dropoffLat,
  dropoffLng,
}: CameraControllerProps) {
  const map = useMap()
  const hp = pickupLat !== undefined && pickupLng !== undefined
  const hd = dropoffLat !== undefined && dropoffLng !== undefined

  useEffect(() => {
    if (!map) return

    if (hp && hd) {
      // Fit both markers in view with generous padding
      const north = Math.max(pickupLat!, dropoffLat!)
      const south = Math.min(pickupLat!, dropoffLat!)
      const east = Math.max(pickupLng!, dropoffLng!)
      const west = Math.min(pickupLng!, dropoffLng!)
      // Add a small buffer so markers aren't right at the edge
      const latPad = Math.max((north - south) * 0.25, 0.004)
      const lngPad = Math.max((east - west) * 0.25, 0.004)
      map.fitBounds(
        {
          north: north + latPad,
          south: south - latPad,
          east: east + lngPad,
          west: west - lngPad,
        },
        /* pixel padding */ 40,
      )
    } else if (hd) {
      // User just set the dropoff — zoom to it
      map.panTo({ lat: dropoffLat!, lng: dropoffLng! })
      map.setZoom(16)
    } else if (hp) {
      // Only pickup known — zoom to it
      map.panTo({ lat: pickupLat!, lng: pickupLng! })
      map.setZoom(15)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, pickupLat, pickupLng, dropoffLat, dropoffLng])

  return null
}

// ---------------------------------------------------------------------------
// RouteLayer — draws the driving polyline between origin and destination.
// Must be rendered inside <Map> so that useMap() resolves correctly.
// ---------------------------------------------------------------------------
interface RouteLayerProps {
  originLat: number
  originLng: number
  destinationLat: number
  destinationLng: number
}

function RouteLayer({
  originLat,
  originLng,
  destinationLat,
  destinationLng,
}: RouteLayerProps) {
  const routesLib = useMapsLibrary("routes")
  const map = useMap()
  const serviceRef = useRef<google.maps.DirectionsService | null>(null)

  useEffect(() => {
    if (!routesLib || !map) return

    if (!serviceRef.current) {
      serviceRef.current = new routesLib.DirectionsService()
    }

    const renderer = new routesLib.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: "#4FC3F7",
        strokeWeight: 4,
        strokeOpacity: 0.85,
      },
    })
    renderer.setMap(map)

    serviceRef.current.route(
      {
        origin: { lat: originLat, lng: originLng },
        destination: { lat: destinationLat, lng: destinationLng },
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          renderer.setDirections(result)
        } else if (process.env.NODE_ENV !== "production") {
          console.warn("[RouteMap] DirectionsService failed:", status)
        }
      },
    )

    return () => {
      renderer.setMap(null)
    }
  }, [routesLib, map, originLat, originLng, destinationLat, destinationLng])

  return null
}

/**
 * Real Google Maps embed in satellite mode.
 * Shows pickup (blue dot) and dropoff (red pin) markers when co-ordinates
 * are available. Draws a driving route polyline between them via
 * DirectionsService when both points are set (unless noRoute is true).
 * Falls back to a Plett-centred view otherwise.
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
  routeOriginLat,
  routeOriginLng,
  routeDestinationLat,
  routeDestinationLng,
  noRoute = false,
  interactive = false,
  children,
}: RouteMapProps) {
  const h = variant === "full" ? "h-[52vh] min-h-[360px]" : "h-44"

  const hasPickup = pickupLat !== undefined && pickupLng !== undefined
  const hasDropoff = dropoffLat !== undefined && dropoffLng !== undefined

  // Resolve effective origin/destination for the route
  const originLat = routeOriginLat ?? pickupLat
  const originLng = routeOriginLng ?? pickupLng
  const destinationLat = routeDestinationLat ?? dropoffLat
  const destinationLng = routeDestinationLng ?? dropoffLng

  const hasRoute =
    !noRoute &&
    originLat !== undefined &&
    originLng !== undefined &&
    destinationLat !== undefined &&
    destinationLng !== undefined

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
        gestureHandling={interactive ? "cooperative" : "none"}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Camera controller — pans/zooms when pickup/dropoff change */}
        <CameraController
          pickupLat={pickupLat}
          pickupLng={pickupLng}
          dropoffLat={dropoffLat}
          dropoffLng={dropoffLng}
        />

        {/* Route polyline — only when both endpoints are known */}
        {hasRoute && (
          <RouteLayer
            originLat={originLat!}
            originLng={originLng!}
            destinationLat={destinationLat!}
            destinationLng={destinationLng!}
          />
        )}

        {/* Pickup marker — glowing blue dot */}
        {hasPickup && (
          <Marker
            position={{ lat: pickupLat!, lng: pickupLng! }}
            title={pickupLabel}
            icon={{
              url:
                "data:image/svg+xml," +
                encodeURIComponent(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22">' +
                    '<circle cx="11" cy="11" r="7" fill="#2196F3" stroke="#fff" stroke-width="3"/>' +
                    '<circle cx="11" cy="11" r="11" fill="rgba(33,150,243,0.25)"/>' +
                  "</svg>",
                ),
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              scaledSize: { width: 22, height: 22 } as any,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              anchor: { x: 11, y: 11 } as any,
            }}
          />
        )}

        {/* Dropoff marker — red teardrop pin */}
        {hasDropoff && (
          <Marker
            position={{ lat: dropoffLat!, lng: dropoffLng! }}
            title={dropoffLabel}
            icon={{
              url:
                "data:image/svg+xml," +
                encodeURIComponent(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36">' +
                    '<path d="M14 1C7.92 1 3 5.92 3 12c0 9 11 23 11 23s11-14 11-23C25 5.92 20.08 1 14 1z"' +
                    ' fill="#F44336" stroke="#fff" stroke-width="2"/>' +
                    '<circle cx="14" cy="12" r="4" fill="#fff"/>' +
                  "</svg>",
                ),
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              scaledSize: { width: 28, height: 36 } as any,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              anchor: { x: 14, y: 36 } as any,
            }}
          />
        )}

        {/* Additional markers/overlays passed by parent (e.g. live DriverMarker) */}
        {children}
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
