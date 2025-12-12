export interface Product {
  id: string
  name: string
  description: string
  price: number
  category_id: string
  
  // Tekstil özellikleri
  fabric_type?: string
  fabric_composition?: string
  care_instructions?: string
  brand?: string
  gender?: 'erkek' | 'kadın' | 'unisex' | 'çocuk'
  season?: 'yaz' | 'kış' | 'ilkbahar' | 'sonbahar' | 'her-mevsim'
  
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  is_primary: boolean
  display_order: number
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  parent_id?: string
  created_at: string
}

export interface Color {
  id: string
  name: string
  hex_code?: string
  created_at: string
}

export interface Size {
  id: string
  name: string
  category?: string
  display_order: number
  created_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  color_id: string
  size_id: string
  sku?: string
  stock: number
  price_modifier: number
  created_at: string
  
  // İlişkili veriler (JOIN ile gelecek)
  color?: Color
  size?: Size
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  variant_id?: string
  created_at: string
  
  // İlişkili veriler
  product?: Product
  variant?: ProductVariant
}

export interface Order {
  id: string
  user_id: string
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shipping_address?: string
  shipping_city?: string
  shipping_zip?: string
  created_at: string
  
  // İlişkili veriler
  user?: User
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  variant_id?: string
  quantity: number
  price: number
  
  // İlişkili veriler
  product?: Product
  variant?: ProductVariant
}

export interface User {
  id: string
  email: string
  full_name?: string
  phone?: string
  role: 'customer' | 'admin'
  created_at: string
}

export interface Coupon {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  active: boolean
  expires_at?: string
  created_at: string
}

export interface Address {
  id: string
  user_id: string
  title?: string
  full_address: string
  city: string
  zip_code?: string
  is_default: boolean
  created_at: string
}

export interface Banner {
  id: string
  title: string
  subtitle?: string
  image_url: string
  link_url?: string
  button_text?: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}
