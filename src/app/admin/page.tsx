import Image from 'next/image'
import Link from 'next/link'
import { Edit, Plus } from 'lucide-react'
import { logout } from '@/app/admin/actions'
import { deleteProduct } from '@/app/admin/products/actions'
import { DeleteProductForm } from '@/components/delete-product-form'
import { normalizeProduct } from '@/lib/catalog'
import { fallbackProducts } from '@/lib/catalog-data'
import { formatCoverage, formatPrice } from '@/lib/format'
import { requireOwner } from '@/lib/supabase/auth'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams: Promise<{ created?: string; updated?: string; deleted?: string; error?: string }>
}

export default async function AdminPage({ searchParams }: PageProps) {
  const { supabase, user } = await requireOwner()
  const params = await searchParams

  const { products, error } = supabase
    ? await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => ({ products: data?.map(normalizeProduct) ?? [], error }))
    : { products: fallbackProducts, error: null }

  return (
    <section className="section-y">
      <div className="page-container">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-brand-dark">Admin</p>
            <h1 className="mt-3 text-4xl font-black tracking-normal md:text-6xl">Inventory</h1>
            <p className="mt-3 text-muted">Signed in as {user.email}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/admin/products/new" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-dark">
              <Plus className="size-4" aria-hidden="true" />
              Add product
            </Link>
            <form action={logout}>
              <button className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-foreground px-5 py-3 text-sm font-bold text-background hover:bg-foreground/88" type="submit">
                Log out
              </button>
            </form>
          </div>
        </div>

        {params.created || params.updated || params.deleted ? (
          <div className="mt-8 rounded-lg bg-success-soft p-4 text-sm font-semibold text-success">Inventory saved.</div>
        ) : null}
        {!supabase ? (
          <div className="mt-8 rounded-lg bg-warning-soft p-4 text-sm font-semibold text-warning">
            Local demo mode is read-only. Connect Supabase to save inventory changes.
          </div>
        ) : null}
        {params.error || error ? (
          <div className="mt-8 rounded-lg bg-danger-soft p-4 text-sm font-semibold text-danger">{params.error || error?.message}</div>
        ) : null}

        <div className="mt-8 overflow-hidden rounded-lg bg-surface shadow-card">
          <div className="hidden grid-cols-[1fr_140px_160px_128px] gap-4 border-b border-border px-5 py-3 text-sm font-bold text-muted md:grid">
            <span>Product</span>
            <span>Price</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
          {products.length > 0 ? (
            <div className="divide-y divide-border">
              {products.map((product) => (
                <div key={product.id} className="grid gap-4 p-5 md:grid-cols-[1fr_140px_160px_128px] md:items-center">
                  <div className="flex items-center gap-4">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-surface-warm">
                      <Image src={product.images[0] || '/supplybird-assets/flooring.png'} alt="" fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold">{product.title}</p>
                      <p className="truncate text-sm text-muted">{formatCoverage(product)}</p>
                    </div>
                  </div>
                  <p className="font-mono text-sm font-bold">{formatPrice(product)}</p>
                  <p>
                    <span
                      className={
                        product.in_stock
                          ? 'rounded-full bg-success-soft px-3 py-1 text-xs font-bold text-success'
                          : 'rounded-full bg-warning-soft px-3 py-1 text-xs font-bold text-warning'
                      }
                    >
                      {product.in_stock ? 'In stock' : 'Ask availability'}
                    </span>
                  </p>
                  <div className="flex justify-start gap-2 md:justify-end">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="inline-flex size-10 items-center justify-center rounded-lg bg-surface-warm text-foreground hover:bg-brand-soft"
                      aria-label={`Edit ${product.title}`}
                    >
                      <Edit className="size-4" aria-hidden="true" />
                    </Link>
                    <DeleteProductForm productTitle={product.title} action={deleteProduct.bind(null, product.id)} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <h2 className="text-2xl font-black">No products yet.</h2>
              <p className="mt-2 text-muted">Add the first inventory item to populate the catalog.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
