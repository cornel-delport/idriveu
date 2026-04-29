import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyWebhookSignature } from "@/lib/paystack"

/**
 * POST /api/paystack/webhook
 *
 * Server-to-server confirmation from Paystack. We:
 *   1. Read the raw request body (signature is computed against bytes, not parsed JSON)
 *   2. Verify HMAC-SHA512 signature against PAYSTACK_SECRET_KEY
 *   3. On `charge.success`: mark the matching booking paid + confirmed
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get("x-paystack-signature") ?? ""

    if (process.env.PAYSTACK_SECRET_KEY) {
      const ok = await verifyWebhookSignature(rawBody, signature)
      if (!ok) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    const body = JSON.parse(rawBody) as {
      event: string
      data?: { reference?: string; amount?: number; status?: string }
    }

    if (body.event === "charge.success" && body.data?.reference) {
      const reference = body.data.reference
      const amountCents = body.data.amount ?? 0

      const booking = await db.booking.findFirst({
        where: { paymentReference: reference },
        select: { id: true, status: true, estimatedPrice: true },
      })

      if (booking && booking.status === "pending_payment") {
        await db.booking.update({
          where: { id: booking.id },
          data: {
            status: "confirmed",
            paymentStatus: "paid",
            finalPrice:
              amountCents > 0 ? Math.round(amountCents / 100) : booking.estimatedPrice,
          },
        })
        await db.tripEvent.create({
          data: {
            bookingId: booking.id,
            actorRole: "system",
            eventType: "payment_received",
            metadata: { reference, source: "paystack_webhook" },
          },
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[/api/paystack/webhook]", err)
    }
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
