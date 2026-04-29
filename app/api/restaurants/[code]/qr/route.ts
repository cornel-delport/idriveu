import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * GET /api/restaurants/[code]/qr
 *
 * Public endpoint — used the moment a customer scans a QR code.
 * Looks up the restaurant by short code (case-insensitive). If `?t=<table>`
 * is supplied, also resolves the matching QR code row and bumps its scanCount.
 *
 * NEVER trust restaurant details from the client URL — always re-fetch from DB.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params
    const upper = code.toUpperCase().trim()
    const tableNumber = req.nextUrl.searchParams.get("t")?.trim() || null

    const restaurant = await db.restaurant.findUnique({
      where: { restaurantCode: upper },
      select: {
        id: true,
        name: true,
        address: true,
        lat: true,
        lng: true,
        restaurantCode: true,
        status: true,
        waiveCallOutFee: true,
      },
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 },
      )
    }
    if (restaurant.status !== "active") {
      return NextResponse.json(
        { error: "Restaurant is not currently active" },
        { status: 404 },
      )
    }

    let qrCode: { id: string; tableNumber: string | null } | null = null
    if (tableNumber) {
      const found = await db.restaurantQrCode.findFirst({
        where: {
          restaurantId: restaurant.id,
          tableNumber,
          status: "active",
        },
        select: { id: true, tableNumber: true },
      })
      if (found) {
        qrCode = found
        // Best-effort scan tracking — don't fail the request if this errors
        void db.restaurantQrCode
          .update({
            where: { id: found.id },
            data: {
              scanCount: { increment: 1 },
              lastScannedAt: new Date(),
            },
          })
          .catch(() => undefined)
      }
    }

    return NextResponse.json({
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address,
        lat: restaurant.lat,
        lng: restaurant.lng,
        restaurantCode: restaurant.restaurantCode,
        waiveCallOutFee: restaurant.waiveCallOutFee,
      },
      qrCode,
    })
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[/api/restaurants/[code]/qr]", err)
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
