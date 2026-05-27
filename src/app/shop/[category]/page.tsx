import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProductCard } from '@/components/product-card'
import { categories } from '@/lib/catalog-data'
import { getCategory, getProducts, isProductCategory } from '@/lib/catalog'

export const revalidate = 60

type PageProps = {
  params: Promise<{ category: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: categorySlug } = await params
  const category = getCategory(categorySlug)

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

  const category = getCategory(categorySlug)
  if (!category) notFound()

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

        {products.length > 0 ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="surface-card mt-10 p-8 text-center">
            <h2 className="text-2xl font-black">No products listed yet.</h2>
            <p className="mt-2 text-muted">Check back after the owner adds inventory.</p>
          </div>
        )}
      </div>
    </section>
  )
}
