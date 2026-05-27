'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { clearDemoAdminSession } from '@/lib/supabase/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function logout() {
  const supabase = await createServerSupabaseClient()
  await clearDemoAdminSession()

  if (supabase) {
    await supabase.auth.signOut()
  }

  revalidatePath('/', 'layout')
  redirect('/admin/login')
}
