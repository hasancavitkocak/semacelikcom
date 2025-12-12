import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit } from '@/lib/security'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('supabaseUrl is required. Please set NEXT_PUBLIC_SUPABASE_URL environment variable.')
}
if (!supabaseAnonKey) {
  throw new Error('supabaseAnonKey is required. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.')
}

const supabase = createClient(supabaseUrl as string, supabaseAnonKey as string)

export async function GET(request: Request) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  if (!checkRateLimit(ip, 30, 60000)) { // 30 requests per minute
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }
  
  try {
    console.log('Home API called at:', new Date().toISOString())
    console.log('Environment check:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV
    })
    // Tüm verileri paralel olarak çek
    const [bannersRes, menuCategoriesRes, productsRes, blocksRes, settingsRes] = await Promise.all([
      supabase.from('banners').select('*').eq('is_active', true).order('display_order'),
      // Ana sayfa kategorilerini menülerden al (Giyim menüsündeki kategoriler)
      supabase.from('menu_items').select(`
        id,
        name,
        slug,
        display_order,
        category:categories(
          id,
          name,
          slug,
          image_url,
          show_on_homepage
        )
      `).eq('is_active', true).not('category_id', 'is', null).order('display_order').limit(8),
      supabase.from('products').select(`
        id, name, slug, price, is_active,
        category:categories(name),
        images:product_images(image_url, is_primary),
        variants:product_variants(stock),
        product_categories(
          category:categories(name),
          is_primary
        )
      `).eq('is_active', true).order('created_at', { ascending: false }).limit(8),
      supabase.from('home_blocks').select('*').eq('is_active', true).order('display_order'),
      supabase.from('site_settings').select('key, value').in('key', ['site_logo', 'top_banner'])
    ])

    // Settings'i object'e çevir
    const settings: Record<string, string> = {}
    settingsRes.data?.forEach(s => {
      settings[s.key] = s.value
    })

    // Menu kategorilerini düzenle
    const categories = menuCategoriesRes.data?.map(item => item.category).filter((cat: any) => cat && cat.show_on_homepage) || []

    return NextResponse.json({
      banners: bannersRes.data || [],
      categories,
      products: productsRes.data || [],
      homeBlocks: blocksRes.data || [],
      settings
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    })
  } catch (error: any) {
    console.error('Home API Error:', error)
    
    // Development'da detaylı hata göster
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        error: 'Internal Server Error',
        details: error.message,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }
    
    // Production'da basit hata
    return NextResponse.json({ 
      error: 'Internal Server Error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
