import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(_req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { role } = session.user as { id: string; role: string; email: string }

  if (role !== "admin" && role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const drivers = await db.user.findMany({
      where: { role: "driver" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        driverProfile: {
          select: {
            id: true,
            driverStatus: true,
            verified: true,
            female: true,
            languages: true,
            serviceAreas: true,
            licenseNumber: true,
            licenseExpiry: true,
            isOnline: true,
            rating: true,
            totalTrips: true,
            availability: {
              select: {
                status: true,
                currentBookingId: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ drivers })
  } catch (err: unknown) {
    if (process.env.NODE_ENV === "development") console.error("[GET /api/admin/drivers]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
