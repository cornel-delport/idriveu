export const dynamic = 'force-dynamic'

import Link from "next/link"
import { redirect } from "next/navigation"
import { MobileShell } from "@/components/mobile-shell"
import { AppTopBar } from "@/components/app-top-bar"
import { BottomNav, BottomNavSpacer } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
  ItemDescription,
  ItemActions,
  ItemGroup,
  ItemSeparator,
} from "@/components/ui/item"
import { SignOutButton } from "@/components/sign-out-button"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import {
  Bell,
  ChevronRight,
  CreditCard,
  HelpCircle,
  LifeBuoy,
  Mail,
  MapPin,
  Shield,
  Star,
  User,
} from "lucide-react"

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

      <section className="px-5 pt-4 pb-6">
        {/* Identity card */}
        <div className="rounded-3xl bg-primary p-5 text-primary-foreground">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/15 text-[18px] font-semibold">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="text-[20px] font-semibold tracking-tight">
                {user.name ?? "No name"}
              </h1>
              <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-primary-foreground/80">
                <Star className="h-3.5 w-3.5 fill-current" /> 4.98 passenger rating
              </p>
            </div>
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="h-9 rounded-full bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25"
            >
              <Link href="#">Edit</Link>
            </Button>
          </div>
          <dl className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-primary-foreground/10 p-3 text-center">
            <Stat label="Trips" value={String(tripCount)} />
            <Stat label="Saved" value={`${user.savedPlaces.length}`} />
            <Stat label="Since" value={String(memberYear)} />
          </dl>
        </div>

        {/* Account */}
        <h2 className="mt-7 px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Account
        </h2>
        <div className="mt-2 overflow-hidden rounded-3xl border border-border bg-card">
          <ItemGroup>
            <ProfileItem icon={User} title="Personal details" description="Name, email, phone" />
            <ItemSeparator />
            <ProfileItem
              icon={MapPin}
              title="Saved places"
              description="Home, work, favourite pickup spots"
            />
            <ItemSeparator />
            <ProfileItem
              icon={CreditCard}
              title="Payment methods"
              description="Cards, EFT, cash on arrival"
            />
            <ItemSeparator />
            <ProfileItem icon={Bell} title="Notifications" description="SMS, WhatsApp and email alerts" />
          </ItemGroup>
        </div>

        {/* Safety */}
        <h2 className="mt-7 px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Safety
        </h2>
        <div className="mt-2 overflow-hidden rounded-3xl border border-border bg-card">
          <ItemGroup>
            <ProfileItem icon={Shield} title="Trusted contacts" description="Share your live trip with 3 people" />
            <ItemSeparator />
            <ProfileItem icon={LifeBuoy} title="Emergency contact" description="+27 84 555 0303" />
          </ItemGroup>
        </div>

        {/* Support */}
        <h2 className="mt-7 px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Support
        </h2>
        <div className="mt-2 overflow-hidden rounded-3xl border border-border bg-card">
          <ItemGroup>
            <ProfileItem icon={HelpCircle} title="Help centre" description="FAQs and how-to guides" href="/contact" />
            <ItemSeparator />
            <ProfileItem
              icon={Mail}
              title="Contact IDriveU"
              description="We reply within 10 minutes, 24/7"
              href="/contact"
            />
            <ItemSeparator />
            <ProfileItem icon={Shield} title="Terms & safety" description="How we keep you safe" href="/terms" />
          </ItemGroup>
        </div>

        <SignOutButton />

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          IDriveU · Plettenberg Bay · v1.0
        </p>
      </section>

      <BottomNavSpacer />
      <BottomNav />
    </MobileShell>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dd className="text-[18px] font-semibold tracking-tight">{value}</dd>
      <dt className="text-[11px] text-primary-foreground/80">{label}</dt>
    </div>
  )
}

interface ProfileItemProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  href?: string
}

function ProfileItem({ icon: Icon, title, description, href = "#" }: ProfileItemProps) {
  return (
    <Item asChild className="gap-3 px-4 py-3.5">
      <Link href={href}>
        <ItemMedia className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-[18px] w-[18px]" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="text-[14px]">{title}</ItemTitle>
          <ItemDescription className="text-[12px]">{description}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </ItemActions>
      </Link>
    </Item>
  )
}
