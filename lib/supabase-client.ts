'use client'

/**
 * Client-side Supabase singleton.
 * Used for Realtime subscriptions to driver locations only.
 *
 * NOTE: After running `prisma db push`, enable Realtime on the
 * "DriverLocation" table in Supabase dashboard:
 *   Table Editor → Replication → toggle DriverLocation ON
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

declare global {
  // eslint-disable-next-line no-var
  var _supabase: SupabaseClient | undefined
}

function makeClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env.local",
    )
  }
  return createClient(url, key)
}

export const supabase: SupabaseClient =
  globalThis._supabase ?? (globalThis._supabase = makeClient())
