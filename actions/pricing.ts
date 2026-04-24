'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { defaultPricing } from '@/lib/pricing'
import type { PricingRules } from '@/lib/types'

export async function updatePricingRule(
  key: string,
  value: number
): Promise<{ success: true } | { error: string }> {
  const session = await auth()
  if (session?.user?.role !== 'admin') return { error: 'Unauthorized' }

  await db.pricingConfig.upsert({
    where: { key },
    update: { value: String(value) },
    create: { key, value: String(value) },
  })

  revalidatePath('/admin')
  return { success: true }
}

export async function getPricingRules(): Promise<PricingRules> {
  const rows = await db.pricingConfig.findMany()
  const map = Object.fromEntries(rows.map((r) => [r.key, Number(r.value)]))

  return {
    baseFee: map['baseFee'] ?? defaultPricing.baseFee,
    perKm: map['perKm'] ?? defaultPricing.perKm,
    nightSurcharge: map['nightSurcharge'] ?? defaultPricing.nightSurcharge,
    waitingPerMin: map['waitingPerMin'] ?? defaultPricing.waitingPerMin,
    airportFixed: {
      george: map['airportFixed.george'] ?? defaultPricing.airportFixed.george,
      gqeberha: map['airportFixed.gqeberha'] ?? defaultPricing.airportFixed.gqeberha,
      cape_town: map['airportFixed.cape_town'] ?? defaultPricing.airportFixed.cape_town,
    },
    childPickupFixed: map['childPickupFixed'] ?? defaultPricing.childPickupFixed,
    wineHalfDay: map['wineHalfDay'] ?? defaultPricing.wineHalfDay,
    wineFullDay: map['wineFullDay'] ?? defaultPricing.wineFullDay,
  }
}
