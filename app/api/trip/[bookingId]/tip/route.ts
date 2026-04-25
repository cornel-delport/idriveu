import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { submitTip } from "@/actions/posttrip"

const BodySchema = z.object({
  amountCents: z.number().int().positive(),
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

  if (role !== "customer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { bookingId } = await params

  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: "Bad request", message: "amountCents must be a positive integer" }, { status: 400 })
  }

  const result = await submitTip(bookingId, body.amountCents)

  if ("error" in result) {
    const status = result.error === "Not authenticated" ? 401 : result.error === "Forbidden" ? 403 : 400
    return NextResponse.json({ error: result.error }, { status })
  }

  return NextResponse.json({ ok: true, tipId: result.tipId })
}
