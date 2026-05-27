import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { ChatOpenButton } from '@/components/chat-open-button'
import { CoverageCalculator } from '@/components/coverage-calculator'
import { ProductCard } from '@/components/product-card'
import { ProductGallery } from '@/components/product-gallery'
import { textHref } from '@/lib/business'
import { formatCoverage, formatPrice } from '@/lib/format'
import { getProduct, getRelatedProducts, isProductCategory } from '@/lib/catalog'

export const revalidate = 60

type PageProps = {
  params: Promise<{ category: string; slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, slug } = await params

  if (!isProductCategory(category)) {
    return { title: 'Product' }
  }

  const product = await getProduct(category, slug)

  if (!product) {
    return { title: 'Product' }
  }

  return {
    title: product.title,
    description: product.description,
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { category, slug } = await params

  if (!isProductCategory(category)) {
    notFound()
  }

  const product = await getProduct(category, slug)
  if (!product) notFound()

  const images = product.images.length ? product.images : ['/supplybird-assets/flooring.png']
  const relatedProducts = await getRelatedProducts(product)

  return (
    <>
      <section className="section-y">
        <div className="page-container">
          <Link href={`/shop/${product.category}`} className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to {product.category}
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.08fr_0.92fr]">
            <ProductGallery images={images} title={product.title} />

            <div className="grid content-start gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={
                      product.in_stock
                        ? 'rounded-full bg-success-soft px-3 py-1 text-sm font-bold text-success'
                        : 'rounded-full bg-warning-soft px-3 py-1 text-sm font-bold text-warning'
                    }
                  >
                    {product.in_stock ? 'In stock' : 'Ask availability'}
                  </span>
                  <span className="rounded-full bg-brand-soft px-3 py-1 text-sm font-bold text-brand-dark">{formatCoverage(product)}</span>
                </div>
                <h1 className="mt-5 text-4xl font-black tracking-normal md:text-6xl">{product.title}</h1>
                <p className="mt-4 text-lg leading-8 text-muted">{product.description}</p>
                <p className="mt-6 font-mono text-2xl font-black text-foreground">{formatPrice(product)}</p>
              </div>

              <CoverageCalculator coveragePerBox={product.coverage_per_box} price={product.price} priceUnit={product.price_unit} />

              <div className="grid gap-3 sm:grid-cols-2">
                <ChatOpenButton label="Chat" />
                <a
                  href={textHref()}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-3 text-sm font-bold text-background hover:bg-foreground/88"
                >
                  <MessageSquare className="size-4" aria-hidden="true" />
                  Text
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="section-y bg-surface-warm">
          <div className="page-container">
            <h2 className="text-3xl font-black tracking-normal">Related products</h2>
            <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}
