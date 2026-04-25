import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

const BodySchema = z.object({
  lat: z.number(),
  lng: z.number(),
  heading: z.number().optional(),
  speed: z.number().optional(),
  accuracy: z.number().optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: driverId, role } = session.user as { id: string; role: string; email: string }

  if (role !== "driver") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { bookingId } = await params

  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      select: { driverId: true },
    })
    if (!booking) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    if (booking.driverId !== driverId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await db.driverLocation.upsert({
      where: { bookingId },
      create: {
        bookingId,
        driverId,
        lat: body.lat,
        lng: body.lng,
        heading: body.heading,
        speed: body.speed,
        accuracy: body.accuracy,
        isOnline: true,
      },
      update: {
        lat: body.lat,
        lng: body.lng,
        heading: body.heading,
        speed: body.speed,
        accuracy: body.accuracy,
        isOnline: true,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    if (process.env.NODE_ENV === "development") console.error("[POST /api/trip/[bookingId]/location]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
