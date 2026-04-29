# IDriveU — Uber-Style Live Map & Trip Tracking

## Architecture decisions

- **Realtime layer**: Supabase Realtime (already in stack) — subscribe to `driver_locations` table via `@supabase/supabase-js` channel. No Firebase needed.
- **Maps**: `@vis.gl/react-google-maps` already installed. Use `useMapsLibrary("routes")` for `DirectionsService` / `DirectionsRenderer`.
- **Booking statuses**: All needed statuses already exist in schema (`driver_assigned`, `driver_on_the_way`, `arrived`, `in_progress`, `completed`).
- **Auth**: NextAuth v5 — `auth()` in server components, `useSession()` in client components.
- **Brand**: Dark navy (`#0D47A1 → #0A0F1C`) map style, blue route line `#4FC3F7`.

---

## Task 1 — DriverLocation schema + Supabase realtime client

### Files
- `prisma/schema.prisma` — ADD `DriverLocation` model
- `lib/supabase-client.ts` — CREATE client-side Supabase singleton for realtime
- `.env.local.example` — ADD `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Schema addition
```prisma
model DriverLocation {
  id         String   @id @default(cuid())
  bookingId  String   @unique
  driverId   String
  lat        Float
  lng        Float
  heading    Float?
  speed      Float?
  accuracy   Float?
  isOnline   Boolean  @default(true)
  updatedAt  DateTime @updatedAt
  createdAt  DateTime @default(now())
}
```

### `lib/supabase-client.ts`
```ts
import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)
```

### Install
```bash
pnpm add @supabase/supabase-js
```

### After creating the model
Run `prisma db push` to apply. Enable Supabase Realtime on `DriverLocation` table in Supabase dashboard (Table Editor → Replication). Note this in a comment in the file.

---

## Task 2 — Route polyline in RouteMap

### Files
- `components/booking/route-map.tsx` — UPDATE to draw route polyline

### Behaviour
- When both `pickupLat`/`pickupLng` AND `dropoffLat`/`dropoffLng` are present, call `DirectionsService.route()` and render with `DirectionsRenderer`
- Route line color: `#4FC3F7` (IDriveU blue), stroke weight 4
- Fit map bounds to the route using `DirectionsRenderer`'s default behaviour
- Fall back to current behaviour (just markers, Plett centred) when no route available
- Accept optional `routeOriginLat/Lng` + `routeDestinationLat/Lng` props that override pickup/dropoff for the route (needed when driver is navigating to pickup — origin = driver position, dest = pickup)

### Props to add
```ts
routeOriginLat?: number
routeOriginLng?: number
routeDestinationLat?: number
routeDestinationLng?: number
/** When true, don't render DirectionsRenderer (just markers) */
noRoute?: boolean
```

### DirectionsRenderer options
```ts
{
  suppressMarkers: true, // we draw our own markers
  polylineOptions: {
    strokeColor: "#4FC3F7",
    strokeWeight: 4,
    strokeOpacity: 0.85,
  }
}
```

---

## Task 3 — Driver location API route + upsert action

### Files
- `app/api/driver-location/route.ts` — CREATE POST handler
- `actions/trip.ts` — CREATE server actions for trip status

### `app/api/driver-location/route.ts`
POST — authenticated driver writes their live location for a booking.

```ts
// Body: { bookingId, lat, lng, heading?, speed?, accuracy? }
// Auth: session.user.role === "driver"
// Validates: driver is actually assigned to that booking
// Upserts DriverLocation row

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== "driver") return new Response("Unauthorized", { status: 401 })
  
  const body = await req.json()
  // zod validate
  // check booking.driverId === session.user.id
  // db.driverLocation.upsert({ where: { bookingId }, create: {...}, update: {...} })
  return Response.json({ ok: true })
}
```

### `actions/trip.ts`
```ts
"use server"
export async function updateTripStatus(bookingId: string, status: BookingStatus): Promise<{ ok: true } | { error: string }>
  // auth check — driver or admin
  // check booking.driverId === session.user.id OR admin
  // update booking.status + statusUpdatedAt
  // send WhatsApp notification per status (use existing whatsapp.ts)
  // revalidatePath
```

Status → WhatsApp template map:
- `driver_on_the_way` → `DRIVER_ON_THE_WAY`
- `arrived` → `DRIVER_ARRIVED`
- `in_progress` → `TRIP_IN_PROGRESS` (send to customer)
- `completed` → `TRIP_COMPLETED`

---

## Task 4 — Customer live trip tracking page

### Files
- `app/trip/[bookingId]/page.tsx` — CREATE full-screen trip tracking page

### Layout
Full-screen satellite map behind a transparent header + sliding bottom sheet.

### Behaviour
1. Server component fetches booking (checks `booking.customerId === session.user.id`)
2. Passes booking data to `<LiveTripMap>` client component
3. `LiveTripMap` subscribes to Supabase Realtime channel `driver_locations:bookingId=eq.{bookingId}`
4. When driver location updates → move driver marker (animated)
5. Map shows:
   - Blue dot = pickup
   - Red teardrop = dropoff
   - Car icon = driver (rotated by heading)
   - Blue polyline = route
6. Header: booking reference + back button
7. Bottom sheet: status card (see Task 5)

### Components to create
- `components/trip/live-trip-map.tsx` — `"use client"`, wraps `APIProvider` + `Map`
- `components/trip/driver-marker.tsx` — car SVG marker with heading rotation
- `components/trip/animate-marker.ts` — `animateMarkerTo(marker, to, duration)` using `requestAnimationFrame`

### Realtime subscription pattern
```ts
useEffect(() => {
  const channel = supabase
    .channel(`driver-location-${bookingId}`)
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "DriverLocation",
      filter: `bookingId=eq.${bookingId}`,
    }, (payload) => {
      const loc = payload.new as DriverLocation
      setDriverLocation({ lat: loc.lat, lng: loc.lng, heading: loc.heading })
    })
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}, [bookingId])
```

---

## Task 5 — Trip status bottom sheet

### Files
- `components/trip/trip-status-sheet.tsx` — CREATE

### States & content

| Status | Title | Body |
|---|---|---|
| `confirmed` | Finding your driver | Matching you with a nearby driver… |
| `driver_assigned` | Driver assigned | [Driver name] is preparing for your trip |
| `driver_on_the_way` | Driver on the way | [Driver name] is heading to your pickup · ETA [eta] |
| `arrived` | Driver has arrived | Your driver is waiting at [pickup address] |
| `in_progress` | Trip in progress | On the way to [dropoff address] · ETA [eta] |
| `completed` | Trip complete | You've arrived at your destination |

### Props
```ts
interface TripStatusSheetProps {
  status: BookingStatus
  driverName?: string
  driverPhone?: string
  pickupAddress: string
  dropoffAddress: string
  etaMinutes?: number
  onCancel?: () => void
}
```

### Design
- Rounded top corners `rounded-t-3xl`
- `glass-strong` background
- Animated status icon (pulse for waiting, animated car for in progress)
- Driver phone button (tel: link) when driver assigned
- "You are booking a private driver who drives your own car." note always visible

---

## Task 6 — Driver tracking controls page

### Files
- `app/driver/trip/[bookingId]/page.tsx` — CREATE

### Behaviour
1. Fetch booking (check `booking.driverId === session.user.id`)
2. Show full-screen map with route: driver current position → pickup (before collected) or dropoff (after collected)
3. **Start tracking** button → calls `navigator.geolocation.watchPosition()`, POSTs to `/api/driver-location` every 4 seconds
4. Status control buttons in bottom sheet

### Status flow buttons

| Current status | Button label | New status |
|---|---|---|
| `driver_assigned` | Start journey to pickup | `driver_on_the_way` |
| `driver_on_the_way` | I've arrived at pickup | `arrived` |
| `arrived` | Start trip | `in_progress` |
| `in_progress` | Complete trip | `completed` |

### GPS broadcast
```ts
watchIdRef.current = navigator.geolocation.watchPosition(
  (pos) => {
    const now = Date.now()
    if (now - lastSentRef.current < 4000) return // throttle to 4s
    lastSentRef.current = now
    fetch("/api/driver-location", {
      method: "POST",
      body: JSON.stringify({
        bookingId,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        heading: pos.coords.heading,
        speed: pos.coords.speed,
        accuracy: pos.coords.accuracy,
      }),
    })
  },
  (err) => console.error("GPS error", err),
  { enableHighAccuracy: true, maximumAge: 0 },
)
```

Stop watchPosition when status reaches `completed` or `cancelled`.

---

## Task 7 — Wire up confirmation + navigation links

### Files
- `app/book/confirmation/page.tsx` — UPDATE: add "Track my trip" button
- `app/driver/page.tsx` — UPDATE: add "Open trip" button on active bookings
- `app/dashboard/page.tsx` — UPDATE: add "Track" button on active bookings

### Confirmation page
After booking confirmed, show:
- "Track your trip" button → `/trip/[bookingId]`

### Driver dashboard
On each booking card where `status` is `driver_assigned`, `driver_on_the_way`, or `arrived`:
- "Open trip map" button → `/driver/trip/[bookingId]`

### Customer dashboard
On bookings where status is one of the active tracking statuses:
- "Track driver" button → `/trip/[bookingId]`

---

## Critical files summary

| File | Action |
|---|---|
| `prisma/schema.prisma` | UPDATE — add DriverLocation model |
| `lib/supabase-client.ts` | CREATE |
| `.env.local.example` | UPDATE — add Supabase vars |
| `components/booking/route-map.tsx` | UPDATE — route polyline |
| `app/api/driver-location/route.ts` | CREATE |
| `actions/trip.ts` | CREATE |
| `components/trip/live-trip-map.tsx` | CREATE |
| `components/trip/driver-marker.tsx` | CREATE |
| `components/trip/animate-marker.ts` | CREATE |
| `components/trip/trip-status-sheet.tsx` | CREATE |
| `app/trip/[bookingId]/page.tsx` | CREATE |
| `app/driver/trip/[bookingId]/page.tsx` | CREATE |
| `app/book/confirmation/page.tsx` | UPDATE |
| `app/driver/page.tsx` | UPDATE |
| `app/dashboard/page.tsx` | UPDATE |

---

## Environment variables needed

```
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon key]
```

(Already have `DATABASE_URL` pointing to Supabase. The anon key is needed for client-side realtime subscriptions.)
