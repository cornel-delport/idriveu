"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Baby,
  Calendar as CalendarIcon,
  Car,
  Check,
  Clock,
  MapPin,
  MinusCircle,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Users,
  UserRound,
} from "lucide-react"
import { toast } from "sonner"
import { services, type ServiceId } from "@/lib/services"
import { estimatePrice, formatZAR } from "@/lib/pricing"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { RouteMapPreview } from "./route-map-preview"
import { cn } from "@/lib/utils"

type Step = 0 | 1 | 2 | 3 | 4

interface BookingState {
  serviceId: ServiceId
  date: string
  time: string
  passengerCount: number
  returnTrip: boolean
  pickup: string
  dropoff: string
  stops: string[]
  usesCustomerVehicle: boolean
  requiresFemaleDriver: boolean
  childPickup: boolean
  childName: string
  childSchool: string
  childAdult: string
  childEmergency: string
  vehicleConfirmed: boolean
  notes: string
}

const popularPlaces = [
  "The Lookout Deck, Plettenberg Bay",
  "Enrico Restaurant, Keurboomstrand",
  "Robberg Beach Lodge, Plett",
  "Bramon Wine Estate, The Crags",
  "George Airport (GRJ)",
  "Tsitsikamma National Park",
  "Plettenberg Primary School",
  "Hog Hollow Country Lodge",
]

const stepTitles = [
  "Choose your service",
  "When & who",
  "Where to?",
  "Trip details",
  "Review & confirm",
]

export function BookingWizard() {
  const router = useRouter()
  const params = useSearchParams()
  const initialService = (params.get("service") as ServiceId) || "drive-me-home"

  const [step, setStep] = useState<Step>(0)
  const [state, setState] = useState<BookingState>({
    serviceId: initialService,
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    time: "19:00",
    passengerCount: 2,
    returnTrip: false,
    pickup: "",
    dropoff: "",
    stops: [],
    usesCustomerVehicle: true,
    requiresFemaleDriver: false,
    childPickup: initialService === "child-pickup",
    childName: "",
    childSchool: "",
    childAdult: "",
    childEmergency: "",
    vehicleConfirmed: false,
    notes: "",
  })

  const update = <K extends keyof BookingState>(key: K, value: BookingState[K]) =>
    setState((s) => ({ ...s, [key]: value }))

  const service = useMemo(
    () => services.find((s) => s.id === state.serviceId)!,
    [state.serviceId],
  )

  // Fake distance/duration estimate from pickup+dropoff length
  const distanceKm = useMemo(() => {
    if (!state.pickup || !state.dropoff) return 0
    const base = (state.pickup.length + state.dropoff.length) / 4
    const withStops = base + state.stops.length * 4
    return Number(Math.min(220, Math.max(3, withStops)).toFixed(1))
  }, [state.pickup, state.dropoff, state.stops])

  const durationMinutes = Math.max(8, Math.round(distanceKm * 1.6))
  const hour = Number(state.time.split(":")[0] || "0")
  const isNight = hour >= 21 || hour < 5

  const estimate = useMemo(
    () =>
      state.pickup && state.dropoff
        ? estimatePrice({
            serviceId: state.serviceId,
            distanceKm,
            durationMinutes,
            isNight,
          })
        : service.fromPrice,
    [state, distanceKm, durationMinutes, isNight, service.fromPrice],
  )

  const canNext = () => {
    if (step === 0) return !!state.serviceId
    if (step === 1) return !!state.date && !!state.time && state.passengerCount > 0
    if (step === 2) return state.pickup.length > 3 && state.dropoff.length > 3
    if (step === 3) {
      if (state.serviceId !== "parcel") {
        if (state.usesCustomerVehicle && !state.vehicleConfirmed) return false
      }
      if (state.childPickup) {
        return !!state.childName && !!state.childSchool && !!state.childAdult
      }
      return true
    }
    return true
  }

  const submit = async () => {
    toast.success("Booking received — check your email for confirmation.")
    const ref = "JK-" + Math.floor(1000 + Math.random() * 9000)
    const params = new URLSearchParams({
      ref,
      service: service.name,
      date: state.date,
      time: state.time,
      pickup: state.pickup,
      dropoff: state.dropoff,
      price: String(estimate),
    })
    router.push(`/book/confirmation?${params.toString()}`)
  }

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_360px]">
      <div>
        {/* Stepper */}
        <ol className="mb-8 hidden grid-cols-5 gap-2 md:grid">
          {stepTitles.map((title, i) => (
            <li key={title} className="flex flex-col gap-2">
              <div
                className={cn(
                  "h-1.5 rounded-full",
                  i <= step ? "bg-primary" : "bg-border",
                )}
              />
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full text-[10px] font-semibold",
                    i < step
                      ? "bg-primary text-primary-foreground"
                      : i === step
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-muted-foreground",
                  )}
                >
                  {i < step ? <Check className="size-3" /> : i + 1}
                </span>
                <span
                  className={cn(
                    i <= step
                      ? "font-medium text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {title}
                </span>
              </div>
            </li>
          ))}
        </ol>

        <div className="md:hidden mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            Step {step + 1} of {stepTitles.length}
          </p>
          <h2 className="mt-1 font-serif text-2xl font-semibold">
            {stepTitles[step]}
          </h2>
          <div className="mt-3 h-1.5 rounded-full bg-border">
            <div
              className="h-1.5 rounded-full bg-primary transition-all"
              style={{ width: `${((step + 1) / stepTitles.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 md:p-8">
          {step === 0 && (
            <div>
              <h2 className="hidden font-serif text-2xl font-semibold md:block">
                {stepTitles[0]}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick the service that fits your plan. You can always change it.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {services.map((s) => {
                  const active = state.serviceId === s.id
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => {
                        update("serviceId", s.id)
                        update("childPickup", s.id === "child-pickup")
                      }}
                      className={cn(
                        "flex gap-3 rounded-xl border p-4 text-left transition-all",
                        active
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border bg-background hover:border-primary/30",
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-10 flex-none items-center justify-center rounded-lg",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary/10 text-primary",
                        )}
                      >
                        <s.icon className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold">{s.name}</span>
                          <span className="text-xs font-semibold text-muted-foreground">
                            {s.priceLabel}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {s.description}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="hidden font-serif text-2xl font-semibold md:block">
                {stepTitles[1]}
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="date" className="text-sm">
                    <CalendarIcon className="mr-1.5 inline size-4 text-accent" />
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={state.date}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => update("date", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="time" className="text-sm">
                    <Clock className="mr-1.5 inline size-4 text-accent" />
                    Pickup time
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={state.time}
                    onChange={(e) => update("time", e.target.value)}
                  />
                  {isNight && (
                    <p className="text-xs text-accent-foreground/80">
                      Late-night pickup — night surcharge applies.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">
                  <Users className="mr-1.5 inline size-4 text-accent" />
                  Passengers
                </Label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() =>
                      update(
                        "passengerCount",
                        Math.max(1, state.passengerCount - 1),
                      )
                    }
                  >
                    <MinusCircle className="size-4" />
                  </Button>
                  <span className="min-w-10 text-center font-serif text-2xl font-semibold">
                    {state.passengerCount}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() =>
                      update(
                        "passengerCount",
                        Math.min(7, state.passengerCount + 1),
                      )
                    }
                  >
                    <PlusCircle className="size-4" />
                  </Button>
                  <span className="ml-2 text-sm text-muted-foreground">
                    Max 7 passengers (in your vehicle)
                  </span>
                </div>
              </div>

              <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-secondary/40 p-4">
                <div>
                  <p className="text-sm font-medium">Return trip?</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    We&apos;ll hold the driver to take you back.
                  </p>
                </div>
                <Switch
                  checked={state.returnTrip}
                  onCheckedChange={(v) => update("returnTrip", v)}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="hidden font-serif text-2xl font-semibold md:block">
                {stepTitles[2]}
              </h2>

              <div className="space-y-1.5">
                <Label htmlFor="pickup" className="text-sm">
                  <MapPin className="mr-1.5 inline size-4 text-primary" />
                  Pickup location
                </Label>
                <Input
                  id="pickup"
                  placeholder="e.g. The Lookout Deck, Plett"
                  value={state.pickup}
                  onChange={(e) => update("pickup", e.target.value)}
                  list="popular-places"
                />
                <datalist id="popular-places">
                  {popularPlaces.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dropoff" className="text-sm">
                  <MapPin className="mr-1.5 inline size-4 text-accent" />
                  Dropoff location
                </Label>
                <Input
                  id="dropoff"
                  placeholder="e.g. 14 Cormorant Drive, Plett"
                  value={state.dropoff}
                  onChange={(e) => update("dropoff", e.target.value)}
                  list="popular-places"
                />
              </div>

              {state.stops.map((stop, i) => (
                <div key={i} className="space-y-1.5">
                  <Label className="text-sm">
                    <MapPin className="mr-1.5 inline size-4 text-muted-foreground" />
                    Stop {i + 1}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a stop"
                      value={stop}
                      onChange={(e) => {
                        const next = [...state.stops]
                        next[i] = e.target.value
                        update("stops", next)
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        update(
                          "stops",
                          state.stops.filter((_, idx) => idx !== i),
                        )
                      }
                    >
                      <MinusCircle className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {state.stops.length < 4 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                  onClick={() => update("stops", [...state.stops, ""])}
                >
                  <PlusCircle className="size-4" /> Add a stop
                </Button>
              )}

              <div className="pt-2">
                <RouteMapPreview
                  pickup={state.pickup}
                  dropoff={state.dropoff}
                  distanceKm={state.pickup && state.dropoff ? distanceKm : undefined}
                  durationMinutes={
                    state.pickup && state.dropoff ? durationMinutes : undefined
                  }
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Distance and time are estimates. Google Maps route preview
                  will replace this once the API key is added.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="hidden font-serif text-2xl font-semibold md:block">
                {stepTitles[3]}
              </h2>

              <div className="rounded-xl border border-border bg-secondary/40 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 flex-none items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Car className="size-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      John will drive your own car
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Toggle off if you&apos;d like us to arrange a vehicle.
                    </p>
                  </div>
                  <Switch
                    checked={state.usesCustomerVehicle}
                    onCheckedChange={(v) => update("usesCustomerVehicle", v)}
                  />
                </div>

                {state.usesCustomerVehicle && (
                  <label className="mt-4 flex items-start gap-3 rounded-lg bg-background p-3 text-sm">
                    <Checkbox
                      checked={state.vehicleConfirmed}
                      onCheckedChange={(v) =>
                        update("vehicleConfirmed", v === true)
                      }
                      className="mt-0.5"
                    />
                    <span className="text-foreground/90">
                      I confirm I have permission to authorise John to drive my
                      vehicle, and that the car is roadworthy, licensed and
                      insured.
                    </span>
                  </label>
                )}
              </div>

              <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
                <div className="flex gap-3">
                  <div className="flex size-9 flex-none items-center justify-center rounded-lg bg-accent/20 text-accent-foreground">
                    <UserRound className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Request a female driver
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Junior will be assigned if available.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={state.requiresFemaleDriver}
                  onCheckedChange={(v) => update("requiresFemaleDriver", v)}
                />
              </div>

              <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
                <div className="flex gap-3">
                  <div className="flex size-9 flex-none items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Baby className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">This is a child pickup</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      We&apos;ll require extra safety details.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={state.childPickup}
                  onCheckedChange={(v) => update("childPickup", v)}
                />
              </div>

              {state.childPickup && (
                <div className="grid gap-4 rounded-xl border border-accent/40 bg-accent/5 p-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Child&apos;s name &amp; age</Label>
                    <Input
                      placeholder="e.g. Nia (7)"
                      value={state.childName}
                      onChange={(e) => update("childName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">School or location</Label>
                    <Input
                      placeholder="e.g. Plettenberg Primary"
                      value={state.childSchool}
                      onChange={(e) => update("childSchool", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Authorised adult</Label>
                    <Input
                      placeholder="Parent / guardian name"
                      value={state.childAdult}
                      onChange={(e) => update("childAdult", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Emergency contact</Label>
                    <Input
                      placeholder="+27 ..."
                      value={state.childEmergency}
                      onChange={(e) => update("childEmergency", e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-sm">
                  Trip notes (optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Where to find the car, parking gate codes, special requests..."
                  value={state.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="hidden font-serif text-2xl font-semibold md:block">
                {stepTitles[4]}
              </h2>

              <div className="rounded-2xl border border-border bg-secondary/30 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <service.icon className="size-5" />
                  </div>
                  <div>
                    <p className="font-serif text-lg font-semibold">
                      {service.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {service.tagline}
                    </p>
                  </div>
                </div>

                <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                  <Summary label="When" value={`${formatDate(state.date)} · ${state.time}`} />
                  <Summary label="Passengers" value={`${state.passengerCount}`} />
                  <Summary label="Pickup" value={state.pickup} />
                  <Summary label="Dropoff" value={state.dropoff} />
                  {state.stops.filter(Boolean).length > 0 && (
                    <Summary
                      label="Stops"
                      value={state.stops.filter(Boolean).join(", ")}
                    />
                  )}
                  <Summary
                    label="Vehicle"
                    value={
                      state.usesCustomerVehicle
                        ? "Customer's own car"
                        : "Arranged by us"
                    }
                  />
                  {state.requiresFemaleDriver && (
                    <Summary label="Driver" value="Female driver requested" />
                  )}
                  {state.returnTrip && <Summary label="Return" value="Yes" />}
                </dl>
                {state.notes && (
                  <div className="mt-4 rounded-lg bg-background p-3 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Notes
                    </p>
                    <p className="mt-1 text-foreground/90">{state.notes}</p>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Estimated total</p>
                  <p className="font-serif text-3xl font-semibold text-primary">
                    {formatZAR(estimate)}
                  </p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Includes {distanceKm.toFixed(1)} km, {durationMinutes} min
                  {isNight && ", night surcharge"} · VAT where applicable
                </p>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-border p-4 text-sm">
                <ShieldCheck className="mt-0.5 size-5 flex-none text-primary" />
                <p className="text-muted-foreground">
                  This is a private driver &amp; chauffeur booking — not a
                  metered taxi. Payment is secured via Stripe (PayFast, Ozow
                  and Yoco coming soon). You&apos;ll only be charged after John
                  confirms the booking.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            className="rounded-full"
            onClick={() => setStep((s) => Math.max(0, (s - 1)) as Step)}
            disabled={step === 0}
          >
            <ArrowLeft className="size-4" /> Back
          </Button>
          {step < 4 ? (
            <Button
              type="button"
              className="rounded-full"
              disabled={!canNext()}
              onClick={() => setStep((s) => Math.min(4, (s + 1)) as Step)}
            >
              Continue <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button type="button" className="rounded-full" onClick={submit}>
              Confirm & pay <Sparkles className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Sticky summary */}
      <aside className="space-y-4 md:sticky md:top-24 md:self-start">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            Your booking
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <service.icon className="size-5" />
            </div>
            <div>
              <p className="font-serif text-base font-semibold">
                {service.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {state.date ? formatDate(state.date) : "—"} · {state.time}
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-2 border-t border-border/70 pt-4 text-sm">
            <SummaryRow label="Passengers" value={state.passengerCount} />
            <SummaryRow
              label="Distance"
              value={distanceKm ? `${distanceKm.toFixed(1)} km` : "—"}
            />
            <SummaryRow
              label="Duration"
              value={distanceKm ? `${durationMinutes} min` : "—"}
            />
            {isNight && <SummaryRow label="Night surcharge" value="Yes" />}
          </div>
          <div className="mt-4 flex items-baseline justify-between border-t border-border/70 pt-4">
            <span className="text-sm text-muted-foreground">Estimate</span>
            <span className="font-serif text-2xl font-semibold text-primary">
              {formatZAR(estimate)}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-secondary/40 p-5 text-sm">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-5 flex-none text-primary" />
            <div>
              <p className="font-medium">Safe, local, private driver</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Vetted drivers, upfront pricing, and support via WhatsApp
                whenever you need us.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

function SummaryRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-foreground">{value}</dd>
    </div>
  )
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString("en-ZA", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch {
    return value
  }
}
