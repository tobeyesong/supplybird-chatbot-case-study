'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getOwnerTokenMetadata, isOwnerSignupConfigured, verifyOwnerInviteCode } from '@/lib/supabase/owner-access'
import { createServerSupabaseClient } from '@/lib/supabase/server'

function getSiteUrl() {
  const url = process.env.URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.DEPLOY_PRIME_URL
  return url ? `https://${url.replace(/^https?:\/\//, '')}` : undefined
}

function redirectWithError(message: string, code?: string): never {
  const params = new URLSearchParams({ error: message })

  if (code) {
    params.set('code', code)
  }

  redirect(`/admin/create-account?${params.toString()}`)
}

export async function createOwnerAccount(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '')
  const code = String(formData.get('code') || '').trim()

  if (!supabase) {
    redirectWithError('Supabase environment variables are required before the owner account can be created.', code)
  }

  if (!isOwnerSignupConfigured()) {
    redirectWithError('Owner invite environment variables are not configured yet.', code)
  }

  if (!verifyOwnerInviteCode(code)) {
    redirectWithError('This owner invite link is invalid or expired.')
  }

  if (!email || !password) {
    redirectWithError('Enter an email and password.', code)
  }

  if (password.length < 8) {
    redirectWithError('Use a password with at least 8 characters.', code)
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: getOwnerTokenMetadata(email),
      emailRedirectTo: getSiteUrl() ? `${getSiteUrl()}/admin/login?created=1` : undefined,
    },
  })

  if (error) {
    redirectWithError(error.message, code)
  }

  revalidatePath('/', 'layout')
  redirect('/admin/login?created=1')
}
