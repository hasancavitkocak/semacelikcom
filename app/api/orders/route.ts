import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit } from '@/lib/security'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are required')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// GET - Siparişleri listele
export async function GET(request: Request) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  if (!checkRateLimit(ip, 60, 60000)) { // 60 requests per minute
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const isAdmin = searchParams.get('admin') === 'true'
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let query = supabase
      .from('orders')
      .select('*')

    // Kullanıcı siparişleri için user_id filtresi
    if (userId && !isAdmin) {
      query = query.eq('user_id', userId)
    }

    // Status filtresi
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Arama filtresi (admin için) - sadece order_number'da ara
    if (search && isAdmin) {
      query = query.ilike('order_number', `%${search}%`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    // Kullanıcı bilgilerini ayrı olarak çek (admin için)
    let userProfiles: any = {}
    if (isAdmin && data && data.length > 0) {
      const userIds = [...new Set(data.map(order => order.user_id))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds)
      
      profiles?.forEach(profile => {
        userProfiles[profile.id] = profile
      })
    }

    // Get all unique product IDs to fetch slugs
    const allProductIds = data?.flatMap(order => 
      order.items?.map((item: any) => item.product_id) || []
    ).filter(Boolean) || []

    // Fetch product slugs if we have product IDs
    let productSlugs: Record<string, string> = {}
    if (allProductIds.length > 0) {
      const { data: products } = await supabase
        .from('products')
        .select('id, slug')
        .in('id', [...new Set(allProductIds)])
      
      products?.forEach(product => {
        if (product.slug) {
          productSlugs[product.id] = product.slug
        }
      })
    }

    // Format data
    const formattedOrders = data?.map(order => ({
      id: order.id,
      order_number: order.conversation_id || `#${order.id.slice(0, 8).toUpperCase()}`,
      status: order.order_status || (order.status === 'paid' ? 'created' : order.status), // Use order_status if exists, otherwise convert payment status
      total: order.total_amount,
      subtotal: order.total_amount - (order.shipping_cost || 0),
      shipping_cost: order.shipping_cost || 0,
      created_at: order.created_at,
      updated_at: order.updated_at,
      user_id: order.user_id,
      user_email: userProfiles[order.user_id]?.email || order.shipping_address?.fullName || 'Bilinmiyor',
      user_name: userProfiles[order.user_id]?.full_name || order.shipping_address?.fullName || 'Bilinmiyor',
      payment_status: order.status, // Use actual status for payment
      payment_method: order.payment_details?.payment_method || 'Bilinmiyor',
      tracking_number: order.tracking_number,
      shipping_address: order.shipping_address,
      billing_address: order.billing_address,
      notes: order.notes,
      order_items: order.items?.map((item: any) => ({
        ...item,
        product: {
          ...item.product,
          slug: productSlugs[item.product_id] || item.product?.slug
        }
      })) || [],
      order_items_count: order.items?.length || 0
    })) || []

    return NextResponse.json({
      success: true,
      data: formattedOrders,
      count: formattedOrders.length
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })
  } catch (error: any) {
    console.error('Orders API Error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal Server Error',
      message: error.message 
    }, { status: 500 })
  }
}

// PUT - Sipariş durumunu güncelle (Admin)
export async function PUT(request: Request) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  if (!checkRateLimit(ip, 30, 60000)) { // 30 requests per minute
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const { orderId, status, tracking_number, notes } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json({ 
        success: false,
        error: 'Order ID and status are required' 
      }, { status: 400 })
    }

    // Geçerli status değerleri
    const validStatuses = ['created', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid status value' 
      }, { status: 400 })
    }

    // For now, we'll add order_status column to track order progress
    // while keeping the original status for payment status
    const updateData: any = { 
      order_status: status,
      updated_at: new Date().toISOString()
    }

    if (tracking_number) {
      updateData.tracking_number = tracking_number
    }

    if (notes) {
      updateData.notes = notes
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Sipariş durumu güncellendi'
    })
  } catch (error: any) {
    console.error('Update order error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal Server Error',
      message: error.message 
    }, { status: 500 })
  }
}

// DELETE - Siparişi iptal et
export async function DELETE(request: Request) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  if (!checkRateLimit(ip, 10, 60000)) { // 10 requests per minute
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('id')

    if (!orderId) {
      return NextResponse.json({ 
        success: false,
        error: 'Order ID is required' 
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ 
        order_status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Sipariş iptal edildi'
    })
  } catch (error: any) {
    console.error('Cancel order error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal Server Error',
      message: error.message 
    }, { status: 500 })
  }
}