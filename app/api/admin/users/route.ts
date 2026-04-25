import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import type { UserRole } from "@prisma/client"

const VALID_ROLES: UserRole[] = ["customer", "driver", "admin", "super_admin"]

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { role } = session.user as { id: string; role: string; email: string }

  if (role !== "admin" && role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const searchParams = req.nextUrl.searchParams
  const roleFilter = searchParams.get("role") ?? "all"
  const statusFilter = searchParams.get("status") ?? "all"
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)))
  const skip = (page - 1) * limit

  // Build where clause
  const where: Record<string, unknown> = {}
  if (roleFilter !== "all" && VALID_ROLES.includes(roleFilter as UserRole)) {
    where.role = roleFilter as UserRole
  }
  if (statusFilter !== "all") {
    where.status = statusFilter
  }

  try {
    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          lastLoginAt: true,
          driverProfile: {
            select: {
              id: true,
              driverStatus: true,
              verified: true,
              rating: true,
              totalTrips: true,
              isOnline: true,
            },
          },
        },
      }),
      db.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err: unknown) {
    if (process.env.NODE_ENV === "development") console.error("[GET /api/admin/users]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
