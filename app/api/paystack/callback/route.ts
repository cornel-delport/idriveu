import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getPaystackOrMock } from "@/lib/paystack"

/**
 * GET /api/paystack/callback?bookingId=...&reference=...
 * Paystack sends the user back here after the hosted checkout completes.
 * We verify the transaction (or trust the mock in dev), mark the booking
 * paid, then redirect to the live tracking screen.
 */
export async function GET(req: NextRequest) {
  const bookingId = req.nextUrl.searchParams.get("bookingId")
  const reference = req.nextUrl.searchParams.get("reference") ?? ""
  const isMock =
    !process.env.PAYSTACK_SECRET_KEY ||
    req.nextUrl.searchParams.get("mock") === "1"

  if (!bookingId) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  try {
    let success = false
    let amountCents = 0
    if (isMock) {
      success = true
    } else {
      const verify = await getPaystackOrMock().verifyTransaction(reference)
      success = verify.status === "success"
      amountCents = verify.amountCents
    }

    if (success) {
      const booking = await db.booking.findUnique({
        where: { id: bookingId },
        select: { id: true, estimatedPrice: true, status: true },
      })
      if (booking && booking.status === "pending_payment") {
        await db.booking.update({
          where: { id: bookingId },
          data: {
            status: "confirmed",
            paymentStatus: "paid",
            finalPrice:
              amountCents > 0 ? Math.round(amountCents / 100) : booking.estimatedPrice,
          },
        })
        await db.tripEvent.create({
          data: {
            bookingId,
            actorRole: "system",
            eventType: "payment_received",
            metadata: { reference, mock: isMock },
          },
        })
      }
      return NextResponse.redirect(new URL(`/trip/${bookingId}`, req.url))
    }

    // Failed — back to the QR booking page so they can retry
    return NextResponse.redirect(
      new URL(`/trip/${bookingId}?paymentFailed=1`, req.url),
    )
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[/api/paystack/callback]", err)
    }
    return NextResponse.redirect(new URL("/", req.url))
  }
}
