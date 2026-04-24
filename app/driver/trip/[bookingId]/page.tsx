import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { DriverTripControls } from "@/components/trip/driver-trip-controls"
import type { BookingStatus } from "@/lib/types"

export default async function DriverTripPage({
  params,
}: {
  params: Promise<{ bookingId: string }>
}) {
  const { bookingId } = await params
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = (session.user as { role?: string }).role
  if (role !== "driver" && role !== "admin") redirect("/")

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { customer: { select: { name: true, phone: true } } },
  })

  if (!booking) notFound()

  // Only the assigned driver (or admin) can access
  if (role !== "admin" && booking.driverId !== session.user.id) {
    notFound()
  }

  return (
    <DriverTripControls
      bookingId={booking.id}
      status={booking.status as BookingStatus}
      pickupAddress={booking.pickupAddress}
      pickupLat={booking.pickupLat ?? undefined}
      pickupLng={booking.pickupLng ?? undefined}
      dropoffAddress={booking.dropoffAddress}
      dropoffLat={booking.dropoffLat ?? undefined}
      dropoffLng={booking.dropoffLng ?? undefined}
      customerName={booking.customer.name ?? undefined}
      customerPhone={booking.customer.phone ?? undefined}
    />
  )
}
