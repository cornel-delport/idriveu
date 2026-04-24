import Link from "next/link"
import { MobileShell } from "@/components/mobile-shell"
import { AppTopBar } from "@/components/app-top-bar"
import { BottomNav, BottomNavSpacer } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from "@/components/ui/item"
import { MessageCircle, Phone, Mail, ChevronRight, ShieldCheck } from "lucide-react"

export default function ContactPage() {
  return (
    <MobileShell>
      <AppTopBar title="Contact & help" showBack />

      <section className="px-5 pt-4">
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-balance">
          We&apos;re here, day and night.
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          Typical reply in under 10 minutes. For live bookings, tap Live call below.
        </p>
      </section>

      {/* Quick actions */}
      <section className="mt-6 flex flex-col gap-3 px-5">
        <QuickAction
          icon={Phone}
          title="Live call"
          description="+27 82 123 4567 · 24/7 dispatch"
          href="tel:+27821234567"
          tone="primary"
        />
        <QuickAction
          icon={MessageCircle}
          title="WhatsApp us"
          description="Fastest for bookings and changes"
          href="https://wa.me/27821234567"
          tone="default"
        />
        <QuickAction
          icon={Mail}
          title="Email"
          description="hello@idriveu.co.za"
          href="mailto:hello@idriveu.co.za"
          tone="default"
        />
      </section>

      {/* Message form */}
      <section className="mt-8 px-5">
        <div className="rounded-3xl border border-border bg-card p-5">
          <h2 className="text-[18px] font-semibold tracking-tight">Send us a message</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Booking changes, feedback, or anything else.
          </p>
          <form className="mt-5">
            <FieldGroup className="gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel htmlFor="c-name">Name</FieldLabel>
                  <Input id="c-name" placeholder="Your name" className="h-11 text-base" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="c-phone">Phone</FieldLabel>
                  <Input id="c-phone" inputMode="tel" placeholder="+27 ..." className="h-11 text-base" />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="c-email">Email</FieldLabel>
                <Input id="c-email" type="email" placeholder="you@example.com" className="h-11 text-base" />
              </Field>
              <Field>
                <FieldLabel htmlFor="c-message">Message</FieldLabel>
                <Textarea
                  id="c-message"
                  placeholder="How can we help?"
                  rows={4}
                  className="min-h-[120px] resize-none text-base"
                />
              </Field>
            </FieldGroup>
            <Button
              type="submit"
              size="lg"
              className="mt-5 h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Send message
            </Button>
          </form>
        </div>
      </section>

      {/* Trust footer */}
      <section className="mt-6 px-5 pb-6">
        <div className="flex items-start gap-3 rounded-3xl bg-muted/50 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            All IDriveU drivers are vetted, insured and tracked. Read our{" "}
            <Link href="/terms" className="font-medium text-primary hover:underline">
              terms & safety policy
            </Link>
            .
          </p>
        </div>
      </section>

      <BottomNavSpacer />
      <BottomNav />
    </MobileShell>
  )
}

interface QuickActionProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  href: string
  tone?: "primary" | "default"
}

function QuickAction({ icon: Icon, title, description, href, tone = "default" }: QuickActionProps) {
  return (
    <Item
      asChild
      className={
        tone === "primary"
          ? "rounded-3xl border border-primary/30 bg-primary/5 p-4"
          : "rounded-3xl border border-border bg-card p-4"
      }
    >
      <a href={href}>
        <ItemMedia
          className={
            tone === "primary"
              ? "flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
              : "flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"
          }
        >
          <Icon className="h-5 w-5" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="text-[15px]">{title}</ItemTitle>
          <ItemDescription className="text-[12.5px]">{description}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </ItemActions>
      </a>
    </Item>
  )
}
