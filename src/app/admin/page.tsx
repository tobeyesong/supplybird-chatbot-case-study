import Link from 'next/link'
import { Edit, Plus } from 'lucide-react'
import { deleteProduct, updateCategoryPricing } from '@/app/admin/products/actions'
import { AdminLogoutButton } from '@/components/admin-logout-button'
import { AdminToasts, type AdminToastMessage } from '@/components/admin-toasts'
import { DeleteProductForm } from '@/components/delete-product-form'
import { AdminProductsEmptyState } from '@/components/empty-state'
import { ProductImage } from '@/components/product-image'
import { getCategorySettings, normalizeProduct } from '@/lib/catalog'
import { categories, fallbackProducts } from '@/lib/catalog-data'
import { formatCoverage, formatPrice, formatUnitPrice } from '@/lib/format'
import { requireOwner } from '@/lib/supabase/auth'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams: Promise<{ created?: string; updated?: string; deleted?: string; pricing?: string; error?: string }>
}

function getAdminToast(params: Awaited<PageProps['searchParams']>): AdminToastMessage | null {
  if (params.created) {
    return {
      id: 'created',
      tone: 'success',
      title: 'Product created',
      message: 'The new product is live in the admin inventory.',
    }
  }

  if (params.updated) {
    return {
      id: 'updated',
      tone: 'info',
      title: 'Product updated',
      message: 'The listing changes were saved.',
    }
  }

  if (params.deleted) {
    return {
      id: 'deleted',
      tone: 'danger',
      title: 'Deletion confirmed',
      message: 'The product was removed from the catalog.',
    }
  }

  if (params.pricing) {
    return {
      id: 'pricing',
      tone: 'success',
      title: 'Pricing saved',
      message: 'Default category pricing was updated.',
    }
  }

  if (params.error) {
    return {
      id: 'error',
      tone: 'error',
      title: 'Could not save changes',
      message: params.error,
    }
  }

  return null
}

function unitLabel(priceUnit: string) {
  return formatUnitPrice(1, priceUnit).replace('$1 / ', '')
}

export default async function AdminPage({ searchParams }: PageProps) {
  const { supabase, user } = await requireOwner()
  const params = await searchParams
  const toast = getAdminToast(params)

  const { products, error } = supabase
    ? await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => ({ products: data?.map(normalizeProduct) ?? [], error }))
    : { products: fallbackProducts, error: null }
  const categorySettings = await getCategorySettings()
  const categorySettingsBySlug = new Map(categorySettings.map((setting) => [setting.category, setting]))
  const pricingRows = categories.map((category) => ({
    category,
    setting: categorySettingsBySlug.get(category.slug) ?? {
      category: category.slug,
      default_price: category.default_price,
      price_unit: category.price_unit,
      updated_at: null,
    },
  }))

  return (
    <section className="section-y">
      <AdminToasts toast={toast} />
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
            <AdminLogoutButton />
          </div>
        </div>

        {!supabase ? (
          <div className="mt-8 rounded-lg bg-warning-soft p-4 text-sm font-semibold text-warning">
            Local demo mode is read-only. Connect Supabase to save inventory changes.
          </div>
        ) : null}
        {params.error || error ? (
          <div className="mt-8 rounded-lg bg-danger-soft p-4 text-sm font-semibold text-danger">{params.error || error?.message}</div>
        ) : null}

        <div className="mt-8 surface-card p-6">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-brand-dark">Default pricing</p>
              <h2 className="mt-2 text-2xl font-black tracking-normal">Category starting prices</h2>
              <p className="mt-2 max-w-2xl text-muted">
                These values control the public “starting at” prices for each shop category.
              </p>
            </div>
            <div className="grid gap-2 text-base text-muted sm:text-sm md:text-right">
              {pricingRows.map(({ category, setting }) => (
                <p key={category.slug}>
                  {category.name}: <span className="font-bold text-foreground">{formatUnitPrice(setting.default_price, setting.price_unit)}</span>
                </p>
              ))}
            </div>
          </div>

          <form action={updateCategoryPricing} className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_auto] xl:items-end">
            {pricingRows.map(({ category, setting }) => (
              <label key={category.slug} className="grid gap-2 text-base font-semibold sm:text-sm">
                {category.name} price per {unitLabel(setting.price_unit)}
                <input className="field" name={`${category.slug}_default_price`} type="number" step="0.01" min="0" defaultValue={setting.default_price} />
                <input name={`${category.slug}_price_unit`} type="hidden" value={setting.price_unit} />
              </label>
            ))}
            <button className="min-h-12 rounded-lg bg-foreground px-5 py-3 text-base font-bold text-background hover:bg-foreground/88 sm:min-h-11 sm:py-2.5 sm:text-sm md:col-span-2 xl:col-span-1" type="submit">
              Save pricing
            </button>
          </form>
        </div>

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
                      <ProductImage src={product.images[0] || '/supplybird-assets/flooring.png'} alt="" className="h-full w-full object-cover" />
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
            <div className="px-5 pb-5">
              <AdminProductsEmptyState />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
