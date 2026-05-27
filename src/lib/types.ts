export type ProductCategory = 'flooring' | 'decking' | 'roofing' | 'other'

export type Product = {
  id: string
  title: string
  slug: string
  description: string
  category: ProductCategory
  subcategory: string | null
  price: number
  price_unit: string
  coverage_per_box: number | null
  coverage_unit: string | null
  images: string[]
  in_stock: boolean
  featured: boolean
  created_at: string | null
}

export type Category = {
  name: string
  slug: ProductCategory
  description: string
  image: string
  startingPrice: string
  default_price: number
  price_unit: string
  subcategories: string[]
}

export type CategorySetting = {
  category: ProductCategory
  default_price: number
  price_unit: string
  updated_at: string | null
}
