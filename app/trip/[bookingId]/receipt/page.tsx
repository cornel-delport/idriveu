export const dynamic = "force-dynamic"

import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getReceipt, generateReceipt } from "@/actions/posttrip"
import { ReceiptCard } from "@/components/trip/receipt-card"
import { MobileShell } from "@/components/mobile-shell"
import { AppTopBar } from "@/components/app-top-bar"
import { BottomNav, BottomNavSpacer } from "@/components/bottom-nav"
import Link from "next/link"
import { ArrowRight, Star } from "lucide-react"

export default async function ReceiptPage({
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
      serviceId: true,
      status: true,
      customerId: true,
      pickupAddress: true,
      dropoffAddress: true,
      dateTime: true,
      estimatedPrice: true,
      finalPrice: true,
      driver: { select: { name: true } },
      review: { select: { id: true } },
      receipt: true,
    },
  })
  if (!booking) notFound()

  const role = (session.user as { role?: string }).role
  const isAdmin = role === "admin" || role === "super_admin"
  if (!isAdmin && booking.customerId !== session.user.id) notFound()

  // Auto-generate receipt if completed and none exists yet
  if (booking.status === "completed" && !booking.receipt) {
    await generateReceipt(bookingId)
    redirect(`/trip/${bookingId}/receipt`)
  }

  if (booking.status !== "completed") {
    return (
      <MobileShell>
        <AppTopBar title="Receipt" backHref="/dashboard" />
        <main className="flex flex-col items-center gap-4 px-6 py-20 text-center">
          <p className="text-[15px] font-medium text-foreground">
            Receipt will be available once the trip is completed.
          </p>
          <Link
            href="/dashboard"
            className="mt-2 inline-flex h-12 items-center rounded-2xl bg-primary px-8 text-[14px] font-semibold text-primary-foreground"
          >
            Back to dashboard
          </Link>
        </main>
      </MobileShell>
    )
  }

  const receiptResult = await getReceipt(bookingId)
  if ("error" in receiptResult) {
    return (
      <MobileShell>
        <AppTopBar title="Receipt" backHref="/dashboard" />
        <main className="flex flex-col items-center gap-4 px-6 py-20 text-center">
          <p className="text-[14px] text-muted-foreground">{receiptResult.error}</p>
          <Link href="/dashboard" className="text-primary text-[14px] font-medium">
            Back to dashboard
          </Link>
        </main>
      </MobileShell>
    )
  }

  const { receipt } = receiptResult

  return (
    <MobileShell>
      <AppTopBar title="Receipt" backHref="/dashboard" />
      <main className="px-4 pt-4 pb-4">
        <ReceiptCard
          receipt={{
            receiptNumber: receipt.receiptNumber,
            subtotalCents: receipt.subtotalCents,
            tipCents: receipt.tipCents,
            totalCents: receipt.totalCents,
            createdAt: receipt.createdAt,
          }}
          booking={{
            reference: booking.reference,
            serviceId: booking.serviceId,
            pickupAddress: booking.pickupAddress,
            dropoffAddress: booking.dropoffAddress,
            dateTime: booking.dateTime,
            driverName: booking.driver?.name,
          }}
          className="mx-auto max-w-md"
        />

        {/* Post-trip CTAs (customer only) */}
        {!isAdmin && (
          <div className="mx-auto mt-5 flex max-w-md flex-col gap-3">
            {!booking.review && (
              <Link
                href={`/trip/${bookingId}/rate`}
                className="tap flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary text-[14px] font-semibold text-primary-foreground"
              >
                <Star className="h-4 w-4" />
                Rate your trip
              </Link>
            )}

            <Link
              href="/customer/past-trips"
              className="tap flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-card text-[14px] font-medium text-foreground"
            >
              View trip history
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/dashboard"
              className="text-center text-[13px] text-muted-foreground underline-offset-4 hover:underline"
            >
              Back to dashboard
            </Link>
          </div>
        )}
      </main>
      <BottomNavSpacer />
      <BottomNav />
    </MobileShell>
  )
}
