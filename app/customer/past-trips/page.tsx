export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { MobileShell } from "@/components/mobile-shell"
import { AppTopBar } from "@/components/app-top-bar"
import { BottomNav, BottomNavSpacer } from "@/components/bottom-nav"
import { PastTripCard } from "@/components/booking/past-trip-card"
import { Car } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Trip history — IDriveU",
}

export default async function CustomerPastTripsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const bookings = await db.booking.findMany({
    where: {
      customerId: session.user.id,
      status: { in: ["completed", "cancelled", "refunded"] },
    },
    include: {
      driver: { select: { name: true } },
      review: { select: { rating: true } },
      receipt: { select: { totalCents: true } },
    },
    orderBy: { dateTime: "desc" },
    take: 50,
  })

  const trips = bookings.map((b) => ({
    id: b.id,
    reference: b.reference,
    serviceId: b.serviceId,
    pickupAddress: b.pickupAddress,
    dropoffAddress: b.dropoffAddress,
    dateTime: b.dateTime.toISOString(),
    status: b.status,
    estimatedPrice: b.estimatedPrice,
    finalPrice: b.finalPrice,
    driverName: b.driver?.name ?? null,
    rating: b.review?.rating ?? null,
    receiptTotal: b.receipt?.totalCents ?? null,
  }))

  return (
    <MobileShell>
      <AppTopBar title="Trip history" backHref="/dashboard" />
      <main className="px-4 pt-2">
        {/* Header */}
        <section className="mb-5">
          <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
            Past trips
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            {trips.length} completed {trips.length === 1 ? "trip" : "trips"}
          </p>
        </section>

        {trips.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="flex flex-col gap-3">
            {trips.map((trip) => (
              <li key={trip.id}>
                <PastTripCard trip={trip} />
              </li>
            ))}
          </ul>
        )}

        <BottomNavSpacer />
      </main>
      <BottomNav />
    </MobileShell>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
        <Car className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="text-[18px] font-semibold text-foreground">No trips yet</h2>
      <p className="max-w-[260px] text-[14px] text-muted-foreground">
        Your completed trips will appear here with receipts and ratings.
      </p>
      <Link
        href="/book"
        className="tap mt-2 inline-flex h-12 items-center rounded-2xl bg-primary px-8 text-[14px] font-semibold text-primary-foreground"
      >
        Book your first ride
      </Link>
    </div>
  )
}
