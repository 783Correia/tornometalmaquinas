import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Category = {
  id: number
  name: string
  slug: string
}

export type Brand = {
  id: number
  name: string
  slug: string
}

export type ProductImage = {
  id: number
  product_id: number
  src: string
  alt: string
  position: number
}

export type Product = {
  id: number
  name: string
  slug: string
  description: string
  short_description: string
  sku: string
  price: number
  regular_price: number
  sale_price: number | null
  weight: number
  length: number
  width: number
  height: number
  stock_quantity: number
  manage_stock: boolean
  status: string
  featured: boolean
  category_id: number
  brand_id: number
  woo_id: number
  categories?: Category
  brands?: Brand
  product_images?: ProductImage[]
}
