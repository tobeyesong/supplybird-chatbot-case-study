import type { Product } from '@/lib/types'

const priceUnits: Record<string, string> = {
  sq_ft: 'sq.ft.',
  ln_ft: 'ln.ft.',
  box: 'box',
  bundle: 'bundle',
  board: 'board',
  roll: 'roll',
  unit: 'unit',
}

export function formatUnitPrice(price: number, priceUnit: string) {
  const amount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: price % 1 === 0 ? 0 : 2,
  }).format(price)

  return `${amount} / ${priceUnits[priceUnit] ?? priceUnit.replaceAll('_', ' ')}`
}

export function formatPrice(product: Pick<Product, 'price' | 'price_unit' | 'coverage_per_box' | 'coverage_unit'>) {
  if (product.price <= 0) return 'Contact for pricing'

  if (product.coverage_per_box && product.coverage_unit === 'sq_ft') {
    if (product.price_unit === 'sq_ft') {
      return `${formatUnitPrice(product.price, 'sq_ft')} · ${formatUnitPrice(product.price * product.coverage_per_box, 'box')}`
    }

    if (product.price_unit === 'box') {
      return `${formatUnitPrice(product.price / product.coverage_per_box, 'sq_ft')} · ${formatUnitPrice(product.price, 'box')}`
    }
  }

  return formatUnitPrice(product.price, product.price_unit)
}

export function formatCoverage(product: Pick<Product, 'coverage_per_box' | 'coverage_unit' | 'display_detail'>) {
  if (product.display_detail) return product.display_detail
  if (!product.coverage_per_box) return 'Ask for coverage'

  const unit = product.coverage_unit === 'ln_ft' ? 'ln.ft.' : 'sq.ft.'
  return `${product.coverage_per_box} ${unit} / box`
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
