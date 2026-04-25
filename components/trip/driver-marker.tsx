"use client"

import { Marker } from "@vis.gl/react-google-maps"

interface DriverMarkerProps {
  lat: number
  lng: number
  heading?: number | null
}

/**
 * Car icon marker that rotates based on driver heading.
 * Uses legacy Marker (no Map ID required) with an inline SVG icon.
 */
export function DriverMarker({ lat, lng, heading }: DriverMarkerProps) {
  const rotation = heading ?? 0

  const svgIcon =
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">` +
        `<g transform="rotate(${rotation} 20 20)">` +
        `<circle cx="20" cy="20" r="18" fill="#1565C0" stroke="#fff" stroke-width="3"/>` +
        `<text x="20" y="26" text-anchor="middle" font-size="18">🚗</text>` +
        `</g>` +
        `</svg>`,
    )

  return (
    <Marker
      position={{ lat, lng }}
      title="Driver location"
      icon={{
        url: svgIcon,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        scaledSize: { width: 40, height: 40 } as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        anchor: { x: 20, y: 20 } as any,
      }}
    />
  )
}
