import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: (url, options = {}) => {
      return fetch(url, { ...options, cache: 'no-store' })
    },
  },
})

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

export type Customer = {
  id: string
  full_name: string
  email: string
  phone: string | null
  cpf: string | null
  cnpj: string | null
  inscricao_estadual: string | null
  address_street: string | null
  address_number: string | null
  address_complement: string | null
  address_neighborhood: string | null
  address_city: string | null
  address_state: string | null
  address_zip: string | null
}

export type Order = {
  id: number
  customer_id: string
  status: string
  total: number
  shipping_cost: number
  payment_method: string | null
  payment_status: string
  tracking_code: string | null
  notes: string | null
  created_at: string
  order_items?: OrderItem[]
}

export type OrderItem = {
  id: number
  order_id: number
  product_id: number
  quantity: number
  price: number
  product_name: string
}

export type Review = {
  id: number
  product_id: number
  customer_id: string
  customer_name: string
  rating: number
  comment: string
  created_at: string
}
