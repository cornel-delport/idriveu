import { MapPin, Navigation } from "lucide-react"

interface RouteMapPreviewProps {
  pickup?: string
  dropoff?: string
  distanceKm?: number
  durationMinutes?: number
  className?: string
}

/**
 * Placeholder map preview that mimics a Google Maps route panel.
 * Replace with a real <GoogleMap /> + DirectionsRenderer once
 * NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is configured.
 */
export function RouteMapPreview({
  pickup,
  dropoff,
  distanceKm,
  durationMinutes,
  className,
}: RouteMapPreviewProps) {
  return (
    <div
      className={`relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border bg-card ${className ?? ""}`}
    >
      <svg
        aria-hidden
        viewBox="0 0 400 250"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="sea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.88 0.04 200)" />
            <stop offset="100%" stopColor="oklch(0.82 0.05 200)" />
          </linearGradient>
          <linearGradient id="land" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.96 0.015 85)" />
            <stop offset="100%" stopColor="oklch(0.92 0.025 80)" />
          </linearGradient>
          <pattern
            id="grid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke="oklch(0.88 0.02 80)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="400" height="250" fill="url(#land)" />
        <rect width="400" height="250" fill="url(#grid)" />
        <path
          d="M0,170 C80,160 140,180 200,175 C270,168 330,185 400,175 L400,250 L0,250 Z"
          fill="url(#sea)"
          opacity="0.9"
        />
        <path
          d="M0,165 C80,158 140,178 200,172 C270,164 330,182 400,172"
          stroke="oklch(0.6 0.06 200)"
          strokeWidth="1"
          fill="none"
          opacity="0.4"
        />
        {/* Roads */}
        <path
          d="M40,40 C90,60 120,100 180,110 C240,120 280,80 360,90"
          stroke="oklch(0.85 0.02 80)"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M50,200 C130,190 200,160 260,150 C320,140 350,120 380,100"
          stroke="oklch(0.85 0.02 80)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        {/* Route line */}
        <path
          d="M70,75 C110,90 130,120 180,125 C230,130 280,110 320,115"
          stroke="oklch(0.42 0.07 190)"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="0"
        />
        <path
          d="M70,75 C110,90 130,120 180,125 C230,130 280,110 320,115"
          stroke="oklch(0.74 0.11 70)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="6 6"
          opacity="0.9"
        />
        {/* Pickup dot */}
        <circle cx="70" cy="75" r="7" fill="oklch(0.42 0.07 190)" />
        <circle cx="70" cy="75" r="3" fill="#fff" />
        {/* Dropoff dot */}
        <circle cx="320" cy="115" r="7" fill="oklch(0.74 0.11 70)" />
        <circle cx="320" cy="115" r="3" fill="#fff" />
      </svg>

      <div className="relative flex h-full flex-col justify-between p-4">
        <div className="flex items-start gap-3 rounded-xl bg-background/95 p-3 shadow-sm ring-1 ring-border backdrop-blur">
          <div className="flex size-8 flex-none items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MapPin className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Pickup
            </p>
            <p className="truncate text-sm font-medium">
              {pickup || "Set pickup location"}
            </p>
          </div>
        </div>

        <div className="self-end">
          <div className="flex items-start gap-3 rounded-xl bg-background/95 p-3 shadow-sm ring-1 ring-border backdrop-blur">
            <div className="flex size-8 flex-none items-center justify-center rounded-lg bg-accent/20 text-accent-foreground">
              <Navigation className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Dropoff
              </p>
              <p className="truncate text-sm font-medium">
                {dropoff || "Set dropoff location"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {distanceKm !== undefined && durationMinutes !== undefined && (
        <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-md">
          <span>{distanceKm.toFixed(1)} km</span>
          <span className="opacity-60">·</span>
          <span>{durationMinutes} min</span>
        </div>
      )}
    </div>
  )
}
