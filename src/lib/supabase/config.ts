export type SupabaseConfig = {
  url: string
  key: string
}

export type SupabaseAdminConfig = SupabaseConfig & {
  serviceRoleKey: string
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) return null

  return { url, key }
}

export function getSupabaseAdminConfig(): SupabaseAdminConfig | null {
  const config = getSupabaseConfig()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!config || !serviceRoleKey) return null

  return { ...config, serviceRoleKey }
}
