"use client"

/**
 * PlacesAutocomplete
 * Wraps the Google Maps Places Autocomplete API to provide a styled, mobile-
 * first address-search input with a dropdown suggestions list.
 *
 * Requires <APIProvider apiKey={...}> somewhere above in the tree.
 * Falls back gracefully to a plain input if the library hasn't loaded yet.
 */

import { useState, useCallback, useRef, useEffect } from "react"
import { useMapsLibrary } from "@vis.gl/react-google-maps"
import { MapPin, CircleDot, X, Loader2, Navigation } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PlaceResult {
  address: string
  lat?: number
  lng?: number
  placeId?: string
}

interface PlacesAutocompleteProps {
  value: string
  onChange: (result: PlaceResult) => void
  placeholder?: string
  label: string
  icon?: "pickup" | "dropoff" | "stop"
  className?: string
  /** Called when user taps "Use my location" — parent handles geolocation */
  onUseCurrentLocation?: () => void
  /** Shows a loading spinner on the "Use my location" button */
  locating?: boolean
}

// Plettenberg Bay bias centre — keeps suggestions local by default
const PLETT_CENTRE = { lat: -34.0527, lng: 23.3716 }
const BIAS_RADIUS_M = 80_000 // 80 km covers Garden Route airports

export function PlacesAutocomplete({
  value,
  onChange,
  placeholder = "Search address, restaurant or business",
  label,
  icon = "stop",
  className,
  onUseCurrentLocation,
  locating = false,
}: PlacesAutocompleteProps) {
  const placesLib = useMapsLibrary("places")

  const [inputValue, setInputValue] = useState(value)
  const [predictions, setPredictions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const autocompleteRef = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesRef = useRef<google.maps.places.PlacesService | null>(null)
  const dummyRef = useRef<HTMLDivElement | null>(null)

  // Initialise services once the Places library is loaded
  useEffect(() => {
    if (!placesLib) return
    autocompleteRef.current = new placesLib.AutocompleteService()
    if (!dummyRef.current) dummyRef.current = document.createElement("div")
    placesRef.current = new placesLib.PlacesService(dummyRef.current)
  }, [placesLib])

  // Sync external value resets (e.g. wizard resets)
  useEffect(() => {
    setInputValue(value)
  }, [value])

  const fetchPredictions = useCallback(
    (text: string) => {
      if (!autocompleteRef.current || text.trim().length < 2) {
        setPredictions([])
        setOpen(false)
        return
      }
      setLoading(true)
      autocompleteRef.current.getPlacePredictions(
        {
          input: text,
          // Bias — not restrict — so George/Cape Town airports work too
          locationBias: new google.maps.Circle({
            center: PLETT_CENTRE,
            radius: BIAS_RADIUS_M,
          }),
          componentRestrictions: { country: "za" },
        },
        (results, status) => {
          setLoading(false)
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            results?.length
          ) {
            setPredictions(results)
            setOpen(true)
          } else {
            setPredictions([])
            setOpen(false)
          }
        },
      )
    },
    [],
  )

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const text = e.target.value
    setInputValue(text)
    // Immediately propagate the raw text so the wizard state stays in sync
    onChange({ address: text })
    fetchPredictions(text)
  }

  function handleSelect(pred: google.maps.places.AutocompletePrediction) {
    const formatted = pred.description
    setInputValue(formatted)
    setOpen(false)
    setPredictions([])

    // Resolve lat/lng via PlacesService.getDetails
    placesRef.current?.getDetails(
      { placeId: pred.place_id, fields: ["geometry", "formatted_address"] },
      (place, status) => {
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          place?.geometry?.location
        ) {
          onChange({
            address: place.formatted_address ?? formatted,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            placeId: pred.place_id,
          })
        } else {
          onChange({ address: formatted })
        }
      },
    )
  }

  function handleClear() {
    setInputValue("")
    setPredictions([])
    setOpen(false)
    onChange({ address: "" })
  }

  const IconEl =
    icon === "pickup" ? (
      <CircleDot className="h-4 w-4 text-primary" />
    ) : (
      <MapPin
        className={cn(
          "h-4 w-4",
          icon === "dropoff" ? "text-accent-foreground" : "text-muted-foreground",
        )}
      />
    )

  return (
    <div className={cn("relative", className)}>
      <label className="flex items-center gap-3 rounded-2xl bg-secondary p-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card ring-1 ring-border">
          {loading || locating ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            IconEl
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <div className="flex items-center gap-1">
            <input
              value={inputValue}
              onChange={handleChange}
              onFocus={() =>
                inputValue.trim().length > 1 &&
                predictions.length > 0 &&
                setOpen(true)
              }
              // Delay close so mousedown on option fires first
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder={placeholder}
              autoComplete="off"
              className="w-full bg-transparent py-0.5 text-[14px] font-medium outline-none placeholder:text-muted-foreground/70"
            />
            {inputValue && (
              <button
                type="button"
                // Use mousedown to fire before onBlur
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleClear()
                }}
                aria-label="Clear"
                className="shrink-0 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </span>

        {/* "Use my location" button — only shown on pickup field when empty */}
        {onUseCurrentLocation && !inputValue && (
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              onUseCurrentLocation()
            }}
            aria-label="Use my current location"
            className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
          >
            <Navigation className="h-4 w-4" />
          </button>
        )}
      </label>

      {/* Suggestions dropdown */}
      {open && predictions.length > 0 && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]"
        >
          {predictions.map((pred) => (
            <li key={pred.place_id} role="option" aria-selected={false}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleSelect(pred)
                }}
                className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors active:bg-secondary/80"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold leading-tight">
                    {pred.structured_formatting.main_text}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {pred.structured_formatting.secondary_text}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
