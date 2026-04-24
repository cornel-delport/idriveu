import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { LiveTripMap } from "@/components/trip/live-trip-map"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function TripTrackingPage({
  params,
}: {
  params: { bookingId: string }
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const booking = await db.booking.findUnique({
    where: { id: params.bookingId },
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

      {/* Bottom status card — TODO: replace with TripStatusSheet in Task 5 */}
      <div className="absolute inset-x-0 bottom-0 z-30 p-4 pb-safe">
        <div className="glass-strong rounded-3xl border border-border p-4">
          <div className="text-[13px] font-semibold capitalize text-foreground">
            {booking.status.replace(/_/g, " ")}
          </div>
          {booking.driver && (
            <div className="mt-1 text-[12px] text-muted-foreground">
              Driver: {booking.driver.name}
              {booking.driver.phone && (
                <a href={`tel:${booking.driver.phone}`} className="ml-2 text-primary underline">
                  Call
                </a>
              )}
            </div>
          )}
          <p className="mt-2 text-[11px] text-muted-foreground/70">
            You are booking a private driver who drives your own car.
          </p>
        </div>
      </div>
    </div>
  )
}
