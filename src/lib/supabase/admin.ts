import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { getSupabaseAdminConfig } from '@/lib/supabase/config'

export function createSupabaseAdminClient(): SupabaseClient<Database> | null {
  const config = getSupabaseAdminConfig()
  if (!config) return null

  return createClient<Database>(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
