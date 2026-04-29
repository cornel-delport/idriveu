"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

function isAdmin(role: string | undefined): role is "admin" | "super_admin" {
  return role === "admin" || role === "super_admin"
}

// ── createRestaurant ──────────────────────────────────────────────────────────

const createSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  restaurantCode: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[A-Z0-9-]+$/, "Use uppercase letters, digits, hyphens only"),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  waiveCallOutFee: z.boolean().default(false),
})

export async function createRestaurant(
  data: z.infer<typeof createSchema>,
): Promise<{ ok: true; id: string } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }
  const role = (session.user as { role?: string }).role
  if (!isAdmin(role)) return { error: "Forbidden" }

  const parsed = createSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid data" }

  const code = parsed.data.restaurantCode.toUpperCase()

  try {
    const existing = await db.restaurant.findUnique({ where: { restaurantCode: code } })
    if (existing) return { error: "Restaurant code already exists" }

    const restaurant = await db.restaurant.create({
      data: { ...parsed.data, restaurantCode: code },
    })

    await db.auditLog.create({
      data: {
        actorUserId: session.user.id,
        actionType: "create_restaurant",
        targetType: "restaurant",
        targetId: restaurant.id,
        metadata: { name: restaurant.name, code },
      },
    })

    revalidatePath("/admin/restaurants")
    return { ok: true, id: restaurant.id }
  } catch (err: unknown) {
    if (process.env.NODE_ENV === "development") console.error("[createRestaurant]", err)
    return { error: "Failed to create restaurant" }
  }
}

// ── updateRestaurant ──────────────────────────────────────────────────────────

const updateSchema = createSchema.partial().extend({
  id: z.string().min(1),
  status: z.enum(["active", "inactive"]).optional(),
})

export async function updateRestaurant(
  data: z.infer<typeof updateSchema>,
): Promise<{ ok: true } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }
  const role = (session.user as { role?: string }).role
  if (!isAdmin(role)) return { error: "Forbidden" }

  const parsed = updateSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid data" }

  const { id, restaurantCode, ...rest } = parsed.data
  const updateData: Record<string, unknown> = { ...rest }
  if (restaurantCode) updateData.restaurantCode = restaurantCode.toUpperCase()

  try {
    await db.restaurant.update({ where: { id }, data: updateData })
    await db.auditLog.create({
      data: {
        actorUserId: session.user.id,
        actionType: "update_restaurant",
        targetType: "restaurant",
        targetId: id,
        metadata: updateData,
      },
    })
    revalidatePath("/admin/restaurants")
    revalidatePath(`/admin/restaurants/${id}`)
    return { ok: true }
  } catch (err: unknown) {
    if (process.env.NODE_ENV === "development") console.error("[updateRestaurant]", err)
    return { error: "Failed to update restaurant" }
  }
}

// ── createQrCode ──────────────────────────────────────────────────────────────

const createQrSchema = z.object({
  restaurantId: z.string().min(1),
  tableNumber: z.string().optional(),
})

export async function createQrCode(
  data: z.infer<typeof createQrSchema>,
): Promise<{ ok: true; id: string; url: string } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }
  const role = (session.user as { role?: string }).role
  if (!isAdmin(role)) return { error: "Forbidden" }

  const parsed = createQrSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid data" }

  const restaurant = await db.restaurant.findUnique({
    where: { id: parsed.data.restaurantId },
  })
  if (!restaurant) return { error: "Restaurant not found" }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.NEXTAUTH_URL ?? "https://idriveu.app")
  const tableSuffix = parsed.data.tableNumber
    ? `?t=${encodeURIComponent(parsed.data.tableNumber)}`
    : ""
  const url = `${baseUrl.replace(/\/$/, "")}/qr/restaurant/${restaurant.restaurantCode}${tableSuffix}`

  try {
    const qr = await db.restaurantQrCode.create({
      data: {
        restaurantId: parsed.data.restaurantId,
        qrCodeUrl: url,
        tableNumber: parsed.data.tableNumber,
      },
    })
    revalidatePath(`/admin/restaurants/${parsed.data.restaurantId}/qr-codes`)
    return { ok: true, id: qr.id, url }
  } catch (err: unknown) {
    if (process.env.NODE_ENV === "development") console.error("[createQrCode]", err)
    return { error: "Failed to create QR code" }
  }
}

// ── deactivateQrCode ──────────────────────────────────────────────────────────

export async function setQrCodeStatus(
  qrCodeId: string,
  status: "active" | "inactive",
): Promise<{ ok: true } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }
  const role = (session.user as { role?: string }).role
  if (!isAdmin(role)) return { error: "Forbidden" }

  try {
    const qr = await db.restaurantQrCode.update({
      where: { id: qrCodeId },
      data: { status },
    })
    revalidatePath(`/admin/restaurants/${qr.restaurantId}/qr-codes`)
    return { ok: true }
  } catch (err: unknown) {
    if (process.env.NODE_ENV === "development") console.error("[setQrCodeStatus]", err)
    return { error: "Failed to update QR code" }
  }
}

// ── acknowledgeArrivalAlert (customer side) ───────────────────────────────────

export async function acknowledgeArrivalAlert(
  bookingId: string,
): Promise<{ ok: true } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: { customerId: true },
  })
  if (!booking) return { error: "Booking not found" }
  if (booking.customerId !== session.user.id) return { error: "Forbidden" }

  try {
    await db.booking.update({
      where: { id: bookingId },
      data: { arrivalAlertAcknowledged: true },
    })
    return { ok: true }
  } catch (err: unknown) {
    if (process.env.NODE_ENV === "development") console.error("[ack arrival alert]", err)
    return { error: "Failed to acknowledge alert" }
  }
}
