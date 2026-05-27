export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          title: string
          slug: string
          description: string
          category: string
          subcategory: string | null
          price: number
          price_unit: string
          coverage_per_box: number | null
          coverage_unit: string | null
          images: string[] | null
          in_stock: boolean
          featured: boolean
          created_at: string | null
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description: string
          category: string
          subcategory?: string | null
          price: number
          price_unit: string
          coverage_per_box?: number | null
          coverage_unit?: string | null
          images?: string[] | null
          in_stock?: boolean
          featured?: boolean
          created_at?: string | null
        }
        Update: {
          title?: string
          slug?: string
          description?: string
          category?: string
          subcategory?: string | null
          price?: number
          price_unit?: string
          coverage_per_box?: number | null
          coverage_unit?: string | null
          images?: string[] | null
          in_stock?: boolean
          featured?: boolean
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
