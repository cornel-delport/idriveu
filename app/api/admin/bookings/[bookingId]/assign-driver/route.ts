import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { assignDriver } from "@/actions/admin"

const BodySchema = z.object({
  driverUserId: z.string().min(1),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { role } = session.user as { id: string; role: string; email: string }

  if (role !== "admin" && role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { bookingId } = await params

  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: "Bad request", message: "driverUserId is required" }, { status: 400 })
  }

  const result = await assignDriver(bookingId, body.driverUserId)

  if ("error" in result) {
    const status = result.error === "Not authenticated" ? 401 : result.error === "Forbidden" ? 403 : 400
    return NextResponse.json({ error: result.error }, { status })
  }

  return NextResponse.json({ ok: true })
}
