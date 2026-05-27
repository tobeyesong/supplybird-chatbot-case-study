import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { updateProduct } from '@/app/admin/products/actions'
import { ProductForm } from '@/components/product-form'
import { normalizeProduct } from '@/lib/catalog'
import { fallbackProducts } from '@/lib/catalog-data'
import { requireOwner } from '@/lib/supabase/auth'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}

export default async function EditProductPage({ params, searchParams }: PageProps) {
  const { supabase } = await requireOwner()
  const { id } = await params
  const query = await searchParams

  if (!supabase) {
    const product = fallbackProducts.find((item) => item.id === id)
    if (!product) {
      notFound()
    }

    return (
      <section className="section-y">
        <div className="page-container max-w-4xl">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to inventory
          </Link>
          <div className="mt-8 surface-card p-6 md:p-8">
            <h1 className="text-3xl font-black tracking-normal">Edit product</h1>
            <p className="mt-2 text-muted">Update listing details, stock status, calculator coverage, and photos.</p>
            <div className="mt-6 rounded-lg bg-warning-soft p-4 text-sm font-semibold text-warning">
              Local demo mode is read-only. Connect Supabase to save inventory changes.
            </div>
            <div className="mt-8">
              <ProductForm product={product} submitLabel="Save product" action={updateProduct.bind(null, product.id)} error={query.error} />
            </div>
          </div>
        </div>
      </section>
    )
  }

  const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle()

  if (error || !data) {
    notFound()
  }

  const product = normalizeProduct(data)
  const action = updateProduct.bind(null, product.id)

  return (
    <section className="section-y">
      <div className="page-container max-w-4xl">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to inventory
        </Link>
        <div className="mt-8 surface-card p-6 md:p-8">
          <h1 className="text-3xl font-black tracking-normal">Edit product</h1>
          <p className="mt-2 text-muted">Update listing details, stock status, calculator coverage, and photos.</p>
          <div className="mt-8">
            <ProductForm product={product} submitLabel="Save product" action={action} error={query.error} />
          </div>
        </div>
      </div>
    </section>
  )
}
