import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (session.user.role !== 'driver' && session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const bookings = await db.booking.findMany({
    where: {
      driverId: null,
      status: 'confirmed',
      dateTime: { gt: new Date() },
    },
    orderBy: { dateTime: 'asc' },
    include: {
      customer: { select: { name: true, phone: true } },
    },
  })

  return NextResponse.json(bookings)
}
