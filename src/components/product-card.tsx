import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { formatCoverage, formatPrice } from '@/lib/format'
import type { Product } from '@/lib/types'

export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0] || '/supplybird-assets/flooring.png'

  return (
    <Link href={`/shop/${product.category}/${product.slug}`} className="group grid overflow-hidden rounded-lg bg-surface shadow-card">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-warm">
        <Image
          src={image}
          alt={product.title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="grid gap-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-bold leading-6 text-foreground">{product.title}</p>
            <p className="mt-1 text-sm text-muted">{formatCoverage(product)}</p>
          </div>
          <span className="mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-dark">
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-sm font-bold text-foreground">{formatPrice(product)}</p>
          <span
            className={
              product.in_stock
                ? 'rounded-full bg-success-soft px-3 py-1 text-xs font-bold text-success'
                : 'rounded-full bg-warning-soft px-3 py-1 text-xs font-bold text-warning'
            }
          >
            {product.in_stock ? 'In stock' : 'Ask availability'}
          </span>
        </div>
      </div>
    </Link>
  )
}
