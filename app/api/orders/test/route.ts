import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are required')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET() {
  try {
    // Basit orders sorgusu
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(5)

    console.log('Orders:', orders, 'Error:', ordersError)

    // Users tablosu var mı kontrol et
    const { data: profiles, error: profilesError } = await supabase
      .from('users')
      .select('*')
      .limit(5)

    console.log('Profiles:', profiles, 'Error:', profilesError)

    // Order items kontrol et
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .limit(5)

    console.log('Order Items:', orderItems, 'Error:', itemsError)

    return NextResponse.json({
      success: true,
      data: {
        orders: orders || [],
        profiles: profiles || [],
        orderItems: orderItems || [],
        errors: {
          ordersError,
          profilesError,
          itemsError
        }
      }
    })
  } catch (error: any) {
    console.error('Test API Error:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 })
  }
}