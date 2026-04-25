import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: userId, role } = session.user as { id: string; role: string; email: string }
  const { bookingId } = await params

  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        receipt: true,
        customer: { select: { id: true } },
        driver: { select: { id: true, name: true } },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // Access control: customer, assigned driver, or admin
    const isAdmin = role === "admin" || role === "super_admin"
    const isCustomer = booking.customer.id === userId
    const isDriver = booking.driver?.id === userId

    if (!isAdmin && !isCustomer && !isDriver) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (!booking.receipt) {
      return NextResponse.json({ error: "No receipt found for this booking" }, { status: 404 })
    }

    return NextResponse.json({
      receipt: {
        id: booking.receipt.id,
        receiptNumber: booking.receipt.receiptNumber,
        subtotalCents: booking.receipt.subtotalCents,
        tipCents: booking.receipt.tipCents,
        totalCents: booking.receipt.totalCents,
        createdAt: booking.receipt.createdAt,
      },
      booking: {
        reference: booking.reference,
        pickupAddress: booking.pickupAddress,
        dropoffAddress: booking.dropoffAddress,
        driverName: booking.driver?.name ?? null,
        dateTime: booking.dateTime,
      },
    })
  } catch (err: unknown) {
    if (process.env.NODE_ENV === "development") console.error("[GET /api/trip/[bookingId]/receipt]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
