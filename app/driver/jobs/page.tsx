export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { MobileShell } from '@/components/mobile-shell'
import { AppTopBar } from '@/components/app-top-bar'
import { BottomNav, BottomNavSpacer } from '@/components/bottom-nav'
import { SignedInAs } from '@/components/role-banner'
import { JobsClient, type JobCardData, type ActiveTripData } from './jobs-client'

export const metadata = {
  title: 'Jobs — iDriveU Driver',
}

export default async function DriverJobsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const role = (session.user as { role?: string }).role ?? 'customer'
  if (role !== 'driver' && role !== 'admin' && role !== 'super_admin') {
    redirect('/home')
  }

  const driverId = session.user.id as string

  const [availableBookings, activeBooking] = await Promise.all([
    db.booking.findMany({
      where: { status: 'confirmed', driverId: null },
      orderBy: { dateTime: 'asc' },
      take: 30,
    }),
    db.booking.findFirst({
      where: {
        driverId,
        status: { in: ['driver_assigned', 'driver_on_the_way', 'arrived', 'in_progress'] },
      },
      orderBy: { dateTime: 'asc' },
    }),
  ])

  const jobs: JobCardData[] = availableBookings.map((b) => ({
    id: b.id,
    reference: b.reference,
    serviceId: b.serviceId,
    pickupAddress: b.pickupAddress,
    dropoffAddress: b.dropoffAddress,
    dateTime: b.dateTime.toISOString(),
    estimatedPrice: b.estimatedPrice,
    passengerCount: b.passengerCount,
    distanceKm: b.distanceKm,
  }))

  const activeTrip: ActiveTripData | null = activeBooking
    ? {
        id: activeBooking.id,
        reference: activeBooking.reference,
        pickupAddress: activeBooking.pickupAddress,
        dropoffAddress: activeBooking.dropoffAddress,
        dateTime: activeBooking.dateTime.toISOString(),
        status: activeBooking.status,
      }
    : null

  return (
    <MobileShell>
      <AppTopBar title="Jobs" />
      <main className="px-4 pb-6 pt-3">
        <SignedInAs
          role={role as 'driver' | 'admin' | 'super_admin'}
          name={session.user.name}
          className="mb-4"
        />
        <JobsClient jobs={jobs} activeTrip={activeTrip} />
        <BottomNavSpacer />
      </main>
      <BottomNav />
    </MobileShell>
  )
}
