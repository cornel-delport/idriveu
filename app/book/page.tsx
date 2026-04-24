import { Suspense } from "react"
import { BookingWizard } from "@/components/booking/booking-wizard"

export const metadata = {
  title: "Book a driver — IDriveU",
  description:
    "Book a private driver in Plettenberg Bay. Drive Me Home, Wine Farm Driver, Airport Transfers, and more.",
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading…</div>}>
      <BookingWizard />
    </Suspense>
  )
}
