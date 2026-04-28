/**
 * Promote (or create) a user as platform super_admin.
 *
 * Usage:
 *   pnpm tsx scripts/promote-admin.ts <email> [--password=<pw>]
 *
 * Idempotent — safe to re-run. If the user exists, role is bumped to
 * super_admin and status set to active. If not, a new user row is created.
 *
 * NOTE: this script is run-once-by-hand. It is NOT shipped to production
 * runtime. Production credentials live in .env.local (locally) or Vercel
 * env vars (server). It loads .env.local explicitly so DATABASE_URL is
 * available when invoked from the CLI.
 */
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"
import { config as loadEnv } from "dotenv"
import path from "node:path"

loadEnv({ path: path.resolve(process.cwd(), ".env.local") })

const url = process.env.DATABASE_URL
if (!url) {
  console.error("❌ DATABASE_URL is not set in .env.local")
  process.exit(1)
}

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: url }),
})

async function main() {
  const args = process.argv.slice(2)
  const email = args.find((a) => !a.startsWith("--"))?.toLowerCase().trim()
  const passwordArg = args
    .find((a) => a.startsWith("--password="))
    ?.split("=")[1]

  if (!email) {
    console.error("Usage: pnpm tsx scripts/promote-admin.ts <email> [--password=<pw>]")
    process.exit(1)
  }

  const existing = await db.user.findUnique({
    where: { email },
    include: { driverProfile: { select: { id: true } } },
  })

  if (existing) {
    const updated = await db.user.update({
      where: { email },
      data: {
        role: "super_admin",
        status: "active",
        ...(passwordArg
          ? { passwordHash: await bcrypt.hash(passwordArg, 12) }
          : {}),
      },
    })

    // Audit + role-change log
    await db.roleChangeLog.create({
      data: {
        targetUserId: updated.id,
        oldRole: existing.role,
        newRole: "super_admin",
        changedById: updated.id, // self / system
        reason: "Promoted via promote-admin.ts script",
      },
    })

    console.log(`✅ Promoted existing user → super_admin`)
    console.log(`   email:  ${email}`)
    console.log(`   id:     ${updated.id}`)
    console.log(`   was:    ${existing.role}`)
    console.log(`   now:    super_admin (active)`)
    if (passwordArg) console.log(`   password: updated`)
    return
  }

  // Create new user
  const passwordHash = passwordArg
    ? await bcrypt.hash(passwordArg, 12)
    : await bcrypt.hash(`temp-${Date.now()}-please-reset`, 12)

  const created = await db.user.create({
    data: {
      email,
      name: email.split("@")[0],
      role: "super_admin",
      status: "active",
      passwordHash,
    },
  })

  await db.roleChangeLog.create({
    data: {
      targetUserId: created.id,
      oldRole: "customer",
      newRole: "super_admin",
      changedById: created.id,
      reason: "Created as super_admin via promote-admin.ts script",
    },
  })

  console.log(`✅ Created new super_admin user`)
  console.log(`   email:  ${email}`)
  console.log(`   id:     ${created.id}`)
  console.log(`   role:   super_admin`)
  console.log(`   status: active`)
  if (passwordArg) {
    console.log(`   password: SET (use credentials login)`)
  } else {
    console.log(
      `   password: temp random (use Google OAuth, or re-run with --password=...)`,
    )
  }
}

main()
  .catch((err) => {
    console.error("❌ Failed:", err)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
