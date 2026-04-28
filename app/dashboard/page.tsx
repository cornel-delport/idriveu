export const dynamic = 'force-dynamic'

import Link from "next/link"
import {
  ArrowRight,
  Calendar,
  CarFront,
  ChevronRight,
  History,
  MapPin,
  Navigation,
  Plus,
  Star,
  Wallet,
} from "lucide-react"
import { redirect } from "next/navigation"
import { MobileShell } from "@/components/mobile-shell"
import { AppTopBar } from "@/components/app-top-bar"
import { BottomNav, BottomNavSpacer } from "@/components/bottom-nav"
import { BookingItem } from "@/components/dashboard/booking-item"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { formatZAR } from "@/lib/pricing"
import type { Booking } from "@/lib/types"
import type { Booking as PrismaBooking } from "@prisma/client"
import {
  IconButton,
  IconCard,
  IconStat,
} from "@/components/ui-icon"
import { SignedInAs } from "@/components/role-banner"

function mapBooking(b: PrismaBooking): Booking {
  return {
    id: b.id,
    reference: b.reference,
    customerId: b.customerId,
    customerName: "",
    driverId: b.driverId ?? undefined,
    serviceId: b.serviceId as Booking["serviceId"],
    pickup: { address: b.pickupAddress, lat: b.pickupLat ?? undefined, lng: b.pickupLng ?? undefined },
    dropoff: { address: b.dropoffAddress, lat: b.dropoffLat ?? undefined, lng: b.dropoffLng ?? undefined },
    stops: [],
    dateTime: b.dateTime.toISOString(),
    returnTrip: b.returnTrip,
    returnDateTime: b.returnDateTime?.toISOString(),
    passengerCount: b.passengerCount,
    usesCustomerVehicle: b.usesCustomerVehicle,
    requiresFemaleDriver: b.requiresFemaleDriver,
    childPickup: b.childPickup,
    distanceKm: b.distanceKm,
    durationMinutes: b.durationMinutes,
    estimatedPrice: b.estimatedPrice,
    finalPrice: b.finalPrice ?? undefined,
    status: b.status as Booking["status"],
    paymentStatus: b.paymentStatus as Booking["paymentStatus"],
    notes: b.notes ?? undefined,
    createdAt: b.createdAt.toISOString(),
  }
}

export default async function CustomerDashboard() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const myBookingsRaw = await db.booking.findMany({
    where: { customerId: session.user.id },
    orderBy: { dateTime: "desc" },
  })

  const myBookings = myBookingsRaw.map(mapBooking)

  const upcoming = myBookings.filter(
    (b) => new Date(b.dateTime) > new Date() && b.status !== "cancelled",
  )
  const past = myBookings.filter((b) => b.status === "completed")

  const totalSpent = myBookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + (b.finalPrice ?? b.estimatedPrice), 0)

  const firstName = session.user.name?.split(" ")[0] ?? "there"

  const savedPlaces = await db.savedPlace.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  })

  return (
    <MobileShell>
      <AppTopBar />
      <main className="px-4 pt-3">
        {/* Role banner */}
        <SignedInAs role="customer" name={session.user.name} className="mb-4" />

        {/* Greeting */}
        <section>
          <p className="text-[12px] font-medium text-muted-foreground">
            Kunjani,
          </p>
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight">
            {firstName}.
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Here&apos;s a quick look at your trips.
          </p>
        </section>

        {/* Stats — icon-driven */}
        <section className="mt-4 grid grid-cols-3 gap-2">
          <IconStat
            icon={Calendar}
            value={upcoming.length}
            label="Upcoming"
            tone="primary"
          />
          <IconStat
            icon={History}
            value={myBookings.length}
            label="All trips"
            tone="accent"
          />
          <IconStat
            icon={Star}
            value="4.9"
            label="Rating"
            tone="warning"
          />
        </section>

        {/* Quick booking CTA — premium dark gradient card */}
        <Link
          href="/book"
          className="tap card-dark mt-4 flex items-center justify-between rounded-3xl p-4"
        >
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-glow">
              <Wallet className="h-3 w-3" /> Quick action
            </p>
            <p className="mt-1 text-[16px] font-semibold text-white">
              Book a driver now
            </p>
            <p className="mt-1 text-[12px] text-white/70">
              Total spent:{" "}
              <span className="font-semibold text-white">{formatZAR(totalSpent)}</span>
            </p>
          </div>
          <span className="btn-glow flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
            <Plus className="h-5 w-5" strokeWidth={2.4} />
          </span>
        </Link>

        {/* Upcoming */}
        <section className="mt-6">
          <SectionHeader title="Upcoming trips" actionLabel="See all" actionHref="/bookings" />
          <div className="mt-3 flex flex-col gap-3">
            {upcoming.length === 0 ? (
              <Empty
                title="No upcoming trips"
                body="Book a ride and it'll appear here."
              />
            ) : (
              upcoming.map((b) => (
                <div key={b.id} className="flex flex-col gap-2">
                  <BookingItem booking={b} href="/bookings" />
                  {["driver_assigned", "driver_on_the_way", "arrived", "in_progress"].includes(b.status) && (
                    <IconButton
                      icon={Navigation}
                      iconRight={ChevronRight}
                      variant="glow"
                      size="md"
                      fullWidth
                      href={`/trip/${b.id}`}
                    >
                      Track driver
                    </IconButton>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Saved locations */}
        <section className="mt-6">
          <h2 className="text-[17px] font-semibold tracking-tight">
            Saved places
          </h2>
          <p className="text-[12px] text-muted-foreground">
            Quick taps for places you visit often.
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {savedPlaces.length === 0 ? (
              <li className="flex items-center gap-3 rounded-2xl bg-secondary p-3 text-[13px] text-muted-foreground">
                <MapPin className="h-4 w-4" />
                No saved places yet — add Home or Work.
              </li>
            ) : (
              savedPlaces.map((p) => (
                <li key={p.id}>
                  <IconCard
                    icon={MapPin}
                    title={p.label}
                    description={p.address}
                    href="#"
                    showChevron
                    surface="secondary"
                    tone="primary"
                    className="p-3"
                  />
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Past */}
        <section className="mt-6 pb-6">
          <SectionHeader
            title="Recent trips"
            actionLabel="History"
            actionHref="/customer/past-trips"
          />
          <div className="mt-3 flex flex-col gap-3">
            {past.length === 0 ? (
              <Empty
                title="No past trips yet"
                body="Finished rides appear here so you can repeat them in one tap."
              />
            ) : (
              past.slice(0, 4).map((b) => (
                <BookingItem
                  key={b.id}
                  booking={b}
                  cta="Repeat"
                  href={`/book?service=${b.serviceId}`}
                />
              ))
            )}
          </div>
        </section>
        <BottomNavSpacer />
      </main>
      <BottomNav />
    </MobileShell>
  )
}

function SectionHeader({
  title,
  actionLabel,
  actionHref,
}: {
  title: string
  actionLabel?: string
  actionHref?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-0.5 text-[12px] font-medium text-primary"
        >
          {actionLabel} <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  )
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-card/60 p-6 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <CarFront className="h-5 w-5" />
      </span>
      <p className="mt-3 text-[14px] font-semibold">{title}</p>
      <p className="mt-1 text-[12px] text-muted-foreground">{body}</p>
      <IconButton
        icon={Plus}
        iconRight={ArrowRight}
        variant="glow"
        size="sm"
        href="/book"
        className="mt-3"
      >
        Book a driver
      </IconButton>
    </div>
  )
}
