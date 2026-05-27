import Link from 'next/link'
import { Hammer, Layers, Package, PackagePlus, Plus, Warehouse, type LucideIcon } from 'lucide-react'
import type { ProductCategory } from '@/lib/types'

const categoryIcons = {
  flooring: Layers,
  decking: Warehouse,
  roofing: Hammer,
  other: Package,
} satisfies Record<ProductCategory, LucideIcon>

const categoryCopy = {
  flooring: {
    title: 'No flooring listed yet',
    message: 'Fresh flooring lots will appear here as inventory is added.',
  },
  decking: {
    title: 'No decking listed yet',
    message: 'Deck boards and trim will show here when stock is available.',
  },
  roofing: {
    title: 'No roofing listed yet',
    message: 'Roofing bundles will show here after the next inventory update.',
  },
  other: {
    title: 'No other items listed yet',
    message: 'Windows, appliances, and supplies will appear here as they are added.',
  },
} satisfies Record<ProductCategory, { title: string; message: string }>

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  message: string
  action?: {
    href: string
    label: string
  }
}

export function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="mt-10 flex min-h-[45vh] items-center justify-center rounded-lg border border-dashed border-border bg-surface/70 px-6 py-14 text-center">
      <div className="mx-auto max-w-sm">
        <div className="mx-auto flex size-16 items-center justify-center rounded-lg bg-surface-warm text-brand-dark shadow-card">
          <Icon className="size-8" aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-2xl font-black tracking-normal text-foreground">{title}</h2>
        <p className="mt-2 text-base leading-7 text-muted sm:text-sm/6">{message}</p>
        {action ? (
          <div className="mt-7">
            <Link
              href={action.href}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-base font-bold text-white shadow-card hover:bg-brand-dark sm:min-h-11 sm:py-2.5 sm:text-sm"
            >
              <Plus className="size-5 sm:size-4" aria-hidden="true" />
              {action.label}
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function CategoryEmptyState({ category }: { category: ProductCategory }) {
  const copy = categoryCopy[category]

  return <EmptyState icon={categoryIcons[category]} title={copy.title} message={copy.message} />
}

export function AdminProductsEmptyState() {
  return (
    <EmptyState
      icon={PackagePlus}
      title="No inventory yet"
      message="Create the first listing to start filling the public catalog."
      action={{ href: '/admin/products/new', label: 'Add product' }}
    />
  )
}
