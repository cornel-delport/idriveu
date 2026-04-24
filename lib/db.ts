/**
 * Prisma client singleton using lazy initialization.
 *
 * PrismaClient is NOT instantiated at module load time — only when the first
 * database operation is called. This allows `next build` to complete without
 * a live DATABASE_URL (pages are marked `dynamic = 'force-dynamic'`).
 *
 * Prisma 7 requires a driver adapter for PostgreSQL (WASM engine).
 */
import type { PrismaClient as PrismaClientType } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var _prisma: PrismaClientType | undefined
}

function createClient(): PrismaClientType {
  // Dynamic requires so they aren't evaluated at module load / build time
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require('@prisma/client') as { PrismaClient: new (opts: object) => PrismaClientType }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaPg } = require('@prisma/adapter-pg') as { PrismaPg: new (opts: { connectionString: string }) => object }

  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set. Add it to .env.local')

  const adapter = new PrismaPg({ connectionString: url })
  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  if (process.env.NODE_ENV !== 'production') global._prisma = client
  return client
}

/**
 * A Proxy that lazily creates the real PrismaClient on first property access.
 * Usage is identical to a regular PrismaClient: `db.user.findMany()`, etc.
 */
export const db = new Proxy({} as PrismaClientType, {
  get(_target, prop: string | symbol) {
    const client = global._prisma ?? createClient()
    const val = client[prop as keyof PrismaClientType]
    return typeof val === 'function' ? (val as (...args: unknown[]) => unknown).bind(client) : val
  },
  has(_target, prop) {
    return prop in (global._prisma ?? {})
  },
})
