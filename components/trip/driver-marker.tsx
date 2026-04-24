"use client"

import { AdvancedMarker } from "@vis.gl/react-google-maps"

interface DriverMarkerProps {
  lat: number
  lng: number
  heading?: number | null
}

/**
 * Car icon marker that rotates based on driver heading.
 */
export function DriverMarker({ lat, lng, heading }: DriverMarkerProps) {
  const rotation = heading ?? 0

  return (
    <AdvancedMarker position={{ lat, lng }}>
      <div
        style={{
          transform: `rotate(${rotation}deg)`,
          width: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1565C0",
          borderRadius: "50%",
          border: "3px solid #fff",
          boxShadow: "0 0 0 4px rgba(79,195,247,0.35), 0 4px 16px rgba(0,0,0,0.5)",
          fontSize: 18,
        }}
        aria-label="Driver location"
      >
        🚗
      </div>
    </AdvancedMarker>
  )
}
