import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are required')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// GET - Ödeme yöntemlerini listele
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true)
      .order('created_at')

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data || []
    })
  } catch (error: any) {
    console.error('Payment methods API error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal Server Error',
      message: error.message 
    }, { status: 500 })
  }
}