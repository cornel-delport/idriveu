export const dynamic = 'force-dynamic'

import { redirect } from "next/navigation"
import Link from "next/link"
import { MobileShell } from "@/components/mobile-shell"
import { AppTopBar } from "@/components/app-top-bar"
import { BottomNav, BottomNavSpacer } from "@/components/bottom-nav"
import { SignOutButton } from "@/components/sign-out-button"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import {
  Bell,
  CreditCard,
  HelpCircle,
  LifeBuoy,
  Mail,
  MapPin,
  Shield,
  Star,
  User,
  History,
  Pencil,
  Receipt,
  PhoneCall,
} from "lucide-react"
import { IconCard, IconStat } from "@/components/ui-icon"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { savedPlaces: { orderBy: { createdAt: "asc" } } },
  })
  if (!user) redirect("/login")

  const initials = (user.name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const tripCount = await db.booking.count({
    where: { customerId: session.user.id, status: "completed" },
  })

  const memberYear = new Date(user.createdAt).getFullYear()

  return (
    <MobileShell>
      <AppTopBar title="Profile" />

      <section className="px-5 pb-6 pt-4">
        {/* Identity card — premium dark gradient */}
        <div className="card-dark rounded-3xl p-5">
          <div className="flex items-center gap-4">
            <span className="chip-glass flex h-14 w-14 items-center justify-center rounded-full text-[18px] font-semibold text-white">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="text-[20px] font-semibold tracking-tight text-white">
                {user.name ?? "No name"}
              </h1>
              <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-white/75">
                <Star className="h-3.5 w-3.5 fill-current text-amber-300" /> 4.98 passenger rating
              </p>
            </div>
            <Link
              href="#"
              aria-label="Edit profile"
              className="tap chip-glass flex h-9 w-9 items-center justify-center rounded-full text-white"
            >
              <Pencil className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <IconStat
              icon={Receipt}
              value={tripCount}
              label="Trips"
              surface="dark"
            />
            <IconStat
              icon={MapPin}
              value={user.savedPlaces.length}
              label="Saved"
              surface="dark"
            />
            <IconStat
              icon={Star}
              value={memberYear}
              label="Since"
              surface="dark"
            />
          </div>
        </div>

        {/* Account */}
        <SectionHeading>Account</SectionHeading>
        <div className="flex flex-col gap-2">
          <IconCard
            icon={User}
            title="Personal details"
            description="Name, email, phone"
            href="#"
            showChevron
          />
          <IconCard
            icon={MapPin}
            title="Saved places"
            description="Home, work, favourite pickups"
            href="#"
            showChevron
          />
          <IconCard
            icon={History}
            title="Trip history"
            description="Receipts, ratings & past trips"
            href="/customer/past-trips"
            showChevron
          />
          <IconCard
            icon={CreditCard}
            title="Payment methods"
            description="Cards, EFT, cash on arrival"
            href="#"
            showChevron
          />
          <IconCard
            icon={Bell}
            title="Notifications"
            description="SMS, WhatsApp and email alerts"
            href="#"
            showChevron
          />
        </div>

        {/* Safety */}
        <SectionHeading>Safety</SectionHeading>
        <div className="flex flex-col gap-2">
          <IconCard
            icon={Shield}
            title="Trusted contacts"
            description="Share your live trip with 3 people"
            href="#"
            showChevron
            tone="success"
          />
          <IconCard
            icon={LifeBuoy}
            title="Emergency contact"
            description="+27 84 555 0303"
            href="#"
            showChevron
            tone="danger"
          />
        </div>

        {/* Support */}
        <SectionHeading>Support</SectionHeading>
        <div className="flex flex-col gap-2">
          <IconCard
            icon={HelpCircle}
            title="Help centre"
            description="FAQs and how-to guides"
            href="/contact"
            showChevron
            tone="muted"
          />
          <IconCard
            icon={PhoneCall}
            title="Contact IDriveU"
            description="We reply within 10 min · 24/7"
            href="/contact"
            showChevron
            tone="muted"
          />
          <IconCard
            icon={Mail}
            title="Terms & safety"
            description="How we keep you safe"
            href="/terms"
            showChevron
            tone="muted"
          />
        </div>

        <div className="mt-8">
          <SignOutButton />
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          IDriveU · Plettenberg Bay · v1.0
        </p>
      </section>

      <BottomNavSpacer />
      <BottomNav />
    </MobileShell>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 mt-7 px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </h2>
  )
}
