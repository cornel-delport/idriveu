import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendWhatsApp } from "@/lib/whatsapp"

export async function POST(
  _req: NextRequest,
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

  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: { select: { phone: true } },
        tip: { select: { amountCents: true } },
        receipt: true,
      },
    })
    if (!booking) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // Driver must be assigned driver
    if (actorRole === "driver" && booking.driverId !== actorUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Update booking status
    await db.booking.update({
      where: { id: bookingId },
      data: {
        status: "completed",
        statusUpdatedAt: new Date(),
        completedAt: new Date(),
      },
    })

    // Free up driver availability
    if (booking.driverId) {
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

    // Auto-generate receipt (idempotent)
    let receipt = booking.receipt
    if (!receipt) {
      const subtotalCents = booking.finalPrice ?? booking.estimatedPrice
      const tipCents = booking.tip?.amountCents ?? 0
      const totalCents = subtotalCents + tipCents
      const receiptNumber = `RCP-${Date.now().toString(36).toUpperCase()}`

      receipt = await db.receipt.create({
        data: {
          bookingId,
          receiptNumber,
          subtotalCents,
          tipCents,
          totalCents,
        },
      })
    }

    await db.tripEvent.create({
      data: {
        bookingId,
        actorUserId,
        actorRole,
        eventType: "trip_completed",
        metadata: { receiptId: receipt.id },
      },
    })

    // Notify customer
    if (booking.customer.phone) {
      void sendWhatsApp(
        booking.customer.phone,
        "TRIP_COMPLETED",
        {
          ref: booking.reference,
          amount: String(booking.finalPrice ?? booking.estimatedPrice),
          link: `${process.env.NEXTAUTH_URL}/review?booking=${bookingId}`,
        },
        bookingId,
      )
    }

    return NextResponse.json({ ok: true, receiptId: receipt.id })
  } catch (err: unknown) {
    if (process.env.NODE_ENV === "development") console.error("[POST /api/trip/[bookingId]/complete]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
