import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BadgePercent, Clock3, Tags } from 'lucide-react'
import { notFound } from 'next/navigation'
import { CategoryEmptyState } from '@/components/empty-state'
import { ProductCard } from '@/components/product-card'
import { getCategoriesWithSettings, getCategoryWithSettings, getProducts, isProductCategory } from '@/lib/catalog'

export const revalidate = 60

type PageProps = {
  params: Promise<{ category: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: categorySlug } = await params
  const category = await getCategoryWithSettings(categorySlug)

  if (!category) {
    return { title: 'Shop' }
  }

  return {
    title: `${category.name} Products`,
    description: category.description,
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { category: categorySlug } = await params

  if (!isProductCategory(categorySlug)) {
    notFound()
  }

  const category = await getCategoryWithSettings(categorySlug)
  if (!category) notFound()

  const categories = await getCategoriesWithSettings()
  const products = await getProducts({ category: categorySlug })

  return (
    <section className="section-y">
      <div className="page-container">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <Link
                  key={item.slug}
                  href={`/shop/${item.slug}`}
                  className={`rounded-full px-3 py-1.5 text-sm font-bold ${
                    item.slug === category.slug ? 'bg-brand text-white' : 'bg-surface text-muted shadow-card hover:text-foreground'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-normal md:text-6xl">{category.name}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{category.description}</p>
          </div>
          <p className="font-mono text-sm font-bold text-brand-dark">Starting at {category.startingPrice}</p>
        </div>

        {category.slug === 'flooring' ? (
          <aside className="relative mt-8 overflow-hidden rounded-lg bg-foreground p-6 text-background shadow-float sm:p-8" aria-label="Flooring project sale">
            <div className="absolute -right-16 -top-20 size-56 rounded-full bg-brand/20 blur-3xl" aria-hidden="true" />
            <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-brand">
                  <BadgePercent className="size-5" aria-hidden="true" />
                  Flooring project sale
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-normal text-white sm:text-4xl">Save over 50% off major retail prices.</h2>
                <p className="mt-3 max-w-xl leading-7 text-background/75">Stretch your project budget with closeout flooring from brands including Mohawk and LifeProof. Quantities are limited.</p>
              </div>
              <a href="#flooring-inventory" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-black text-foreground shadow-card transition hover:bg-brand-dark hover:text-white">
                Shop flooring deals
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </div>
          </aside>
        ) : null}

        {category.slug === 'flooring' ? (
          <aside className="mt-8 rounded-lg border border-brand/40 bg-brand-soft p-5 shadow-card sm:p-6" aria-label="Featured flooring brands">
            <div className="flex items-start gap-4 sm:items-center">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-foreground">
                <Tags className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-brand">Featured flooring brands</p>
                <h2 className="mt-1 text-xl font-black text-foreground sm:text-2xl">Shop trusted names for your next project.</h2>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3 pl-0 sm:pl-15">
              {['Mohawk', 'LifeProof'].map((brand) => (
                <span key={brand} className="rounded-full border border-border bg-surface px-5 py-2 text-sm font-black text-foreground shadow-card">
                  {brand}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-muted sm:pl-15">Brand availability changes with each closeout lot. Contact us to confirm current styles and quantities.</p>
          </aside>
        ) : null}

        {category.slug === 'roofing' ? (
          <aside className="mt-8 flex items-start gap-4 rounded-lg border border-brand/40 bg-brand-soft p-5 shadow-card sm:items-center sm:p-6" aria-label="Upcoming shingles">
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-foreground">
              <Clock3 className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-brand">Coming soon</p>
              <h2 className="mt-1 text-xl font-black text-foreground sm:text-2xl">Economy shingles coming soon.</h2>
              <p className="mt-1 text-sm leading-6 text-muted">Check back soon for available styles, colors, bundle pricing, and pickup details.</p>
            </div>
          </aside>
        ) : null}

        {products.length > 0 ? (
          <div id={category.slug === 'flooring' ? 'flooring-inventory' : undefined} className="mt-10 scroll-mt-36 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <CategoryEmptyState category={category.slug} />
        )}
      </div>
    </section>
  )
}
