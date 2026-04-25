import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(_req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { role } = session.user as { id: string; role: string; email: string }

  if (role !== "admin" && role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const logs = await db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        actor: { select: { name: true, email: true } },
      },
    })

    return NextResponse.json({
      logs: logs.map((log) => ({
        id: log.id,
        actorUserId: log.actorUserId,
        actorName: log.actor?.name ?? null,
        actorEmail: log.actor?.email ?? null,
        actionType: log.actionType,
        targetType: log.targetType,
        targetId: log.targetId,
        metadata: log.metadata,
        createdAt: log.createdAt,
      })),
    })
  } catch (err: unknown) {
    if (process.env.NODE_ENV === "development") console.error("[GET /api/admin/audit-logs]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
