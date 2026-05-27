import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createProduct } from '@/app/admin/products/actions'
import { AdminLogoutButton } from '@/components/admin-logout-button'
import { ProductForm } from '@/components/product-form'
import { requireOwner } from '@/lib/supabase/auth'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams: Promise<{ error?: string }>
}

export default async function NewProductPage({ searchParams }: PageProps) {
  const { supabase } = await requireOwner()
  const params = await searchParams

  return (
    <section className="section-y">
      <div className="page-container max-w-4xl">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to inventory
          </Link>
          <AdminLogoutButton />
        </div>
        <div className="mt-8 surface-card p-6 md:p-8">
          <h1 className="text-3xl font-black tracking-normal">Add product</h1>
          <p className="mt-2 text-muted">Add price, stock status, photos, and box coverage for the calculator.</p>
          {!supabase ? (
            <div className="mt-6 rounded-lg bg-warning-soft p-4 text-sm font-semibold text-warning">
              Local demo mode is read-only. Connect Supabase to save inventory changes.
            </div>
          ) : null}
          <div className="mt-8">
            <ProductForm submitLabel="Create product" action={createProduct} error={params.error} />
          </div>
        </div>
      </div>
    </section>
  )
}
