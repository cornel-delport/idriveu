import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = z.object({
    phone: z.string().regex(/^\+?[0-9]{9,15}$/, 'Invalid phone number format')
  }).safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid phone' }, { status: 400 })

  await db.user.update({
    where: { id: session.user.id },
    data: { phone: parsed.data.phone },
  })

  return NextResponse.json({ success: true })
}
