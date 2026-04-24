export const dynamic = 'force-dynamic'

import Link from "next/link"
import { redirect } from "next/navigation"
import { MobileShell } from "@/components/mobile-shell"
import { AppTopBar } from "@/components/app-top-bar"
import { BottomNav, BottomNavSpacer } from "@/components/bottom-nav"
import { BookingItem } from "@/components/dashboard/booking-item"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { CalendarPlus } from "lucide-react"
import type { Booking } from "@/lib/types"
import type { Booking as PrismaBooking } from "@prisma/client"

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

export default async function BookingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const bookingsRaw = await db.booking.findMany({
    where: { customerId: session.user.id },
    orderBy: { dateTime: "desc" },
  })

  const all = bookingsRaw.map(mapBooking)

  const now = Date.now()
  const upcoming = all.filter(
    (b) =>
      new Date(b.dateTime).getTime() >= now &&
      b.status !== "cancelled" &&
      b.status !== "completed",
  )
  const past = all.filter(
    (b) => b.status === "completed" || b.status === "cancelled",
  )

  return (
    <MobileShell>
      <AppTopBar title="Your bookings" />

      <section className="px-5 pt-4 pb-6">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="w-full rounded-full bg-muted p-1">
            <TabsTrigger
              value="upcoming"
              className="flex-1 rounded-full text-[13px] font-medium data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              Upcoming ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="flex-1 rounded-full text-[13px] font-medium data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              History ({past.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-5">
            {upcoming.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="flex flex-col gap-3">
                {upcoming.map((b) => (
                  <BookingItem key={b.id} booking={b} href={`/bookings/${b.id}`} cta="Manage" />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-5">
            {past.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="flex flex-col gap-3">
                {past.map((b) => (
                  <BookingItem key={b.id} booking={b} href={`/bookings/${b.id}`} cta="Receipt" />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      <BottomNavSpacer />
      <BottomNav />
    </MobileShell>
  )
}

function EmptyState() {
  return (
    <Empty className="rounded-3xl border border-dashed border-border bg-muted/40 py-10">
      <EmptyHeader>
        <EmptyTitle>No bookings yet</EmptyTitle>
        <EmptyDescription>
          Book your first ride — it only takes a minute.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild className="h-11 rounded-full px-6">
          <Link href="/book">
            <CalendarPlus className="mr-1.5 h-4 w-4" /> Book a ride
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
