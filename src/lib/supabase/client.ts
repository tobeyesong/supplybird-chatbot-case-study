'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { getSupabaseConfig } from '@/lib/supabase/config'

let browserClient: SupabaseClient<Database> | null = null

export function getBrowserSupabaseClient() {
  const config = getSupabaseConfig()
  if (!config) return null

  browserClient ??= createBrowserClient<Database>(config.url, config.key)

  return browserClient
}
