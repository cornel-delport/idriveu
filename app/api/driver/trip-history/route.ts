import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: userId, role } = session.user as { id: string; role: string; email: string }

  if (role !== "driver") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const searchParams = req.nextUrl.searchParams
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)))
  const skip = (page - 1) * limit

  try {
    const [trips, total] = await Promise.all([
      db.booking.findMany({
        where: {
          driverId: userId,
          status: "completed",
        },
        orderBy: { dateTime: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          reference: true,
          pickupAddress: true,
          dropoffAddress: true,
          dateTime: true,
          status: true,
          estimatedPrice: true,
          finalPrice: true,
          completedAt: true,
          review: { select: { rating: true } },
          tip: { select: { amountCents: true, paymentStatus: true } },
          customer: { select: { name: true } },
        },
      }),
      db.booking.count({
        where: {
          driverId: userId,
          status: "completed",
        },
      }),
    ])

    return NextResponse.json({
      trips,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err: unknown) {
    if (process.env.NODE_ENV === "development") console.error("[GET /api/driver/trip-history]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
