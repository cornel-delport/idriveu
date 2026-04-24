# IDriveU — Backend, Auth & User Management Design

**Date:** 2026-04-24  
**Status:** Approved  
**Scope:** Full backend logic, database schema, auth (Google + credentials), WhatsApp notifications, driver self-assign, admin refunds, trip status timers.

---

## 1. Stack Decisions

| Concern | Choice | Reason |
|---|---|---|
| Database | Supabase PostgreSQL | Already used on GoFlexxi, generous free tier |
| ORM | Prisma 7 | Type-safe, familiar, `prisma.config.ts` pattern |
| Auth | NextAuth v5 (Auth.js) | Google + credentials, JWT sessions, role middleware |
| Mutations | Next.js Server Actions | Fits App Router, no separate API layer needed |
| Notifications | Twilio WhatsApp Business API | SA-preferred channel, customer + driver alerts |
| Payments | EFT + Cash only (Stripe deferred) | PSP not yet configured |
| Available jobs feed | 30s polling route (`GET /api/bookings/available`) | Simple, no WebSocket needed at this scale |

---

## 2. Database Schema (Prisma)

### User
```prisma
model User {
  id           String        @id @default(cuid())
  name         String
  email        String        @unique
  phone        String?
  passwordHash String?
  role         UserRole      @default(customer)
  googleId     String?       @unique
  avatar       String?
  createdAt    DateTime      @default(now())

  driverProfile DriverProfile?
  bookingsAsCustomer Booking[] @relation("CustomerBookings")
  bookingsAsDriver   Booking[] @relation("DriverBookings")
  savedPlaces  SavedPlace[]
  reviews      Review[]
  notifications Notification[]
}

enum UserRole { customer driver admin }
```

### DriverProfile
```prisma
model DriverProfile {
  id         String   @id @default(cuid())
  userId     String   @unique
  user       User     @relation(fields: [userId], references: [id])
  bio        String?
  verified   Boolean  @default(false)
  female     Boolean  @default(false)
  languages  String[] @default(["English"])
  isOnline   Boolean  @default(false)
  rating     Float    @default(5.0)
  totalTrips Int      @default(0)
}
```

### SavedPlace
```prisma
model SavedPlace {
  id      String  @id @default(cuid())
  userId  String
  user    User    @relation(fields: [userId], references: [id])
  label   String
  address String
  lat     Float?
  lng     Float?
}
```

### Booking
```prisma
model Booking {
  id                   String        @id @default(cuid())
  reference            String        @unique
  customerId           String
  customer             User          @relation("CustomerBookings", fields: [customerId], references: [id])
  driverId             String?
  driver               User?         @relation("DriverBookings", fields: [driverId], references: [id])
  serviceId            String
  status               BookingStatus @default(confirmed)
  statusUpdatedAt      DateTime      @default(now())
  paymentStatus        PaymentStatus @default(pending)
  paymentMethod        PaymentMethod @default(cash)
  pickupAddress        String
  pickupLat            Float?
  pickupLng            Float?
  dropoffAddress       String
  dropoffLat           Float?
  dropoffLng           Float?
  stops                Json          @default("[]")
  dateTime             DateTime
  returnTrip           Boolean       @default(false)
  returnDateTime       DateTime?
  passengerCount       Int           @default(1)
  usesCustomerVehicle  Boolean       @default(true)
  requiresFemaleDriver Boolean       @default(false)
  childPickup          Boolean       @default(false)
  distanceKm           Float         @default(0)
  durationMinutes      Int           @default(0)
  estimatedPrice       Int
  finalPrice           Int?
  notes                String?
  createdAt            DateTime      @default(now())

  childDetail   ChildDetail?
  review        Review?
  whatsappLogs  WhatsAppLog[]
}

enum BookingStatus {
  draft pending_payment confirmed driver_assigned
  driver_on_the_way arrived in_progress completed
  cancelled refund_requested refunded
}

enum PaymentStatus {
  pending paid failed refunded
  cash_requested eft_requested admin_confirmed
}

enum PaymentMethod { card eft cash }
```

### ChildDetail
```prisma
model ChildDetail {
  id               String  @id @default(cuid())
  bookingId        String  @unique
  booking          Booking @relation(fields: [bookingId], references: [id])
  childName        String
  school           String
  authorisedAdult  String
  emergencyContact String
  instructions     String?
}
```

### Review
```prisma
model Review {
  id         String   @id @default(cuid())
  bookingId  String   @unique
  booking    Booking  @relation(fields: [bookingId], references: [id])
  customerId String
  customer   User     @relation(fields: [customerId], references: [id])
  driverId   String
  rating     Int
  comment    String?
  createdAt  DateTime @default(now())
}
```

### Notification
```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  type      String
  message   String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

### WhatsAppLog
```prisma
model WhatsAppLog {
  id        String   @id @default(cuid())
  bookingId String
  booking   Booking  @relation(fields: [bookingId], references: [id])
  to        String
  body      String
  sid       String?
  sentAt    DateTime @default(now())
}
```

### PricingConfig
```prisma
model PricingConfig {
  id    String @id @default(cuid())
  key   String @unique
  value String
}
```

---

## 3. Auth (NextAuth v5)

### Providers
- **Google OAuth** — `GoogleProvider` with client ID/secret from Google Cloud Console
- **Credentials** — email + bcrypt password hash stored on `User.passwordHash`

### Session
- Strategy: JWT
- Payload: `{ id, role, name, avatar }`
- No DB call on every request

### Role assignment
- New Google sign-in → `role: customer` by default
- If email matches pre-seeded driver/admin record → correct role assigned
- Admin promotes users to `driver` (creates `DriverProfile`) or `admin` via admin dashboard
- No self-signup for `driver` or `admin` roles

### Profile completion gate
- After Google sign-in, if `phone` is null → redirect to `/profile/complete` before booking
- Phone is required for WhatsApp confirmations

### Route protection (middleware)
```
/dashboard            → authenticated, role: customer
/driver/*             → authenticated, role: driver
/admin/*              → authenticated, role: admin
/profile/*            → authenticated, any role
/book (submit)        → authenticated (guest can browse, must log in to confirm)
```

---

## 4. Server Actions

### Booking actions (`actions/bookings.ts`)
```
createBooking(data)
  → validate input (zod)
  → generate reference IDU-XXXX (random 4-digit)
  → save Booking + optional ChildDetail to DB
  → send WhatsApp BOOKING_CONFIRMED to customer
  → send WhatsApp NEW_JOB_AVAILABLE to all online drivers
  → revalidate /dashboard
  → return { reference }

claimBooking(bookingId)                          [driver only]
  → check booking still has no driverId (race-condition safe with DB transaction)
  → set driverId = session.id, status = driver_assigned, statusUpdatedAt = now()
  → send WhatsApp DRIVER_ASSIGNED to customer
  → send WhatsApp JOB_CLAIMED_BY_OTHER to other drivers who received alert
  → revalidate /driver

updateBookingStatus(bookingId, status)           [driver or admin]
  → set status, statusUpdatedAt = now()
  → send appropriate WhatsApp to customer per status
  → if status = completed: send TRIP_COMPLETED + review request link
  → if childPickup + status = in_progress: send CHILD_PICKUP_ALERT
  → if childPickup + status = completed: send CHILD_DROPOFF_ALERT
  → revalidate caller page

cancelBooking(bookingId)                         [customer, if status is confirmed]
  → set status = cancelled
  → send WhatsApp BOOKING_CANCELLED to customer
  → notify driver if assigned

triggerRefund(bookingId)                         [admin only]
  → set status = refund_requested, paymentStatus = refund_requested
  → send WhatsApp REFUND_REQUESTED to customer

markRefundComplete(bookingId)                    [admin only]
  → set paymentStatus = refunded, status = refunded
  → send WhatsApp REFUND_COMPLETED to customer

confirmPayment(bookingId, method)                [admin only]
  → set paymentStatus = admin_confirmed

assignDriverOverride(bookingId, driverId)        [admin only]
  → set driverId, status = driver_assigned
  → send WhatsApp DRIVER_ASSIGNED to customer
```

### User actions (`actions/users.ts`)
```
savePlace(label, address, lat, lng)
deletePlace(id)
updateProfile(name, phone, avatar)
submitReview(bookingId, rating, comment)
  → saves Review
  → recalculates DriverProfile.rating (average of all reviews)
promoteToDriver(userId)                          [admin only]
  → set role = driver, create DriverProfile
```

### Pricing actions (`actions/pricing.ts`)
```
updatePricingRule(key, value)                    [admin only]
  → upsert PricingConfig
  → pricing engine reads from DB instead of hardcoded defaultPricing
```

---

## 5. Available Jobs Feed

`GET /api/bookings/available` — route handler (not server action, needs to be pollable)
- Auth: driver only
- Returns bookings where `driverId IS NULL` and `status = confirmed` and `dateTime > now()`
- Driver dashboard polls every 30 seconds
- On claim, optimistic UI removes the job immediately; DB transaction prevents double-claim

---

## 6. WhatsApp Notifications (`lib/whatsapp.ts`)

Single module wrapping Twilio REST API. All messages sent from IDriveU WhatsApp Business number.

### Message templates

**To customer:**
| Key | Trigger | Message |
|---|---|---|
| BOOKING_CONFIRMED | createBooking | "Hi {name}, your IDriveU booking {ref} is confirmed for {date} at {time}. A driver will be assigned shortly." |
| DRIVER_ASSIGNED | claimBooking / assignDriverOverride | "Your driver {driverName} has been assigned for {ref}. They will contact you before pickup." |
| DRIVER_ON_THE_WAY | status → driver_on_the_way | "🚗 {driverName} is on the way to {pickup}." |
| DRIVER_ARRIVED | status → arrived | "✅ Your driver has arrived at {pickup}." |
| TRIP_COMPLETED | status → completed | "Trip {ref} completed. Total: R{amount}. Rate your driver: {link}" |
| CHILD_PICKUP_ALERT | status → in_progress (child booking) | "✅ {childName} has been collected from {school} and is on the way home." |
| CHILD_DROPOFF_ALERT | status → completed (child booking) | "✅ {childName} has been dropped off safely at {address}." |
| REFUND_REQUESTED | triggerRefund | "Your refund for {ref} is being processed by our team." |
| REFUND_COMPLETED | markRefundComplete | "✅ Your refund for {ref} has been processed." |
| BOOKING_CANCELLED | cancelBooking | "Your booking {ref} has been cancelled." |

**To drivers:**
| Key | Trigger | Message |
|---|---|---|
| NEW_JOB_AVAILABLE | createBooking | "🔔 New IDriveU job — {service} on {date} at {time} from {pickup}. Est. R{price}. Open app to claim." |
| JOB_CLAIMED_BY_OTHER | claimBooking | "Job {ref} has been claimed by another driver." |

All messages logged to `WhatsAppLog` with Twilio SID.

---

## 7. Trip Status Timer

Each `Booking` has `statusUpdatedAt DateTime` updated on every status change.

**Driver dashboard** shows elapsed time per completed step:
```
Booking accepted      ✓  2h ago
On the way to pickup  ✓  14 min ago
Arrived at pickup     ●  now  ← live ticking (client-side useEffect, 1s interval)
Passenger collected   ○
Trip completed        ○
```

**Customer dashboard** shows: "Driver on the way · 6 min ago" — refreshes every 30s via polling.

**Admin dashboard** shows `statusUpdatedAt` as a timestamp column in the bookings list.

Implementation: `lib/time.ts` utility — `timeAgo(date)` returns human-readable string. Active step uses a `useEffect` 1-second ticker. All other steps use server-rendered relative time.

---

## 8. Environment Variables Required

```env
# Supabase
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://v0-idriveu.vercel.app

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
IDRIVEU_WHATSAPP_NUMBER=whatsapp:+27XXXXXXXXX
```

---

## 9. File Structure (new files)

```
prisma/
  schema.prisma
  config.ts (prisma.config.ts — Prisma 7 pattern)

lib/
  auth.ts          — NextAuth config, providers, callbacks
  db.ts            — Prisma client singleton
  whatsapp.ts      — Twilio WhatsApp wrapper
  time.ts          — timeAgo() utility

actions/
  bookings.ts      — createBooking, claimBooking, updateBookingStatus, etc.
  users.ts         — savePlace, updateProfile, submitReview, promoteToDriver
  pricing.ts       — updatePricingRule

app/
  api/
    auth/[...nextauth]/route.ts
    bookings/available/route.ts   — polling endpoint for driver feed

  profile/
    complete/page.tsx             — phone completion gate after Google sign-in

middleware.ts                     — route protection by role
```

---

## 10. Out of Scope (this sprint)

- Stripe / card payment processing
- Real-time WebSockets (using polling instead)
- Google Maps API integration (address autocomplete, real distance calculation)
- Push notifications
- CSV export (admin can see all data; export is a future enhancement)
