import path from 'node:path'
import { defineConfig } from 'prisma/config'
import { config } from 'dotenv'

// Load .env.local so DATABASE_URL is available to Prisma CLI
config({ path: path.join(process.cwd(), '.env.local') })

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
