# Role-Based Login Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement production-ready role-based routing so drivers go to `/driver/jobs`, customers to `/home`, and admins to `/home` (with a visible Manage Users button), all protected by centralised middleware.

**Architecture:** Create a Next.js `middleware.ts` at the project root that checks the NextAuth JWT on every protected request and redirects unauthenticated or unauthorised users before the page renders. The post-login redirect in `app/login/page.tsx` is made role-aware via a shared `lib/auth-redirect.ts` helper. New pages (`/home`, `/driver/jobs`, `/role-flow`) are added as standard App Router Server Components following the existing patterns in `/app/dashboard` and `/app/driver`.

**Tech Stack:** Next.js 16 App Router · NextAuth 5 beta (JWT strategy) · Prisma 7 + PostgreSQL · Tailwind CSS 4 · shadcn/ui · TypeScript strict

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| **Create** | `lib/auth-redirect.ts` | Pure helper: maps a role string to its canonical landing URL |
| **Create** | `middleware.ts` | Route guard for `/home`, `/driver/jobs`, `/admin/*` |
| **Modify** | `app/login/page.tsx` | Replace hardcoded `/book` redirect with role-aware redirect |
| **Modify** | `app/page.tsx` | Update per-role redirects to new canonical routes |
| **Modify** | `components/bottom-nav.tsx` | Point customer Home nav item to `/home` |
| **Create** | `app/home/page.tsx` | Authenticated home for customers + admins (Server Component) |
| **Create** | `app/home/home-client.tsx` | Client component: booking UI + conditional Manage Users button |
| **Create** | `app/driver/jobs/page.tsx` | Driver jobs page (Server Component, replaces `/driver/available`) |
| **Create** | `app/driver/jobs/jobs-client.tsx` | Client component: live job cards with accept/decline |
| **Create** | `app/role-flow/page.tsx` | `RoleFlowRepresentation` host page |
| **Create** | `components/role-flow-representation.tsx` | Visual role-flow diagram (pure presentational) |

---

## Task 1: Central Role-Redirect Helper

**Files:**
- Create: `lib/auth-redirect.ts`

- [ ] **Step 1: Write the file**

```ts
// lib/auth-redirect.ts
const ROLE_ROUTES: Record<string, string> = {
  driver: '/driver/jobs',
  admin: '/home',
  super_admin: '/home',
  customer: '/home',
}

/**
 * Returns the canonical post-login URL for a given role.
 * Defaults to /home for any unknown or missing role value.
 */
export function roleRedirectUrl(role: string | null | undefined): string {
  return ROLE_ROUTES[role ?? ''] ?? '/home'
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/auth-redirect.ts
git commit -m "feat: add roleRedirectUrl helper for centralised role routing"
```

---

## Task 2: Next.js Middleware for Route Protection

**Files:**
- Create: `middleware.ts` (project root, same level as `next.config.mjs`)

The middleware reads the NextAuth JWT from the incoming request's `next-auth.session-token` cookie using `getToken()` from `next-auth/jwt`. It protects four route groups:

| Route prefix | Allowed roles | Unauthorised → redirect |
|---|---|---|
| `/home` | any authenticated | `/login` |
| `/driver/jobs` | `driver`, `admin`, `super_admin` | `/login` or `/home` |
| `/admin` | `admin`, `super_admin` | `/login` or `/home` |
| `/dashboard` | any authenticated | `/login` |

- [ ] **Step 1: Write the middleware**

```ts
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const secret = process.env.NEXTAUTH_SECRET

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret })
  const { pathname } = req.nextUrl

  const loginUrl = new URL('/login', req.url)

  // ── /home — any authenticated user ────────────────────────────────────────
  if (pathname.startsWith('/home')) {
    if (!token) return NextResponse.redirect(loginUrl)
    return NextResponse.next()
  }

  // ── /driver/jobs — driver + admin only ────────────────────────────────────
  if (pathname.startsWith('/driver/jobs')) {
    if (!token) return NextResponse.redirect(loginUrl)
    const role = token.role as string | undefined
    if (role !== 'driver' && role !== 'admin' && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/home', req.url))
    }
    return NextResponse.next()
  }

  // ── /admin — admin + super_admin only ────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!token) return NextResponse.redirect(loginUrl)
    const role = token.role as string | undefined
    if (role !== 'admin' && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/home', req.url))
    }
    return NextResponse.next()
  }

  // ── /dashboard — any authenticated user ──────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    if (!token) return NextResponse.redirect(loginUrl)
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/home/:path*', '/driver/jobs/:path*', '/admin/:path*', '/dashboard/:path*'],
}
```

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat: add NextAuth JWT middleware for route protection"
```

---

## Task 3: Fix Post-Login Redirect in Login Page

The login page currently hard-codes `router.push('/book')` after credentials sign-in and passes `callbackUrl: '/book'` to Google sign-in. Both must become role-aware.

**Files:**
- Modify: `app/login/page.tsx`

The approach: after `signIn('credentials')` succeeds, fetch the session to read the role, then redirect. For Google we use the `callbackUrl` to land on `/`, which already does a role-based redirect via `app/page.tsx`.

- [ ] **Step 1: Import the helper and update the credentials handler**

Find this block in `app/login/page.tsx` (around line 40–50):

```ts
      if (result?.error) {
        toast.error('Invalid email or password.')
      } else {
        router.push('/book')
        router.refresh()
      }
```

Replace with:

```ts
      if (result?.error) {
        toast.error('Invalid email or password.')
      } else {
        // Re-fetch the session so we can read the role that was just set in the JWT.
        // getSession() is a client-side helper from next-auth/react.
        const { getSession } = await import('next-auth/react')
        const session = await getSession()
        const role = (session?.user as { role?: string } | undefined)?.role
        const dest =
          role === 'driver' ? '/driver/jobs'
          : role === 'admin' || role === 'super_admin' ? '/home'
          : '/home'
        router.push(dest)
        router.refresh()
      }
```

- [ ] **Step 2: Fix Google sign-in callbackUrl**

Find this line:

```ts
onClick={() => signIn('google', { callbackUrl: '/book' })}
```

Replace with:

```ts
onClick={() => signIn('google', { callbackUrl: '/' })}
```

This lands Google-authenticated users on `/` which already does per-role redirects in `app/page.tsx` (updated in Task 4).

- [ ] **Step 3: Commit**

```bash
git add app/login/page.tsx
git commit -m "feat: make post-login redirect role-aware"
```

---

## Task 4: Update Landing Page Role Redirects

`app/page.tsx` currently redirects `customer → /dashboard`, `driver → /driver`, `admin → /admin`. Update all three to the new canonical routes.

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Update the redirect block**

Find (around line 20–24):

```ts
  if (role === "customer") redirect("/dashboard")
  if (role === "driver") redirect("/driver")
  if (role === "admin" || role === "super_admin") redirect("/admin")
```

Replace with:

```ts
  if (role === "customer") redirect("/home")
  if (role === "driver") redirect("/driver/jobs")
  if (role === "admin" || role === "super_admin") redirect("/home")
```

- [ ] **Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "feat: update landing page role redirects to new canonical routes"
```

---

## Task 5: Create `/home` Page (Customer + Admin)

This page is the authenticated home for customers and admins. It shows the booking interface for everyone and adds a Manage Users button only for admins.

**Files:**
- Create: `app/home/page.tsx`
- Create: `app/home/home-client.tsx`

- [ ] **Step 1: Create the Server Component**

```tsx
// app/home/page.tsx
export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { MobileShell } from '@/components/mobile-shell'
import { BottomNav, BottomNavSpacer } from '@/components/bottom-nav'
import { HomeClient } from './home-client'

export const metadata = {
  title: 'Home — iDriveU',
}

export default async function HomePage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const role = (session.user as { role?: string }).role ?? 'customer'
  const name = session.user.name

  return (
    <MobileShell>
      <main className="flex flex-col pb-4">
        <HomeClient role={role} name={name ?? ''} />
        <BottomNavSpacer />
      </main>
      <BottomNav />
    </MobileShell>
  )
}
```

- [ ] **Step 2: Create the Client Component**

```tsx
// app/home/home-client.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { MapPin, Navigation, ArrowRight, Shield, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { IconButton, IconInput } from '@/components/ui-icon'

interface HomeClientProps {
  role: string
  name: string
}

export function HomeClient({ role, name }: HomeClientProps) {
  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')
  const [routeReady, setRouteReady] = useState(false)
  const isAdmin = role === 'admin' || role === 'super_admin'

  function handlePreview() {
    if (pickup.trim() && dropoff.trim()) setRouteReady(true)
  }

  return (
    <div className="flex flex-col gap-6 px-5 pt-6">
      {/* Greeting */}
      <div>
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-foreground">
          {name ? `Hi, ${name.split(' ')[0]}` : 'Where to?'}
        </h1>
        <p className="mt-1 text-[14px] text-muted-foreground">
          Book a private driver in seconds.
        </p>
      </div>

      {/* Admin — Manage Users CTA */}
      {isAdmin && (
        <Link
          href="/admin/users"
          className={cn(
            'flex items-center gap-3 rounded-2xl border border-orange-500/30 bg-orange-500/10',
            'px-4 py-3 text-[14px] font-semibold text-orange-600 transition hover:bg-orange-500/20',
            'dark:text-orange-400',
          )}
        >
          <Shield className="h-5 w-5 flex-shrink-0" />
          <span className="flex-1">Manage Users</span>
          <ArrowRight className="h-4 w-4 opacity-60" />
        </Link>
      )}

      {/* Pickup input */}
      <div className="flex flex-col gap-3">
        <IconInput
          icon={MapPin}
          label="Pickup location"
          type="text"
          placeholder="Enter pickup address"
          value={pickup}
          onChange={(e) => { setPickup(e.target.value); setRouteReady(false) }}
        />

        <IconInput
          icon={Navigation}
          label="Drop-off location"
          type="text"
          placeholder="Enter drop-off address"
          value={dropoff}
          onChange={(e) => { setDropoff(e.target.value); setRouteReady(false) }}
        />
      </div>

      {/* Place search hint */}
      {(pickup || dropoff) && !routeReady && (
        <button
          onClick={handlePreview}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-[13px] text-muted-foreground hover:bg-secondary"
        >
          <Search className="h-4 w-4" />
          Preview route
        </button>
      )}

      {/* Route preview */}
      {routeReady && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="mb-1 text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
            Route preview
          </p>
          <p className="text-[14px] text-foreground">
            <span className="font-semibold">{pickup}</span>
            <span className="mx-2 text-muted-foreground">→</span>
            <span className="font-semibold">{dropoff}</span>
          </p>
        </div>
      )}

      {/* Request ride CTA */}
      <IconButton
        icon={Navigation}
        iconRight={ArrowRight}
        variant="glow"
        size="lg"
        fullWidth
        onClick={() => {
          const params = new URLSearchParams()
          if (pickup) params.set('pickup', pickup)
          if (dropoff) params.set('dropoff', dropoff)
          window.location.href = `/book?${params.toString()}`
        }}
      >
        Request ride
      </IconButton>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/home/page.tsx app/home/home-client.tsx
git commit -m "feat: add /home page for customers and admins with booking UI and Manage Users button"
```

---

## Task 6: Create `/driver/jobs` Page

The existing `/driver/available` page shows available jobs. Create `/driver/jobs` as a richer version that also shows the current active trip and empty state.

**Files:**
- Create: `app/driver/jobs/page.tsx`
- Create: `app/driver/jobs/jobs-client.tsx`

- [ ] **Step 1: Create the Server Component**

```tsx
// app/driver/jobs/page.tsx
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
      where: { status: 'pending', driverId: null },
      orderBy: { dateTime: 'asc' },
      take: 30,
    }),
    db.booking.findFirst({
      where: {
        driverId,
        status: { in: ['driver_assigned', 'driver_en_route', 'arrived', 'in_progress'] },
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
```

- [ ] **Step 2: Create the Client Component**

```tsx
// app/driver/jobs/jobs-client.tsx
'use client'

import { useState, useTransition } from 'react'
import { BriefcaseBusiness, MapPin, Navigation, Users, Car, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { claimBooking } from '@/actions/bookings'
import { formatZAR } from '@/lib/pricing'
import { cn } from '@/lib/utils'

export interface JobCardData {
  id: string
  reference: string
  serviceId: string
  pickupAddress: string
  dropoffAddress: string
  dateTime: string
  estimatedPrice: number
  passengerCount: number
  distanceKm: number
}

export interface ActiveTripData {
  id: string
  reference: string
  pickupAddress: string
  dropoffAddress: string
  dateTime: string
  status: string
}

interface JobsClientProps {
  jobs: JobCardData[]
  activeTrip: ActiveTripData | null
}

function ActiveTripCard({ trip }: { trip: ActiveTripData }) {
  return (
    <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Car className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <span className="text-[12px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
          Active trip · {trip.reference}
        </span>
      </div>
      <div className="flex flex-col gap-1 text-[13px] text-foreground">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
          <span>{trip.pickupAddress}</span>
        </div>
        <div className="flex items-start gap-2">
          <Navigation className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
          <span>{trip.dropoffAddress}</span>
        </div>
      </div>
      <p className="mt-2 text-[12px] text-muted-foreground">
        Status: <span className="font-medium text-foreground">{trip.status.replace(/_/g, ' ')}</span>
      </p>
    </div>
  )
}

function JobCard({
  job,
  onAccept,
  onDecline,
  busy,
}: {
  job: JobCardData
  onAccept: (id: string) => void
  onDecline: (id: string) => void
  busy: boolean
}) {
  const date = new Date(job.dateTime)
  const dateLabel = date.toLocaleDateString('en-ZA', { weekday: 'short', month: 'short', day: 'numeric' })
  const timeLabel = date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-[12px] font-medium text-muted-foreground">{job.reference}</p>
          <p className="text-[13px] font-semibold text-foreground">{dateLabel} · {timeLabel}</p>
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[13px] font-bold text-primary">
          {formatZAR(job.estimatedPrice)}
        </span>
      </div>

      <div className="mb-3 flex flex-col gap-1.5 text-[13px] text-foreground">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
          <span className="line-clamp-2">{job.pickupAddress}</span>
        </div>
        <div className="flex items-start gap-2">
          <Navigation className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
          <span className="line-clamp-2">{job.dropoffAddress}</span>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-4 text-[12px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {job.passengerCount} pax
        </span>
        <span>{job.distanceKm.toFixed(1)} km</span>
      </div>

      <div className="flex gap-3">
        <button
          disabled={busy}
          onClick={() => onDecline(job.id)}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary',
            'py-2.5 text-[13px] font-semibold text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive',
            busy && 'pointer-events-none opacity-50',
          )}
        >
          <XCircle className="h-4 w-4" /> Decline
        </button>
        <button
          disabled={busy}
          onClick={() => onAccept(job.id)}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5',
            'text-[13px] font-semibold text-primary-foreground transition hover:bg-primary/90',
            busy && 'pointer-events-none opacity-50',
          )}
        >
          <CheckCircle className="h-4 w-4" /> Accept
        </button>
      </div>
    </div>
  )
}

export function JobsClient({ jobs: initialJobs, activeTrip }: JobsClientProps) {
  const [jobs, setJobs] = useState(initialJobs)
  const [claimingId, setClaimingId] = useState<string | null>(null)
  const [_isPending, startTransition] = useTransition()

  function handleAccept(id: string) {
    setClaimingId(id)
    startTransition(async () => {
      try {
        const result = await claimBooking(id)
        if ('error' in result) {
          toast.error(result.error as string)
        } else {
          toast.success('Job accepted!')
          setJobs((prev) => prev.filter((j) => j.id !== id))
        }
      } catch {
        toast.error('Failed to accept job. Please try again.')
      } finally {
        setClaimingId(null)
      }
    })
  }

  function handleDecline(id: string) {
    setJobs((prev) => prev.filter((j) => j.id !== id))
    toast('Job skipped.')
  }

  return (
    <div>
      {activeTrip && <ActiveTripCard trip={activeTrip} />}

      <div className="mb-3 flex items-center gap-2">
        <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-[15px] font-semibold">
          Available jobs
          {jobs.length > 0 && (
            <span className="ml-2 text-[13px] font-normal text-muted-foreground">
              ({jobs.length})
            </span>
          )}
        </h2>
      </div>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-[14px] font-medium text-muted-foreground">No jobs available right now</p>
          <p className="text-[12px] text-muted-foreground">Pull down to refresh or check back soon.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onAccept={handleAccept}
              onDecline={handleDecline}
              busy={claimingId === job.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/driver/jobs/page.tsx app/driver/jobs/jobs-client.tsx
git commit -m "feat: add /driver/jobs page with job cards, accept/decline, and active trip section"
```

---

## Task 7: Update Bottom Nav Home Link

`components/bottom-nav.tsx` points the customer Home icon to `/`. Update it to `/home` so the tab is consistent with the new routing.

**Files:**
- Modify: `components/bottom-nav.tsx`

- [ ] **Step 1: Update the customerItems array**

Find:

```ts
const customerItems = [
  { href: '/', label: 'Home', icon: Home },
```

Replace with:

```ts
const customerItems = [
  { href: '/home', label: 'Home', icon: Home },
```

Also update the driverItems to point to `/driver/jobs`:

Find:

```ts
const driverItems = [
  { href: '/driver', label: 'Dashboard', icon: Car },
  { href: '/driver/available', label: 'Available', icon: BriefcaseBusiness },
```

Replace with:

```ts
const driverItems = [
  { href: '/driver/jobs', label: 'Jobs', icon: BriefcaseBusiness },
  { href: '/driver', label: 'Dashboard', icon: Car },
```

- [ ] **Step 2: Commit**

```bash
git add components/bottom-nav.tsx
git commit -m "feat: update bottom nav Home link to /home and driver to /driver/jobs"
```

---

## Task 8: RoleFlowRepresentation Component and Page

A visual diagram showing the login → role check → destination flow, styled in iDriveU's dark-blue palette with clean cards.

**Files:**
- Create: `components/role-flow-representation.tsx`
- Create: `app/role-flow/page.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/role-flow-representation.tsx
import { Car, User, Shield, ChevronRight, LogIn, CheckSquare, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FlowStep {
  id: string
  label: string
  sub?: string
  icon: React.ReactNode
  accent?: string
}

const steps: FlowStep[] = [
  {
    id: 'login',
    label: 'User logs in',
    sub: 'Email/password or Google',
    icon: <LogIn className="h-5 w-5" />,
    accent: 'bg-primary/10 text-primary border-primary/20',
  },
  {
    id: 'check',
    label: 'Role is checked',
    sub: 'Fetched from NextAuth JWT',
    icon: <CheckSquare className="h-5 w-5" />,
    accent: 'bg-muted/40 text-foreground border-border',
  },
]

const destinations: { label: string; sub: string; href: string; icon: React.ReactNode; accent: string }[] = [
  {
    label: 'Driver',
    sub: '→ /driver/jobs',
    href: '/driver/jobs',
    icon: <Car className="h-5 w-5" />,
    accent: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
  },
  {
    label: 'Customer',
    sub: '→ /home',
    href: '/home',
    icon: <User className="h-5 w-5" />,
    accent: 'bg-primary/10 text-primary border-primary/20',
  },
  {
    label: 'Admin',
    sub: '→ /home + Manage Users',
    href: '/home',
    icon: <Shield className="h-5 w-5" />,
    accent: 'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400',
  },
]

function FlowCard({ label, sub, icon, accent }: { label: string; sub?: string; icon: React.ReactNode; accent?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl border px-4 py-3 text-[14px] font-semibold',
        accent ?? 'bg-card border-border text-foreground',
      )}
    >
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-background/50">
        {icon}
      </span>
      <div>
        <p>{label}</p>
        {sub && <p className="text-[11px] font-normal opacity-70">{sub}</p>}
      </div>
    </div>
  )
}

export function RoleFlowRepresentation() {
  return (
    <div className="flex flex-col items-center gap-4 px-5 py-8">
      <h2 className="mb-2 text-center text-[20px] font-bold leading-tight tracking-tight text-foreground">
        Role-Based Login Flow
      </h2>
      <p className="mb-4 text-center text-[13px] text-muted-foreground">
        How iDriveU routes users after sign-in
      </p>

      {/* Login + role check */}
      <div className="w-full max-w-sm">
        {steps.map((step, i) => (
          <div key={step.id}>
            <FlowCard label={step.label} sub={step.sub} icon={step.icon} accent={step.accent} />
            {i < steps.length - 1 && (
              <div className="my-1 flex justify-center">
                <ChevronRight className="h-4 w-4 rotate-90 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Branch label */}
      <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
        <div className="h-px w-8 bg-border" />
        <span>role determines destination</span>
        <div className="h-px w-8 bg-border" />
      </div>

      {/* Destinations */}
      <div className="grid w-full max-w-sm grid-cols-1 gap-2">
        {destinations.map((dest) => (
          <a key={dest.label} href={dest.href} className="transition hover:opacity-80">
            <FlowCard label={dest.label} sub={dest.sub} icon={dest.icon} accent={dest.accent} />
          </a>
        ))}
      </div>

      {/* Admin extra step */}
      <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
        <div className="h-px w-8 bg-border" />
        <span>admin-only action</span>
        <div className="h-px w-8 bg-border" />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-1 flex justify-center">
          <ChevronRight className="h-4 w-4 rotate-90 text-muted-foreground" />
        </div>
        <FlowCard
          label="Manage Users"
          sub="Admin clicks → /admin/users"
          icon={<Users className="h-5 w-5" />}
          accent="bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400"
        />
        <div className="mt-2 flex justify-center">
          <ChevronRight className="h-4 w-4 rotate-90 text-muted-foreground" />
        </div>
        <div className="mt-2">
          <FlowCard
            label="User list with role controls"
            sub="Update role · Save · Audit logged"
            icon={<Shield className="h-5 w-5" />}
            accent="bg-card text-foreground border-border"
          />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create the host page**

```tsx
// app/role-flow/page.tsx
import { MobileShell } from '@/components/mobile-shell'
import { AppTopBar } from '@/components/app-top-bar'
import { RoleFlowRepresentation } from '@/components/role-flow-representation'

export const metadata = {
  title: 'Role Flow — iDriveU',
}

export default function RoleFlowPage() {
  return (
    <MobileShell>
      <AppTopBar title="Role Flow" backHref="/" />
      <main>
        <RoleFlowRepresentation />
      </main>
    </MobileShell>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/role-flow-representation.tsx app/role-flow/page.tsx
git commit -m "feat: add RoleFlowRepresentation component and /role-flow page"
```

---

## Task 9: Build Validation

- [ ] **Step 1: Run the TypeScript build**

```bash
cd "path/to/idriveu"
npm run build
```

Expected: no TypeScript errors, no route collisions. If errors appear, fix them in the relevant file before continuing.

- [ ] **Step 2: Common fixes to check**

If `claimBooking` is not exported from `@/actions/bookings`, check `app/driver/available/page.tsx` to confirm the correct import path and function name, then update `app/driver/jobs/jobs-client.tsx` accordingly.

If `SignedInAs` from `@/components/role-banner` does not accept the `driver` role in its type, open `components/role-banner.tsx` and add `'driver'` to its `Role` type union.

If `AppTopBar` does not accept a `backHref` prop, check its existing usage in `/app/admin/users/page.tsx` and match the prop name it actually uses.

- [ ] **Step 3: Confirm build passes**

Expected output ends with:
```
✓ Compiled successfully
Route (app)                              Size
...
/home                                    x kB
/driver/jobs                             x kB
/role-flow                               x kB
```

- [ ] **Step 4: Final commit (if any fixes were needed)**

```bash
git add -p
git commit -m "fix: resolve TypeScript/build errors from role routing implementation"
```

---

## Validation Checklist

After the build passes, manually test these paths:

| Scenario | Expected result |
|----------|----------------|
| Not logged in → visit `/home` | Redirect to `/login` (middleware) |
| Not logged in → visit `/driver/jobs` | Redirect to `/login` (middleware) |
| Not logged in → visit `/admin/users` | Redirect to `/login` (middleware) |
| Login as **customer** | Redirect to `/home` |
| Login as **driver** | Redirect to `/driver/jobs` |
| Login as **admin** | Redirect to `/home` |
| Logged in as **admin** on `/home` | Manage Users button visible |
| Logged in as **customer** on `/home` | Manage Users button NOT visible |
| Admin clicks Manage Users | Navigate to `/admin/users` |
| Customer visits `/driver/jobs` | Redirect to `/home` (middleware) |
| Customer visits `/admin/users` | Redirect to `/home` (middleware) |
| Driver has no jobs | Empty state card shown |
| Driver has active trip | Active trip card shown above job list |
| Visit `/role-flow` | RoleFlowRepresentation renders cleanly |

---

## Edge Case Notes

- **Missing role in JWT** — `roleRedirectUrl(undefined)` returns `/home` (customer default).
- **Expired session** — middleware redirects to `/login` before the Server Component runs.
- **Google sign-in** — `callbackUrl: '/'` sends the user to the landing page which re-dispatches via role redirect. No role fetch race condition.
- **Driver visits `/home`** — `/home` page does not redirect drivers away; if the driver intentionally navigates there they can still book a ride. The middleware only blocks non-drivers from `/driver/jobs`, not drivers from `/home`.
- **Role change takes effect** — NextAuth JWT is updated on the next sign-in or session refresh. After an admin changes a user's role via `/admin/users`, the affected user must sign out and back in for the new role to take effect (standard JWT behaviour).
