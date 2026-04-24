export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { DriverDashboardClient } from './driver-dashboard-client'

export default async function DriverDashboard() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'driver' && session.user.role !== 'admin') redirect('/')

  const [bookings, driverProfile] = await Promise.all([
    db.booking.findMany({
      where: { driverId: session.user.id },
      include: {
        customer: { select: { name: true, phone: true } },
        childDetail: true,
      },
      orderBy: { dateTime: 'asc' },
    }),
    db.driverProfile.findUnique({
      where: { userId: session.user.id },
    }),
  ])

  // Serialize Date objects to ISO strings before passing to client component
  const serializedBookings = bookings.map((b) => ({
    ...b,
    dateTime: b.dateTime.toISOString(),
    returnDateTime: b.returnDateTime?.toISOString() ?? null,
    statusUpdatedAt: b.statusUpdatedAt.toISOString(),
    createdAt: b.createdAt.toISOString(),
  }))

  return (
    <DriverDashboardClient
      bookings={serializedBookings}
      driverName={session.user.name ?? ''}
      driverRating={driverProfile?.rating ?? 5.0}
      driverTotalTrips={driverProfile?.totalTrips ?? 0}
    />
  )
}
