'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

export async function updateProfile(data: {
  name?: string
  phone?: string
  avatar?: string
}): Promise<{ success: true } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Unauthorized' }

  await db.user.update({
    where: { id: session.user.id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.phone && { phone: data.phone }),
      ...(data.avatar && { avatar: data.avatar }),
    },
  })

  revalidatePath('/profile')
  return { success: true }
}

export async function savePlace(data: {
  label: string
  address: string
  lat?: number
  lng?: number
}): Promise<{ success: true } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Unauthorized' }

  const schema = z.object({
    label: z.string().min(1),
    address: z.string().min(3),
    lat: z.number().optional(),
    lng: z.number().optional(),
  })
  const parsed = schema.safeParse(data)
  if (!parsed.success) return { error: 'Invalid data' }

  await db.savedPlace.create({
    data: { userId: session.user.id, ...parsed.data },
  })

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deletePlace(id: string): Promise<{ success: true } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Unauthorized' }

  const place = await db.savedPlace.findUnique({ where: { id } })
  if (!place || place.userId !== session.user.id) return { error: 'Not found' }

  await db.savedPlace.delete({ where: { id } })

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function submitReview(data: {
  bookingId: string
  rating: number
  comment?: string
}): Promise<{ success: true } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Unauthorized' }

  const booking = await db.booking.findUnique({
    where: { id: data.bookingId },
    select: { customerId: true, driverId: true, status: true },
  })
  if (!booking) return { error: 'Booking not found' }
  if (booking.customerId !== session.user.id) return { error: 'Unauthorized' }
  if (booking.status !== 'completed') return { error: 'Can only review completed trips' }
  if (!booking.driverId) return { error: 'No driver assigned' }

  const schema = z.object({ rating: z.number().min(1).max(5), comment: z.string().optional() })
  const parsed = schema.safeParse({ rating: data.rating, comment: data.comment })
  if (!parsed.success) return { error: 'Invalid rating' }

  await db.review.create({
    data: {
      bookingId: data.bookingId,
      customerId: session.user.id,
      driverId: booking.driverId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
  })

  // Recalculate driver average rating
  const reviews = await db.review.findMany({ where: { driverId: booking.driverId }, select: { rating: true } })
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  await db.driverProfile.update({
    where: { userId: booking.driverId },
    data: { rating: avg, totalTrips: { increment: 1 } },
  })

  return { success: true }
}

export async function promoteToDriver(userId: string): Promise<{ success: true } | { error: string }> {
  const session = await auth()
  if (session?.user?.role !== 'admin') return { error: 'Unauthorized' }

  await db.user.update({ where: { id: userId }, data: { role: 'driver' } })
  await db.driverProfile.upsert({
    where: { userId },
    update: {},
    create: { userId, languages: ['English'], verified: false, female: false },
  })

  revalidatePath('/admin')
  return { success: true }
}
