'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { demoAdminCredentials, isDemoAdminEnabled, setDemoAdminSession } from '@/lib/supabase/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'

function errorRedirect(message: string): never {
  redirect(`/admin/login?error=${encodeURIComponent(message)}`)
}

export async function login(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '')

  if (!email || !password) {
    errorRedirect('Enter an email and password.')
  }

  if (!supabase) {
    if (!isDemoAdminEnabled()) {
      errorRedirect('Supabase environment variables are required for admin access.')
    }

    if (email === demoAdminCredentials.email && password === demoAdminCredentials.password) {
      await setDemoAdminSession()
      revalidatePath('/', 'layout')
      redirect('/admin')
    }

    errorRedirect('Invalid demo admin credentials.')
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    errorRedirect(error.message)
  }

  revalidatePath('/', 'layout')
  redirect('/admin')
}
