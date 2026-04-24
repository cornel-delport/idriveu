import { NextRequest } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

const BodySchema = z.object({
  bookingId: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  heading: z.number().optional(),
  speed: z.number().optional(),
  accuracy: z.number().optional(),
})

export async function POST(req: NextRequest) {
  // 1. Auth check — must be a driver
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== "driver") {
    return new Response("Unauthorized", { status: 401 })
  }

  // 2. Parse + validate body
  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await req.json())
  } catch {
    return new Response("Bad request", { status: 400 })
  }

  // 3. Verify driver is actually assigned to this booking
  const booking = await db.booking.findUnique({
    where: { id: body.bookingId },
    select: { driverId: true },
  })
  if (!booking || booking.driverId !== session.user.id) {
    return new Response("Forbidden", { status: 403 })
  }

  // 4. Upsert driver location
  const locationFields = {
    lat: body.lat,
    lng: body.lng,
    heading: body.heading,
    speed: body.speed,
    accuracy: body.accuracy,
  }

  await db.driverLocation.upsert({
    where: { bookingId: body.bookingId },
    create: {
      bookingId: body.bookingId,
      driverId: session.user.id,
      isOnline: true,
      ...locationFields,
    },
    update: {
      isOnline: true,
      ...locationFields,
    },
  })

  return Response.json({ ok: true })
}
