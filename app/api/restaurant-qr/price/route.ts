import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { quoteQrPickup } from "@/lib/qr-pricing"

const schema = z.object({
  restaurantCode: z.string().min(3),
  dropoffAddress: z.string().min(3),
  dropoffLat: z.number().min(-90).max(90),
  dropoffLng: z.number().min(-180).max(180),
  pickupTimeType: z.enum(["asap", "scheduled"]),
  scheduledTime: z.string().datetime().optional(),
})

/**
 * POST /api/restaurant-qr/price
 * Public — quick-quote for a restaurant pickup. No booking written.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid body" },
        { status: 400 },
      )
    }

    const restaurant = await db.restaurant.findUnique({
      where: { restaurantCode: parsed.data.restaurantCode.toUpperCase() },
      select: { lat: true, lng: true, status: true, waiveCallOutFee: true },
    })
    if (!restaurant || restaurant.status !== "active") {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    const pickupAt =
      parsed.data.pickupTimeType === "scheduled" && parsed.data.scheduledTime
        ? new Date(parsed.data.scheduledTime)
        : new Date(Date.now() + 5 * 60 * 1000)

    const quote = quoteQrPickup({
      pickupLat: restaurant.lat,
      pickupLng: restaurant.lng,
      dropoffLat: parsed.data.dropoffLat,
      dropoffLng: parsed.data.dropoffLng,
      pickupAt,
      waiveCallOutFee: restaurant.waiveCallOutFee,
    })

    return NextResponse.json(quote)
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[/api/restaurant-qr/price]", err)
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
