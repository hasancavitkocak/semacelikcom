import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
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

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ categories: data || [] })
  } catch (error: any) {
    console.error('Categories API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
