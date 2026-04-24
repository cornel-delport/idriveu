'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendWhatsApp } from '@/lib/whatsapp'
import { z } from 'zod'
import type { BookingStatus } from '@prisma/client'

const createBookingSchema = z.object({
  serviceId: z.string(),
  pickupAddress: z.string().min(3),
  pickupLat: z.number().optional(),
  pickupLng: z.number().optional(),
  dropoffAddress: z.string().min(3),
  dropoffLat: z.number().optional(),
  dropoffLng: z.number().optional(),
  stops: z
    .array(
      z.object({
        address: z.string(),
        lat: z.number().optional(),
        lng: z.number().optional(),
      })
    )
    .default([]),
  dateTime: z.string(), // ISO string
  returnTrip: z.boolean().default(false),
  returnDateTime: z.string().optional(),
  passengerCount: z.number().min(1).max(8).default(1),
  usesCustomerVehicle: z.boolean().default(true),
  requiresFemaleDriver: z.boolean().default(false),
  childPickup: z.boolean().default(false),
  childDetails: z
    .object({
      childName: z.string(),
      school: z.string(),
      authorisedAdult: z.string(),
      emergencyContact: z.string(),
      instructions: z.string().optional(),
    })
    .optional(),
  distanceKm: z.number().default(0),
  durationMinutes: z.number().default(0),
  estimatedPrice: z.number(),
  notes: z.string().optional(),
  paymentMethod: z.enum(['eft', 'cash']).default('cash'),
})

export async function createBooking(
  data: z.infer<typeof createBookingSchema>
): Promise<{ reference: string } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Please sign in to book.' }

  const parsed = createBookingSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid booking data' }

  const d = parsed.data
  const reference = `IDU-${Math.floor(1000 + Math.random() * 9000)}`

  const booking = await db.booking.create({
    data: {
      reference,
      customerId: session.user.id,
      serviceId: d.serviceId,
      status: 'confirmed',
      paymentStatus: 'pending',
      paymentMethod: d.paymentMethod,
      pickupAddress: d.pickupAddress,
      pickupLat: d.pickupLat,
      pickupLng: d.pickupLng,
      dropoffAddress: d.dropoffAddress,
      dropoffLat: d.dropoffLat,
      dropoffLng: d.dropoffLng,
      stops: d.stops,
      dateTime: new Date(d.dateTime),
      returnTrip: d.returnTrip,
      returnDateTime: d.returnDateTime ? new Date(d.returnDateTime) : undefined,
      passengerCount: d.passengerCount,
      usesCustomerVehicle: d.usesCustomerVehicle,
      requiresFemaleDriver: d.requiresFemaleDriver,
      childPickup: d.childPickup,
      distanceKm: d.distanceKm,
      durationMinutes: d.durationMinutes,
      estimatedPrice: d.estimatedPrice,
      notes: d.notes,
      childDetail: d.childDetails ? { create: d.childDetails } : undefined,
    },
    include: { customer: true },
  })

  // Notify customer
  if (booking.customer.phone) {
    await sendWhatsApp(booking.customer.phone, 'BOOKING_CONFIRMED', {
      name: booking.customer.name ?? 'there',
      ref: reference,
      date: new Date(d.dateTime).toLocaleDateString('en-ZA', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }),
      time: new Date(d.dateTime).toLocaleTimeString('en-ZA', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }, booking.id)
  }

  // Notify all online drivers
  const onlineDrivers = await db.driverProfile.findMany({
    where: { isOnline: true },
    include: { user: { select: { phone: true } } },
  })

  for (const driver of onlineDrivers) {
    if (driver.user.phone) {
      await sendWhatsApp(driver.user.phone, 'NEW_JOB_AVAILABLE', {
        service: d.serviceId,
        date: new Date(d.dateTime).toLocaleDateString('en-ZA', {
          day: 'numeric',
          month: 'short',
        }),
        time: new Date(d.dateTime).toLocaleTimeString('en-ZA', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        pickup: d.pickupAddress,
        price: String(d.estimatedPrice),
        ref: reference,
      }, booking.id)
    }
  }

  revalidatePath('/dashboard')
  return { reference }
}

export async function claimBooking(bookingId: string): Promise<{ success: true } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'driver') return { error: 'Unauthorized' }

  try {
    const booking = await db.$transaction(async (tx) => {
      const b = await tx.booking.findUnique({ where: { id: bookingId } })
      if (!b) throw new Error('Booking not found')
      if (b.driverId) throw new Error('Already claimed')
      if (b.status !== 'confirmed') throw new Error('Not available')

      return tx.booking.update({
        where: { id: bookingId },
        data: {
          driverId: session.user.id,
          status: 'driver_assigned',
          statusUpdatedAt: new Date(),
        },
        include: {
          customer: { select: { phone: true, name: true } },
          driver: { select: { name: true } },
        },
      })
    })

    if (booking.customer.phone) {
      await sendWhatsApp(booking.customer.phone, 'DRIVER_ASSIGNED', {
        driverName: booking.driver?.name ?? 'Your driver',
        ref: booking.reference,
      }, bookingId)
    }

    revalidatePath('/driver')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to claim booking'
    return { error: message }
  }
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
): Promise<{ success: true } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Unauthorized' }
  if (session.user.role !== 'driver' && session.user.role !== 'admin') return { error: 'Unauthorized' }

  const booking = await db.booking.update({
    where: { id: bookingId },
    data: { status, statusUpdatedAt: new Date() },
    include: {
      customer: { select: { phone: true, name: true } },
      driver: { select: { name: true } },
    },
  })

  const phone = booking.customer.phone
  if (phone) {
    const driverName = booking.driver?.name ?? 'Your driver'
    if (status === 'driver_on_the_way') {
      await sendWhatsApp(phone, 'DRIVER_ON_THE_WAY', { driverName, pickup: booking.pickupAddress }, bookingId)
    } else if (status === 'arrived') {
      await sendWhatsApp(phone, 'DRIVER_ARRIVED', { pickup: booking.pickupAddress }, bookingId)
    } else if (status === 'completed') {
      await sendWhatsApp(phone, 'TRIP_COMPLETED', {
        ref: booking.reference,
        amount: String(booking.finalPrice ?? booking.estimatedPrice),
        link: `${process.env.NEXTAUTH_URL}/review?booking=${bookingId}`,
      }, bookingId)
      if (booking.childPickup) {
        await sendWhatsApp(phone, 'CHILD_DROPOFF_ALERT', { address: booking.dropoffAddress }, bookingId)
      }
    } else if (status === 'in_progress' && booking.childPickup) {
      await sendWhatsApp(phone, 'CHILD_PICKUP_ALERT', {
        childName: 'your child',
        school: booking.pickupAddress,
      }, bookingId)
    } else if (status === 'cancelled') {
      await sendWhatsApp(phone, 'BOOKING_CANCELLED', { ref: booking.reference }, bookingId)
    }
  }

  revalidatePath('/driver')
  revalidatePath('/dashboard')
  revalidatePath('/admin')
  return { success: true }
}

export async function cancelBooking(bookingId: string): Promise<{ success: true } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Unauthorized' }

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { customer: { select: { phone: true } } },
  })
  if (!booking) return { error: 'Booking not found' }
  if (booking.customerId !== session.user.id && session.user.role !== 'admin') return { error: 'Unauthorized' }
  if (!['confirmed', 'driver_assigned'].includes(booking.status)) return { error: 'Cannot cancel at this stage' }

  await db.booking.update({
    where: { id: bookingId },
    data: { status: 'cancelled', statusUpdatedAt: new Date() },
  })

  if (booking.customer.phone) {
    await sendWhatsApp(booking.customer.phone, 'BOOKING_CANCELLED', { ref: booking.reference }, bookingId)
  }

  revalidatePath('/dashboard')
  revalidatePath('/admin')
  return { success: true }
}

export async function triggerRefund(bookingId: string): Promise<{ success: true } | { error: string }> {
  const session = await auth()
  if (session?.user?.role !== 'admin') return { error: 'Unauthorized' }

  const booking = await db.booking.update({
    where: { id: bookingId },
    data: { status: 'refund_requested', paymentStatus: 'refunded', statusUpdatedAt: new Date() },
    include: { customer: { select: { phone: true } } },
  })

  if (booking.customer.phone) {
    await sendWhatsApp(booking.customer.phone, 'REFUND_REQUESTED', { ref: booking.reference }, bookingId)
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function markRefundComplete(bookingId: string): Promise<{ success: true } | { error: string }> {
  const session = await auth()
  if (session?.user?.role !== 'admin') return { error: 'Unauthorized' }

  const booking = await db.booking.update({
    where: { id: bookingId },
    data: { status: 'refunded', paymentStatus: 'refunded', statusUpdatedAt: new Date() },
    include: { customer: { select: { phone: true } } },
  })

  if (booking.customer.phone) {
    await sendWhatsApp(booking.customer.phone, 'REFUND_COMPLETED', { ref: booking.reference }, bookingId)
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function confirmPayment(
  bookingId: string,
  method: 'eft' | 'cash'
): Promise<{ success: true } | { error: string }> {
  const session = await auth()
  if (session?.user?.role !== 'admin') return { error: 'Unauthorized' }

  await db.booking.update({
    where: { id: bookingId },
    data: { paymentStatus: 'admin_confirmed', paymentMethod: method },
  })

  revalidatePath('/admin')
  return { success: true }
}

export async function assignDriverOverride(
  bookingId: string,
  driverId: string
): Promise<{ success: true } | { error: string }> {
  const session = await auth()
  if (session?.user?.role !== 'admin') return { error: 'Unauthorized' }

  const booking = await db.booking.update({
    where: { id: bookingId },
    data: { driverId, status: 'driver_assigned', statusUpdatedAt: new Date() },
    include: {
      customer: { select: { phone: true } },
      driver: { select: { name: true } },
    },
  })

  if (booking.customer.phone) {
    await sendWhatsApp(booking.customer.phone, 'DRIVER_ASSIGNED', {
      driverName: booking.driver?.name ?? 'Your driver',
      ref: booking.reference,
    }, bookingId)
  }

  revalidatePath('/admin')
  return { success: true }
}
