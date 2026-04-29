import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { quoteQrPickup } from "@/lib/qr-pricing"

const schema = z.object({
  restaurantCode: z.string().min(3),
  dropoffAddress: z.string().min(3),
  dropoffLat: z.number().min(-90).max(90),
  dropoffLng: z.number().min(-180).max(180),
  pickupTimeType: z.enum(["asap", "scheduled"]),
  scheduledTime: z.string().datetime().optional(),
  restaurantQrCodeId: z.string().optional(),
  customerNote: z.string().max(500).optional(),
})

/**
 * POST /api/restaurant-qr/book
 * Authenticated. Creates a pending_payment booking with locked pickup
 * at the restaurant. Returns the booking id so the client can hand off
 * to /api/paystack/create-checkout.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

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

    const reference = `IDU-${Math.floor(1000 + Math.random() * 9000)}`

    const booking = await db.booking.create({
      data: {
        reference,
        customerId: session.user.id,
        serviceId: "drive-me-home",
        source: "restaurant_qr",
        pickupType: "restaurant",
        pickupLocked: true,
        pickupAddress: restaurant.address,
        pickupLat: restaurant.lat,
        pickupLng: restaurant.lng,
        dropoffAddress: parsed.data.dropoffAddress,
        dropoffLat: parsed.data.dropoffLat,
        dropoffLng: parsed.data.dropoffLng,
        dateTime: pickupAt,
        passengerCount: 1,
        usesCustomerVehicle: true,
        distanceKm: quote.distanceKm,
        durationMinutes: quote.durationMinutes,
        estimatedPrice: quote.estimatedPrice,
        status: "pending_payment",
        paymentStatus: "pending",
        paymentMethod: "card",
        paymentProvider: "paystack",
        restaurantId: restaurant.id,
        restaurantQrCodeId: parsed.data.restaurantQrCodeId,
        notes: parsed.data.customerNote,
        pickupNote: `Restaurant pickup · ${restaurant.name}`,
      },
      select: { id: true, reference: true, estimatedPrice: true },
    })

    await db.tripEvent.create({
      data: {
        bookingId: booking.id,
        actorUserId: session.user.id,
        actorRole: "customer",
        eventType: "booking_created",
        metadata: { source: "restaurant_qr", restaurantId: restaurant.id },
      },
    })

    return NextResponse.json(booking)
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[/api/restaurant-qr/book]", err)
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
