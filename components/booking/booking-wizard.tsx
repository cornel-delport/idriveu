"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock,
  MapPin,
  Plus,
  Trash2,
  X,
  Car,
  UserCheck,
  Baby,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react"
import { APIProvider } from "@vis.gl/react-google-maps"
import { useSession } from "next-auth/react"
import { services, type ServiceId, getService } from "@/lib/services"
import { estimatePrice, formatZAR } from "@/lib/pricing"
import { RouteMap } from "@/components/booking/route-map"
import { ServiceCard } from "@/components/service-card"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { createBooking } from "@/actions/bookings"
import {
  PlacesAutocomplete,
  type PlaceResult,
} from "@/components/booking/places-autocomplete"

type Step = 0 | 1 | 2 | 3 | 4

/** A location with optional resolved co-ordinates */
interface Loc {
  address: string
  lat?: number
  lng?: number
}

interface BookingState {
  serviceId: ServiceId
  pickup: Loc
  dropoff: Loc
  stops: Loc[]
  date: string
  time: string
  passengers: number
  usesCustomerVehicle: boolean
  requiresFemaleDriver: boolean
  childPickup: boolean
  notes: string
  name: string
  phone: string
  email: string
  payment: "card" | "cash" | "eft"
}

const stepLabels = ["Service", "Route", "When", "Options", "Confirm"] as const

export function BookingWizard() {
  const router = useRouter()
  const params = useSearchParams()
  const [step, setStep] = useState<Step>(0)
  const { data: session } = useSession()

  const defaults = useMemo(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 60)
    const pad = (n: number) => String(n).padStart(2, "0")
    return {
      date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
      time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
    }
  }, [])

  const [state, setState] = useState<BookingState>(() => ({
    serviceId: (params.get("service") as ServiceId) || "drive-me-home",
    pickup: { address: params.get("pickup") || "" },
    dropoff: { address: params.get("dropoff") || "" },
    stops: [],
    date: params.get("date") || defaults.date,
    time: params.get("time") || defaults.time,
    passengers: 2,
    usesCustomerVehicle: true,
    requiresFemaleDriver: false,
    childPickup: false,
    notes: "",
    name: "",
    phone: "",
    email: "",
    payment: "card",
  }))

  // Derived distance/duration estimate (mocked until real routing is wired)
  const estimate = useMemo(() => {
    const svc = getService(state.serviceId)!
    const baseKm =
      state.pickup.address && state.dropoff.address
        ? 8 + state.dropoff.address.length % 14
        : 6
    const extraStops = state.stops.filter((s) => s.address).length
    const distanceKm = baseKm + extraStops * 6
    const durationMinutes = Math.round(distanceKm * 2.3)
    const [h] = state.time.split(":").map(Number)
    const isNight = !Number.isNaN(h) && (h >= 22 || h < 5)
    const price = estimatePrice({
      serviceId: state.serviceId,
      distanceKm,
      durationMinutes,
      isNight,
    })
    return { distanceKm, durationMinutes, price, isNight, service: svc }
  }, [state])

  function update<K extends keyof BookingState>(
    key: K,
    value: BookingState[K],
  ) {
    setState((s) => ({ ...s, [key]: value }))
  }

  function next() {
    setStep((s) => Math.min(4, (s + 1) as Step))
  }
  function back() {
    if (step === 0) router.back()
    else setStep((s) => Math.max(0, (s - 1) as Step))
  }

  const canProceed = useMemo(() => {
    if (step === 0) return Boolean(state.serviceId)
    if (step === 1)
      return state.pickup.address.length > 1 && state.dropoff.address.length > 1
    if (step === 2) return Boolean(state.date && state.time)
    if (step === 3) return true
    return true
  }, [step, state])

  // Pre-fill contact details from session when it loads
  useEffect(() => {
    if (session?.user) {
      setState((s) => ({
        ...s,
        name: s.name || session.user.name || "",
        phone: s.phone || (session.user as { phone?: string }).phone || "",
        email: s.email || session.user.email || "",
      }))
    }
  }, [session])

  // Scroll to top on step change
  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0 })
  }, [step])

  async function handleConfirm() {
    const result = await createBooking({
      serviceId: state.serviceId,
      pickupAddress: state.pickup.address,
      pickupLat: state.pickup.lat,
      pickupLng: state.pickup.lng,
      dropoffAddress: state.dropoff.address,
      dropoffLat: state.dropoff.lat,
      dropoffLng: state.dropoff.lng,
      stops: state.stops
        .filter((s) => s.address)
        .map((s) => ({ address: s.address, lat: s.lat, lng: s.lng })),
      dateTime: `${state.date}T${state.time}:00`,
      passengerCount: state.passengers,
      usesCustomerVehicle: state.usesCustomerVehicle,
      requiresFemaleDriver: state.requiresFemaleDriver,
      childPickup: state.childPickup,
      distanceKm: estimate.distanceKm,
      durationMinutes: estimate.durationMinutes,
      estimatedPrice: estimate.price,
      notes: state.notes,
      paymentMethod: state.payment === "card" ? "cash" : (state.payment as "eft" | "cash"),
    })

    if ("error" in result) {
      toast.error(result.error)
      return
    }

    const payload = new URLSearchParams()
    payload.set("ref", result.reference)
    payload.set("service", state.serviceId)
    payload.set("pickup", state.pickup.address)
    payload.set("dropoff", state.dropoff.address)
    payload.set("date", state.date)
    payload.set("time", state.time)
    payload.set("price", String(estimate.price))
    payload.set("distance", String(estimate.distanceKm))
    payload.set("duration", String(estimate.durationMinutes))

    toast.success("Booking confirmed!")
    router.push(`/book/confirmation?${payload.toString()}`)
  }

  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""

  return (
    <APIProvider apiKey={mapsApiKey} libraries={["places"]}>
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Top bar with stepper */}
      <header className="sticky top-0 z-30 glass-strong border-b border-border/70">
        <div className="mx-auto flex max-w-xl items-center justify-between px-4 pt-3">
          <button
            onClick={back}
            aria-label="Go back"
            className="tap flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="text-[13px] font-medium text-muted-foreground">
            Step {step + 1} of {stepLabels.length}
            <span className="mx-2 text-border">·</span>
            <span className="text-foreground">{stepLabels[step]}</span>
          </span>
          <Link
            href="/"
            aria-label="Close"
            className="tap flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground"
          >
            <X className="h-4 w-4" />
          </Link>
        </div>
        {/* Progress */}
        <div className="mx-auto mt-3 flex max-w-xl gap-1 px-4 pb-3">
          {stepLabels.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i <= step ? "bg-primary" : "bg-secondary",
              )}
            />
          ))}
        </div>
      </header>

      {/* Step content */}
      <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-40 pt-4">
        {step === 0 && (
          <StepService
            serviceId={state.serviceId}
            onChange={(id) => update("serviceId", id)}
          />
        )}
        {step === 1 && (
          <StepRoute
            pickup={state.pickup}
            dropoff={state.dropoff}
            stops={state.stops}
            onPickup={(loc) => update("pickup", loc)}
            onDropoff={(loc) => update("dropoff", loc)}
            onStops={(locs) => update("stops", locs)}
          />
        )}
        {step === 2 && (
          <StepWhen
            date={state.date}
            time={state.time}
            passengers={state.passengers}
            onDate={(v) => update("date", v)}
            onTime={(v) => update("time", v)}
            onPassengers={(v) => update("passengers", v)}
          />
        )}
        {step === 3 && (
          <StepOptions
            state={state}
            onChange={(partial) => setState((s) => ({ ...s, ...partial }))}
          />
        )}
        {step === 4 && (
          <StepConfirm
            state={state}
            onChange={(partial) => setState((s) => ({ ...s, ...partial }))}
            estimate={estimate}
          />
        )}
      </main>

      {/* Sticky price + action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/80 glass-strong pb-safe">
        <div className="mx-auto max-w-xl px-4 pt-3">
          <div className="mb-2 flex items-end justify-between">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Estimated total
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[22px] font-semibold tracking-tight">
                  {formatZAR(estimate.price)}
                </span>
                <span className="text-[12px] text-muted-foreground">
                  {estimate.distanceKm.toFixed(1)} km ·{" "}
                  {estimate.durationMinutes} min
                </span>
              </div>
            </div>
            {estimate.isNight && (
              <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">
                Night rate
              </span>
            )}
          </div>
          {step < 4 ? (
            <button
              onClick={next}
              disabled={!canProceed}
              className={cn(
                "tap inline-flex h-13 w-full items-center justify-between rounded-2xl px-5 py-3.5 text-[15px] font-semibold",
                canProceed
                  ? "btn-glow-strong"
                  : "bg-secondary text-muted-foreground",
              )}
            >
              <span>Continue</span>
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  canProceed ? "bg-white/15" : "bg-card",
                )}
              >
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              className="tap btn-glow-strong inline-flex h-13 w-full items-center justify-between rounded-2xl px-5 py-3.5 text-[15px] font-semibold"
            >
              <span>Confirm &amp; request driver</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                <CheckCircle2 className="h-4 w-4" />
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
    </APIProvider>
  )
}

/* ------------------------ Steps ------------------------ */

function StepService({
  serviceId,
  onChange,
}: {
  serviceId: ServiceId
  onChange: (id: ServiceId) => void
}) {
  return (
    <section>
      <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
        What can we help you with?
      </h1>
      <p className="mt-1 text-[14px] text-muted-foreground">
        Choose a service — you can change it later.
      </p>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {services.map((s) => (
          <ServiceCard
            key={s.id}
            service={s}
            as="select"
            active={serviceId === s.id}
            onSelect={onChange}
            compact
          />
        ))}
      </div>
    </section>
  )
}

function StepRoute({
  pickup,
  dropoff,
  stops,
  onPickup,
  onDropoff,
  onStops,
}: {
  pickup: Loc
  dropoff: Loc
  stops: Loc[]
  onPickup: (loc: PlaceResult) => void
  onDropoff: (loc: PlaceResult) => void
  onStops: (locs: Loc[]) => void
}) {
  function addStop() {
    onStops([...stops, { address: "" }])
  }
  function updateStop(i: number, loc: PlaceResult) {
    const next = [...stops]
    next[i] = loc
    onStops(next)
  }
  function removeStop(i: number) {
    onStops(stops.filter((_, idx) => idx !== i))
  }

  return (
    <section>
      <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
        Where to?
      </h1>
      <p className="mt-1 text-[14px] text-muted-foreground">
        Search a restaurant, business or address.
      </p>

      {/* Map preview */}
      <div className="mt-4">
        <RouteMap
          variant="full"
          pickupLabel={pickup.address || "Pickup location"}
          dropoffLabel={dropoff.address || "Drop off location"}
        />
      </div>

      {/* Address inputs with Places Autocomplete */}
      <div className="mt-4 flex flex-col gap-2 rounded-3xl border border-border bg-card p-3">
        <PlacesAutocomplete
          value={pickup.address}
          onChange={onPickup}
          label="Pickup"
          icon="pickup"
          placeholder="e.g. The Lookout Deck, Plett"
        />

        {stops.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <PlacesAutocomplete
              value={s.address}
              onChange={(loc) => updateStop(i, loc)}
              label={`Stop ${i + 1}`}
              icon="stop"
              placeholder="Add a stop"
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => removeStop(i)}
              aria-label="Remove stop"
              className="tap mt-0 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-muted-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        <PlacesAutocomplete
          value={dropoff.address}
          onChange={onDropoff}
          label="Drop off"
          icon="dropoff"
          placeholder="e.g. 14 Cormorant Drive, Plett"
        />

        <button
          type="button"
          onClick={addStop}
          className="tap inline-flex h-10 items-center gap-2 rounded-full bg-primary/10 px-3 text-[12px] font-semibold text-primary"
        >
          <Plus className="h-4 w-4" /> Add a stop
        </button>
      </div>
    </section>
  )
}

function StepWhen({
  date,
  time,
  passengers,
  onDate,
  onTime,
  onPassengers,
}: {
  date: string
  time: string
  passengers: number
  onDate: (v: string) => void
  onTime: (v: string) => void
  onPassengers: (v: number) => void
}) {
  return (
    <section>
      <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
        When do you need us?
      </h1>
      <p className="mt-1 text-[14px] text-muted-foreground">
        Schedule a pickup or ride as soon as possible.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <label className="flex items-center gap-3 rounded-2xl bg-secondary p-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-card ring-1 ring-border">
            <CalendarDays className="h-4 w-4 text-primary" />
          </span>
          <span className="flex-1">
            <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Date
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => onDate(e.target.value)}
              className="w-full bg-transparent py-0.5 text-[14px] font-medium outline-none"
            />
          </span>
        </label>
        <label className="flex items-center gap-3 rounded-2xl bg-secondary p-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-card ring-1 ring-border">
            <Clock className="h-4 w-4 text-primary" />
          </span>
          <span className="flex-1">
            <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Time
            </span>
            <input
              type="time"
              value={time}
              onChange={(e) => onTime(e.target.value)}
              className="w-full bg-transparent py-0.5 text-[14px] font-medium outline-none"
            />
          </span>
        </label>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-card p-4">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Passengers
          </div>
          <div className="mt-0.5 text-[18px] font-semibold tracking-tight">
            {passengers}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPassengers(Math.max(1, passengers - 1))}
            aria-label="Decrease passengers"
            className="tap flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground text-lg font-semibold"
          >
            −
          </button>
          <button
            onClick={() => onPassengers(Math.min(8, passengers + 1))}
            aria-label="Increase passengers"
            className="tap flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-semibold"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-primary/5 p-4 text-[13px] leading-relaxed text-foreground ring-1 ring-primary/10">
        <strong className="font-semibold">Heads up:</strong> evening pickups
        after 22:00 include a small night surcharge.
      </div>
    </section>
  )
}

function StepOptions({
  state,
  onChange,
}: {
  state: BookingState
  onChange: (p: Partial<BookingState>) => void
}) {
  const toggles: {
    key: keyof BookingState
    icon: React.ElementType
    title: string
    body: string
  }[] = [
    {
      key: "usesCustomerVehicle",
      icon: Car,
      title: "Use my own car",
      body: "Our driver drives your vehicle. No ride-share vehicle arrives.",
    },
    {
      key: "requiresFemaleDriver",
      icon: UserCheck,
      title: "Request a female driver",
      body: "Subject to availability in your area.",
    },
    {
      key: "childPickup",
      icon: Baby,
      title: "Child pickup",
      body: "Authorised adult confirmation + WhatsApp alerts at pickup/drop off.",
    },
  ]

  return (
    <section>
      <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
        Any preferences?
      </h1>
      <p className="mt-1 text-[14px] text-muted-foreground">
        Toggle what you need — we&apos;ll sort the rest.
      </p>

      <ul className="mt-5 flex flex-col gap-3">
        {toggles.map((t) => {
          const Icon = t.icon
          const active = Boolean(state[t.key])
          return (
            <li key={String(t.key)}>
              <button
                type="button"
                onClick={() => onChange({ [t.key]: !active } as Partial<BookingState>)}
                className={cn(
                  "tap flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition",
                  active
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card",
                )}
              >
                <span
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                    active ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="flex-1">
                  <span className="block text-[15px] font-semibold tracking-tight">
                    {t.title}
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-relaxed text-muted-foreground">
                    {t.body}
                  </span>
                </span>
                <span
                  className={cn(
                    "relative mt-1 h-6 w-11 shrink-0 rounded-full transition",
                    active ? "bg-primary" : "bg-secondary",
                  )}
                  aria-hidden
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition",
                      active ? "left-5" : "left-0.5",
                    )}
                  />
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <label className="mt-4 flex flex-col gap-1 rounded-2xl border border-border bg-card p-4">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Notes for driver (optional)
        </span>
        <textarea
          value={state.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          rows={3}
          placeholder="e.g. Park on the left, silver BMW."
          className="w-full resize-none bg-transparent text-[14px] outline-none placeholder:text-muted-foreground/70"
        />
      </label>

      <div className="mt-4 flex items-start gap-2 rounded-2xl bg-primary/5 p-4 text-[13px] leading-relaxed ring-1 ring-primary/10">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <span>
          You are booking a private driver who drives your own car.
        </span>
      </div>
    </section>
  )
}

function StepConfirm({
  state,
  onChange,
  estimate,
}: {
  state: BookingState
  onChange: (p: Partial<BookingState>) => void
  estimate: {
    distanceKm: number
    durationMinutes: number
    price: number
    isNight: boolean
    service: ReturnType<typeof getService>
  }
}) {
  const { service } = estimate
  return (
    <section>
      <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
        Confirm &amp; book
      </h1>
      <p className="mt-1 text-[14px] text-muted-foreground">
        Review your trip and add your details.
      </p>

      {/* Summary */}
      <div className="mt-4 flex flex-col gap-3">
        <div className="rounded-3xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Service
            </span>
            <span className="text-[13px] font-semibold">{service?.name}</span>
          </div>
          <div className="mt-3 h-px bg-border" />
          <div className="mt-3 flex flex-col gap-2 text-[13px]">
            <Row label="Pickup" value={state.pickup.address || "—"} />
            {state.stops.filter((s) => s.address).map((s, i) => (
              <Row key={i} label={`Stop ${i + 1}`} value={s.address} />
            ))}
            <Row label="Drop off" value={state.dropoff.address || "—"} />
            <Row label="When" value={`${state.date} · ${state.time}`} />
            <Row label="Passengers" value={String(state.passengers)} />
            <Row
              label="Distance"
              value={`${estimate.distanceKm.toFixed(1)} km · ${estimate.durationMinutes} min`}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-4">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-muted-foreground">Base fare</span>
            <span className="font-medium">
              {formatZAR(Math.round(estimate.price * 0.55))}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[13px]">
            <span className="text-muted-foreground">
              Distance ({estimate.distanceKm.toFixed(1)} km)
            </span>
            <span className="font-medium">
              {formatZAR(Math.round(estimate.price * 0.4))}
            </span>
          </div>
          {estimate.isNight && (
            <div className="mt-1.5 flex items-center justify-between text-[13px]">
              <span className="text-muted-foreground">Night surcharge</span>
              <span className="font-medium">{formatZAR(80)}</span>
            </div>
          )}
          <div className="mt-3 h-px bg-border" />
          <div className="mt-3 flex items-end justify-between">
            <span className="text-[13px] font-medium text-muted-foreground">
              Estimated total
            </span>
            <span className="text-[22px] font-semibold tracking-tight">
              {formatZAR(estimate.price)}
            </span>
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-3xl border border-border bg-card p-4">
          <h2 className="text-[15px] font-semibold">Your details</h2>
          <div className="mt-3 grid grid-cols-1 gap-3">
            <LineInput
              label="Full name"
              value={state.name}
              onChange={(v) => onChange({ name: v })}
              placeholder="Thandi Mokoena"
            />
            <LineInput
              label="Mobile"
              value={state.phone}
              onChange={(v) => onChange({ phone: v })}
              placeholder="+27 82 555 0101"
              type="tel"
            />
            <LineInput
              label="Email"
              value={state.email}
              onChange={(v) => onChange({ email: v })}
              placeholder="you@email.co.za"
              type="email"
            />
          </div>
        </div>

        {/* Payment */}
        <div className="rounded-3xl border border-border bg-card p-4">
          <h2 className="text-[15px] font-semibold">Payment</h2>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(["card", "eft", "cash"] as const).map((p) => {
              const active = state.payment === p
              return (
                <button
                  key={p}
                  onClick={() => onChange({ payment: p })}
                  className={cn(
                    "tap flex h-11 items-center justify-center rounded-xl border text-[13px] font-semibold capitalize",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground",
                  )}
                >
                  {p === "card" ? "Card" : p === "eft" ? "EFT" : "Cash"}
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
            Card payment uses secure Stripe checkout. EFT and cash are
            confirmed on pickup.
          </p>
        </div>
      </div>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  )
}

function LineInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <label className="flex flex-col gap-0.5 rounded-2xl bg-secondary p-3">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[14px] font-medium outline-none placeholder:text-muted-foreground/70"
      />
    </label>
  )
}
