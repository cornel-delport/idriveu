import Link from "next/link"
import { MobileShell } from "@/components/mobile-shell"
import { BottomNav, BottomNavSpacer } from "@/components/bottom-nav"
import { RouteMap } from "@/components/booking/route-map"
import { Button } from "@/components/ui/button"
import { mockBookings, mockDrivers } from "@/lib/mock-data"
import { getService } from "@/lib/services"
import { Car, Clock, MapPin, Phone, Star } from "lucide-react"
import { BookingStatusBadge } from "@/components/status-badge"

export default function MapPage() {
  // Pick the first active booking to "track"
  const active =
    mockBookings.find(
      (b) => b.status === "driver_assigned" || b.status === "en_route",
    ) ??
    mockBookings.find(
      (b) => b.status === "confirmed" || b.status === "pending",
    ) ??
    mockBookings[0]

  const svc = active ? getService(active.serviceId) : undefined
  const driver = mockDrivers.find((d) => d.id === active?.driverId)
  const when = active
    ? new Date(active.dateTime).toLocaleString("en-ZA", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : ""

  return (
    <MobileShell>
      <div className="relative">
        {/* Full-bleed map */}
        <div className="relative">
          <RouteMap
            variant="full"
            pickupLabel={active?.pickup.address ?? "Pickup"}
            dropoffLabel={active?.dropoff.address ?? "Drop off"}
          />
          {/* Floating back button */}
          <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
            <Link
              href="/dashboard"
              aria-label="Back"
              className="glass-strong tap flex h-10 items-center gap-2 rounded-full border border-border px-3 text-[13px] font-medium"
            >
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
              Live tracking
            </Link>
            {active && <BookingStatusBadge status={active.status} />}
          </div>
        </div>

        {/* Sheet */}
        <section className="relative -mt-8 rounded-t-[32px] border-t border-border bg-card px-5 pt-6 pb-6 shadow-[0_-8px_30px_rgba(15,23,42,0.08)]">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1.5 w-10 rounded-full bg-border"
          />

          {active ? (
            <>
              <header className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {svc?.name}
                  </p>
                  <h1 className="mt-1 text-[22px] font-semibold leading-tight tracking-tight text-foreground">
                    Your driver is on the way
                  </h1>
                </div>
              </header>

              {driver && (
                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-border bg-muted/40 p-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Car className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold tracking-tight">{driver.name}</p>
                    <p className="mt-0.5 inline-flex items-center gap-1 text-[12px] text-muted-foreground">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                      {driver.rating.toFixed(1)} · {driver.trips.toLocaleString()} trips
                    </p>
                  </div>
                  <a
                    href={`tel:${driver.phone}`}
                    aria-label={`Call ${driver.name}`}
                    className="tap flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground"
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                </div>
              )}

              <ul className="mt-5 flex flex-col gap-3 text-[13px]">
                <li className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{when}</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                  <span className="text-foreground">{active.pickup.address}</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-accent-foreground" />
                  <span className="text-foreground">{active.dropoff.address}</span>
                </li>
              </ul>

              <div className="mt-6 flex gap-3">
                <Button asChild variant="outline" className="h-12 flex-1 rounded-full">
                  <Link href={`/bookings/${active.id}`}>Trip details</Link>
                </Button>
                <Button
                  asChild
                  className="h-12 flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Link href="/contact">Need help?</Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <p className="text-[15px] text-muted-foreground">
                You have no active rides right now.
              </p>
              <Button asChild className="mt-4 h-12 rounded-full px-6">
                <Link href="/book">Book a ride</Link>
              </Button>
            </div>
          )}
        </section>
      </div>

      <BottomNavSpacer />
      <BottomNav />
    </MobileShell>
  )
}
