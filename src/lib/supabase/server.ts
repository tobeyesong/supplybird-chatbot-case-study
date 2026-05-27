import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { getSupabaseConfig } from '@/lib/supabase/config'

export async function createServerSupabaseClient(): Promise<SupabaseClient<Database> | null> {
  const config = getSupabaseConfig()
  if (!config) return null

  const cookieStore = await cookies()

  return createServerClient<Database>(config.url, config.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server Components cannot set cookies; Server Actions and proxy can.
        }
      },
    },
  })
}
