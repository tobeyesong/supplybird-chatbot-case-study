import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createOwnerAccount } from '@/app/admin/create-account/actions'
import { getCurrentUser } from '@/lib/supabase/auth'
import { hasOwnerAccess, isOwnerSignupConfigured } from '@/lib/supabase/owner-access'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams: Promise<{ code?: string; error?: string }>
}

export default async function CreateOwnerAccountPage({ searchParams }: PageProps) {
  const params = await searchParams
  const { user } = await getCurrentUser()

  if (hasOwnerAccess(user)) {
    redirect('/admin')
  }

  return (
    <section className="section-y">
      <div className="page-container max-w-md">
        <div className="surface-card p-6 md:p-8">
          <div className="flex items-center gap-3">
            <Image src="/modhaus-mark.svg" alt="" width={44} height={44} className="rounded-lg" />
            <div>
              <h1 className="text-2xl font-black">Create owner login</h1>
              <p className="text-sm text-muted">Set the private ModHaus admin email and password.</p>
            </div>
          </div>

          {!isOwnerSignupConfigured() ? (
            <div className="mt-6 rounded-lg bg-danger-soft p-4 text-sm font-semibold text-danger">
              Owner signup is not configured yet.
            </div>
          ) : null}
          {params.error ? <div className="mt-6 rounded-lg bg-danger-soft p-4 text-sm font-semibold text-danger">{params.error}</div> : null}

          <form className="mt-6 grid gap-5" action={createOwnerAccount}>
            {params.code ? <input name="code" type="hidden" value={params.code} /> : null}
            {!params.code ? (
              <label className="grid gap-2 text-sm font-semibold">
                Invite code
                <input className="field" name="code" autoComplete="one-time-code" required />
              </label>
            ) : null}
            <label className="grid gap-2 text-sm font-semibold">
              Email
              <input className="field" name="email" type="email" autoComplete="email" required />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Password
              <input className="field" name="password" type="password" autoComplete="new-password" minLength={8} required />
            </label>
            <button
              className="min-h-12 rounded-lg bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={!isOwnerSignupConfigured()}
            >
              Create owner account
            </button>
          </form>

          <p className="mt-6 text-sm text-muted">
            Already have the account?{' '}
            <Link href="/admin/login" className="font-bold text-brand-dark hover:text-brand">
              Log in
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
