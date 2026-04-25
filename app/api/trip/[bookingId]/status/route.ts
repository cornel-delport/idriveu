import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import type { BookingStatus } from "@prisma/client"

const VALID_STATUSES: BookingStatus[] = [
  "draft",
  "pending_payment",
  "payment_received",
  "confirmed",
  "driver_assigned",
  "driver_on_the_way",
  "arrived",
  "passenger_collected",
  "in_progress",
  "completed",
  "cancelled",
  "refund_requested",
  "refunded",
]

const BodySchema = z.object({
  status: z.string().refine((s): s is BookingStatus => VALID_STATUSES.includes(s as BookingStatus), {
    message: "Invalid booking status",
  }),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: actorUserId, role: actorRole } = session.user as { id: string; role: string; email: string }

  if (actorRole !== "driver" && actorRole !== "admin" && actorRole !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { bookingId } = await params

  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: "Bad request", message: "Invalid or missing status" }, { status: 400 })
  }

  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      select: { driverId: true, status: true },
    })
    if (!booking) {
      return NextResponse.json({ error: "Not found", message: "Booking not found" }, { status: 404 })
    }

    // Driver must be the assigned driver
    if (actorRole === "driver" && booking.driverId !== actorUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const previousStatus = booking.status
    const newStatus = body.status

    // Build timestamp fields based on incoming status
    const timestampData: Record<string, Date | null> = {}
    if (newStatus === "arrived") timestampData.arrivedAt = new Date()
    if (newStatus === "passenger_collected") timestampData.passengerCollectedAt = new Date()
    if (newStatus === "in_progress") timestampData.startedAt = new Date()
    if (newStatus === "completed") timestampData.completedAt = new Date()

    await db.booking.update({
      where: { id: bookingId },
      data: {
        status: newStatus,
        statusUpdatedAt: new Date(),
        ...timestampData,
      },
    })

    // On completion, mark driver as available again
    if (newStatus === "completed" && booking.driverId) {
      const driverProfile = await db.driverProfile.findUnique({
        where: { userId: booking.driverId },
        select: { id: true },
      })
      if (driverProfile) {
        await db.driverAvailability.upsert({
          where: { driverProfileId: driverProfile.id },
          create: {
            driverProfileId: driverProfile.id,
            status: "available",
            currentBookingId: null,
          },
          update: {
            status: "available",
            currentBookingId: null,
          },
        })
      }
    }

    await db.tripEvent.create({
      data: {
        bookingId,
        actorUserId,
        actorRole,
        eventType: "status_changed",
        metadata: { status: newStatus, previousStatus },
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    if (process.env.NODE_ENV === "development") console.error("[POST /api/trip/[bookingId]/status]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
