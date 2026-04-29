"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  MapPin,
  Clock,
  CalendarDays,
  Zap,
  CalendarClock,
  ShieldCheck,
  CreditCard,
  Loader2,
  ArrowRight,
  Lock,
  Route,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { IconButton } from "@/components/ui-icon"
import { PlacesAutocomplete, type PlaceResult } from "@/components/booking/places-autocomplete"
import { formatZAR } from "@/lib/pricing"

interface Restaurant {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  restaurantCode: string
  waiveCallOutFee: boolean
}

interface QuoteResult {
  distanceKm: number
  durationMinutes: number
  isNight: boolean
  estimatedPrice: number
  breakdown: {
    baseFee: number
    perKmTotal: number
    nightSurcharge: number
    callOutWaived: boolean
  }
}

interface Props {
  restaurant: Restaurant
  qrCodeId?: string | null
  isAuthenticated: boolean
}

export function RestaurantPickupQuickBook({
  restaurant,
  qrCodeId,
  isAuthenticated,
}: Props) {
  const router = useRouter()

  const [dropoff, setDropoff] = useState<PlaceResult>({ address: "" })
  const [pickupTimeType, setPickupTimeType] = useState<"asap" | "scheduled">("asap")
  const [scheduledTime, setScheduledTime] = useState<string>(() => {
    const d = new Date(Date.now() + 30 * 60 * 1000)
    const pad = (n: number) => String(n).padStart(2, "0")
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  })

  const [quote, setQuote] = useState<QuoteResult | null>(null)
  const [quoting, setQuoting] = useState(false)
  const [bookPending, startBook] = useTransition()

  // Auto-quote whenever we have full dropoff coords
  useEffect(() => {
    if (
      typeof dropoff.lat !== "number" ||
      typeof dropoff.lng !== "number" ||
      !dropoff.address
    ) {
      setQuote(null)
      return
    }
    let cancelled = false
    setQuoting(true)
    fetch("/api/restaurant-qr/price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantCode: restaurant.restaurantCode,
        dropoffAddress: dropoff.address,
        dropoffLat: dropoff.lat,
        dropoffLng: dropoff.lng,
        pickupTimeType,
        scheduledTime:
          pickupTimeType === "scheduled"
            ? new Date(scheduledTime).toISOString()
            : undefined,
      }),
    })
      .then((r) => r.json())
      .then((data: QuoteResult | { error: string }) => {
        if (cancelled) return
        if ("error" in data) {
          setQuote(null)
        } else {
          setQuote(data)
        }
      })
      .catch(() => !cancelled && setQuote(null))
      .finally(() => !cancelled && setQuoting(false))
    return () => {
      cancelled = true
    }
  }, [dropoff, pickupTimeType, scheduledTime, restaurant.restaurantCode])

  function handleBook() {
    if (!isAuthenticated) {
      const next = encodeURIComponent(
        `/qr/restaurant/${restaurant.restaurantCode}`,
      )
      router.push(`/login?next=${next}`)
      return
    }
    if (!quote || typeof dropoff.lat !== "number" || typeof dropoff.lng !== "number") {
      toast.error("Choose your dropoff location first")
      return
    }

    startBook(async () => {
      try {
        const bookRes = await fetch("/api/restaurant-qr/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            restaurantCode: restaurant.restaurantCode,
            dropoffAddress: dropoff.address,
            dropoffLat: dropoff.lat,
            dropoffLng: dropoff.lng,
            pickupTimeType,
            scheduledTime:
              pickupTimeType === "scheduled"
                ? new Date(scheduledTime).toISOString()
                : undefined,
            restaurantQrCodeId: qrCodeId ?? undefined,
          }),
        })
        const bookData = (await bookRes.json()) as
          | { bookingId: string; reference: string; estimatedPrice: number; id?: string }
          | { error: string }
        if ("error" in bookData) {
          toast.error(bookData.error)
          return
        }
        // Some routes return id, others bookingId — normalise
        const bookingId =
          (bookData as { bookingId?: string; id?: string }).bookingId ??
          (bookData as { bookingId?: string; id?: string }).id
        if (!bookingId) {
          toast.error("Booking failed — no id returned")
          return
        }

        const checkoutRes = await fetch("/api/paystack/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        })
        const checkoutData = (await checkoutRes.json()) as
          | { authorizationUrl: string }
          | { error: string }
        if ("error" in checkoutData) {
          toast.error(checkoutData.error)
          return
        }
        // Hand off to Paystack hosted checkout
        window.location.assign(checkoutData.authorizationUrl)
      } catch {
        toast.error("Could not start checkout. Try again.")
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Locked pickup banner — restaurant context */}
      <div className="card-dark rounded-3xl p-4">
        <div className="flex items-start gap-3">
          <span className="chip-glass flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
            <MapPin className="h-5 w-5 text-glow" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-glow">
              <Lock className="h-3 w-3" /> Locked pickup
            </p>
            <p className="mt-0.5 truncate text-[16px] font-semibold text-white">
              {restaurant.name}
            </p>
            <p className="mt-0.5 truncate text-[12px] text-white/70">
              {restaurant.address}
            </p>
          </div>
        </div>
        <p className="mt-3 rounded-xl bg-white/5 px-3 py-2 text-[12px] leading-snug text-white/80">
          Your pickup is set to this restaurant. We&apos;ll meet you here and
          drive you home in your own car.
        </p>
      </div>

      {/* Dropoff */}
      <PlacesAutocomplete
        value={dropoff.address}
        onChange={setDropoff}
        label="Where are you going?"
        placeholder="Home address, hotel, etc."
        icon="dropoff"
      />

      {/* Time picker */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          When?
        </p>
        <div className="grid grid-cols-2 gap-2">
          <TimeChip
            icon={Zap}
            label="ASAP"
            sub="In ~10 min"
            active={pickupTimeType === "asap"}
            onClick={() => setPickupTimeType("asap")}
          />
          <TimeChip
            icon={CalendarClock}
            label="Schedule"
            sub="Pick a time"
            active={pickupTimeType === "scheduled"}
            onClick={() => setPickupTimeType("scheduled")}
          />
        </div>
        {pickupTimeType === "scheduled" && (
          <label className="flex items-center gap-3 rounded-2xl bg-secondary p-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CalendarDays className="h-5 w-5" />
            </span>
            <span className="flex flex-1 flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Pickup time
              </span>
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="bg-transparent text-[15px] font-medium text-foreground outline-none"
              />
            </span>
          </label>
        )}
      </div>

      {/* Price card */}
      <div
        className={cn(
          "rounded-3xl border border-border bg-card p-4 transition-opacity",
          (!quote || quoting) && "opacity-90",
        )}
      >
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Price estimate
          </p>
          {quoting && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Updating
            </span>
          )}
        </div>

        {quote ? (
          <>
            <p className="mt-1 text-[32px] font-bold leading-none tracking-tight text-foreground">
              {formatZAR(quote.estimatedPrice)}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
              <Stat icon={Route} label="Distance" value={`${quote.distanceKm} km`} />
              <Stat
                icon={Clock}
                label="Trip time"
                value={`${quote.durationMinutes} min`}
              />
            </div>
            <div className="mt-3 space-y-1.5 border-t border-border pt-3 text-[12px]">
              <Line
                label={
                  quote.breakdown.callOutWaived ? "Call-out (waived)" : "Call-out fee"
                }
                value={formatZAR(quote.breakdown.baseFee)}
                muted={quote.breakdown.callOutWaived}
              />
              <Line
                label={`Distance (${quote.distanceKm} km)`}
                value={formatZAR(quote.breakdown.perKmTotal)}
              />
              {quote.breakdown.nightSurcharge > 0 && (
                <Line
                  label="Night surcharge"
                  value={formatZAR(quote.breakdown.nightSurcharge)}
                />
              )}
            </div>
          </>
        ) : (
          <p className="mt-2 text-[13px] text-muted-foreground">
            Choose your dropoff above to see your price.
          </p>
        )}
      </div>

      {/* Confirm + pay */}
      <IconButton
        icon={CreditCard}
        iconRight={ArrowRight}
        variant="glow"
        size="lg"
        fullWidth
        disabled={!quote || quoting}
        loading={bookPending}
        loadingLabel="Starting checkout…"
        onClick={handleBook}
      >
        {isAuthenticated
          ? quote
            ? `Confirm & Pay ${formatZAR(quote.estimatedPrice)}`
            : "Confirm & Pay"
          : "Sign in to confirm"}
      </IconButton>

      <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" />
        Don&apos;t risk driving over the legal alcohol limit.
      </p>
    </div>
  )
}

function TimeChip({
  icon: Icon,
  label,
  sub,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  sub: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "tap flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors",
        active
          ? "border-primary bg-primary/10"
          : "border-border bg-card hover:bg-secondary",
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full",
          active ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span className="block text-[14px] font-semibold text-foreground">{label}</span>
        <span className="block text-[11px] text-muted-foreground">{sub}</span>
      </span>
    </button>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-[12px] font-semibold text-foreground">{value}</p>
      </div>
    </div>
  )
}

function Line({
  label,
  value,
  muted,
}: {
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn("text-muted-foreground", muted && "line-through opacity-60")}>
        {label}
      </span>
      <span className={cn("font-medium text-foreground", muted && "line-through opacity-60")}>
        {value}
      </span>
    </div>
  )
}
