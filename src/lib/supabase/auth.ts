import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const demoAdminCookie = 'modhaus_demo_admin'

export const demoAdminCredentials = {
  email: process.env.ADMIN_DEMO_EMAIL || 'admin@modhaus.local',
  password: process.env.ADMIN_DEMO_PASSWORD || 'modhaus-demo',
}

export function isDemoAdminEnabled() {
  return process.env.NODE_ENV !== 'production'
}

export async function getDemoAdminUser() {
  if (!isDemoAdminEnabled()) return null

  const cookieStore = await cookies()
  if (cookieStore.get(demoAdminCookie)?.value !== '1') return null

  return {
    id: 'demo-admin',
    email: demoAdminCredentials.email,
  }
}

export async function setDemoAdminSession() {
  const cookieStore = await cookies()
  cookieStore.set(demoAdminCookie, '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  })
}

export async function clearDemoAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(demoAdminCookie)
}

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient()
  if (!supabase) return { supabase: null, user: await getDemoAdminUser() }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { supabase, user }
}

export async function requireOwner() {
  const { supabase, user } = await getCurrentUser()

  if (!supabase) {
    if (user) return { supabase, user }

    redirect('/admin/login?error=Supabase%20environment%20variables%20are%20required%20for%20admin%20access.')
  }

  if (!user) {
    redirect('/admin/login')
  }

  return { supabase, user }
}
