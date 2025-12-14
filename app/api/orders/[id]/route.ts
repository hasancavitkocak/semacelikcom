import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit } from '@/lib/security'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are required')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// GET - Tek sipariş detayı
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  if (!checkRateLimit(ip, 60, 60000)) { // 60 requests per minute
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const isAdmin = searchParams.get('admin') === 'true'
    
    // Params'ı await edelim
    const { id: orderId } = await params
    
    if (!orderId) {
      return NextResponse.json({ 
        success: false,
        error: 'Order ID is required' 
      }, { status: 400 })
    }

    let query = supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)

    // Kullanıcı kontrolü (admin değilse sadece kendi siparişlerini görebilir)
    if (userId && !isAdmin) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ 
          success: false,
          error: 'Order not found' 
        }, { status: 404 })
      }
      throw error
    }

    // Kullanıcı bilgilerini ayrı olarak çek
    let userProfile: any = {}
    if (isAdmin) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone')
        .eq('id', data.user_id)
        .single()
      
      userProfile = profile || {}
    }

    // Get product slugs for order items
    const productIds = data.items?.map((item: any) => item.product_id).filter(Boolean) || []
    let productSlugs: Record<string, string> = {}
    
    if (productIds.length > 0) {
      const { data: products } = await supabase
        .from('products')
        .select('id, slug')
        .in('id', productIds)
      
      products?.forEach(product => {
        if (product.slug) {
          productSlugs[product.id] = product.slug
        }
      })
    }

    // Format data
    const formattedOrder = {
      id: data.id,
      order_number: data.conversation_id || `#${data.id.slice(0, 8).toUpperCase()}`,
      status: data.order_status || (data.status === 'paid' ? 'created' : data.status),
      total: data.total_amount,
      subtotal: data.total_amount - (data.shipping_cost || 0),
      shipping_cost: data.shipping_cost || 0,
      tax_amount: 0,
      created_at: data.created_at,
      updated_at: data.updated_at,
      user_id: data.user_id,
      user_email: userProfile?.email || data.shipping_address?.fullName || 'Bilinmiyor',
      user_name: userProfile?.full_name || data.shipping_address?.fullName || 'Bilinmiyor',
      user_phone: userProfile?.phone || '',
      payment_status: data.status,
      payment_method: data.payment_details?.payment_method || 'Bilinmiyor',
      tracking_number: data.tracking_number,
      shipping_address: data.shipping_address,
      billing_address: data.billing_address,
      notes: data.notes,
      order_items: data.items?.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.product?.price || 0,
        product: {
          id: item.product_id,
          name: item.product?.name,
          price: item.product?.price,
          slug: productSlugs[item.product_id] || item.product?.slug,
          images: item.product?.images || []
        },
        variant: item.variant ? {
          id: item.variant_id,
          color: item.variant.color,
          size: item.variant.size
        } : null
      })) || [],
      order_items_count: data.items?.length || 0
    }

    return NextResponse.json({
      success: true,
      data: formattedOrder
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })
  } catch (error: any) {
    console.error('Order detail API Error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal Server Error',
      message: error.message 
    }, { status: 500 })
  }
}