"use client"

import { cn } from "@/lib/utils"

interface RouteMapProps {
  pickupLabel?: string
  dropoffLabel?: string
  className?: string
  /** Display in a tall "uber-like" full screen style */
  variant?: "compact" | "full"
}

/**
 * Stylised map preview. Uses an SVG with a soft blue grid and a curved
 * route between pickup and dropoff pins — enough to feel map-like without
 * depending on a maps SDK. A real Google Maps integration can slot in here.
 */
export function RouteMap({
  pickupLabel = "Pickup location",
  dropoffLabel = "Drop off location",
  className,
  variant = "compact",
}: RouteMapProps) {
  const h = variant === "full" ? "h-[50vh] min-h-[340px]" : "h-44"
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-3xl bg-primary/5",
        h,
        className,
      )}
    >
      <svg
        viewBox="0 0 400 240"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label="Route preview from pickup to drop off"
      >
        <defs>
          <pattern
            id="grid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke="var(--primary)"
              strokeOpacity="0.08"
              strokeWidth="1"
            />
          </pattern>
          <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
        <rect width="400" height="240" fill="var(--secondary)" />
        <rect width="400" height="240" fill="url(#grid)" />
        {/* Fake roads */}
        <path
          d="M0 190 C 80 180, 140 200, 220 170 S 360 130, 400 150"
          stroke="var(--primary)"
          strokeOpacity="0.15"
          strokeWidth="14"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M20 60 C 100 70, 160 50, 240 80 S 360 120, 400 100"
          stroke="var(--primary)"
          strokeOpacity="0.08"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
        />
        {/* Main route */}
        <path
          d="M60 180 C 140 160, 180 60, 340 70"
          stroke="url(#routeGrad)"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="0"
        />
        {/* Pickup pin */}
        <g transform="translate(60,180)">
          <circle r="10" fill="var(--card)" />
          <circle r="6" fill="var(--primary)" />
        </g>
        {/* Dropoff pin */}
        <g transform="translate(340,70)">
          <path
            d="M0 -18 c-8 0 -14 6 -14 14 0 10 14 22 14 22 s14 -12 14 -22 c0 -8 -6 -14 -14 -14 z"
            fill="var(--accent)"
            stroke="var(--card)"
            strokeWidth="2"
          />
          <circle cy="-4" r="4" fill="var(--card)" />
        </g>
      </svg>

      {/* Labels overlay */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3">
        <div className="glass-strong rounded-2xl border border-border p-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="truncate text-[12px] font-medium text-foreground">
              {pickupLabel}
            </span>
          </div>
          <div className="ml-[5px] my-1 h-3 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
            <span className="truncate text-[12px] font-medium text-foreground">
              {dropoffLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
