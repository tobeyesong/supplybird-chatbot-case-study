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

export function formatPrice(product: Pick<Product, 'price' | 'price_unit'>) {
  const amount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: product.price % 1 === 0 ? 0 : 2,
  }).format(product.price)

  return `${amount} / ${priceUnits[product.price_unit] ?? product.price_unit.replaceAll('_', ' ')}`
}

export function formatCoverage(product: Pick<Product, 'coverage_per_box' | 'coverage_unit'>) {
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
