import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getPaystackOrMock } from "@/lib/paystack"

const schema = z.object({
  bookingId: z.string().min(1),
})

/**
 * POST /api/paystack/create-checkout
 * Initialises a Paystack transaction for an existing pending_payment booking
 * and returns the redirect URL. Falls back to a mock URL when no
 * PAYSTACK_SECRET_KEY is set (dev / preview).
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 })
    }

    const booking = await db.booking.findUnique({
      where: { id: parsed.data.bookingId },
      select: {
        id: true,
        reference: true,
        customerId: true,
        status: true,
        estimatedPrice: true,
      },
    })
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }
    if (booking.customerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    if (booking.status !== "pending_payment") {
      return NextResponse.json(
        { error: `Booking is already ${booking.status}` },
        { status: 400 },
      )
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      process.env.NEXTAUTH_URL ??
      new URL(req.url).origin

    const callbackUrl = `${baseUrl.replace(/\/$/, "")}/api/paystack/callback?bookingId=${booking.id}`

    const checkout = await getPaystackOrMock().initializeCheckout({
      amountCents: booking.estimatedPrice * 100, // ZAR cents
      email: session.user.email,
      bookingId: booking.id,
      reference: booking.reference,
      callbackUrl,
      metadata: { bookingId: booking.id, source: "restaurant_qr" },
    })

    await db.booking.update({
      where: { id: booking.id },
      data: { paymentReference: checkout.reference, paymentProvider: "paystack" },
    })

    return NextResponse.json({
      authorizationUrl: checkout.authorizationUrl,
      reference: checkout.reference,
    })
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[/api/paystack/create-checkout]", err)
    }
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 })
  }
}
