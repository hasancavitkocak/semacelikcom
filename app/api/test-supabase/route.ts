import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        error: 'Environment variables missing',
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey
      }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Basit bir test sorgusu - public tablolardan birini dene
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .limit(1)

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      dataCount: data?.length || 0,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}