import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl) {
      throw new Error('supabaseUrl is required. Please set NEXT_PUBLIC_SUPABASE_URL environment variable.')
    }
    if (!supabaseAnonKey) {
      throw new Error('supabaseAnonKey is required. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.')
    }

    const supabase = createClient(supabaseUrl as string, supabaseAnonKey as string)
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = searchParams.get('limit')

    let query = supabase
      .from('products')
      .select(`
        id, name, slug, price, description, is_active, created_at,
        category:categories(name, slug),
        images:product_images(image_url, is_primary)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category_id', category)
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ products: data || [] })
  } catch (error: any) {
    console.error('Products API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
