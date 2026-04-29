import { NextRequest, NextResponse } from "next/server"
import { acknowledgeArrivalAlert } from "@/actions/restaurants"

/**
 * POST /api/trip/[bookingId]/arrival-alert-acknowledge
 * Customer confirms they've seen the "your driver is outside" alert.
 * Called by ArrivalAlertModal when the user taps "I'm on my way".
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  try {
    const { bookingId } = await params
    const result = await acknowledgeArrivalAlert(bookingId)
    if ("error" in result) {
      return NextResponse.json(result, { status: 400 })
    }
    return NextResponse.json(result)
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[arrival-alert-ack]", err)
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
