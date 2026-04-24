import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  // Seed admin user
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'IDriveU-admin-2026!'
  const passwordHash = await bcrypt.hash(password, 12)
  await db.user.upsert({
    where: { email: 'cornel@goflexxi.com' },
    update: {},
    create: {
      email: 'cornel@goflexxi.com',
      name: 'Cornel Delport',
      passwordHash,
      role: 'admin',
    },
  })

  // Seed pricing config (mirrors lib/pricing.ts defaultPricing)
  const pricingRows = [
    { key: 'baseFee', value: '120' },
    { key: 'perKm', value: '14' },
    { key: 'nightSurcharge', value: '80' },
    { key: 'waitingPerMin', value: '3' },
    { key: 'airportFixed.george', value: '650' },
    { key: 'airportFixed.gqeberha', value: '1950' },
    { key: 'airportFixed.cape_town', value: '4200' },
    { key: 'childPickupFixed', value: '220' },
    { key: 'wineHalfDay', value: '950' },
    { key: 'wineFullDay', value: '1750' },
  ]

  for (const row of pricingRows) {
    await db.pricingConfig.upsert({
      where: { key: row.key },
      update: { value: row.value },
      create: row,
    })
  }

  console.log('✅ Seeded admin user and pricing config')
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
