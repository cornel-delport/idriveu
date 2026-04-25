export const dynamic = "force-dynamic"

import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { TipForm } from "./tip-form"
import { MobileShell } from "@/components/mobile-shell"
import { AppTopBar } from "@/components/app-top-bar"
import { Heart } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Leave a tip — IDriveU",
}

export default async function TipPage({
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
      driver: { select: { name: true } },
      tip: { select: { id: true, amountCents: true } },
    },
  })
  if (!booking) notFound()
  if (booking.customerId !== session.user.id) notFound()
  if (booking.status !== "completed") redirect(`/trip/${bookingId}`)

  // Already tipped — show summary
  if (booking.tip) {
    return (
      <MobileShell>
        <AppTopBar title="Tip sent" backHref={`/trip/${bookingId}/receipt`} />
        <main className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-10 w-10 text-primary" fill="currentColor" />
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight">Tip already sent!</h1>
          <p className="text-[14px] text-muted-foreground">
            You sent R{(booking.tip.amountCents / 100).toFixed(2)} to{" "}
            {booking.driver?.name ?? "your driver"}. They appreciate it!
          </p>
          <Link
            href={`/trip/${bookingId}/receipt`}
            className="mt-4 inline-flex h-12 items-center rounded-2xl bg-primary px-8 text-[14px] font-semibold text-primary-foreground"
          >
            View receipt
          </Link>
        </main>
      </MobileShell>
    )
  }

  return (
    <MobileShell>
      <AppTopBar title="Leave a tip" backHref={`/trip/${bookingId}/rate`} />
      <main className="px-4 pb-10 pt-4">
        <TipForm
          bookingId={bookingId}
          driverName={booking.driver?.name ?? "Your driver"}
          reference={booking.reference}
        />
      </main>
    </MobileShell>
  )
}
