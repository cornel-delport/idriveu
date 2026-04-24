/**
 * Client-side Supabase singleton.
 * Used for Realtime subscriptions to driver locations only.
 *
 * NOTE: After running `prisma db push`, enable Realtime on the
 * "DriverLocation" table in Supabase dashboard:
 *   Table Editor → Replication → toggle DriverLocation ON
 */
import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)
