import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { categories, fallbackProducts } from '@/lib/catalog-data'
import type { Database } from '@/lib/database.types'
import { getSupabaseConfig } from '@/lib/supabase/config'
import { formatUnitPrice } from '@/lib/format'
import type { CategorySetting, Product, ProductCategory } from '@/lib/types'

let publicSupabaseClient: SupabaseClient<Database> | null = null

function getPublicSupabaseClient() {
  const config = getSupabaseConfig()
  if (!config) return null

  publicSupabaseClient ??= createClient<Database>(config.url, config.key)

  return publicSupabaseClient
}

export function isProductCategory(value: string): value is ProductCategory {
  return categories.some((category) => category.slug === value)
}

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug) ?? null
}

function normalizeCategorySetting(setting: Database['public']['Tables']['category_settings']['Row']): CategorySetting | null {
  if (!isProductCategory(setting.category)) return null

  return {
    category: setting.category,
    default_price: Number(setting.default_price),
    price_unit: setting.price_unit,
    updated_at: setting.updated_at,
  }
}

function fallbackCategorySettings(): CategorySetting[] {
  return categories.map((category) => ({
    category: category.slug,
    default_price: category.default_price,
    price_unit: category.price_unit,
    updated_at: null,
  }))
}

export async function getCategorySettings() {
  const supabase = getPublicSupabaseClient()

  if (!supabase) {
    return fallbackCategorySettings()
  }

  const { data, error } = await supabase.from('category_settings').select('*')

  if (error || !data) {
    return fallbackCategorySettings()
  }

  const settings = data.map(normalizeCategorySetting).filter((setting): setting is CategorySetting => Boolean(setting))
  const byCategory = new Map(settings.map((setting) => [setting.category, setting]))

  return fallbackCategorySettings().map((fallback) => byCategory.get(fallback.category) ?? fallback)
}

export async function getCategoriesWithSettings() {
  const settings = await getCategorySettings()
  const byCategory = new Map(settings.map((setting) => [setting.category, setting]))

  return categories.map((category) => {
    const setting = byCategory.get(category.slug)
    if (!setting) return category

    return {
      ...category,
      default_price: setting.default_price,
      price_unit: setting.price_unit,
      startingPrice: formatUnitPrice(setting.default_price, setting.price_unit),
    }
  })
}

export async function getCategoryWithSettings(slug: string) {
  const categoriesWithSettings = await getCategoriesWithSettings()
  return categoriesWithSettings.find((category) => category.slug === slug) ?? null
}

export function normalizeProduct(product: Database['public']['Tables']['products']['Row']): Product {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    category: isProductCategory(product.category) ? product.category : 'other',
    subcategory: product.subcategory,
    price: Number(product.price),
    price_unit: product.price_unit,
    coverage_per_box: product.coverage_per_box === null ? null : Number(product.coverage_per_box),
    coverage_unit: product.coverage_unit,
    images: Array.isArray(product.images) ? product.images.filter(Boolean) : [],
    in_stock: product.in_stock,
    featured: product.featured,
    created_at: product.created_at,
  }
}

function fallbackFilter(options: { category?: ProductCategory; featured?: boolean; limit?: number } = {}) {
  let products = fallbackProducts

  if (options.category) {
    products = products.filter((product) => product.category === options.category)
  }

  if (options.featured) {
    products = products.filter((product) => product.featured)
  }

  if (options.limit) {
    products = products.slice(0, options.limit)
  }

  return products
}

export async function getProducts(options: { category?: ProductCategory; featured?: boolean; limit?: number } = {}) {
  const supabase = getPublicSupabaseClient()

  if (!supabase) {
    return fallbackFilter(options)
  }

  let query = supabase.from('products').select('*').order('created_at', { ascending: false })

  if (options.category) {
    query = query.eq('category', options.category)
  }

  if (options.featured) {
    query = query.eq('featured', true)
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error || !data) {
    return fallbackFilter(options)
  }

  return data.map(normalizeProduct)
}

export async function getProduct(category: ProductCategory, slug: string) {
  const supabase = getPublicSupabaseClient()

  if (!supabase) {
    return fallbackProducts.find((product) => product.category === category && product.slug === slug) ?? null
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    return fallbackProducts.find((product) => product.category === category && product.slug === slug) ?? null
  }

  return data ? normalizeProduct(data) : null
}

export async function getRelatedProducts(product: Product) {
  const products = await getProducts({ category: product.category, limit: 4 })
  return products.filter((item) => item.id !== product.id).slice(0, 3)
}
