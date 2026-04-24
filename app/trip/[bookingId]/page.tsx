import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { LiveTripMap } from "@/components/trip/live-trip-map"
import { TripStatusSheet } from "@/components/trip/trip-status-sheet"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function TripTrackingPage({
  params,
}: {
  params: Promise<{ bookingId: string }>
}) {
  const { bookingId } = await params
  const session = await auth()
  if (!session?.user) redirect("/login")

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { driver: { select: { name: true, phone: true } } },
  })

  if (!booking) notFound()

  // Only the customer can view their own trip tracking
  if (booking.customerId !== session.user.id) {
    const role = (session.user as { role?: string }).role
    if (role !== "admin") notFound()
  }

  return (
    <div className="relative flex h-dvh flex-col bg-background">
      {/* Top bar */}
      <header className="absolute inset-x-0 top-0 z-30 flex items-center gap-3 p-4">
        <Link
          href="/dashboard"
          className="tap flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur text-white"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="glass-strong rounded-full border border-border/60 px-4 py-1.5 text-[13px] font-medium text-foreground">
          {booking.reference}
        </div>
      </header>

      {/* Full-screen map */}
      <div className="flex-1">
        <LiveTripMap
          bookingId={booking.id}
          status={booking.status as import("@/lib/types").BookingStatus}
          pickupLat={booking.pickupLat ?? undefined}
          pickupLng={booking.pickupLng ?? undefined}
          dropoffLat={booking.dropoffLat ?? undefined}
          dropoffLng={booking.dropoffLng ?? undefined}
          pickupLabel={booking.pickupAddress}
          dropoffLabel={booking.dropoffAddress}
        />
      </div>

      {/* Bottom status sheet */}
      <div className="absolute inset-x-0 bottom-0 z-30">
        <TripStatusSheet
          status={booking.status as import("@/lib/types").BookingStatus}
          driverName={booking.driver?.name}
          driverPhone={booking.driver?.phone}
          pickupAddress={booking.pickupAddress}
          dropoffAddress={booking.dropoffAddress}
        />
      </div>
    </div>
  )
}
