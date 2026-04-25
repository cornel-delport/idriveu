export const dynamic = "force-dynamic"

import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { RateForm } from "./rate-form"
import { MobileShell } from "@/components/mobile-shell"
import { AppTopBar } from "@/components/app-top-bar"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Rate your trip — IDriveU",
}

export default async function RateTripPage({
  params,
}: {
  params: Promise<{ bookingId: string }>
}) {
  const { bookingId } = await params
  const session = await auth()
  if (!session?.user) redirect("/login")

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      reference: true,
      status: true,
      customerId: true,
      pickupAddress: true,
      dropoffAddress: true,
      driver: { select: { name: true } },
      review: { select: { id: true, rating: true } },
    },
  })
  if (!booking) notFound()
  if (booking.customerId !== session.user.id) notFound()
  if (booking.status !== "completed") redirect(`/trip/${bookingId}`)

  // Already rated — show thank-you
  if (booking.review) {
    return (
      <MobileShell>
        <AppTopBar title="Trip rated" backHref="/dashboard" />
        <main className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight">Already rated</h1>
          <p className="text-[14px] text-muted-foreground">
            You gave this trip {booking.review.rating} star
            {booking.review.rating !== 1 ? "s" : ""}. Thank you!
          </p>
          <Link
            href={`/trip/${bookingId}/tip`}
            className="mt-4 inline-flex h-12 items-center rounded-2xl bg-primary px-8 text-[14px] font-semibold text-primary-foreground"
          >
            Leave a tip
          </Link>
        </main>
      </MobileShell>
    )
  }

  return (
    <MobileShell>
      <AppTopBar title="Rate your trip" backHref={`/trip/${bookingId}`} />
      <main className="px-4 pb-10 pt-4">
        <RateForm
          bookingId={bookingId}
          driverName={booking.driver?.name ?? "Your driver"}
          reference={booking.reference}
          pickup={booking.pickupAddress}
          dropoff={booking.dropoffAddress}
        />
      </main>
    </MobileShell>
  )
}
