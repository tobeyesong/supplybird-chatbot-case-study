import Link from 'next/link'
import { ProductImage } from '@/components/product-image'
import { formatCoverage, formatPrice } from '@/lib/format'
import type { Product } from '@/lib/types'

export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0] || '/supplybird-assets/flooring.png'

  return (
    <Link href={`/shop/${product.category}/${product.slug}`} className="group block">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-surface-warm sm:aspect-[2/3]">
        <ProductImage
          src={image}
          alt={product.title}
          className="h-full w-full object-cover transition duration-300 group-hover:opacity-75"
        />
      </div>
      <div className="mt-4 flex items-start justify-between gap-4 text-base font-bold text-foreground">
        <h3 className="min-w-0 leading-6">{product.title}</h3>
        <p className="max-w-44 shrink-0 text-right font-mono text-sm leading-5 sm:max-w-48">{formatPrice(product)}</p>
      </div>
      <p className="mt-1 text-base italic text-muted sm:text-sm">{formatCoverage(product)}</p>
      {product.availability_note ? (
        <p className="mt-3 inline-flex rounded-full bg-brand px-3 py-1 text-xs font-black uppercase tracking-wide text-foreground">
          {product.availability_note}
        </p>
      ) : null}
      <p
        className={
          product.in_stock
            ? 'mt-3 flex w-fit rounded-full bg-success-soft px-3 py-1 text-xs font-bold text-success'
            : 'mt-3 flex w-fit rounded-full bg-warning-soft px-3 py-1 text-xs font-bold text-warning'
        }
      >
        {product.in_stock ? 'In stock' : 'Ask availability'}
      </p>
    </Link>
  )
}
