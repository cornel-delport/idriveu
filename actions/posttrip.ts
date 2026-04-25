"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

// ── submitRating ──────────────────────────────────────────────────────────────

const submitRatingSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  feedbackTags: z.array(z.string()).default([]),
})

export async function submitRating(
  bookingId: string,
  rating: number,
  comment?: string,
  feedbackTags: string[] = [],
): Promise<{ ok: true } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }
  if ((session.user as { role?: string }).role !== "customer") return { error: "Forbidden" }

  const parsed = submitRatingSchema.safeParse({ bookingId, rating, comment, feedbackTags })
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid data" }

  const booking = await db.booking.findUnique({
    where: { id: parsed.data.bookingId },
    select: { customerId: true, driverId: true, status: true },
  })
  if (!booking) return { error: "Booking not found" }
  if (booking.customerId !== session.user.id) return { error: "Forbidden" }
  if (booking.status !== "completed") return { error: "Can only rate completed trips" }
  if (!booking.driverId) return { error: "No driver assigned to this booking" }

  const existing = await db.review.findUnique({ where: { bookingId: parsed.data.bookingId } })
  if (existing) return { error: "You have already rated this trip" }

  try {
    await db.review.create({
      data: {
        bookingId: parsed.data.bookingId,
        customerId: session.user.id,
        driverId: booking.driverId,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
        feedbackTags: parsed.data.feedbackTags,
      },
    })

    // Recalculate driver average rating
    const reviews = await db.review.findMany({
      where: { driverId: booking.driverId },
      select: { rating: true },
    })
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

    await db.driverProfile.update({
      where: { userId: booking.driverId },
      data: { rating: avg, totalTrips: { increment: 1 } },
    })

    await db.tripEvent.create({
      data: {
        bookingId: parsed.data.bookingId,
        actorUserId: session.user.id,
        actorRole: "customer",
        eventType: "rating_submitted",
        metadata: { rating: parsed.data.rating },
      },
    })

    revalidatePath(`/trip/${bookingId}/rate`)
    return { ok: true }
  } catch (err: unknown) {
    if (process.env.NODE_ENV === "development") console.error("[submitRating]", err)
    return { error: "Failed to submit rating" }
  }
}

// ── submitTip ─────────────────────────────────────────────────────────────────

const submitTipSchema = z.object({
  bookingId: z.string().min(1),
  amountCents: z.number().int().positive(),
})

export async function submitTip(
  bookingId: string,
  amountCents: number,
): Promise<{ ok: true; tipId: string } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }
  if ((session.user as { role?: string }).role !== "customer") return { error: "Forbidden" }

  const parsed = submitTipSchema.safeParse({ bookingId, amountCents })
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid data" }

  const booking = await db.booking.findUnique({
    where: { id: parsed.data.bookingId },
    select: { customerId: true, driverId: true, status: true },
  })
  if (!booking) return { error: "Booking not found" }
  if (booking.customerId !== session.user.id) return { error: "Forbidden" }
  if (booking.status !== "completed") return { error: "Can only tip on completed trips" }
  if (!booking.driverId) return { error: "No driver assigned to this booking" }

  try {
    const driverProfile = await db.driverProfile.findUnique({
      where: { userId: booking.driverId },
      select: { id: true },
    })
    if (!driverProfile) return { error: "Driver profile not found" }

    const tip = await db.tip.create({
      data: {
        bookingId: parsed.data.bookingId,
        customerId: session.user.id,
        driverProfileId: driverProfile.id,
        amountCents: parsed.data.amountCents,
        paymentStatus: "pending",
      },
    })

    await db.tripEvent.create({
      data: {
        bookingId: parsed.data.bookingId,
        actorUserId: session.user.id,
        actorRole: "customer",
        eventType: "tip_submitted",
        metadata: { amountCents: parsed.data.amountCents },
      },
    })

    revalidatePath(`/trip/${bookingId}/tip`)
    return { ok: true, tipId: tip.id }
  } catch (err: unknown) {
    if (process.env.NODE_ENV === "development") console.error("[submitTip]", err)
    return { error: "Failed to submit tip" }
  }
}

// ── generateReceipt ───────────────────────────────────────────────────────────

export async function generateReceipt(
  bookingId: string,
): Promise<{ ok: true; receipt: { id: string; receiptNumber: string; subtotalCents: number; tipCents: number; totalCents: number } } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const role = (session.user as { role?: string }).role
  if (role !== "customer" && role !== "admin" && role !== "super_admin") return { error: "Forbidden" }

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: {
      customerId: true,
      status: true,
      estimatedPrice: true,
      finalPrice: true,
      tip: { select: { amountCents: true } },
      receipt: true,
    },
  })
  if (!booking) return { error: "Booking not found" }

  const isAdmin = role === "admin" || role === "super_admin"
  if (!isAdmin && booking.customerId !== session.user.id) return { error: "Forbidden" }
  if (booking.status !== "completed") return { error: "Receipt only available for completed trips" }

  // Idempotent: return existing receipt if found
  if (booking.receipt) {
    return {
      ok: true,
      receipt: {
        id: booking.receipt.id,
        receiptNumber: booking.receipt.receiptNumber,
        subtotalCents: booking.receipt.subtotalCents,
        tipCents: booking.receipt.tipCents,
        totalCents: booking.receipt.totalCents,
      },
    }
  }

  try {
    const subtotalCents = booking.finalPrice ?? booking.estimatedPrice
    const tipCents = booking.tip?.amountCents ?? 0
    const totalCents = subtotalCents + tipCents
    const receiptNumber = `RCP-${Date.now().toString(36).toUpperCase()}`

    const receipt = await db.receipt.create({
      data: {
        bookingId,
        receiptNumber,
        subtotalCents,
        tipCents,
        totalCents,
      },
    })

    await db.tripEvent.create({
      data: {
        bookingId,
        actorUserId: session.user.id,
        actorRole: role,
        eventType: "receipt_generated",
        metadata: { receiptNumber, totalCents },
      },
    })

    return {
      ok: true,
      receipt: {
        id: receipt.id,
        receiptNumber: receipt.receiptNumber,
        subtotalCents: receipt.subtotalCents,
        tipCents: receipt.tipCents,
        totalCents: receipt.totalCents,
      },
    }
  } catch (err: unknown) {
    if (process.env.NODE_ENV === "development") console.error("[generateReceipt]", err)
    return { error: "Failed to generate receipt" }
  }
}

// ── getReceipt ────────────────────────────────────────────────────────────────

export async function getReceipt(bookingId: string): Promise<
  | {
      receipt: {
        id: string
        receiptNumber: string
        subtotalCents: number
        tipCents: number
        totalCents: number
        createdAt: Date
      }
      booking: {
        id: string
        reference: string
        pickupAddress: string
        dropoffAddress: string
        dateTime: Date
        status: string
      }
    }
  | { error: string }
> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const role = (session.user as { role?: string }).role

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      reference: true,
      customerId: true,
      pickupAddress: true,
      dropoffAddress: true,
      dateTime: true,
      status: true,
      receipt: true,
    },
  })
  if (!booking) return { error: "Booking not found" }

  const isAdmin = role === "admin" || role === "super_admin"
  if (!isAdmin && booking.customerId !== session.user.id) return { error: "Forbidden" }
  if (!booking.receipt) return { error: "No receipt found for this booking" }

  return {
    receipt: {
      id: booking.receipt.id,
      receiptNumber: booking.receipt.receiptNumber,
      subtotalCents: booking.receipt.subtotalCents,
      tipCents: booking.receipt.tipCents,
      totalCents: booking.receipt.totalCents,
      createdAt: booking.receipt.createdAt,
    },
    booking: {
      id: booking.id,
      reference: booking.reference,
      pickupAddress: booking.pickupAddress,
      dropoffAddress: booking.dropoffAddress,
      dateTime: booking.dateTime,
      status: booking.status,
    },
  }
}
