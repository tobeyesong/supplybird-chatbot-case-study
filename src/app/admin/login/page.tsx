import { redirect } from 'next/navigation'
import Image from 'next/image'
import { login } from '@/app/admin/login/actions'
import { demoAdminCredentials, getCurrentUser, isDemoAdminEnabled } from '@/lib/supabase/auth'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams: Promise<{ created?: string; error?: string }>
}

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const { user } = await getCurrentUser()
  const params = await searchParams

  if (user) {
    redirect('/admin')
  }

  return (
    <section className="section-y">
      <div className="page-container max-w-md">
        <div className="surface-card p-6 md:p-8">
          <div className="flex items-center gap-3">
            <Image src="/modhaus-mark.svg" alt="" width={44} height={44} className="rounded-lg" />
            <div>
              <h1 className="text-2xl font-black">Owner login</h1>
              <p className="text-sm text-muted">Manage ModHaus inventory.</p>
            </div>
          </div>

          {params.error ? <div className="mt-6 rounded-lg bg-danger-soft p-4 text-sm font-semibold text-danger">{params.error}</div> : null}
          {params.created ? (
            <div className="mt-6 rounded-lg bg-success-soft p-4 text-sm font-semibold text-success">
              Owner account created. If Supabase sent a confirmation email, confirm it first, then log in here.
            </div>
          ) : null}
          {isDemoAdminEnabled() ? (
            <div className="mt-6 rounded-lg bg-surface-warm p-4 text-sm text-muted">
              <p className="font-bold text-foreground">Local demo admin</p>
              <p className="mt-1">{demoAdminCredentials.email}</p>
              <p>{demoAdminCredentials.password}</p>
            </div>
          ) : null}

          <form className="mt-6 grid gap-5" action={login}>
            <label className="grid gap-2 text-sm font-semibold">
              Email
              <input className="field" name="email" type="email" autoComplete="email" required />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Password
              <input className="field" name="password" type="password" autoComplete="current-password" required />
            </label>
            <button className="min-h-12 rounded-lg bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-dark" type="submit">
              Log in
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
