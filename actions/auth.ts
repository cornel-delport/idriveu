'use server'

import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[0-9]{9,15}$/, 'Invalid phone number'),
  password: z.string().min(8),
})

export async function registerUser(formData: {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}): Promise<{ success: true } | { error: string }> {
  const parsed = registerSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  const { firstName, lastName, email, phone, password } = parsed.data

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) return { error: 'An account with this email already exists.' }

  const passwordHash = await bcrypt.hash(password, 12)

  await db.user.create({
    data: {
      name: `${firstName} ${lastName}`,
      email,
      phone,
      passwordHash,
      role: 'customer',
    },
  })

  return { success: true }
}
