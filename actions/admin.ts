"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendWhatsApp } from "@/lib/whatsapp"

// ── Auth helper ───────────────────────────────────────────────────────────────

function isAdmin(role: string | undefined): role is "admin" | "super_admin" {
  return role === "admin" || role === "super_admin"
}

// ── assignDriver ──────────────────────────────────────────────────────────────

export async function assignDriver(
  bookingId: string,
  driverUserId: string,
): Promise<{ ok: true } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }
  const role = (session.user as { role?: string }).role
  if (!isAdmin(role)) return { error: "Forbidden" }

  try {
    // Validate driver: must have role=driver and driverProfile.driverStatus=approved
    const driverUser = await db.user.findUnique({
      where: { id: driverUserId },
      select: {
        id: true,
        role: true,
        name: true,
        phone: true,
        driverProfile: { select: { id: true, driverStatus: true } },
      },
    })
    if (!driverUser) return { error: "Driver user not found" }
    if (driverUser.role !== "driver") return { error: "User is not a driver" }
    if (!driverUser.driverProfile) return { error: "Driver has no profile" }
    if (driverUser.driverProfile.driverStatus !== "approved") {
      return { error: "Driver is not approved" }
    }

    const booking = await db.booking.update({
      where: { id: bookingId },
      data: {
        driverId: driverUserId,
        status: "driver_assigned",
        statusUpdatedAt: new Date(),
      },
      include: {
        customer: { select: { phone: true, name: true } },
        driver: { select: { name: true } },
      },
    })

    // Upsert DriverAvailability
    await db.driverAvailability.upsert({
      where: { driverProfileId: driverUser.driverProfile.id },
      create: {
        driverProfileId: driverUser.driverProfile.id,
        status: "busy",
        currentBookingId: bookingId,
      },
      update: {
        status: "busy",
        currentBookingId: bookingId,
      },
    })

    await db.tripEvent.create({
      data: {
        bookingId,
        actorUserId: session.user.id,
        actorRole: role,
        eventType: "driver_assigned",
        metadata: { driverUserId },
      },
    })

    await db.auditLog.create({
      data: {
        actorUserId: session.user.id,
        actionType: "assign_driver",
        targetType: "booking",
        targetId: bookingId,
        metadata: { driverUserId },
      },
    })

    if (booking.customer.phone) {
      void sendWhatsApp(
        booking.customer.phone,
        "DRIVER_ASSIGNED",
        {
          driverName: booking.driver?.name ?? "Your driver",
          ref: booking.reference,
        },
        bookingId,
      )
    }

    revalidatePath("/admin")
    return { ok: true }
  } catch (err: unknown) {
    if (process.env.NODE_ENV === "development") console.error("[assignDriver]", err)
    return { error: "Failed to assign driver" }
  }
}

// ── approveDriver ─────────────────────────────────────────────────────────────

export async function approveDriver(
  driverProfileId: string,
): Promise<{ ok: true } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }
  const role = (session.user as { role?: string }).role
  if (!isAdmin(role)) return { error: "Forbidden" }

  try {
    await db.driverProfile.update({
      where: { id: driverProfileId },
      data: { driverStatus: "approved", verified: true },
    })

    await db.auditLog.create({
      data: {
        actorUserId: session.user.id,
        actionType: "approve_driver",
        targetType: "driver_profile",
        targetId: driverProfileId,
        metadata: {},
      },
    })

    return { ok: true }
  } catch (err: unknown) {
    if (process.env.NODE_ENV === "development") console.error("[approveDriver]", err)
    return { error: "Failed to approve driver" }
  }
}

// ── suspendUser ───────────────────────────────────────────────────────────────

export async function suspendUser(
  userId: string,
  reason: string,
): Promise<{ ok: true } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }
  const role = (session.user as { role?: string }).role
  if (!isAdmin(role)) return { error: "Forbidden" }

  try {
    const targetUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, status: true },
    })
    if (!targetUser) return { error: "User not found" }

    await db.user.update({
      where: { id: userId },
      data: { status: "suspended" },
    })

    await db.auditLog.create({
      data: {
        actorUserId: session.user.id,
        actionType: "suspend_user",
        targetType: "user",
        targetId: userId,
        metadata: { reason },
      },
    })

    await db.roleChangeLog.create({
      data: {
        targetUserId: userId,
        oldRole: targetUser.role,
        newRole: targetUser.role, // role unchanged, status changed
        changedById: session.user.id,
        reason: `Suspended: ${reason}`,
      },
    })

    return { ok: true }
  } catch (err: unknown) {
    if (process.env.NODE_ENV === "development") console.error("[suspendUser]", err)
    return { error: "Failed to suspend user" }
  }
}

// ── reactivateUser ────────────────────────────────────────────────────────────

export async function reactivateUser(userId: string): Promise<{ ok: true } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }
  const role = (session.user as { role?: string }).role
  if (!isAdmin(role)) return { error: "Forbidden" }

  try {
    const targetUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })
    if (!targetUser) return { error: "User not found" }

    await db.user.update({
      where: { id: userId },
      data: { status: "active" },
    })

    await db.auditLog.create({
      data: {
        actorUserId: session.user.id,
        actionType: "reactivate_user",
        targetType: "user",
        targetId: userId,
        metadata: {},
      },
    })

    return { ok: true }
  } catch (err: unknown) {
    if (process.env.NODE_ENV === "development") console.error("[reactivateUser]", err)
    return { error: "Failed to reactivate user" }
  }
}

// ── upgradeToDriver ───────────────────────────────────────────────────────────

export async function upgradeToDriver(userId: string): Promise<{ ok: true } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }
  const role = (session.user as { role?: string }).role
  if (!isAdmin(role)) return { error: "Forbidden" }

  try {
    const targetUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    })
    if (!targetUser) return { error: "User not found" }
    if (targetUser.role !== "customer") return { error: "User is not a customer" }

    await db.user.update({
      where: { id: userId },
      data: { role: "driver" },
    })

    await db.driverProfile.upsert({
      where: { userId },
      create: {
        userId,
        driverStatus: "pending",
        verified: false,
        female: false,
        languages: ["English"],
        serviceAreas: [],
      },
      update: {},
    })

    await db.roleChangeLog.create({
      data: {
        targetUserId: userId,
        oldRole: targetUser.role,
        newRole: "driver",
        changedById: session.user.id,
        reason: "Upgraded to driver by admin",
      },
    })

    await db.auditLog.create({
      data: {
        actorUserId: session.user.id,
        actionType: "role_change",
        targetType: "user",
        targetId: userId,
        metadata: { oldRole: targetUser.role, newRole: "driver" },
      },
    })

    revalidatePath("/admin")
    return { ok: true }
  } catch (err: unknown) {
    if (process.env.NODE_ENV === "development") console.error("[upgradeToDriver]", err)
    return { error: "Failed to upgrade user to driver" }
  }
}

// ── getAuditLogs ──────────────────────────────────────────────────────────────

export async function getAuditLogs(limit = 50): Promise<
  | {
      logs: Array<{
        id: string
        actorUserId: string | null
        actorName: string | null
        actionType: string
        targetType: string | null
        targetId: string | null
        metadata: unknown
        createdAt: Date
      }>
    }
  | { error: string }
> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }
  const role = (session.user as { role?: string }).role
  if (!isAdmin(role)) return { error: "Forbidden" }

  try {
    const logs = await db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        actor: { select: { name: true } },
      },
    })

    return {
      logs: logs.map((log) => ({
        id: log.id,
        actorUserId: log.actorUserId,
        actorName: log.actor?.name ?? null,
        actionType: log.actionType,
        targetType: log.targetType,
        targetId: log.targetId,
        metadata: log.metadata,
        createdAt: log.createdAt,
      })),
    }
  } catch (err: unknown) {
    if (process.env.NODE_ENV === "development") console.error("[getAuditLogs]", err)
    return { error: "Failed to fetch audit logs" }
  }
}
