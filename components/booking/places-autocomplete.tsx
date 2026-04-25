"use client"

/**
 * PlacesAutocomplete
 * Styled address-search input with dropdown suggestions.
 *
 * Calls server-side API routes (/api/places/autocomplete and /api/places/details)
 * which proxy to Google's Places API (New) with a fallback to the legacy Places API.
 * No @vis.gl/react-google-maps library required for autocomplete functionality.
 *
 * Can be rendered inside or outside <APIProvider> — makes no difference.
 */

import { useState, useCallback, useEffect, useRef } from "react"
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

interface Suggestion {
  placeId: string
  mainText: string
  secondaryText: string
  fullText: string
}

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
  const [inputValue, setInputValue] = useState(value)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync external value resets (e.g. wizard resets the field)
  useEffect(() => {
    setInputValue(value)
  }, [value])

  const fetchSuggestions = useCallback(async (text: string) => {
    if (text.trim().length < 2) {
      setSuggestions([])
      setOpen(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(
        `/api/places/autocomplete?q=${encodeURIComponent(text)}&lang=en`,
      )
      if (!res.ok) throw new Error(`Autocomplete API returned ${res.status}`)

      const data = (await res.json()) as { results: Suggestion[] }
      const items = data.results ?? []

      setSuggestions(items)
      setActiveIndex(-1)
      setOpen(true) // keep open to show results OR "no results" message
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[PlacesAutocomplete] fetchSuggestions failed:", err)
      }
      setSuggestions([])
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const text = e.target.value
    setInputValue(text)
    // Propagate raw text immediately so wizard state stays in sync
    onChange({ address: text })

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(text), 280)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(suggestions[activeIndex])
    } else if (e.key === "Escape") {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  async function handleSelect(suggestion: Suggestion) {
    const displayText = suggestion.fullText || suggestion.mainText
    setInputValue(displayText)
    setOpen(false)
    setSuggestions([])
    setActiveIndex(-1)

    // Immediately give the parent the address text so the UI feels instant
    onChange({ address: displayText, placeId: suggestion.placeId })

    // Then fetch lat/lng in the background
    try {
      const res = await fetch(
        `/api/places/details?id=${encodeURIComponent(suggestion.placeId)}`,
      )
      if (!res.ok) throw new Error(`Details API returned ${res.status}`)

      const data = (await res.json()) as { lat: number; lng: number; address: string }
      onChange({
        address: data.address || displayText,
        lat: data.lat,
        lng: data.lng,
        placeId: suggestion.placeId,
      })
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[PlacesAutocomplete] handleSelect details fetch failed:", err)
      }
      // Keep the address-only result already sent above
    }
  }

  function handleClear() {
    setInputValue("")
    setSuggestions([])
    setOpen(false)
    setActiveIndex(-1)
    onChange({ address: "" })
    inputRef.current?.focus()
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
              ref={inputRef}
              value={inputValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (inputValue.trim().length >= 2 && suggestions.length > 0) {
                  setOpen(true)
                } else if (inputValue.trim().length >= 2) {
                  // Re-fetch if we have text but no suggestions cached
                  fetchSuggestions(inputValue)
                }
              }}
              // Delay close so mousedown on suggestion fires first
              onBlur={() =>
                setTimeout(() => {
                  setOpen(false)
                  setActiveIndex(-1)
                }, 180)
              }
              placeholder={placeholder}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="w-full bg-transparent py-0.5 text-[14px] font-medium outline-none placeholder:text-muted-foreground/70"
            />
            {inputValue && (
              <button
                type="button"
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

        {/* "Use my location" button — only on pickup field when empty */}
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
      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full z-[200] mt-1.5 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_8px_40px_-8px_rgba(0,0,0,0.35)]"
        >
          {suggestions.map((s, idx) => (
            <li key={s.placeId} role="option" aria-selected={activeIndex === idx}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleSelect(s)
                }}
                className={cn(
                  "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                  activeIndex === idx
                    ? "bg-secondary"
                    : "hover:bg-secondary/60 active:bg-secondary/80",
                )}
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold leading-tight text-foreground">
                    {s.mainText}
                  </p>
                  {s.secondaryText && (
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {s.secondaryText}
                    </p>
                  )}
                </div>
              </button>
            </li>
          ))}

          {/* Required Google attribution */}
          <li className="flex items-center justify-end border-t border-border/40 px-4 py-1.5">
            <span className="text-[10px] text-muted-foreground/60">Powered by Google</span>
          </li>
        </ul>
      )}

      {/* Loading state — shown when fetching and no previous suggestions to show */}
      {loading && suggestions.length === 0 && inputValue.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-[200] mt-1.5 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.35)]">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          <span className="text-[13px] text-muted-foreground">Searching…</span>
        </div>
      )}

      {/* No results state */}
      {!loading && open && suggestions.length === 0 && inputValue.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-[200] mt-1.5 rounded-2xl border border-border bg-card px-4 py-3 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.35)]">
          <p className="text-[13px] text-muted-foreground">No results found</p>
        </div>
      )}
    </div>
  )
}
