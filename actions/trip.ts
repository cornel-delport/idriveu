"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendWhatsApp } from "@/lib/whatsapp"
import type { BookingStatus } from "@/lib/types"
import type { BookingStatus as PrismaBookingStatus } from "@prisma/client"

type TripStatusResult = { ok: true } | { error: string }

/** Driver or admin updates the status of an active trip */
export async function updateTripStatus(
  bookingId: string,
  status: BookingStatus,
): Promise<TripStatusResult> {
  const session = await auth()
  if (!session?.user) return { error: "Not authenticated" }
  const userRole = (session.user as { role?: string }).role

  if (userRole !== "admin" && userRole !== "driver") {
    return { error: "Forbidden" }
  }

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: { select: { phone: true, name: true } },
      driver: { select: { name: true } },
      childDetail: true,
    },
  })
  if (!booking) return { error: "Booking not found" }

  // Role check: driver must be the assigned driver; admin can always update
  if (userRole !== "admin" && booking.driverId !== session.user.id) {
    return { error: "Forbidden" }
  }

  await db.booking.update({
    where: { id: bookingId },
    data: { status: status as PrismaBookingStatus, statusUpdatedAt: new Date() },
  })

  // WhatsApp notifications — genuinely non-blocking; errors are logged inside sendWhatsApp
  const customerPhone = booking.customer.phone
  if (customerPhone) {
    const driverName = booking.driver?.name ?? "Your driver"

    if (status === "driver_on_the_way") {
      void sendWhatsApp(
        customerPhone,
        "DRIVER_ON_THE_WAY",
        { driverName, pickup: booking.pickupAddress },
        bookingId,
      )
    } else if (status === "arrived") {
      void sendWhatsApp(
        customerPhone,
        "DRIVER_ARRIVED",
        { pickup: booking.pickupAddress },
        bookingId,
      )
    } else if (status === "in_progress" && booking.childPickup) {
      // Only send a notification for in_progress when it's a child pickup trip
      void sendWhatsApp(
        customerPhone,
        "CHILD_PICKUP_ALERT",
        {
          childName: booking.childDetail?.childName ?? "your child",
          school: booking.childDetail?.school ?? booking.pickupAddress,
        },
        bookingId,
      )
    } else if (status === "completed") {
      if (booking.childPickup) {
        void Promise.all([
          sendWhatsApp(
            customerPhone,
            "TRIP_COMPLETED",
            {
              ref: booking.reference,
              amount: String(booking.finalPrice ?? booking.estimatedPrice),
              link: `${process.env.NEXTAUTH_URL}/review?booking=${bookingId}`,
            },
            bookingId,
          ),
          sendWhatsApp(
            customerPhone,
            "CHILD_DROPOFF_ALERT",
            {
              childName: booking.childDetail?.childName ?? "your child",
              address: booking.dropoffAddress,
            },
            bookingId,
          ),
        ])
      } else {
        void sendWhatsApp(
          customerPhone,
          "TRIP_COMPLETED",
          {
            ref: booking.reference,
            amount: String(booking.finalPrice ?? booking.estimatedPrice),
            link: `${process.env.NEXTAUTH_URL}/review?booking=${bookingId}`,
          },
          bookingId,
        )
      }
    }
  }

  revalidatePath(`/trip/${bookingId}`)
  revalidatePath(`/driver/trip/${bookingId}`)
  revalidatePath("/driver")
  revalidatePath("/dashboard")

  return { ok: true }
}
